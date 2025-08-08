import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export function useVisibleCommentIds(editor: Editor | null) {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  useEffect(() => {
    const updateVisibleIds = () => {
      const dom = document.querySelector('#pdf-content');
      if (!dom) return;

      const spans = dom.querySelectorAll('[data-comment-id]');
      const ids = Array.from(spans)
        .map((el) => el.getAttribute('data-comment-id'))
        .filter(Boolean) as string[];

      setVisibleIds(ids);
    };

    updateVisibleIds(); // lần đầu gọi

    const dom = document.querySelector('#pdf-content');
    if (!dom) return;

    const observer = new MutationObserver(() => {
      updateVisibleIds();
    });

    observer.observe(dom, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [editor]);

  return visibleIds;
}
