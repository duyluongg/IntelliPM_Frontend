// MentionExtension.ts
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { ReactRenderer } from '@tiptap/react';
import SuggestionList from './SuggestionList';
import type { SuggestionProps } from '@tiptap/suggestion';

export const MentionExtension = (itemsRef: React.RefObject<MentionItem[]>) =>
  Mention.configure({
    HTMLAttributes: {
      class: 'mention bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded',
    },
    suggestion: {
      char: '@',
      items: ({ query }) =>
        (itemsRef.current || [])
          .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5),

      render: () => {
        let component: ReactRenderer;
        let popup: any;

        return {
          onStart: (props: SuggestionProps) => {
            component = new ReactRenderer(SuggestionList, {
              props,
              editor: props.editor,
            });

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect as any,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },

          onUpdate(props: SuggestionProps) {
            component.updateProps(props);
            popup[0].setProps({
              getReferenceClientRect: props.clientRect as any,
            });
          },

          onExit() {
            popup[0]?.destroy();
            component?.destroy();
          },
        };
      },
    },
  });
