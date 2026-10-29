import { useEffect, useRef } from 'react';

/* 09 · Cursor personalizado (Não Codei): o ponto acompanha na hora, o anel chega depois. */
export function Cursor() {
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    const cur = raiz.current!;
    const ponto = cur.querySelector<HTMLElement>('.ponto')!;
    const anel = cur.querySelector<HTMLElement>('.anel')!;
    const alvo = { x: 0, y: 0 }, pos = { x: 0, y: 0 };
    let id = 0;
    const move = (e: PointerEvent) => {
      alvo.x = e.clientX; alvo.y = e.clientY;
      if (!cur.classList.contains('ativo')) { pos.x = alvo.x; pos.y = alvo.y; cur.classList.add('ativo'); }
      const t = e.target as HTMLElement;
      cur.classList.toggle('sobre', !!t.closest('a, button'));
    };
    const sai = () => cur.classList.remove('ativo');
    const passo = () => {
      ponto.style.transform = `translate(${alvo.x - 4}px,${alvo.y - 4}px)`;
      pos.x += (alvo.x - pos.x) * 0.14;
      pos.y += (alvo.y - pos.y) * 0.14;
      anel.style.transform = `translate(${pos.x - 20}px,${pos.y - 20}px)`;
      id = requestAnimationFrame(passo);
    };
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', sai);
    id = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', sai);
    };
  }, []);
  return (
    <div className="cursor" ref={raiz} aria-hidden="true">
      <span className="ponto" /><span className="anel" />
    </div>
  );
}
