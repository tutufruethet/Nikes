import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TENIS } from '../data/tenis';
import { useMagnetico } from '../hooks/useMagnetico';

gsap.registerPlugin(ScrollTrigger);

const TEMPO = 6; // segundos por tênis
const POSE = { x: 0, y: 0, rotation: -14, scale: 1, opacity: 1, filter: 'blur(0px)' };
const pad = (n: number) => (n < 10 ? '0' : '') + n;

/* Hero "Cada par tem sua palavra".
   Efeitos da vitrine Não Codei: 06 faixas · 12 luz no mouse · 14 botão elástico · 15 embaralhar letras. */
export function Hero({ pronto, reduzido }: { pronto: boolean; reduzido: boolean }) {
  const hero = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const ver = useRef<HTMLAnchorElement>(null);
  const api = useRef<{ entrar: () => void } | null>(null);
  useMagnetico(ver, 0.3);

  useEffect(() => {
    const h = hero.current!;
    const q = <T extends Element = HTMLElement>(s: string) => h.querySelector<T>(s)!;
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(h.querySelectorAll<T>(s));
    const imgs = qa<HTMLImageElement>('.shoes img');
    const thumbs = qa<HTMLButtonElement>('.thumb');
    const word = q('.word');
    const tiras = qa('.tira');
    const linhas = qa('.linha > span');
    const eyebrowTxt = q('.eyebrow-txt');
    const idxEl = q('.idx');
    const sizesTxt = q('.sizes-txt');
    const aviso = q('[aria-live]');
    const barra = q('.progresso span');
    const root = document.documentElement;

    let atual = 0, pronto = false, emCima = 0;
    let tl: gsap.core.Timeline | null = null;
    let auto: gsap.core.Tween | null = null;
    let scrambleId = 0;
    const limpezas: (() => void)[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ouvir = (el: EventTarget, ev: string, fn: (e: any) => void, opt?: AddEventListenerOptions) => {
      el.addEventListener(ev, fn, opt);
      limpezas.push(() => el.removeEventListener(ev, fn));
    };

    const ctx = gsap.context(() => {
      /* 15 · Embaralhar letras */
      const sopa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const embaralhar = (final: string) => {
        cancelAnimationFrame(scrambleId);
        if (reduzido) { word.textContent = final; return; }
        let quadro = 0;
        const girar = () => {
          const travadas = Math.floor(quadro / 3);
          let saida = '';
          for (let i = 0; i < final.length; i++) saida += i < travadas ? final[i] : sopa[(Math.random() * sopa.length) | 0];
          word.textContent = saida;
          quadro++;
          if (travadas <= final.length) scrambleId = requestAnimationFrame(girar);
        };
        girar();
      };

      /* 06 · Faixas que se montam */
      const montarFaixas = () => gsap.fromTo(tiras,
        { yPercent: (i: number) => (i % 2 ? 1 : -1) * 110, opacity: 0.25 },
        { yPercent: 0, opacity: 0.9, duration: 1.1, ease: 'power3.out', stagger: 0.07 });
      const desmontarFaixas = () => gsap.to(tiras,
        { yPercent: (i: number) => (i % 2 ? -1 : 1) * 110, duration: 0.55, ease: 'power2.in', stagger: 0.04 });

      const textos = (i: number) => {
        const t = TENIS[i];
        idxEl.textContent = pad(i + 1);
        eyebrowTxt.textContent = t.modelo;
        sizesTxt.textContent = t.tamanhos;
        linhas[0].textContent = t.l1;
        linhas[1].textContent = t.l2;
        aviso.textContent = `${i + 1} de ${TENIS.length}: ${t.modelo}`;
        thumbs.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
        imgs.forEach((img, j) => img.setAttribute('aria-hidden', String(j !== i)));
      };

      const reiniciarAuto = () => {
        auto?.kill();
        if (reduzido) return;
        auto = gsap.fromTo(barra, { scaleX: 0 }, { scaleX: 1, duration: TEMPO, ease: 'none', onComplete: () => ir(atual + 1, 1) });
        if (emCima || document.hidden) auto.pause();
      };

      const ir = (n: number, dir?: number) => {
        if (!pronto) return;
        n = (n + TENIS.length) % TENIS.length;
        if (n === atual) return;
        dir = dir || (n > atual ? 1 : -1);
        const antes = imgs[atual], depois = imgs[n], t = TENIS[n];
        atual = n;
        tl?.progress(1).kill();
        if (reduzido) {
          gsap.set(antes, { opacity: 0 });
          gsap.set(depois, POSE);
          gsap.set(root, { '--accent': t.accent, '--deep': t.deep });
          textos(n); word.textContent = t.palavra;
          return;
        }
        tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          .addLabel('sai', 0)
          .to(antes, { x: -dir * 260, y: 40, rotation: -14 - dir * 24, opacity: 0, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, 'sai')
          .add(desmontarFaixas(), 'sai')
          .to(linhas, { yPercent: 160, duration: 0.4, ease: 'power2.in', stagger: 0.05 }, 'sai')
          .to([eyebrowTxt, q('.sizes')], { opacity: 0, y: -8, duration: 0.3 }, 'sai')
          .to(word, { opacity: 0, scale: 0.96, duration: 0.35, ease: 'power2.in' }, 'sai')
          .addLabel('entra', 0.5)
          .to(root, { '--accent': t.accent, '--deep': t.deep, duration: 0.9, ease: 'power2.inOut' }, 'sai+=.15')
          .call(() => { textos(n); embaralhar(t.palavra); }, undefined, 'entra')
          .to(word, { opacity: 1, scale: 1, duration: 0.6 }, 'entra')
          .add(montarFaixas(), 'entra')
          .fromTo(depois,
            { x: dir * 320, y: -60, rotation: -14 + dir * 30, scale: 0.86, opacity: 0, filter: 'blur(12px)' },
            { ...POSE, duration: 1.15, ease: 'expo.out' }, 'entra+=.1')
          .fromTo(linhas, { yPercent: 160 }, { yPercent: 0, duration: 0.8, stagger: 0.08 }, 'entra+=.15')
          .fromTo([eyebrowTxt, q('.sizes')], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 'entra+=.25');
        reiniciarAuto();
      };

      thumbs.forEach((b, i) => ouvir(b, 'click', () => ir(i)));
      ouvir(q('.next'), 'click', () => ir(atual + 1, 1));
      ouvir(q('.prev'), 'click', () => ir(atual - 1, -1));
      ouvir(document, 'keydown', (e: KeyboardEvent) => {
        const alvo = e.target as HTMLElement;
        if (/input|textarea|select/i.test(alvo.tagName)) return;
        const r = h.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        if (e.key === 'ArrowRight') ir(atual + 1, 1);
        if (e.key === 'ArrowLeft') ir(atual - 1, -1);
      });
      ouvir(document, 'visibilitychange', () => {
        if (!auto) return;
        (document.hidden || emCima) ? auto.pause() : auto.resume();
      });
      [q('.seletor'), q('.ctas')].forEach((el) => {
        ouvir(el, 'mouseenter', () => { emCima++; auto?.pause(); });
        ouvir(el, 'mouseleave', () => { emCima = Math.max(0, emCima - 1); if (auto && !document.hidden) auto.resume(); });
      });

      /* a lista da Coleção escolhe um par aqui no topo */
      const escolher = (e: Event) => ir((e as CustomEvent<number>).detail);
      window.addEventListener('par:escolher', escolher);
      limpezas.push(() => window.removeEventListener('par:escolher', escolher));

      /* swipe no celular */
      let toqueX: number | null = null;
      ouvir(h, 'touchstart', (e: TouchEvent) => { toqueX = e.touches[0].clientX; }, { passive: true });
      ouvir(h, 'touchend', (e: TouchEvent) => {
        if (toqueX === null) return;
        const dx = e.changedTouches[0].clientX - toqueX; toqueX = null;
        if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      });

      /* 12 · Luz que segue o mouse + parallax */
      const shoeX = gsap.quickTo(q('.shoe-float'), 'x', { duration: 0.9, ease: 'power3' });
      const shoeY = gsap.quickTo(q('.shoe-float'), 'y', { duration: 0.9, ease: 'power3' });
      const wordX = gsap.quickTo(q('.word-wrap'), 'x', { duration: 1.2, ease: 'power3' });
      ouvir(h, 'mousemove', (ev: MouseEvent) => {
        const r = h.getBoundingClientRect();
        h.style.setProperty('--x', `${ev.clientX - r.left}px`);
        h.style.setProperty('--y', `${ev.clientY - r.top}px`);
        if (reduzido) return;
        const nx = (ev.clientX - r.left) / r.width - 0.5, ny = (ev.clientY - r.top) / r.height - 0.5;
        shoeX(nx * 36); shoeY(ny * 24); wordX(nx * -40);
      });

      /* 14 · Botão elástico (mola com velocidade e amortecimento) */
      if (!reduzido) {
        const btn = cta.current!;
        let escala = 1, vel = 0, alvoE = 1, id = 0;
        ouvir(btn, 'mouseenter', () => { alvoE = 1.1; });
        ouvir(btn, 'mouseleave', () => { alvoE = 1; });
        ouvir(btn, 'mousedown', () => { alvoE = 0.9; });
        ouvir(btn, 'mouseup', () => { alvoE = 1.1; });
        const passo = () => {
          vel = (vel + (alvoE - escala) * 0.22) * 0.72;
          escala += vel;
          btn.style.scale = String(escala);
          id = requestAnimationFrame(passo);
        };
        const obs = new IntersectionObserver(([e]) => {
          cancelAnimationFrame(id);
          if (e.isIntersecting) id = requestAnimationFrame(passo);
        });
        obs.observe(h);
        limpezas.push(() => { obs.disconnect(); cancelAnimationFrame(id); });
      }

      /* estado inicial, antes do carregamento terminar */
      gsap.set(root, { '--accent': TENIS[0].accent, '--deep': TENIS[0].deep });
      textos(0);
      if (reduzido) {
        gsap.set(imgs[0], POSE);
        word.textContent = TENIS[0].palavra;
      } else {
        gsap.set(tiras, { yPercent: (i: number) => (i % 2 ? 1 : -1) * 110 });
        gsap.set(linhas, { yPercent: 160 });
        gsap.set([q('.nav'), ...qa('.seletor > *'), q('.rodape-hero'), q('.eyebrow'), q('.sizes'), ...qa('.ctas > *')], { opacity: 0 });
        word.textContent = '';
        gsap.to(q('.shoes'), { y: -16, rotation: 1.5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to(q('.sombra'), { scaleX: 0.86, opacity: 0.7, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }

      /* entrada, chamada quando o carregamento acaba */
      api.current = {
        entrar: () => {
          if (reduzido) { pronto = true; return; }
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .call(() => embaralhar(TENIS[0].palavra), undefined, 0)
            .add(montarFaixas(), 0)
            .fromTo(imgs[0], { y: -260, rotation: -34, scale: 0.8, opacity: 0, filter: 'blur(14px)' },
              { ...POSE, duration: 1.4, ease: 'expo.out' }, 0.15)
            .to(linhas, { yPercent: 0, duration: 0.9, stagger: 0.1 }, 0.35)
            .to([q('.eyebrow'), q('.sizes')], { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.45)
            .fromTo(qa('.ctas > *'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.55)
            .to(q('.nav'), { opacity: 1, duration: 0.6 }, 0.55)
            .fromTo(qa('.seletor > *'), { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.06 }, 0.6)
            .to(q('.rodape-hero'), { opacity: 1, duration: 0.6 }, 0.75)
            .call(() => { pronto = true; reiniciarAuto(); });
        },
      };

      /* saída do hero na rolagem */
      if (!reduzido) {
        gsap.timeline({ scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: 0.6 } })
          // .palco é centralizado com translate -50% -50%, que o GSAP converte em xPercent/yPercent
          .fromTo(q('.palco'), { xPercent: -50, yPercent: -50, scale: 1 }, { xPercent: -50, yPercent: -32, scale: 1.18, ease: 'none' }, 0)
          .fromTo(q('.word-wrap'), { yPercent: 0, opacity: 1 }, { yPercent: -35, opacity: 0.15, ease: 'none' }, 0)
          .fromTo(q('.faixas'), { xPercent: -50, yPercent: 0 }, { xPercent: -50, yPercent: -20, ease: 'none' }, 0)
          .fromTo([q('.info'), q('.seletor'), q('.rodape-hero')], { y: 0, autoAlpha: 1 }, { y: -40, autoAlpha: 0, ease: 'none', immediateRender: false }, 0);
      }
    }, h);

    return () => {
      cancelAnimationFrame(scrambleId);
      auto?.kill();
      tl?.kill();
      limpezas.forEach((f) => f());
      ctx.revert();
    };
  }, [reduzido]);

  useEffect(() => { if (pronto) api.current?.entrar(); }, [pronto, reduzido]);

  return (
    <section id="topo" className="hero" ref={hero} aria-label="Tênis em destaque">
      <header className="nav">
        <a className="logo" href="#topo" aria-label="PAR, início">PAR</a>
        <nav className="nav-links" aria-label="Principal">
          <a href="#anatomia">Anatomia</a>
          <a href="#colecao">Coleção</a>
          <a href="#manifesto">Manifesto</a>
          <a href="#contato">Contato</a>
        </nav>
        <div className="nav-actions">
          <a href="#colecao" className="nav-icon" aria-label="Ver a coleção">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          </a>
          <a href="#contato" className="nav-icon" aria-label="Sacola">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
          </a>
        </div>
      </header>

      <div className="luz" aria-hidden="true" />
      <div className="grao" aria-hidden="true" />
      <div className="word-wrap" aria-hidden="true"><span className="word" /></div>
      <div className="faixas" aria-hidden="true">
        <span className="tira" /><span className="tira" /><span className="tira" /><span className="tira" />
      </div>

      <div className="palco">
        <div className="shoe-float">
          <div className="shoes">
            {TENIS.map((t) => <img key={t.img} src={t.img} alt={t.modelo} draggable={false} decoding="async" />)}
          </div>
        </div>
        <div className="sombra" aria-hidden="true" />
      </div>

      <div className="info">
        <p className="eyebrow"><span className="idx">01</span><span className="sep" /><span className="eyebrow-txt" /></p>
        <h1 className="headline">
          <span className="linha"><span /></span>
          <span className="linha"><span /></span>
        </h1>
        <p className="sizes">Numeração <strong className="sizes-txt" /></p>
        <div className="ctas">
          <a href="#contato" className="btn btn-main" ref={cta}>Comprar agora
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a href="#colecao" className="btn btn-ghost btn-magnetico" ref={ver}>Ver coleção</a>
        </div>
      </div>

      <div className="seletor" role="group" aria-label="Escolha o tênis">
        {TENIS.map((t, i) => (
          <button key={t.img} type="button" className="thumb" aria-pressed={i === 0} aria-label={`${t.modelo}: ${t.palavra}`}>
            <span className="n">{pad(i + 1)}</span><img src={t.img} alt="" draggable={false} />
          </button>
        ))}
      </div>

      <div className="rodape-hero">
        <div className="setas">
          <button type="button" className="seta prev" aria-label="Tênis anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
          <button type="button" className="seta next" aria-label="Próximo tênis"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
        </div>
        <div className="progresso" aria-hidden="true"><span /></div>
        <p className="role">Role <span aria-hidden="true">↓</span></p>
      </div>

      <p className="sr-only" aria-live="polite" />
    </section>
  );
}
