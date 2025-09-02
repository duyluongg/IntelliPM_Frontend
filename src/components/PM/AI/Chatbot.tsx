import React, { useState, useRef, useEffect, use } from 'react';
import {
  Sparkles,
  X,
  User,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Send, // Giữ lại Send nếu bạn muốn dùng, nhưng code mới không cần
  MessageSquare, // Icon mới cho header
  FileSignature, // Icon cho gợi ý
  CheckCircle, // Icon cho gợi ý
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

import {
  useAskAIMutation,
  useGenerateFromProjectMutation,
  useGenerateFromTasksMutation,
} from '../../../services/Document/documentAPI';
import { useAuth } from '../../../services/AuthContext';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';
import { useParams } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatbotProps {
  onClose: () => void;
  editor: Editor | null;
}

function unwrapCodeFencesLoose(input: string): string {
  if (typeof input !== 'string') return '';

  let out = input;

  // 1) Cặp ```lang ... ```
  out = out.replace(/```[\t ]*([a-z0-9_-]+)?[\t ]*\r?\n([\s\S]*?)\r?\n```/gi, '$2');

  // 2) Cặp ~~~lang ... ~~~
  out = out.replace(/~~~[\t ]*([a-z0-9_-]+)?[\t ]*\r?\n([\s\S]*?)\r?\n~~~/gi, '$2');

  // 3) Trường hợp CHỈ có mở mà không có đóng (hoặc còn sót mở/đóng rác)
  //    - Bỏ fence mở ở đầu (có/không ngôn ngữ)
  out = out.replace(/^\s*```[\t ]*[a-z0-9_-]*[\t ]*\r?\n?/i, '');
  out = out.replace(/^\s*~~~[\t ]*[a-z0-9_-]*[\t ]*\r?\n?/i, '');

  //    - Bỏ fence đóng ở cuối nếu có
  out = out.replace(/\r?\n?```\s*$/i, '');
  out = out.replace(/\r?\n?~~~\s*$/i, '');

  // 4) (Tuỳ chọn) nếu server encode backtick thành &#96;
  out = out.replace(/&#96;&#96;&#96;[a-z0-9_-]*\s*/gi, '');
  out = out.replace(/&#96;&#96;&#96;/gi, '');

  return out.trim();
}

function transformTaskSummaryHtml(html: string, opts?: { locale?: string; timeZone?: string }) {
  const { locale = 'vi-VN', timeZone = 'Asia/Ho_Chi_Minh' } = opts || {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const dateFields = new Set([
    'Planned Start Date',
    'Planned End Date',
    'Actual Start Date',
    'Actual End Date',
    'Created At',
    'Updated At',
  ]);

  const df = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone,
  });

  const isIsoLike = (s: string) => {
    if (!s) return false;
    const cleaned = s.trim().replace(/\.$/, ''); // xoá dấu chấm đuôi
    return cleaned.includes('T') && !isNaN(new Date(cleaned).getTime());
  };

  doc.querySelectorAll('tr').forEach((tr) => {
    // Ưu tiên (th, td)
    let labelEl = tr.querySelector('th');
    let valueEl = tr.querySelector('td');

    // Nếu không có <th>, thử lấy (td1, td2)
    if (!labelEl) {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        labelEl = tds[0];
        valueEl = tds[1];
      }
    }
    if (!labelEl || !valueEl) return;

    const label = (labelEl.textContent || '').trim();
    const raw = (valueEl.textContent || '').trim();
    if (!dateFields.has(label) || !raw) return;

    if (isIsoLike(raw)) {
      const cleaned = raw.replace(/\.$/, '');
      const d = new Date(cleaned);
      valueEl.textContent = df.format(d);
    }
  });

  return doc.body.innerHTML;
}

function transformProjectSummaryHtml(
  html: string,
  opts?: {
    locale?: string;
    currency?: string;
    timeZone?: string;
  }
) {
  const { locale = 'vi-VN', currency = 'VND', timeZone = 'Asia/Ho_Chi_Minh' } = opts || {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Map cấu hình format theo nhãn (thẻ <th>)
  const moneyFields = new Set([
    'Planned Value (PV)',
    'Earned Value (EV)',
    'Actual Cost (AC)',
    'Budget At Completion (BAC)',
    'Estimate At Completion (EAC)',
    'Estimate To Complete (ETC)',
    'Variance At Completion (VAC)',
  ]);
  const indexFields = new Set(['Cost Performance Index (CPI)', 'Schedule Performance Index (SPI)']);
  const dateFields = new Set(['Created At (UTC)', 'Updated At (UTC)']);

  const nfMoney = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  const nfNumber = new Intl.NumberFormat(locale); // cho các số lớn không phải tiền
  const nfIndex = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const df = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone,
  });

  const isIsoUtc = (s: string) => /^\d{4}-\d{2}-\d{2}T.*Z$/.test(s);

  doc.querySelectorAll('tr').forEach((tr) => {
    const th = tr.querySelector('th');
    const td = tr.querySelector('td');
    if (!th || !td) return;

    const label = th.textContent?.trim() || '';
    const raw = td.textContent?.trim() || '';

    // Datetime: ISO UTC -> local + hiển thị cả UTC nhỏ phía dưới (nếu muốn)
    if (dateFields.has(label) && isIsoUtc(raw)) {
      const d = new Date(raw);
      td.textContent = df.format(d); // only show local formatted date/time
      th.textContent = label.replace('(UTC)', '').trim();
      return;
    }

    // Tiền tệ (số lớn)
    if (moneyFields.has(label)) {
      const val = Number(raw);
      if (!isNaN(val)) td.textContent = nfMoney.format(val);
      return;
    }

    // Chỉ số CPI/SPI
    if (indexFields.has(label)) {
      const val = Number(raw);
      if (!isNaN(val)) td.textContent = nfIndex.format(val);
      return;
    }

    // Duration (days): thêm "ngày"
    if (/Duration.*\(days\)/i.test(label)) {
      const val = Number(raw);
      if (!isNaN(val)) td.textContent = `${nfNumber.format(val)} day`;
      th.textContent = label.replace(/\s*\(days\)\s*/i, '');
      return;
    }

    // Số lớn khác -> thêm dấu phân cách
    const asNum = Number(raw);
    if (!isNaN(asNum) && raw !== '') {
      td.textContent = nfNumber.format(asNum);
    }
  });

  return doc.body.innerHTML;
}

