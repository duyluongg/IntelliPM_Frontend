// // MentionExtension.ts
// import Mention from '@tiptap/extension-mention';
// import tippy from 'tippy.js';
// import type { Instance, Props as TippyProps } from 'tippy.js';
// import 'tippy.js/dist/tippy.css';
// import './styles.scss';
// import type { SuggestionProps } from '@tiptap/suggestion'; // <-- THÊM DÒNG NÀY

// export function createMentionExtension(mentionItems: { id: number; label: string }[]) {
//   return Mention.configure({
//     HTMLAttributes: {
//       class: 'mention bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded',
//     },
//     suggestion: {
//       char: '@',
//       items: ({ query }) =>
//         mentionItems
//           .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
//           .slice(0, 5),

//       render: () => {
//         let popup: Instance[];
//         let dom: HTMLDivElement;

//         return {
//           onStart: (props: SuggestionProps) => {
//             dom = document.createElement('div');
//             renderItems(props);

//             popup = [
//               tippy(document.body, {
//                 getReferenceClientRect: props.clientRect,
//                 appendTo: () => document.body,
//                 content: dom,
//                 showOnCreate: true,
//                 interactive: true,
//                 trigger: 'manual',
//                 placement: 'bottom-start',
//               }),
//             ];
//           },

//           onUpdate(props: SuggestionProps) {
//             renderItems(props);
//             popup[0].setProps({
//               getReferenceClientRect: props.clientRect as TippyProps['getReferenceClientRect'], // Đã sửa kiểu
//             });
//           },
//           onExit() {
//             popup?.[0]?.destroy();
//           },
//         };

//         function renderItems({
//           items,
//           command,
//         }: {
//           items: { id: number; label: string }[];
//           command: (item: { id: number; label: string }) => void;
//         }) {
//           console.log('📌 Render items mention:', items);

//           dom.innerHTML = '';
//           items.forEach((item) => {
//             const option = document.createElement('div');
//             option.className =
//               'mention-item text-gray-900 bg-white text-sm px-3 py-2 hover:bg-gray-100 cursor-pointer';

//             option.textContent = item.label;
//             option.onclick = () => command(item);
//             dom.appendChild(option);
//           });
//         }
//       },
//     },
//   });
// }
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import type { Instance, Props as TippyProps } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './styles.scss';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { RefObject } from 'react';

// ✅ Thay đổi kiểu của tham số đầu vào
export function createMentionExtension(
  mentionItemsRef: RefObject<{ id: number; label: string }[]>
) {
  console.log('📎 Creating mention extension with items:', mentionItemsRef.current);

  return Mention.configure({
    HTMLAttributes: {
      class: 'mention bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded',
    },
    suggestion: {
      char: '@',

      items: ({ query }) => {
        // ✅ BƯỚC 2: Luôn đọc dữ liệu mới nhất từ `ref.current`
        const items = mentionItemsRef.current;

        if (query.trim() === '') {
          return items.slice(0, 5);
        }

        return items
          .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
      },

      render: () => {
        let popup: Instance[] = [];
        let dom: HTMLDivElement;

        return {
          onStart: (props: SuggestionProps) => {
            console.log('🚀 onStart triggered with props:', props);

            dom = document.createElement('div');
            dom.className = 'mention-dropdown bg-white border shadow rounded p-1';

            renderItems(props);

            if (!props.clientRect) {
              console.warn('❗ clientRect is undefined in onStart');
            }

            popup = [
              tippy(document.body, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: dom,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              }),
            ];

            console.log('📦 Tippy popup created:', popup);
          },

          onUpdate(props: SuggestionProps) {
            console.log('🔄 onUpdate triggered');

            renderItems(props);

            if (!props.clientRect) {
              console.warn('❗ clientRect is undefined in onUpdate');
              return;
            }

            popup[0]?.setProps({
              getReferenceClientRect: props.clientRect,
            });
          },

          onExit() {
            console.log('❌ onExit triggered, destroying popup');
            popup?.[0]?.destroy();
          },
        };

        function renderItems({
          items,
          command,
        }: {
          items: { id: number; label: string }[];
          command: (item: { id: number; label: string }) => void;
        }) {
          console.log('📌 Rendering items:', items);

          dom.innerHTML = '';
          if (items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'mention-item text-gray-500 text-sm px-3 py-2 italic';
            empty.textContent = 'No matches';
            dom.appendChild(empty);
            return;
          }

          items.forEach((item) => {
            const option = document.createElement('div');
            option.className =
              'mention-item text-gray-900 bg-white text-sm px-3 py-2 hover:bg-gray-100 cursor-pointer';

            option.textContent = item.label;
            option.onclick = () => command(item);
            dom.appendChild(option);
          });
        }
      },
    },
  });
}
