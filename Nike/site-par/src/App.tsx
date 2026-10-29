import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loader } from './components/Loader';
import { Cursor } from './components/Cursor';
import { Hero } from './components/Hero';
import { Anatomia } from './components/Anatomia';
import { Colecao } from './components/Colecao';
import { Manifesto } from './components/Manifesto';
import { Rodape } from './components/Rodape';
import { useCelular, useReduzido } from './hooks/useReduzido';

const SLOGAN = Array.from({ length: 10 }, () => 'Cada par tem sua palavra.');

export default function App() {
  const reduzido = useReduzido();
  const celular = useCelular();
  const [pronto, setPronto] = useState(false);
  const aoCarregar = useCallback(() => setPronto(true), []);

  // depois do carregamento, as medidas das seções presas podem ter mudado
  useEffect(() => { if (pronto) ScrollTrigger.refresh(); }, [pronto]);

  return (
    <>
      <Loader onPronto={aoCarregar} reduzido={reduzido} />
      <Cursor />
      <main>
        <Hero pronto={pronto} reduzido={reduzido} />
        <section className="faixa-slogan" aria-label="Slogan">
          <div className="marquee-trilho" aria-hidden="true">
            {SLOGAN.map((t, i) => <span key={i}>{t}</span>)}
          </div>
          <p className="sr-only">Cada par tem sua palavra.</p>
        </section>
        <Anatomia reduzido={reduzido} celular={celular} />
        <Colecao reduzido={reduzido} />
        <Manifesto reduzido={reduzido} />
      </main>
      <Rodape reduzido={reduzido} />
    </>
  );
}
