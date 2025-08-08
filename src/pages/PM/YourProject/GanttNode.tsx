// extensions/GanttNode.tsx
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Gantt from '../Gantt/Gantt'; // Component bạn đã viết
import { NodeViewWrapper } from '@tiptap/react';

const GanttWrapper = ({ node }: any) => {
  const projectKey = node?.attrs?.projectKey || 'NotFound';

  return (
    <NodeViewWrapper as='div' className='border border-gray-300 rounded p-2 my-4'>
      <div id={`gantt-${projectKey}`}>
        <Gantt projectKey={projectKey} />
      </div>
    </NodeViewWrapper>
  );
};

export const GanttNode = Node.create({
  name: 'gantt',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      projectKey: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'gantt-view' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['gantt-view', HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GanttWrapper);
  },
});
