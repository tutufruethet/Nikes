import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/* Botão magnético: puxa o elemento na direção do mouse enquanto ele está por perto. */
export function useMagnetico(ref: RefObject<HTMLElement>, forca = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * forca);
      y((e.clientY - (r.top + r.height / 2)) * forca);
    };
    const sai = () => { x(0); y(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', sai);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', sai); };
  }, [ref, forca]);
}
