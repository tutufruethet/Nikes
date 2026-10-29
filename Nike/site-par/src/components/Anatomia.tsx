import { Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { Cena } from '../three/Cena';
import { estado } from '../three/estado';
import { CORES_3D, PARTES } from '../data/tenis';
import { useMagnetico } from '../hooks/useMagnetico';

gsap.registerPlugin(ScrollTrigger);

const ETAPAS = ['Giro', 'Material', 'Camadas', 'Peças', 'Montagem', 'Cor'];
const VOLTA = Math.PI * 2;

/* "O par por dentro": seção presa na tela enquanto a rolagem gira o tênis, aproxima a câmera,
   abre o tênis em camadas, explica cada peça, monta de novo e termina no shot final com as cores. */
export function Anatomia({ reduzido, celular }: { reduzido: boolean; celular: boolean }) {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const [cor, setCor] = useState(0);
  const [ativo, setAtivo] = useState(false);
  useMagnetico(cta, 0.4);

  const escolherCor = (i: number) => {
    setCor(i);
    estado.cor = i;
  };

  /* só desenha o 3D enquanto a seção está perto da tela */
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setAtivo(e.isIntersecting), { rootMargin: '0px' });
    obs.observe(secao.current!);
    return () => obs.disconnect();
  }, []);

  /* paralaxe do mouse */
  useEffect(() => {
    if (reduzido) return;
    const p = palco.current!;
    const move = (e: PointerEvent) => {
      const r = p.getBoundingClientRect();
      estado.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      estado.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * -2;
    };
    const sai = () => { estado.mouse.x = 0; estado.mouse.y = 0; };
    p.addEventListener('pointermove', move);
    p.addEventListener('pointerleave', sai);
    return () => { p.removeEventListener('pointermove', move); p.removeEventListener('pointerleave', sai); };
  }, [reduzido]);

  useEffect(() => {
    const s = secao.current!;
    const q = (sel: string) => s.querySelectorAll<HTMLElement>(sel);
    const itens = Array.from(q('.peca-item'));
    const passos = Array.from(q('.etapa'));

    const marcar = (peca: number, etapa: number) => {
      itens.forEach((el, i) => el.toggleAttribute('data-ativo', i === peca));
      passos.forEach((el, i) => el.toggleAttribute('data-ativo', i === etapa));
    };

    if (reduzido) {
      Object.assign(estado, { giro: -0.5, cam: 3, explode: 0 });
      estado.rotulos = [0, 0, 0, 0, 0];
      // sem animação: só o shot final no palco; as peças vêm em lista logo abaixo
      gsap.set(q('.ato-a, .ato-b, .ato-c, .ato-e'), { autoAlpha: 0 });
      gsap.set(q('.ato-f, .palavra-fundo'), { autoAlpha: 1 });
      return;
    }

    Object.assign(estado, { giro: 0, cam: 0, explode: 0 });
    const ctx = gsap.context(() => {
      gsap.set(q('.ato-b, .ato-c, .ato-e, .ato-f, .palavra-fundo'), { autoAlpha: 0 });
      gsap.set(q('.ato-a .mascara > span'), { yPercent: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: s,
          pin: palco.current,
          start: 'top top',
          end: () => '+=' + palco.current!.offsetHeight * (celular ? 4.5 : 6),
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (st) => {
            const t = st.progress * tl.duration();
            const etapa = t < 1.6 ? 0 : t < 3 ? 1 : t < 4.4 ? 2 : t < 7 ? 3 : t < 8.2 ? 4 : 5;
            const peca = t >= 4.4 && t < 7 ? Math.min(4, Math.floor((t - 4.4) / 0.5)) : -1;
            marcar(peca, etapa);
          },
        },
      });

      // 1 · gira
      tl.to(estado, { giro: VOLTA, duration: 1.6, ease: 'power1.inOut' }, 0)
        .to(q('.ato-a .mascara > span'), { yPercent: -110, duration: 0.4, stagger: 0.05, ease: 'power2.in' }, 1.25)
        .to(q('.ato-a'), { autoAlpha: 0, duration: 0.3 }, 1.4) // some inteiro: a vírgula de "par," desce abaixo da máscara
      // 2 · câmera chega perto do material
        .to(estado, { cam: 1, giro: VOLTA - 0.45, duration: 1.4, ease: 'power2.inOut' }, 1.6)
        .fromTo(q('.ato-b'), { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 2.2)
        .to(q('.ato-b'), { autoAlpha: 0, x: -20, duration: 0.3 }, 2.85)
      // 3 · abre em camadas
        .to(estado, { cam: 2, giro: VOLTA + 0.35, duration: 1.4, ease: 'power2.inOut' }, 3)
        .to(estado, { explode: 1, duration: 1.1, ease: 'power3.inOut' }, 3.3)
        .to(q('.ato-c'), { autoAlpha: 1, duration: 0.3 }, 4.1);
      // 4 · cada peça com seu rótulo
      PARTES.forEach((_, i) => {
        tl.to(estado.rotulos, { [i]: 1, duration: 0.3 }, 4.4 + i * 0.5);
      });
      // 5 · monta de novo
      tl.to(estado.rotulos, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, duration: 0.3 }, 7)
        .to(q('.ato-c'), { autoAlpha: 0, duration: 0.3 }, 7)
        .to(estado, { explode: 0, duration: 1, ease: 'power3.inOut' }, 7.1)
        .fromTo(q('.ato-e'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 7.2)
        .to(q('.ato-e'), { autoAlpha: 0, y: -20, duration: 0.3 }, 7.95)
      // 6 · shot final
        .to(estado, { cam: 3, giro: VOLTA * 2 - 0.5, duration: 1.2, ease: 'power2.inOut' }, 8.2)
        .fromTo(q('.palavra-fundo'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 8.5)
        .fromTo(q('.ato-f'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 8.9)
        .to({}, { duration: 0.6 }); // respiro antes de soltar a seção
    }, s);
    return () => ctx.revert();
  }, [reduzido, celular]);

  const c = CORES_3D[cor];

  return (
    <section id="anatomia" ref={secao} className="anatomia" aria-labelledby="anatomia-titulo"
      style={{ ['--cor3d' as string]: c.cor, ['--fundo3d' as string]: c.fundo }}>
      <div ref={palco} className="anatomia-palco">
        <div className="absolute inset-0 transition-[background] duration-700"
          style={{ background: 'radial-gradient(70% 60% at 50% 55%, var(--fundo3d), var(--preto) 75%)' }} aria-hidden="true" />
        <p className="palavra-fundo pointer-events-none absolute inset-0 flex items-center justify-center font-display leading-none text-[34vw] text-branco/[.09] select-none" aria-hidden="true">PAR</p>

        <Canvas className="!absolute inset-0" shadows dpr={celular ? [1, 1.5] : [1, 1.75]}
          frameloop={ativo ? 'always' : 'never'} gl={{ alpha: true, antialias: true }}
          camera={{ fov: 30, position: [0, 0.5, 7.6], near: 0.1, far: 60 }}
          aria-label="Tênis em 3D que gira e se abre em camadas com a rolagem" role="img">
          <Suspense fallback={null}>
            <Cena comRotulos={!celular} />
          </Suspense>
        </Canvas>

        {/* trilho das etapas */}
        {!reduzido && <ol className="absolute right-[var(--gutter)] top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 text-right md:flex" aria-label="Etapas">
          {ETAPAS.map((e, i) => (
            <li key={e} className="etapa flex items-center justify-end gap-3 text-[11px] font-bold uppercase tracking-[.18em] text-branco/35 transition-colors data-[ativo]:text-branco">
              {e}<span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ol>}

        {/* ato 1 */}
        <div className="ato-a pointer-events-none absolute left-[var(--gutter)] top-[14%] z-10 max-w-[620px]">
          <p className="olho">Anatomia</p>
          <h2 id="anatomia-titulo" className="titulo-display mt-4 text-[clamp(56px,8.4vw,132px)]">
            <span className="mascara"><span>Um par,</span></span>
            <span className="mascara"><span>por dentro.</span></span>
          </h2>
          <p className="dica mt-6 max-w-[34ch] text-[15px] leading-relaxed text-branco/70">
            Role a página: o tênis gira, abre em camadas e mostra para que serve cada peça.
          </p>
        </div>

        {/* ato 2 */}
        <div className="ato-b pointer-events-none absolute bottom-[14%] right-[var(--gutter)] z-10 max-w-[360px] md:right-[calc(var(--gutter)+150px)]">
          <p className="olho">Material</p>
          <p className="titulo-display mt-3 text-[clamp(36px,4vw,56px)]">Malha que respira.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-branco/70">
            O cabedal deste modelo é de tecido em malha: estica com o pé e deixa o ar circular.
          </p>
        </div>

        {/* atos 3 e 4: índice das peças */}
        <div className="ato-c absolute bottom-[10%] left-[var(--gutter)] z-10 w-[min(380px,calc(100%-2*var(--gutter)))] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <p className="olho mb-4 hidden md:block">Peças</p>
          <ol className="flex flex-col">
            {PARTES.map((p, i) => (
              <li key={p.nome} className="peca-item group border-t border-[var(--linha)] py-3 text-branco/40 transition-colors data-[ativo]:text-branco max-md:hidden max-md:data-[ativo]:block">
                <p className="flex items-baseline gap-3">
                  <span className="text-[11px] font-bold tabular-nums tracking-[.14em]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[26px] uppercase leading-none">{p.nome}</span>
                </p>
                <p className="mt-2 hidden max-w-[36ch] text-[14px] leading-relaxed text-branco/75 group-data-[ativo]:block">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ato 5 */}
        <p className="ato-e titulo-display pointer-events-none absolute inset-x-0 top-[16%] z-10 text-center text-[clamp(44px,7vw,110px)]">
          E volta a ser um só.
        </p>

        {/* ato 6 */}
        <div className="ato-f absolute inset-x-[var(--gutter)] bottom-[7%] z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="olho">Shot final</p>
            <p className="titulo-display mt-3 text-[clamp(44px,6vw,96px)]">Escolha<br />sua cor.</p>
          </div>
          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Cor do tênis 3D">
              {CORES_3D.map((k, i) => (
                <button key={k.id} type="button" className="cor-btn" aria-pressed={i === cor} onClick={() => escolherCor(i)}>
                  <span className="amostra" style={{ background: k.cor }} />{k.nome}
                </button>
              ))}
            </div>
            <a ref={cta} href="#contato" className="btn btn-main btn-magnetico self-start md:self-end">
              Quero esse par
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </div>

      {reduzido && (
        <div className="px-[var(--gutter)] pb-24 pt-10">
          <p className="olho">Anatomia</p>
          <h2 className="titulo-display mt-4 text-[clamp(44px,6vw,96px)]">Um par, por dentro.</h2>
          <ol className="mt-10 grid gap-x-10 md:grid-cols-2">
            {PARTES.map((p, i) => (
              <li key={p.nome} className="border-t border-[var(--linha)] py-5">
                <p className="flex items-baseline gap-3">
                  <span className="text-[11px] font-bold tabular-nums tracking-[.14em] text-branco/50">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[28px] uppercase leading-none">{p.nome}</span>
                </p>
                <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-branco/75">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
