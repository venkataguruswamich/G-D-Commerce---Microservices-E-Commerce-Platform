import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — G&D Commerce` : 'G&D Commerce';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
