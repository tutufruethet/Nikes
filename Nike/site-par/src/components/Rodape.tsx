import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMagnetico } from '../hooks/useMagnetico';

gsap.registerPlugin(ScrollTrigger);

/* Rodapé com a marca gigante. Contatos ficam como [INSERIR] até o cliente mandar os dados reais. */
export function Rodape({ reduzido }: { reduzido: boolean }) {
  const raiz = useRef<HTMLElement>(null);
  const zap = useRef<HTMLAnchorElement>(null);
  const topo = useRef<HTMLButtonElement>(null);
  useMagnetico(zap, 0.35);
  useMagnetico(topo, 0.35);

  useEffect(() => {
    if (reduzido) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.rodape-marca span', { yPercent: 100 }, {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.rodape-marca', start: 'top 92%', once: true },
      });
    }, raiz);
    return () => ctx.revert();
  }, [reduzido]);

  return (
    <footer id="contato" ref={raiz} className="relative overflow-hidden bg-branco text-tinta">
      <div className="grid gap-12 px-[var(--gutter)] pb-10 pt-[clamp(70px,12vh,130px)] md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="olho !text-tinta/60">Contato</p>
          <p className="titulo-display mt-4 text-[clamp(44px,5.6vw,88px)]">Achou o seu par?</p>
          <a ref={zap} href="#contato" className="btn btn-magnetico mt-8 bg-tinta text-branco">
            Chamar no WhatsApp
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <p className="mt-3 text-[13px] text-tinta/60">Número: [INSERIR NÚMERO]</p>
        </div>
        <dl className="grid content-start gap-5 text-[15px]">
          <div><dt className="olho !text-tinta/60">Loja</dt><dd className="mt-1 font-semibold">[INSERIR ENDEREÇO]</dd></div>
          <div><dt className="olho !text-tinta/60">Horário</dt><dd className="mt-1 font-semibold">[INSERIR HORÁRIO]</dd></div>
          <div><dt className="olho !text-tinta/60">Instagram</dt><dd className="mt-1 font-semibold">[INSERIR @]</dd></div>
        </dl>
        <div className="grid content-start gap-5 text-[13px] leading-relaxed text-tinta/70">
          <p>
            Modelo 3D: Materials Variants Shoe, © 2021 Shopify, licença{' '}
            <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
            Separado em camadas e com texturas reduzidas para a web.
          </p>
          <p>Efeitos de movimento adaptados da vitrine Não Codei.</p>
          <p>PAR é uma marca fictícia, criada para este projeto.</p>
          <button ref={topo} type="button" className="btn btn-magnetico self-start border-[1.5px] border-tinta/30 !h-11 !px-5 !text-[14px]"
            onClick={() => document.getElementById('topo')?.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth' })}>
            Voltar ao topo ↑
          </button>
        </div>
      </div>
      <p className="rodape-marca flex select-none overflow-hidden px-[var(--gutter)] pb-[2vw] pt-[.06em]" aria-hidden="true">
        <span className="inline-block">P</span><span className="inline-block">A</span><span className="inline-block">R</span>
      </p>
    </footer>
  );
}
