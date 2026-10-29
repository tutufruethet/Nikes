# Site PAR

Loja fictícia de tênis. Vite + React + TypeScript + Tailwind + React Three Fiber/Drei + GSAP (ScrollTrigger).

## Rodar e publicar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```

Vercel: importe a pasta `Nike/site-par` como projeto Vite (build `npm run build`, saída `dist`).

## Estrutura

- `src/components/Hero.tsx`: hero "Cada par tem sua palavra" (efeitos Não Codei 06, 12, 14, 15).
- `src/components/Anatomia.tsx`: seção presa com o tênis 3D. Uma timeline do GSAP escreve em `three/estado.ts`, e a cena lê a cada quadro: gira, aproxima, abre em camadas, rotula as peças, monta e termina no shot final com as 3 cores.
- `src/three/`: cena, câmera, luzes e o modelo separado em camadas (`partes-mapa.ts` diz a que peça pertence cada triângulo).
- `src/components/Colecao.tsx`, `Manifesto.tsx` (efeito Não Codei 04), `Rodape.tsx`.
- `referencias.md`: referências usadas e onde entraram.

## Modelo 3D

Materials Variants Shoe, © 2021 Shopify, CC BY 4.0 (Khronos glTF Sample Assets). O original otimizado está em `modelo/tenis.glb` (texturas 1024 px em WebP, 1,2 MB).
No site, a geometria vai dentro do JS (`src/three/modelo-dados.ts`) e as texturas ficam em `public/models/`: assim o modelo carrega em qualquer hospedagem, inclusive onde arquivos `.glb` não são servidos.

Para trocar por outro modelo, as camadas da vista explodida precisam ser refeitas (`partes-mapa.ts` e `SUBGRUPOS` em `Tenis3D.tsx`).

## Pendências

- WhatsApp, endereço, horário e Instagram: `[INSERIR]` no rodapé.
- Preço de cada par e numeração dos pares 02 e 03.
- Fotos dos pares em alta resolução.
- O tênis 3D é um modelo genérico de corrida (licença livre), não um dos pares da coleção.
