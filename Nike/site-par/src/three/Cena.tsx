import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Tenis3D } from './Tenis3D';
import { estado } from './estado';
import { CORES_3D } from '../data/tenis';

/* Poses de câmera percorridas pela rolagem (estado.cam vai de 0 a 3):
   0 aberto, tênis girando · 1 perto do cabedal · 2 alto, vendo as camadas · 3 shot final */
const POSES = [
  { pos: [0, 0.5, 7.6], alvo: [0, 0, 0] },
  { pos: [0.9, 0.55, 2.5], alvo: [0.25, 0.15, 0] },
  { pos: [3.6, 2.1, 8.6], alvo: [-0.2, 0.35, 0] },
  { pos: [0, 0.3, 6.4], alvo: [0, -0.05, 0] },
].map((p) => ({ pos: new THREE.Vector3(...p.pos), alvo: new THREE.Vector3(...p.alvo) }));

const suave = (t: number) => t * t * (3 - 2 * t);

function Camera() {
  const { camera, size } = useThree();
  const alvo = useRef(new THREE.Vector3());
  const pos = new THREE.Vector3(), olhar = new THREE.Vector3();
  useFrame((_, dt) => {
    const c = THREE.MathUtils.clamp(estado.cam, 0, POSES.length - 1);
    const i = Math.min(Math.floor(c), POSES.length - 2);
    const t = suave(c - i);
    pos.lerpVectors(POSES[i].pos, POSES[i + 1].pos, t);
    olhar.lerpVectors(POSES[i].alvo, POSES[i + 1].alvo, t);
    // tela em pé: afasta a câmera para o tênis caber na largura
    const aspecto = size.width / size.height;
    if (aspecto < 1) pos.sub(olhar).multiplyScalar(THREE.MathUtils.lerp(1.9, 1.2, aspecto)).add(olhar);
    // paralaxe do mouse
    pos.x += estado.mouse.x * 0.35;
    pos.y += estado.mouse.y * 0.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pos.x, 5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pos.y, 5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, pos.z, 5, dt);
    alvo.current.x = THREE.MathUtils.damp(alvo.current.x, olhar.x, 5, dt);
    alvo.current.y = THREE.MathUtils.damp(alvo.current.y, olhar.y, 5, dt);
    alvo.current.z = THREE.MathUtils.damp(alvo.current.z, olhar.z, 5, dt);
    camera.lookAt(alvo.current);
  });
  return null;
}

/* luz de recorte na cor da variação escolhida */
function LuzDeCor() {
  const luz = useRef<THREE.SpotLight>(null);
  const cor = new THREE.Color();
  useFrame((_, dt) => {
    if (!luz.current) return;
    cor.set(CORES_3D[estado.cor].cor);
    luz.current.color.lerp(cor, 1 - Math.exp(-4 * dt));
  });
  return <spotLight ref={luz} position={[-5, 3, -4]} angle={0.6} penumbra={1} intensity={120} distance={20} />;
}

/* sombra de contato que desce junto com o solado na vista explodida */
function Sombra() {
  const g = useRef<THREE.Group>(null);
  useFrame(() => { if (g.current) g.current.position.y = -0.8 - 0.95 * estado.explode; });
  return (
    <group ref={g}>
      <ContactShadows opacity={0.65} scale={9} blur={2.6} far={2.4} resolution={512} color="#000000" />
    </group>
  );
}

export function Cena({ comRotulos }: { comRotulos: boolean }) {
  return (
    <>
      <Camera />
      <ambientLight intensity={0.15} />
      {/* luz principal de estúdio, de cima e da frente */}
      <spotLight position={[3, 6, 5]} angle={0.45} penumbra={0.8} intensity={140} distance={30} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <LuzDeCor />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} rotation={[-Math.PI / 2.4, 0, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[6, 0.5, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 2, 1]} />
      </Environment>
      <Tenis3D comRotulos={comRotulos} />
      <Sombra />
    </>
  );
}
