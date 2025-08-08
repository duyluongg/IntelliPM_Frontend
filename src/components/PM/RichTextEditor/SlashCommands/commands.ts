import { Editor, type Range } from '@tiptap/core';
import { GanttChartSquare, KanbanSquare } from 'lucide-react';

interface CommandProps {
  editor: Editor;
  range: Range;
}

export const commands = [
  {
    title: 'Gantt Chart',
    icon: GanttChartSquare,
    id: 'gantt', // 👈 Add a unique ID
    onSelect: (options: any) => {
      options.onGanttCommand?.(); // gọi callback được truyền vào
    },
  },
  {
    title: 'Board View',
    icon: KanbanSquare,
    id: 'board',
    onSelect: (options: any) => {
      options.onGanttCommand?.(); // gọi callback được truyền vào
    },
  },
];
