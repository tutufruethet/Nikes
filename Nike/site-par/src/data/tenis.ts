import t1 from '../assets/tenis-1.webp';
import t2 from '../assets/tenis-2.webp';
import t4 from '../assets/tenis-4.webp';
import t5 from '../assets/tenis-5.webp';
import t6 from '../assets/tenis-6.webp';

export type Tenis = {
  img: string;
  modelo: string;
  palavra: string;
  tamanhos: string;
  l1: string;
  l2: string;
  accent: string;
  deep: string;
};

export const TENIS: Tenis[] = [
  { img: t1, modelo: 'Air Jordan 1 High', palavra: 'LENDA', tamanhos: '36–42',
    l1: 'Feito pra quem', l2: 'não pede licença.', accent: '#b3121f', deep: '#24060a' },
  { img: t2, modelo: 'Air Jordan 1 High', palavra: 'FOGO', tamanhos: '[INSERIR]',
    l1: 'Vermelho que', l2: 'não passa despercebido.', accent: '#e3202f', deep: '#3a0508' },
  { img: t4, modelo: 'Air Jordan 1 Mid', palavra: 'RAIZ', tamanhos: '[INSERIR]',
    l1: 'O clássico', l2: 'que segura o jogo.', accent: '#8e1b26', deep: '#1e070a' },
  { img: t5, modelo: 'Nike Dunk High', palavra: 'NOITE', tamanhos: '36–42',
    l1: 'Da quadra', l2: 'pra madrugada.', accent: '#2b3f9a', deep: '#070c26' },
  { img: t6, modelo: 'Nike SB Dunk Low', palavra: 'RUA', tamanhos: '37–45',
    l1: 'Sola de borracha,', l2: 'atitude de pista.', accent: '#c4813a', deep: '#2a1606' },
];

// Variações de cor do modelo 3D (KHR_materials_variants do tenis.glb)
export const CORES_3D = [
  { id: 'street', nome: 'Rua', cor: '#e2394a', fundo: '#1c0609' },
  { id: 'midnight', nome: 'Noite', cor: '#2d8fc4', fundo: '#04111c' },
  { id: 'beach', nome: 'Praia', cor: '#e8b4ab', fundo: '#1d1110' },
] as const;

// Camadas da vista explodida: texto curto e verdadeiro sobre cada peça de um tênis
export const PARTES = [
  { nome: 'Solado', texto: 'A borracha com sulcos é onde o pé encontra o chão. Dá tração, freia e é a peça que mais gasta.' },
  { nome: 'Cabedal', texto: 'A parte de cima, que abraça o pé. Define o encaixe e quanto ar circula.' },
  { nome: 'Faixas laterais', texto: 'Reforço nas laterais. Seguram o pé nas mudanças de direção e dão a cara do modelo.' },
  { nome: 'Língua', texto: 'Fica entre o cadarço e o peito do pé, pra pressão do laço não machucar.' },
  { nome: 'Cadarço e ilhoses', texto: 'O ajuste fino. Cada ilhós espalha a força do cadarço pelo cabedal.' },
] as const;
