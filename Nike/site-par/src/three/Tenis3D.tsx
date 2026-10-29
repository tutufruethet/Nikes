import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MAPA_PARTES } from './partes-mapa';
import { estado } from './estado';
import { CORES_3D, PARTES } from '../data/tenis';

/* O modelo vem em duas partes: a geometria dentro de um pedaço separado do JS (modelo-dados.ts)
   e as texturas como .webp em public/models. Assim ele carrega em qualquer hospedagem,
   inclusive onde arquivos .glb não são servidos. A carga começa assim que este arquivo é importado. */
type GLTFComParser = {
  scene: THREE.Group;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parser: { json: any; getDependency: (t: string, i: number) => Promise<THREE.Material> };
};
let resultado: GLTFComParser | null = null;
let falha: unknown = null;
const promessa = import('./modelo-dados')
  .then(({ MODELO_GLB }) => {
    const bin = atob(MODELO_GLB);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new GLTFLoader().parseAsync(buf.buffer, `${import.meta.env.BASE_URL}models/`);
  })
  .then((g) => { resultado = g as unknown as GLTFComParser; })
  .catch((e) => { falha = e; });

/* lê o modelo no padrão do Suspense: enquanto carrega, suspende */
function useModelo() {
  if (falha) throw falha;
  if (!resultado) throw promessa;
  return resultado;
}

/* Subgrupos do modelo (ver partes-mapa.ts) e para onde cada um vai na vista explodida,
   em unidades do modelo (o tênis tem 2 de comprimento, y para cima, bico em +x). */
const SUBGRUPOS = [
  { parte: 0, dir: [0, -0.62, 0] },      // solado
  { parte: 1, dir: [0, 0, 0] },          // cabedal fica no centro
  { parte: 2, dir: [0, 0.04, 0.55] },    // faixa lateral +z
  { parte: 2, dir: [0, 0.04, -0.55] },   // faixa lateral -z
  { parte: 3, dir: [0.28, 0.48, 0] },    // língua
  { parte: 4, dir: [0.1, 0.82, 0] },     // cadarço e ilhoses
] as const;

// onde fica o rótulo de cada peça, relativo ao centro do subgrupo
const ROTULO_EM = [1, 1, 1, 0, 1, 1]; // um rótulo por peça (a faixa -z, do lado de trás, não leva)

function lerMapa() {
  const bin = atob(MAPA_PARTES);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}

export function Tenis3D({ comRotulos }: { comRotulos: boolean }) {
  const gltf = useModelo();
  const raiz = useRef<THREE.Group>(null);
  const partes = useRef<(THREE.Group | null)[]>([]);
  const rotulos = useRef<(HTMLDivElement | null)[]>([]);
  const [materiais, setMateriais] = useState<Record<string, THREE.Material>>({});

  /* separa a malha única em subgrupos que compartilham os mesmos atributos */
  const { geos, matriz, centros, material } = useMemo(() => {
    let malha: THREE.Mesh | null = null;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o: THREE.Object3D) => { if ((o as THREE.Mesh).isMesh) malha = o as THREE.Mesh; });
    const m = malha as unknown as THREE.Mesh;
    const geo = m.geometry;
    const idx = geo.index!.array;
    const mapa = lerMapa();
    const listas: number[][] = SUBGRUPOS.map(() => []);
    // o valor do mapa já é o índice em SUBGRUPOS
    for (let f = 0; f < mapa.length; f++) listas[mapa[f]].push(idx[f * 3], idx[f * 3 + 1], idx[f * 3 + 2]);
    const geos = listas.map((ii) => {
      const g = new THREE.BufferGeometry();
      for (const k of Object.keys(geo.attributes)) g.setAttribute(k, geo.attributes[k]);
      g.setIndex(ii);
      g.computeBoundingBox();
      return g;
    });
    const centros = geos.map((g) => g.boundingBox!.getCenter(new THREE.Vector3()));
    return { geos, matriz: m.matrixWorld.clone(), centros, material: m.material as THREE.Material };
  }, [gltf]);

  /* variações de cor: KHR_materials_variants (o three não aplica sozinho) */
  useEffect(() => {
    const json = gltf.parser.json;
    const nomes: string[] = json.extensions?.KHR_materials_variants?.variants?.map((v: { name: string }) => v.name) ?? [];
    const mapeamentos: { material: number; variants: number[] }[] =
      json.meshes[0].primitives[0].extensions?.KHR_materials_variants?.mappings ?? [];
    Promise.all(mapeamentos.map((mp) => gltf.parser.getDependency('material', mp.material).then((mat) => {
      (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.15;
      return mp.variants.map((v) => [nomes[v], mat] as const);
    }))).then((pares) => setMateriais(Object.fromEntries(pares.flat())));
  }, [gltf]);

  // escala para o tênis ter 3 unidades de comprimento, centrado na origem
  const ajuste = useMemo(() => {
    const caixa = new THREE.Box3();
    geos.forEach((g) => caixa.union(g.boundingBox!.clone().applyMatrix4(matriz)));
    const tam = caixa.getSize(new THREE.Vector3());
    const centro = caixa.getCenter(new THREE.Vector3());
    const s = 3 / Math.max(tam.x, tam.z);
    return { s, centro };
  }, [geos, matriz]);

  const corAtual = useRef(-1);
  useFrame((_, dt) => {
    const r = raiz.current;
    if (!r) return;
    // giro da rolagem + leve inclinação pelo mouse (paralaxe 3D)
    r.rotation.y = THREE.MathUtils.damp(r.rotation.y, estado.giro + estado.mouse.x * 0.25, 6, dt);
    r.rotation.x = THREE.MathUtils.damp(r.rotation.x, estado.mouse.y * 0.12, 6, dt);
    const e = estado.explode;
    partes.current.forEach((p, i) => {
      if (!p) return;
      const d = SUBGRUPOS[i].dir;
      p.position.set(d[0] * e, d[1] * e, d[2] * e);
      p.rotation.z = (i === 4 ? 0.12 : i === 0 ? -0.05 : 0) * e;
    });
    rotulos.current.forEach((el, i) => { if (el) el.style.opacity = String(estado.rotulos[i] ?? 0); });
    // troca de cor
    if (corAtual.current !== estado.cor) {
      const mat = materiais[CORES_3D[estado.cor].id];
      if (mat) {
        corAtual.current = estado.cor;
        partes.current.forEach((p) => p?.children.forEach((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = mat; }));
      }
    }
  });

  return (
    <group ref={raiz}>
      <group scale={ajuste.s} position={ajuste.centro.clone().multiplyScalar(-ajuste.s)}>
        <group matrixAutoUpdate={false} matrix={matriz}>
          {geos.map((g, i) => (
            <group key={i} ref={(el) => { partes.current[i] = el; }}>
              <mesh geometry={g} material={material} castShadow receiveShadow />
              {comRotulos && ROTULO_EM[i] === 1 && (
                <Html position={centros[i].toArray()} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
                  <div className="parte-rotulo" ref={(el) => { rotulos.current[SUBGRUPOS[i].parte] = el; }}>
                    <span className="pino" /><span className="traco" /><b>{PARTES[SUBGRUPOS[i].parte].nome}</b>
                  </div>
                </Html>
              )}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
