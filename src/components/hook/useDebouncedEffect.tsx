import { useEffect, type DependencyList } from 'react';

export function useDebouncedEffect(callback: () => void, deps: DependencyList, delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
