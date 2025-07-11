import { useEditor, EditorContent } from '@tiptap/react';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import StarterKit from '@tiptap/starter-kit';

type Props = {
  content: string;
  onChange: (content: string) => void;
};

// const exampleContent = `<p><table>
//   <thead>
//     <tr>
//       <th>Phase</th>
//       <th>Task ID</th>
//       <th>Task Description</th>
//       <th>Owner</th>
//       ...
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td>Initiation & Planning</td>
//       <td>1.1</td>
//       <td>Define Project Scope & Objectives</td>
//       <td>Project Manager</td>
//       ...
//     </tr>
//   </tbody>
// </table>
// </p>`;

export default function SimpleEditor({ content, onChange }: Props) {
  const cleanedValue = stripMarkdownCodeBlock(content);

 const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // Important: Disable table from StarterKit to avoid conflicts
      table: false,
    }),
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  content: cleanedValue,
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});


  return (
    <div className='prose'>
      <EditorContent editor={editor} />
    </div>
  );
}

function stripMarkdownCodeBlock(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/^```html\s*([\s\S]*?)\s*```$/i, '$1').trim();
}
