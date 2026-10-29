import { useEffect, useState } from 'react';

export function useMidia(query: string) {
  const [bate, setBate] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const muda = () => setBate(mq.matches);
    muda();
    mq.addEventListener('change', muda);
    return () => mq.removeEventListener('change', muda);
  }, [query]);
  return bate;
}

export const useReduzido = () => useMidia('(prefers-reduced-motion: reduce)');
export const useCelular = () => useMidia('(max-width: 768px)');
