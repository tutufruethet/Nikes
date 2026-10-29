import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TENIS } from '../data/tenis';

gsap.registerPlugin(ScrollTrigger);

const TEXTO = 'Tênis é a primeira coisa que alguém vê quando você entra. Por isso cada par aqui tem uma palavra: lenda, fogo, raiz, noite, rua. A sua ainda não foi escrita.';
const DESTAQUE: Record<string, string> = Object.fromEntries(TENIS.map((t) => [t.palavra.toLowerCase(), t.accent]));

/* 04 · Texto que se preenche (Não Codei): as palavras ganham cor conforme a rolagem avança. */
export function Manifesto({ reduzido }: { reduzido: boolean }) {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = secao.current!;
    const palavras = Array.from(s.querySelectorAll<HTMLElement>('.manifesto-palavra'));
    const pintar = (p: number) => {
      const n = Math.round(p * palavras.length);
      palavras.forEach((w, i) => {
        const cor = w.dataset.cor;
        w.style.color = i < n ? (cor || 'var(--branco)') : '';
      });
    };
    if (reduzido) { pintar(1); return; }
    const st = ScrollTrigger.create({
      trigger: s, start: 'top 70%', end: 'bottom 60%',
      onUpdate: (self) => pintar(self.progress),
    });
    return () => st.kill();
  }, [reduzido]);

  return (
    <section id="manifesto" ref={secao} className="bg-tinta px-[var(--gutter)] py-[clamp(90px,18vh,200px)]" aria-label="Manifesto">
      <p className="olho mb-8">Manifesto</p>
      <p className="titulo-display max-w-[18ch] text-[clamp(40px,6.4vw,104px)] !leading-[1]">
        {TEXTO.split(' ').map((w, i) => {
          const limpa = w.toLowerCase().replace(/[^a-zà-ú]/g, '');
          return (
            <span key={i} className="manifesto-palavra" data-cor={DESTAQUE[limpa]}>{w}{' '}</span>
          );
        })}
      </p>
    </section>
  );
}
