import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useProgress } from '@react-three/drei';
import { TENIS } from '../data/tenis';

/* Tela de carregamento: soma o progresso das fotos do hero e do modelo 3D,
   mostra a porcentagem e abre a cortina quando tudo chegou. */
export function Loader({ onPronto, reduzido }: { onPronto: () => void; reduzido: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [fotos, setFotos] = useState(0);
  const [fontes, setFontes] = useState(false);
  const { progress: p3d, active, total } = useProgress();
  const saiu = useRef(false);
  const [desistiu, setDesistiu] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDesistiu(true), 10000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    let n = 0;
    TENIS.forEach((t) => {
      const img = new Image();
      img.onload = img.onerror = () => setFotos(++n);
      img.src = t.img;
    });
    document.fonts.ready.then(() => setFontes(true));
    document.body.classList.add('carregando');
  }, []);

  // modelo 3D conta como pronto quando o gerenciador do three terminou (ou falhou e saiu)
  const modelo = total > 0 && !active ? 100 : p3d;
  const pct = Math.round(((fotos / TENIS.length) * 100 * 0.35) + modelo * 0.6 + (fontes ? 5 : 0));
  const tudo = desistiu || (fotos === TENIS.length && fontes && total > 0 && !active);

  useEffect(() => {
    if (reduzido) return;
    gsap.fromTo('.loader-logo span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09 });
  }, [reduzido]);

  useEffect(() => {
    gsap.to('.loader-barra span', { scaleX: pct / 100, duration: 0.4, ease: 'power2.out' });
  }, [pct]);

  useEffect(() => {
    if (!tudo || saiu.current) return;
    saiu.current = true;
    const fim = () => { document.body.classList.remove('carregando'); onPronto(); };
    if (reduzido) { gsap.set(raiz.current, { autoAlpha: 0 }); fim(); return; }
    gsap.timeline({ delay: 0.5 })
      .to('.loader-logo span', { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.06 })
      .to(['.loader-barra', '.loader-pct'], { opacity: 0, duration: 0.3 }, '<')
      .to(raiz.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' })
      .call(fim, undefined, '-=0.45')
      .set(raiz.current, { display: 'none' });
  }, [tudo, onPronto, reduzido]);

  return (
    <div className="loader" ref={raiz} role="status" aria-live="polite" aria-label={`Carregando ${pct}%`}>
      <p className="loader-logo" aria-hidden="true"><span>P</span><span>A</span><span>R</span></p>
      <div className="loader-barra" aria-hidden="true"><span /></div>
      <p className="loader-pct">{String(pct).padStart(3, '0')}%</p>
    </div>
  );
}
