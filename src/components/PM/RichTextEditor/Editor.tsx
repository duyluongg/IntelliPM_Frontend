import './styles.scss';

import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Edit3, FileText, Sparkles, X } from 'lucide-react';
import WriteWithAIModal from '../ModalAI/WriteWithAIModal';

type MenuBarProps = {
  editor: ReturnType<typeof useEditor>;
};

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) return null;
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-4'>
      <div className='flex flex-wrap gap-2'>
        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('bold')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Bold'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4.5a3.5 3.5 0 001.35-6.716A3.5 3.5 0 009.5 3H5zm2.5 6H6V6h1.5a1.5 1.5 0 110 3zm1 4H6v-3h2.5a1.5 1.5 0 110 3z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('italic')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Italic'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M8.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 010-1h.5V4h-.5a.5.5 0 010-1h1zm2.5 0h3a.5.5 0 010 1h-1v8h1a.5.5 0 010 1h-3a.5.5 0 010-1h1V4h-1a.5.5 0 010-1z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('strike')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Strikethrough'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M6 11h8v2H6v-2zm2-4h4v2H8V7zm-2 8h8v2H6v-2z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('code')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Code'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M13.962 8.795l1.414 1.414L12.548 13l2.828 2.828-1.414 1.414L10.134 13l3.828-3.828zm-7.924 0L2.21 12.621l3.828 3.828 1.414-1.414L4.624 13l2.828-2.828-1.414-1.414z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors'
            title='Clear marks'
          >
            Clear
          </button>
          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors'
            title='Clear nodes'
          >
            Reset
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('paragraph')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Paragraph'
          >
            P
          </button>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 ${
                editor.isActive('heading', { level })
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('bulletList')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Bullet list'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M4 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm6-10h6a1 1 0 010 2h-6a1 1 0 010-2zm0 6h6a1 1 0 010 2h-6a1 1 0 010-2zm0 6h6a1 1 0 010 2h-6a1 1 0 010-2z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('orderedList')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Ordered list'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('codeBlock')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Code block'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('blockquote')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Blockquote'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors'
            title='Horizontal rule'
          >
            HR
          </button>
          <button
            onClick={() => editor.chain().focus().setHardBreak().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors'
            title='Hard break'
          >
            BR
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Undo'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l5.293 5.293a1 1 0 01-1.414 1.414l-6-6z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Redo'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-5.293-5.293a1 1 0 011.414-1.414l6 6z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Purple color'
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-purple-400'></div>
              <span>A</span>
            </div>
          </button>
        </div>

        {/* <div className='relative'>
          <button
            onClick={() => setShowAIOptions((prev) => !prev)}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='AI Assistant'
          >
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-400 to-purple-400 rounded-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <span>AI Assistant</span>
            </div>
          </button>

          {showAIOptions && (
            <div className='absolute top-full mt-2 right-0 z-50'>
              <WriteWithAIModal editor={editor} onClose={() => setShowAIOptions(false)} />
            </div>
          )}
        </div> */}

        <div className='relative'>
          {/* Nút chính */}
          <button
            onClick={() => setShowAIOptions((prev) => !prev)}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='AI Assistant'
          >
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <span>AI Assistant</span>
            </div>
          </button>

          {/* Menu Option */}
          {showAIOptions && (
            <div className='absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden'>
              <div className='p-2'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-sm font-medium text-gray-800'>AI Assistant</h3>
                  <button
                    onClick={() => setShowAIOptions(false)}
                    className='p-1 hover:bg-gray-100 rounded transition-colors'
                  >
                    <X className='w-3 h-3 text-gray-500' />
                  </button>
                </div>

                <div className='space-y-1'>
                  <button
                    onClick={() => {
                      setShowAIOptions(false);
                      setShowWriteModal(true);
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    <Edit3 className='w-4 h-4 text-blue-500' />
                    <span>Write with AI</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIOptions(false);
                      setShowSummarizeModal(true);
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    <FileText className='w-4 h-4 text-green-500' />
                    <span>Summarize</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal viết AI */}
          {showWriteModal && (
            <div className='absolute top-full mt-2 right-0 z-50'>
              <WriteWithAIModal
                editor={editor}
                onClose={() => setShowWriteModal(false)}
                form='write_with_ai'
            
              />
            </div>
          )}

          {showSummarizeModal && (
            <div className='absolute top-full mt-2 right-0 z-50'>
              <WriteWithAIModal
                editor={editor}
                onClose={() => setShowSummarizeModal(false)}
                form='summarize'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// const extensions = [
//   Color.configure({ types: [TextStyle.name, ListItem.name] }),
//   TextStyle.configure({ types: [ListItem.name] }),
//   StarterKit.configure({
//     bulletList: { keepMarks: true, keepAttributes: false },
//     orderedList: { keepMarks: true, keepAttributes: false },
//   }),
// ];

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
    table: false,
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const cleanedValue = stripMarkdownCodeBlock(value);

  const editor = useEditor({
    extensions,
    content: cleanedValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (editor && cleanedValue && editor.getHTML() !== cleanedValue) {
      editor.commands.setContent(cleanedValue, false);
    }
  }, [value, editor]);

  return (
    <div>
      <div className='sticky top-0 z-10 bg-white'>{editor && <MenuBar editor={editor} />}</div>

      <div className='prose max-w-none'>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function stripMarkdownCodeBlock(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/^```html\s*([\s\S]*?)\s*```$/i, '$1').trim();
}
