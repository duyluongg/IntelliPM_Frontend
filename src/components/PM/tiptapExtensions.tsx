// // tiptapExtensions.ts
// import StarterKit from '@tiptap/starter-kit';
// import Table from '@tiptap/extension-table';
// import TableRow from '@tiptap/extension-table-row';
// import TableCell from '@tiptap/extension-table-cell';
// import TableHeader from '@tiptap/extension-table-header';
// import Heading from '@tiptap/extension-heading';
// import Paragraph from '@tiptap/extension-paragraph';
// import BulletList from '@tiptap/extension-bullet-list';
// import ListItem from '@tiptap/extension-list-item';
// import Bold from '@tiptap/extension-bold';
// import Italic from '@tiptap/extension-italic';

// const CustomHeading = Heading.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: null,
//         renderHTML: ({ node }) => {
//           const level = node?.attrs?.level || 1;
//           const base = 'font-bold text-gray-800 mt-4 mb-2';

//           const sizeMap: Record<number, string> = {
//             1: 'text-3xl',
//             2: 'text-2xl',
//             3: 'text-xl',
//             4: 'text-lg',
//             5: 'text-base',
//             6: 'text-sm',
//           };

//           return {
//             class: `${base} ${sizeMap[level] || ''}`,
//           };
//         },
//       },
//     };
//   },
// }).configure({
//   levels: [1, 2, 3],
// });

// const CustomParagraph = Paragraph.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: 'text-gray-700 mb-3',
//       },
//     };
//   },
// });

// const CustomBulletList = BulletList.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: 'list-disc pl-6 mb-4 text-gray-700',
//       },
//     };
//   },
// });

// const CustomListItem = ListItem.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: 'mb-1',
//       },
//     };
//   },
// });

// const CustomTableHeader = TableHeader.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: 'bg-gray-100 font-semibold p-2 border border-gray-300 text-left',
//       },
//     };
//   },
// });

// const CustomTableCell = TableCell.extend({
//   addAttributes() {
//     return {
//       class: {
//         default: 'p-2 border border-gray-300 text-sm',
//       },
//     };
//   },
// });

// export const CustomExtensions = [
//   StarterKit.configure({
//     heading: false,
//     paragraph: false,
//     bulletList: false,
//     listItem: false,
//   }),
//   CustomHeading,
//   CustomParagraph,
//   CustomBulletList,
//   CustomListItem,
//   Table.configure({
//     resizable: true,
//     HTMLAttributes: {
//       class: 'table-auto w-full',
//     },
//   }),

//   TableRow,
//   CustomTableHeader,
//   CustomTableCell,
//   Bold,
//   Italic,
// ];
import './tiptapExtension.css';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        renderHTML: ({ node }) => {
          const level = node?.attrs?.level || 1;
          const base = 'font-bold text-gray-800 mt-4 mb-2';

          const sizeMap: Record<number, string> = {
            1: 'text-3xl',
            2: 'text-2xl',
            3: 'text-xl',
            4: 'text-lg',
            5: 'text-base',
            6: 'text-sm',
          };

          return {
            class: `${base} ${sizeMap[level] || ''}`,
          };
        },
      },
    };
  },
}).configure({
  levels: [1, 2, 3],
});

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      class: {
        default: 'text-gray-700 mb-3',
      },
    };
  },
});

const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      class: {
        default: 'list-disc pl-6 mb-4 text-gray-700',
      },
    };
  },
});

const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      class: {
        default: 'mb-1',
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      class: {
        default: 'bg-gray-100 font-semibold p-2 border border-gray-300 text-left',
      },
    };
  },
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      class: {
        default: 'p-2 border border-gray-300 text-sm',
      },
    };
  },
});

export const CustomExtensions = [
  StarterKit.configure({
    heading: false,
    paragraph: false,
    bulletList: false,
    listItem: false,

  }),
  CustomHeading,
  CustomParagraph,
  CustomBulletList,
  CustomListItem,
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'w-full',
    },
  }),
  TableRow,
  CustomTableHeader,
  // BaseTableCell,
  CustomTableCell,
  Bold,
  Italic,
];


