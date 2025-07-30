// // components/Editor/SlashCommands/SlashCommandExtension.ts

// import { Extension } from '@tiptap/core';
// import { ReactRenderer } from '@tiptap/react';
// import Suggestion from '@tiptap/suggestion';
// import tippy from 'tippy.js';
// import { commands } from './SlashCommands/commands';
// import { SlashCommandList } from './SlashCommands/SlashCommandList';

// export const SlashCommandExtension = Extension.create({
//   name: 'slashCommand',

//   addOptions() {
//     return {
//       onGanttCommand: () => {},
//       onBoardCommand: () => {},
//     };
//   },

//   addProseMirrorPlugins() {
//     const extensionOptions = this.options;

//     return [
//       Suggestion({
//         editor: this.editor,
//         char: '/',
//         items: ({ query }) =>
//           commands
//             .filter((item) =>
//               item.title.toLowerCase().startsWith(query.toLowerCase())
//             )
//             .map((item) => ({
//               ...item,
//               onGanttCommand: extensionOptions.onGanttCommand,
//               onBoardCommand: extensionOptions.onBoardCommand,
//             })),
//         command: ({ editor, range, props }) => {
//           editor.chain().focus().deleteRange(range).run();

//           props?.onSelect?.(extensionOptions);
//         },
//         render: () => {
//           let component: ReactRenderer<any>;
//           let popup: any;

//           return {
//             onStart: (props) => {
//               component = new ReactRenderer(SlashCommandList, {
//                 props,
//                 editor: props.editor,
//               });

//               popup = tippy('body', {
//                 getReferenceClientRect: props.clientRect,
//                 appendTo: () => document.body,
//                 content: component.element,
//                 showOnCreate: true,
//                 interactive: true,
//                 trigger: 'manual',
//                 placement: 'bottom-start',
//               });
//             },
//             onUpdate(props) {
//               component.updateProps(props);
//               popup[0].setProps({
//                 getReferenceClientRect: props.clientRect,
//               });
//             },
//             onKeyDown(props) {
//               if (props.event.key === 'Escape') {
//                 popup[0].hide();
//                 return true;
//               }
//               return (component.ref as any)?.onKeyDown?.(props);
//             },
//             onExit() {
//               popup[0].destroy();
//               component.destroy();
//             },
//           };
//         },
//       }),
//     ];
//   },
// });
// components/Editor/SlashCommands/SlashCommandExtension.ts

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { commands } from './SlashCommands/commands';
import { SlashCommandList } from './SlashCommands/SlashCommandList';

interface SlashCommandExtensionOptions {
  onGanttCommand: (projectKey: string) => void;
  onBoardCommand: () => void;
}

export const SlashCommandExtension = Extension.create<SlashCommandExtensionOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      onGanttCommand: () => {},
      onBoardCommand: () => {},
    };
  },

  addProseMirrorPlugins() {
    const extensionOptions = this.options;

    return [
      (Suggestion({
        editor: this.editor,
        char: '/',
        items: ({ query }) =>
          commands
            .filter((item) =>
              item.title.toLowerCase().startsWith(query.toLowerCase())
            )
            .map((item) => ({
              ...item,
              onGanttCommand: extensionOptions.onGanttCommand,
              onBoardCommand: extensionOptions.onBoardCommand,
            })),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();

          props?.onSelect?.(extensionOptions);
        },
        render: () => {
          let component: ReactRenderer<any>;
          let popup: any;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              component.updateProps(props);
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              return (component.ref as any)?.onKeyDown?.(props);
            },
            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }) as any),
    ];
  },
});
