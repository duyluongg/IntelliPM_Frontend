import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import tippy from 'tippy.js';

export interface SlashCommandItem {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  command: ({ editor }: { editor: any }) => void;
}

interface SlashCommandOptions {
  items: () => SlashCommandItem[];
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slash-command',

  addOptions() {
    return {
      items: () => [],
    };
  },

  addProseMirrorPlugins() {
    let popup: any = null;

    return [
      new Plugin({
        key: new PluginKey('slash-command'),

        props: {
          handleKeyDown: (view, event) => {
            if (event.key === '/' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
              // show suggestions
              const { from } = view.state.selection;

              const items = this.options.items();
              const dom = document.createElement('div');
              dom.className = 'slash-command-menu';

              items.forEach((item) => {
                const div = document.createElement('div');
                div.className = 'slash-item';
                div.textContent = item.title;
                div.onclick = () => {
                  item.command({ editor: this.editor });
                  popup?.destroy();
                };
                dom.appendChild(div);
              });

              popup = tippy(view.dom, {
                getReferenceClientRect: () => view.coordsAtPos(from),
                content: dom,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            }

            if (event.key === 'Escape' && popup) {
              popup?.destroy();
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

