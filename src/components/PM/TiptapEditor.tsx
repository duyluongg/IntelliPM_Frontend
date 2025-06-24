// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import { useEffect } from 'react';

// type Props = {
//   content: string;
//   onChange: (content: string) => void;
// };

// export default function TiptapEditor({ content, onChange }: Props) {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content,
//     onUpdate: ({ editor }) => onChange(editor.getHTML()),
//   });

//   useEffect(() => {
//     if (editor && content !== editor.getHTML()) {
//       editor.commands.setContent(content);
//     }
//   }, [editor, content]);

//   if (!editor) return null;

//   return <EditorContent editor={editor} />;
// }
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import { CustomExtensions } from './tiptapExtensions'; // Đường dẫn đúng

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
    <div>
      <EditorContent
        editor={editor}
        className='focus:outline-none focus:ring-0 focus:border-none'
      />
    </div>
  );
}
