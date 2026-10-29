import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TENIS } from '../data/tenis';

gsap.registerPlugin(ScrollTrigger);

/* Coleção: índice editorial dos pares. No desktop a foto do par segue o mouse sobre a linha. */
export function Colecao({ reduzido }: { reduzido: boolean }) {
  const secao = useRef<HTMLElement>(null);
  const flutua = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = secao.current!;
    const f = flutua.current!;
    const linhas = Array.from(s.querySelectorAll<HTMLElement>('.colecao-linha'));
    const imgs = Array.from(f.querySelectorAll('img'));
    const ctx = gsap.context(() => {
      if (!reduzido) {
        gsap.from(linhas, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: s.querySelector('.colecao-lista'), start: 'top 85%', once: true },
        });
      }
      if (!window.matchMedia('(pointer:fine)').matches) return;
      const x = gsap.quickTo(f, 'x', { duration: 0.6, ease: 'power3' });
      const y = gsap.quickTo(f, 'y', { duration: 0.6, ease: 'power3' });
      const rot = gsap.quickTo(f, 'rotation', { duration: 0.8, ease: 'power3' });
      let ultimoX = 0;
      const move = (e: PointerEvent) => {
        x(e.clientX - 170); y(e.clientY - 170);
        rot(gsap.utils.clamp(-14, 14, (e.clientX - ultimoX) * 0.6) - 10);
        ultimoX = e.clientX;
      };
      linhas.forEach((l, i) => {
        l.addEventListener('pointerenter', () => {
          gsap.to(f, { opacity: 1, scale: 1, duration: 0.3 });
          imgs.forEach((im, j) => gsap.to(im, { opacity: j === i ? 1 : 0, duration: 0.25 }));
        });
      });
      const lista = s.querySelector<HTMLElement>('.colecao-lista')!;
      lista.addEventListener('pointermove', move);
      lista.addEventListener('pointerleave', () => gsap.to(f, { opacity: 0, scale: 0.8, duration: 0.3 }));
    }, s);
    return () => ctx.revert();
  }, [reduzido]);

  const escolher = (i: number) => {
    window.dispatchEvent(new CustomEvent('par:escolher', { detail: i }));
    document.getElementById('topo')?.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth' });
  };

  return (
    <section id="colecao" ref={secao} className="bg-tinta px-[var(--gutter)] py-[clamp(80px,14vh,160px)]" aria-labelledby="colecao-titulo">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="olho">Coleção</p>
          <h2 id="colecao-titulo" className="titulo-display mt-4 text-[clamp(52px,8vw,128px)]">Cinco pares,<br />cinco palavras.</h2>
        </div>
        <p className="max-w-[34ch] text-[15px] leading-relaxed text-branco/70">
          Escolha um par para vê-lo no topo da página, com a palavra e a cor dele.
        </p>
      </div>

      <ul className="colecao-lista border-b border-[var(--linha)]">
        {TENIS.map((t, i) => (
          <li key={t.img} className="colecao-linha">
            <button type="button" onClick={() => escolher(i)}
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-5 text-left md:grid-cols-[60px_1.4fr_1fr_140px_auto] md:py-7">
              <span className="text-[12px] font-bold tabular-nums tracking-[.14em] text-branco/50">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[clamp(30px,4.6vw,72px)] uppercase leading-[.95]">{t.palavra}</span>
              <img src={t.img} alt="" className="row-span-2 h-16 w-20 -rotate-12 object-contain md:hidden" />
              <span className="col-start-2 text-[14px] font-semibold text-branco/70 md:col-start-auto md:text-[16px]">{t.modelo}</span>
              <span className="hidden text-[14px] tabular-nums text-branco/60 md:block">{t.tamanhos}</span>
              <span className="hidden items-center gap-2 text-[14px] font-bold md:inline-flex">
                Ver par
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div ref={flutua} className="colecao-flutua" aria-hidden="true">
        {TENIS.map((t) => <img key={t.img} src={t.img} alt="" />)}
      </div>
    </section>
  );
}