function stripMarkdownCodeBlock(input: string): string {
  if (typeof input !== 'string') return '';
  // Xóa code fence ```html ... ``` hoặc ```...```
  return input
    .replace(/^```(?:html)?\s*([\s\S]*?)\s*```$/i, '$1') // match block có html
    .trim();
}

const suggestions = [
  {
    icon: FileSignature,
    text: 'Summarize this doc',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: CheckCircle,
    text: 'Project summary',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: CheckCircle,
    text: 'Task summary',
    color: 'text-blue-600 dark:text-blue-400',
  },
];

const Chatbot: React.FC<ChatbotProps> = ({ onClose, editor }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [generateFromTasks, { isLoading: isGenLoading }] = useGenerateFromTasksMutation();
  const [generateFromProject, { isLoading: isProjectLoading }] = useGenerateFromProjectMutation();

  const [askAI, { isLoading }] = useAskAIMutation();
  const { documentId } = useParams<{ documentId: string }>();
  const docId = Number(documentId);
  const busy = isLoading || isGenLoading || isProjectLoading;

  const handleNewChat = () => {
    setMessages([]); // Xóa tất cả tin nhắn để bắt đầu lại
  };

  const handleSendMessage = async (messageText?: string) => {
    let textToSend = messageText || inputText;

    if (textToSend === 'Summarize this doc') {
      const docText = editor?.getText().trim();
      if (!docText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: '⚠️ There is no content in the document to summarize.',
            sender: 'ai',
          },
        ]);
        return;
      }
      // textToSend = `Tóm tắt nội dung sau thành 3-5 gạch đầu dòng dễ hiểu:\n\n${docText}`;
      textToSend = `Summarize the following content in 3-5 easy-to-understand bullet points:\n\n${docText};`;
    }

    if (textToSend === 'Make this doc more clear and concise') {
      const docText = editor?.getText().trim();
      if (!docText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: '⚠️ Không có nội dung nào trong tài liệu để cải thiện.',
            sender: 'ai',
          },
        ]);
        return;
      }
      textToSend = `Hãy cải thiện độ rõ ràng và súc tích cho nội dung sau đây:\n\n${docText}`;
    }

    if (textToSend === 'Extract action items from this doc') {
      const docText = editor?.getText().trim();
      if (!docText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: '⚠️ Không có nội dung nào trong tài liệu để trích xuất.',
            sender: 'ai',
          },
        ]);
        return;
      }
      textToSend = `Hãy trích xuất các công việc hành động (action items) cụ thể từ nội dung sau:\n\n${docText}`;
    }

    if (textToSend.trim() === '') return;

    // đẩy message user lên UI
    const userMessage: Message = {
      id: Date.now(),
      text: messageText || inputText,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      if (messageText === 'Task summary') {
        const result = await generateFromTasks(docId).unwrap();
        const clean = unwrapCodeFencesLoose(result);
        const transformed = transformTaskSummaryHtml(clean, {
          locale: 'vi-VN',
          timeZone: 'Asia/Ho_Chi_Minh',
        });
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: transformed, sender: 'ai' }]);
        return;
      }

      if (messageText === 'Project summary') {
        const result = await generateFromProject(docId).unwrap(); // { content: "```html ... ```" }
        const clean = stripMarkdownCodeBlock(result);
        const transformed = transformProjectSummaryHtml(clean, {
          locale: 'vi-VN',
          currency: 'VND',
          timeZone: 'Asia/Ho_Chi_Minh',
        });
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: transformed, sender: 'ai' }]);
        return;
      }

      const result = await askAI(textToSend).unwrap();
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: result.content, sender: 'ai' }]);
    } catch (err) {
      console.error('AI request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: '❌ An error occurred while calling AI. Please try again.',
          sender: 'ai',
        },
      ]);
    }
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='fixed bottom-5 right-5 w-96 h-[70vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50'>
      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-6 h-6 text-blue-600' />
          <span className='font-semibold text-gray-800 dark:text-white'>IntelliPM AI</span>
        </div>
        <div className='flex items-center gap-1'>
          <button
            className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            onClick={handleNewChat}
          >
            <Pencil className='w-5 h-5' />
          </button>
          {/* Thay đổi: Thêm icon chat */}
          {/* <button className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'>
            <MessageSquare className='w-5 h-5' />
          </button> */}
          <button
            onClick={onClose}
            className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Thay đổi: Hiển thị màn hình chào mừng hoặc danh sách tin nhắn */}
      <div className='flex-grow p-4 overflow-y-auto'>
        {messages.length === 0 ? (
          // Màn hình chào mừng
          <div>
            <h2 className='text-xl font-medium text-gray-800 dark:text-white'>
              Hey {user?.username}, let's level up your docs.
            </h2>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              I can help you write and refine content, answer questions about your doc, and assist
              with drafting, rewriting, and polishing.
            </p>
            <div className='mt-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Try asking me to:
              </p>
              <div className='mt-3 space-y-2'>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion.text)}
                    disabled={busy}
                    className='w-full flex items-center gap-3 p-3 text-left bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50'
                  >
                    <suggestion.icon className={`w-5 h-5 flex-shrink-0 ${suggestion.color}`} />
                    <span className='text-sm text-gray-800 dark:text-gray-200'>
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Danh sách tin nhắn
          <div className='space-y-6'>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} editor={editor} />
            ))}
            {busy && (
              <div className='flex justify-start gap-3 items-start'>
                <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0'>
                  <Sparkles className='w-5 h-5 text-blue-600 animate-pulse' />
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400 pt-1.5'>Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className='p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0'>
        <div className='relative'>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder='Message IntelliPM AI...'
            className='w-full h-12 pr-20 pl-3 py-3 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className='absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm'
          >
            <Send />
          </button>
        </div>
        <p className='text-xs text-center text-gray-500 dark:text-gray-400 mt-2'>
          AI may be inaccurate, make sure to review it.{' '}
          <a href='#' className='underline'>
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{ message: Message; editor: Editor | null }> = ({
  message,
  editor,
}) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className='flex items-end justify-end gap-2'>
        <div className='max-w-[75%] bg-blue-500 text-white p-3 rounded-xl rounded-br-lg'>
          <p className='text-sm whitespace-pre-wrap'>{message.text}</p>
        </div>
        <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
          <User className='w-5 h-5 text-gray-600 dark:text-gray-300' />
        </div>
      </div>
    );
  }

  function stripMarkdownCodeBlock(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(/^```html\s*([\s\S]*?)\s*```$/i, '$1').trim();
  }

  function htmlToTiptapNode(html: string, editor: Editor): any {
    const schema = editor.schema;
    const doc = new window.DOMParser().parseFromString(html, 'text/html');
    const body = doc.body;

    return ProseMirrorDOMParser.fromSchema(schema).parse(body);
  }

  const handleInsert = () => {
    if (!editor || !message.text) return;

    const cleanHtml = unwrapCodeFencesLoose(message.text);
    const contentNode = htmlToTiptapNode(cleanHtml, editor);

    editor.commands.focus();
    editor.commands.insertContent(contentNode);
  };

  return (
    <div className='flex items-start gap-3'>
      <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0'>
        <Sparkles className='w-5 h-5 text-blue-600' />
      </div>
      <div className='flex-1'>
        <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded-xl rounded-bl-none'>
          <div
            className='prose dark:prose-invert max-w-none text-sm'
            dangerouslySetInnerHTML={{ __html: unwrapCodeFencesLoose(message.text) }}
          />
        </div>
        <div className='flex items-center gap-3 mt-2 text-gray-500 dark:text-gray-400'>
          <button
            className='p-1 rounded-md hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            onClick={handleInsert}
          >
            <Send className='w-4 h-4' />
            <span className='ml-1 text-xs'>Insert</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
