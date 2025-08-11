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

const suggestions = [
  {
    icon: FileSignature,
    text: 'Summarize this doc',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Pencil,
    text: 'Make this doc more clear and concise',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    icon: CheckCircle,
    text: 'Extract action items from this doc',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: CheckCircle,
    text: 'Project summary',
    color: 'text-blue-600 dark:text-blue-400',
  },
];

const Chatbot: React.FC<ChatbotProps> = ({ onClose, editor }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [generateFromTasks, { isLoading: isGenLoading }] = useGenerateFromTasksMutation();

  const [askAI, { isLoading }] = useAskAIMutation();
  const { documentId } = useParams<{ documentId: string }>();
  const docId = Number(documentId);
  const busy = isLoading || isGenLoading;

  console.log(documentId, 'documentId in Chatbot');

  // const handleSendMessage = async (messageText?: string) => {
  //   let textToSend = messageText || inputText;

  //   if (textToSend === 'Summarize this doc') {
  //     const docText = editor?.getText().trim();
  //     if (!docText) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: Date.now(),
  //           text: '⚠️ Không có nội dung nào trong tài liệu để tóm tắt.',
  //           sender: 'ai',
  //         },
  //       ]);
  //       return;
  //     }
  //     textToSend = `Tóm tắt nội dung sau thành 3-5 gạch đầu dòng dễ hiểu:\n\n${docText}`;
  //   }

  //   if (textToSend === 'Make this doc more clear and concise') {
  //     const docText = editor?.getText().trim();
  //     if (!docText) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: Date.now(),
  //           text: '⚠️ Không có nội dung nào trong tài liệu để cải thiện.',
  //           sender: 'ai',
  //         },
  //       ]);
  //       return;
  //     }
  //     textToSend = `Hãy cải thiện độ rõ ràng và súc tích cho nội dung sau đây:\n\n${docText}`;
  //   }

  //   if (textToSend === 'Extract action items from this doc') {
  //     const docText = editor?.getText().trim();
  //     if (!docText) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: Date.now(),
  //           text: '⚠️ Không có nội dung nào trong tài liệu để trích xuất.',
  //           sender: 'ai',
  //         },
  //       ]);
  //       return;
  //     }
  //     textToSend = `Hãy trích xuất các công việc hành động (action items) cụ thể từ nội dung sau:\n\n${docText}`;
  //   }

  //   if (textToSend.trim() === '') return;

  //   const userMessage: Message = {
  //     id: Date.now(),
  //     text: messageText || inputText,
  //     sender: 'user',
  //   };
  //   setMessages((prev) => [...prev, userMessage]);
  //   setInputText('');

  //   try {
  //     const result = await askAI(textToSend).unwrap();
  //     const aiMessage: Message = {
  //       id: Date.now() + 1,
  //       text: result.content,
  //       sender: 'ai',
  //     };
  //     setMessages((prev) => [...prev, aiMessage]);
  //   } catch (err) {
  //     console.error('AI request failed:', err);
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         id: Date.now() + 1,
  //         text: '❌ Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại.',
  //         sender: 'ai',
  //       },
  //     ]);
  //   }
  // };
  const handleSendMessage = async (messageText?: string) => {
    let textToSend = messageText || inputText;

    if (textToSend === 'Summarize this doc') {
      const docText = editor?.getText().trim();
      if (!docText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: '⚠️ Không có nội dung nào trong tài liệu để tóm tắt.',
            sender: 'ai',
          },
        ]);
        return;
      }
      textToSend = `Tóm tắt nội dung sau thành 3-5 gạch đầu dòng dễ hiểu:\n\n${docText}`;
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
      if (messageText === 'Project summary') {
        const result = await generateFromTasks(docId).unwrap();
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: result, sender: 'ai' }]);
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
          text: '❌ Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại.',
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
          <span className='font-semibold text-gray-800 dark:text-white'>Sidekick</span>
          <span className='text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded-full'>
            Beta
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <button className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'>
            <Pencil className='w-5 h-5' />
          </button>
          {/* Thay đổi: Thêm icon chat */}
          <button className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'>
            <MessageSquare className='w-5 h-5' />
          </button>
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
            placeholder='Message Sidekick...'
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

    const cleanHtml = stripMarkdownCodeBlock(message.text);
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
            dangerouslySetInnerHTML={{ __html: stripMarkdownCodeBlock(message.text) }}
          />
        </div>
        <div className='flex items-center gap-3 mt-2 text-gray-500 dark:text-gray-400'>
          <button className='p-1 rounded-md hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600'>
            <ThumbsUp className='w-4 h-4' />
          </button>
          <button className='p-1 rounded-md hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600'>
            <ThumbsDown className='w-4 h-4' />
          </button>
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
