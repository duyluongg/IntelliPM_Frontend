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
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className='space-y-2'>
      {/* Toolbar */}
      <div className='flex flex-wrap gap-2 border p-2 rounded bg-gray-50'>
        <button onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </button>

        <select
          onChange={(e) => {
            const level = parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
            editor.chain().focus().toggleHeading({ level }).run();
          }}
          defaultValue=''
        >
          <option value='' disabled>
            Heading
          </option>
          <option value='1'>H1</option>
          <option value='2'>H2</option>
          <option value='3'>H3</option>
        </select>

        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Table size={16} />
        </button>

        <DropdownAI editor={editor} onGenerate={() => {}} />
      </div>

      <EditorContent
        editor={editor}
        className='focus:outline-none focus:ring-0 focus:border-none'
      />
    </div>
  );
}
