import { createContext, useContext } from 'react';

export const DocumentContext = createContext<{ documentId: number } | null>(null);

export const useDocumentId = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocumentId must be used within DocumentProvider');
  return context.documentId;
};
