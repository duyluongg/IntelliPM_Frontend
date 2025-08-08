import { Mark } from '@tiptap/core';
import './CommentMark.scss';

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      addComment: (attributes: { commentId: string }) => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-id'),
        renderHTML: (attrs) => {
          return {
            'data-comment-id': attrs.commentId,
            // class: 'bg-yellow-100 underline decoration-dotted cursor-pointer',
            class: 'comment',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      addComment:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark('comment', attrs);
        },

      unsetComment:
        (commentId: string) =>
        ({
          tr,
          state,
          dispatch,
        }: {
          tr: import('prosemirror-state').Transaction;
          state: import('prosemirror-state').EditorState;
          dispatch?: (tr: import('prosemirror-state').Transaction) => void;
        }) => {
          const { schema, doc } = state;
          const markType = schema.marks.comment;

          // Duyệt tất cả các node trong doc
          doc.descendants((node: import('prosemirror-model').Node, pos: number) => {
            node.marks.forEach((mark: import('prosemirror-model').Mark) => {
              if (mark.type === markType && mark.attrs.commentId === commentId) {
                tr.removeMark(pos, pos + node.nodeSize, markType);
              }
            });
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
    };
  },
});
