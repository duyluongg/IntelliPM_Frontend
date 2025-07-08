import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import { CustomExtensions } from './tiptapExtensions'; // Đường dẫn đúng
import { Bold, Italic, List, ListOrdered, Redo, Table, Undo } from 'lucide-react';
import DropdownAI from './DropdownAI';

type Props = {
  content: string;
  onChange: (content: string) => void;
};

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: CustomExtensions,
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.insertContent(content, {
        parseOptions: {
          preserveWhitespace: true,
        },
      });
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="flex flex-col space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border border-gray-200 p-2 rounded-md bg-white shadow-sm">
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-200">
        <button 
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Undo"
        >
        <Undo size={18} />
        </button>
        <button 
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Redo"
        >
        <Redo size={18} />
        </button>
      </div>
      
      <div className="flex items-center space-x-1 px-2 border-r border-gray-200">
        <select
        onChange={(e) => {
          const level = parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
          editor.chain().focus().toggleHeading({ level }).run();
        }}
        defaultValue=""
        className="px-2 py-1 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="" disabled>Heading</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        </select>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-gray-200">
        <button 
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Bold"
        >
        <Bold size={18} />
        </button>
        <button 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
        >
        <Italic size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-gray-200">
        <button 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Bullet List"
        >
        <List size={18} />
        </button>
        <button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        title="Ordered List"
        >
        <ListOrdered size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-gray-200">
        <button
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Insert Table"
        >
        <Table size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-1 pl-2">
        <DropdownAI editor={editor} onGenerate={() => {}} />
      </div>
      </div>

      <EditorContent
      editor={editor}
      className="p-3  rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
