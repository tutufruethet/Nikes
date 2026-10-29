/* Estado da cena 3D. O GSAP (ScrollTrigger) escreve aqui; o useFrame do three lê a cada quadro.
   Assim a rolagem comanda a câmera sem re-renderizar o React. */
export const estado = {
  giro: 0,        // rotação do tênis em Y (radianos)
  cam: 0,         // posição na lista de poses de câmera (0 a 3, fracionário)
  explode: 0,     // 0 montado, 1 aberto em camadas
  rotulos: [0, 0, 0, 0, 0] as number[], // opacidade do rótulo de cada peça
  mouse: { x: 0, y: 0 },
  cor: 0,         // índice em CORES_3D
};
