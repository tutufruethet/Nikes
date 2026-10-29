/* Hero Nike — "Cada par tem sua palavra"
   Efeitos adaptados da vitrine Não Codei (naocodei.com/free-code):
   06 faixas que se montam · 09 cursor · 12 luz que segue o mouse · 14 botão elástico · 15 embaralhar letras
   Sequência e rolagem com GSAP (timeline + ScrollTrigger). */

(function(){
  gsap.registerPlugin(ScrollTrigger);

  var TENIS = [
    { img:'img/tenis-1.webp', modelo:'Air Jordan 1 High', palavra:'LENDA', tamanhos:'36–42',
      l1:'Feito pra quem', l2:'não pede licença.', accent:'#b3121f', deep:'#24060a' },
    { img:'img/tenis-2.webp', modelo:'Air Jordan 1 High', palavra:'FOGO', tamanhos:'[INSERIR]',
      l1:'Vermelho que', l2:'não passa despercebido.', accent:'#e3202f', deep:'#3a0508' },
    { img:'img/tenis-4.webp', modelo:'Air Jordan 1 Mid', palavra:'RAIZ', tamanhos:'[INSERIR]',
      l1:'O clássico', l2:'que segura o jogo.', accent:'#8e1b26', deep:'#1e070a' },
    { img:'img/tenis-5.webp', modelo:'Nike Dunk High', palavra:'NOITE', tamanhos:'36–42',
      l1:'Da quadra', l2:'pra madrugada.', accent:'#2b3f9a', deep:'#070c26' },
    { img:'img/tenis-6.webp', modelo:'Nike SB Dunk Low', palavra:'RUA', tamanhos:'37–45',
      l1:'Sola de borracha,', l2:'atitude de pista.', accent:'#c4813a', deep:'#2a1606' }
  ];
  var TEMPO = 6; // segundos por tênis

  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var hero = document.querySelector('.hero');
  var shoes = hero.querySelector('.shoes');
  var word = hero.querySelector('.word');
  var tiras = [].slice.call(hero.querySelectorAll('.tira'));
  var seletor = hero.querySelector('.seletor');
  var idxEl = hero.querySelector('.idx');
  var eyebrowTxt = hero.querySelector('.eyebrow-txt');
  var sizesTxt = hero.querySelector('.sizes-txt');
  var linhas = [].slice.call(hero.querySelectorAll('.linha > span'));
  var barra = hero.querySelector('.progresso span');
  var aviso = hero.querySelector('[aria-live]');

  var lerp = function(a,b,t){ return a + (b-a)*t; };
  var limitar = function(v,min,max){ return Math.max(min, Math.min(max, v)); };
  var pad = function(n){ return (n < 10 ? '0' : '') + n; };

  /* laço que só roda enquanto o elemento está visível (NãoCodei) */
  function laco(el, passo){
    var id = null, vivo = false;
    function rodar(){ passo(); id = requestAnimationFrame(rodar); }
    new IntersectionObserver(function(e){
      if(e[0].isIntersecting){ if(!vivo){ vivo = true; rodar(); } }
      else if(vivo){ vivo = false; cancelAnimationFrame(id); }
    },{threshold:0}).observe(el);
  }

  /* ── Monta imagens e seletor ─────────────────────── */
  var imgs = TENIS.map(function(t, i){
    var img = new Image();
    img.src = t.img; img.alt = t.modelo; img.decoding = 'async';
    img.draggable = false;
    shoes.appendChild(img);

    var b = document.createElement('button');
    b.className = 'thumb'; b.type = 'button';
    b.setAttribute('aria-label', t.modelo + ' — ' + t.palavra);
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.innerHTML = '<span class="n">' + pad(i+1) + '</span><img src="' + t.img + '" alt="" draggable="false">';
    b.addEventListener('click', function(){ ir(i); });
    seletor.appendChild(b);
    return img;
  });
  var thumbs = [].slice.call(seletor.children);

  /* ── 15 · Embaralhar letras ──────────────────────── */
  var sopa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', scrambleId;
  function embaralhar(final){
    cancelAnimationFrame(scrambleId);
    if(reduzido){ word.textContent = final; return; }
    var quadro = 0;
    (function girar(){
      var saida = '', travadas = Math.floor(quadro / 3);
      for(var i=0; i<final.length; i++){
        saida += i < travadas ? final[i] : sopa[(Math.random()*sopa.length)|0];
      }
      word.textContent = saida;
      quadro++;
      if(travadas <= final.length) scrambleId = requestAnimationFrame(girar);
    })();
  }

  /* ── 06 · Faixas que se montam (agora por tempo, com GSAP) ── */
  function montarFaixas(){
    return gsap.fromTo(tiras,
      { yPercent: function(i){ return (i % 2 ? 1 : -1) * 110; }, opacity:.25 },
      { yPercent:0, opacity:.9, duration:1.1, ease:'power3.out', stagger:.07 });
  }
  function desmontarFaixas(){
    return gsap.to(tiras,
      { yPercent: function(i){ return (i % 2 ? -1 : 1) * 110; }, duration:.55, ease:'power2.in', stagger:.04 });
  }

  /* ── Troca de tênis ──────────────────────────────── */
  var atual = 0, tl, auto, pronto = false, emCima = 0;
  var POSE = { x:0, y:0, rotation:-14, scale:1, opacity:1, filter:'blur(0px)' };

  function textos(t, i){
    idxEl.textContent = pad(i+1);
    eyebrowTxt.textContent = t.modelo;
    sizesTxt.textContent = t.tamanhos;
    linhas[0].textContent = t.l1;
    linhas[1].textContent = t.l2;
    aviso.textContent = (i+1) + ' de ' + TENIS.length + ': ' + t.modelo;
    thumbs.forEach(function(b, j){ b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    imgs.forEach(function(img, j){ img.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
  }

  function ir(n, dir){
    if(!pronto) return;
    n = (n + TENIS.length) % TENIS.length;
    if(n === atual) return;
    dir = dir || (n > atual ? 1 : -1);
    var antes = imgs[atual], depois = imgs[n], t = TENIS[n];
    atual = n;

    if(tl) tl.progress(1).kill();
    if(reduzido){
      gsap.set(antes, {opacity:0});
      gsap.set(depois, POSE);
      gsap.set(root, {'--accent':t.accent, '--deep':t.deep});
      textos(t, n); word.textContent = t.palavra;
      return;
    }

    tl = gsap.timeline({ defaults:{ ease:'power3.out' } });
    tl.addLabel('sai', 0)
      .to(antes, { x: -dir*260, y:40, rotation:-14 - dir*24, opacity:0, filter:'blur(10px)', duration:.6, ease:'power2.in' }, 'sai')
      .add(desmontarFaixas(), 'sai')
      .to(linhas, { yPercent:160, duration:.4, ease:'power2.in', stagger:.05 }, 'sai')
      .to([eyebrowTxt, '.sizes'], { opacity:0, y:-8, duration:.3 }, 'sai')
      .to(word, { opacity:0, scale:.96, duration:.35, ease:'power2.in' }, 'sai')
      .addLabel('entra', .5)
      .to(root, { '--accent':t.accent, '--deep':t.deep, duration:.9, ease:'power2.inOut' }, 'sai+=.15')
      .call(function(){ textos(t, n); embaralhar(t.palavra); }, null, 'entra')
      .to(word, { opacity:1, scale:1, duration:.6 }, 'entra')
      .add(montarFaixas(), 'entra')
      .fromTo(depois,
        { x: dir*320, y:-60, rotation:-14 + dir*30, scale:.86, opacity:0, filter:'blur(12px)' },
        { x:0, y:0, rotation:-14, scale:1, opacity:1, filter:'blur(0px)', duration:1.15, ease:'expo.out' }, 'entra+=.1')
      .fromTo(linhas, { yPercent:160 }, { yPercent:0, duration:.8, stagger:.08 }, 'entra+=.15')
      .fromTo([eyebrowTxt, '.sizes'], { opacity:0, y:8 }, { opacity:1, y:0, duration:.5, stagger:.06 }, 'entra+=.25');

    reiniciarAuto();
  }

  /* ── Autoplay com barra de progresso ─────────────── */
  function reiniciarAuto(){
    if(auto) auto.kill();
    if(reduzido) return;
    auto = gsap.fromTo(barra, { scaleX:0 }, { scaleX:1, duration:TEMPO, ease:'none',
      onComplete:function(){ ir(atual + 1, 1); } });
    if(emCima || document.hidden) auto.pause();
  }
  hero.querySelector('.next').addEventListener('click', function(){ ir(atual + 1, 1); });
  hero.querySelector('.prev').addEventListener('click', function(){ ir(atual - 1, -1); });
  document.addEventListener('keydown', function(e){
    if(/input|textarea|select/i.test(e.target.tagName) || hero.getBoundingClientRect().bottom < 0) return;
    if(e.key === 'ArrowRight') ir(atual + 1, 1);
    if(e.key === 'ArrowLeft') ir(atual - 1, -1);
  });
  document.addEventListener('visibilitychange', function(){
    if(!auto) return;
    (document.hidden || emCima) ? auto.pause() : auto.resume();
  });
  [seletor, hero.querySelector('.ctas')].forEach(function(el){
    el.addEventListener('mouseenter', function(){ emCima++; auto && auto.pause(); });
    el.addEventListener('mouseleave', function(){ emCima = Math.max(0, emCima - 1); if(auto && !document.hidden) auto.resume(); });
  });

  /* swipe no celular */
  var toqueX = null;
  hero.addEventListener('touchstart', function(e){ toqueX = e.touches[0].clientX; }, {passive:true});
  hero.addEventListener('touchend', function(e){
    if(toqueX === null) return;
    var dx = e.changedTouches[0].clientX - toqueX; toqueX = null;
    if(Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  /* ── 12 · Luz que segue o mouse + parallax ───────── */
  var finoPonteiro = window.matchMedia('(pointer:fine)').matches;
  var shoeX = gsap.quickTo('.shoe-float', 'x', { duration:.9, ease:'power3' });
  var shoeY = gsap.quickTo('.shoe-float', 'y', { duration:.9, ease:'power3' });
  var wordX = gsap.quickTo('.word-wrap', 'x', { duration:1.2, ease:'power3' });
  hero.addEventListener('mousemove', function(ev){
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--x', (ev.clientX - r.left) + 'px');
    hero.style.setProperty('--y', (ev.clientY - r.top) + 'px');
    if(reduzido) return;
    var nx = (ev.clientX - r.left) / r.width - .5, ny = (ev.clientY - r.top) / r.height - .5;
    shoeX(nx * 36); shoeY(ny * 24); wordX(nx * -40);
  });

  /* ── 09 · Cursor personalizado ───────────────────── */
  if(finoPonteiro){
    var cur = document.querySelector('.cursor');
    var ponto = cur.querySelector('.ponto'), anel = cur.querySelector('.anel');
    var alvo = {x:0,y:0}, pos = {x:0,y:0};
    hero.addEventListener('mousemove', function(ev){
      alvo.x = ev.clientX; alvo.y = ev.clientY;
      if(!cur.classList.contains('ativo')){ pos.x = alvo.x; pos.y = alvo.y; cur.classList.add('ativo'); }
    });
    hero.addEventListener('mouseleave', function(){ cur.classList.remove('ativo'); });
    hero.querySelectorAll('a, button').forEach(function(el){
      el.addEventListener('mouseenter', function(){ cur.classList.add('sobre'); });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('sobre'); });
    });
    laco(hero, function(){
      ponto.style.transform = 'translate(' + (alvo.x-4) + 'px,' + (alvo.y-4) + 'px)';
      pos.x = lerp(pos.x, alvo.x, .14);
      pos.y = lerp(pos.y, alvo.y, .14);
      anel.style.transform = 'translate(' + (pos.x-20) + 'px,' + (pos.y-20) + 'px)';
    });
  }

  /* ── 14 · Botão elástico ─────────────────────────── */
  var btn = hero.querySelector('.elastico');
  if(!reduzido){
    var escala = 1, vel = 0, alvoE = 1;
    btn.addEventListener('mouseenter', function(){ alvoE = 1.1; });
    btn.addEventListener('mouseleave', function(){ alvoE = 1; });
    btn.addEventListener('mousedown', function(){ alvoE = .9; });
    btn.addEventListener('mouseup', function(){ alvoE = 1.1; });
    laco(hero, function(){
      var forca = (alvoE - escala) * .22;
      vel = (vel + forca) * .72;
      escala += vel;
      btn.style.scale = escala;
    });
  }

  /* ── Estado inicial ──────────────────────────────── */
  var t0 = TENIS[0];
  gsap.set(root, {'--accent':t0.accent, '--deep':t0.deep});
  textos(t0, 0);

  if(reduzido){
    document.querySelector('.intro').remove();
    gsap.set(imgs[0], POSE);
    pronto = true;
    word.textContent = t0.palavra;
    return;
  }

  /* flutuação contínua */
  gsap.to('.shoes', { y:-16, rotation:1.5, duration:2.6, ease:'sine.inOut', yoyo:true, repeat:-1 });
  gsap.to('.sombra', { scaleX:.86, opacity:.7, duration:2.6, ease:'sine.inOut', yoyo:true, repeat:-1 });

  /* ── Intro (swoosh se desenha) ───────────────────── */
  document.body.classList.add('intro-on');
  var path = document.querySelector('.intro-swoosh path');
  var len = path.getTotalLength();
  gsap.set(path, { strokeDasharray:len, strokeDashoffset:len });
  gsap.set(tiras, { yPercent: function(i){ return (i % 2 ? 1 : -1) * 110; } });
  gsap.set(linhas, { yPercent:160 });
  gsap.set(['.nav', '.seletor > *', '.rodape-hero', '.eyebrow', '.sizes', '.ctas > *'], { opacity:0 });
  word.textContent = '';

  var intro = gsap.timeline({ defaults:{ ease:'power3.out' } });
  intro.addLabel('desenho', .2)
    .to(path, { strokeDashoffset:0, duration:1.1, ease:'power2.inOut' }, 'desenho')
    .to(path, { fill:'#f6f3ee', duration:.4 }, '>-.15')
    .to('.intro-tag', { opacity:1, y:0, duration:.5 }, '<')
    .addLabel('cortina', '+=.35')
    .to('.intro', { yPercent:-100, duration:.9, ease:'expo.inOut' }, 'cortina')
    .call(function(){ embaralhar(t0.palavra); }, null, 'cortina+=.45')
    .add(montarFaixas(), 'cortina+=.45')
    .fromTo(imgs[0],
      { y:-260, rotation:-34, scale:.8, opacity:0, filter:'blur(14px)' },
      { y:0, rotation:-14, scale:1, opacity:1, filter:'blur(0px)', duration:1.4, ease:'expo.out' }, 'cortina+=.6')
    .to(linhas, { yPercent:0, duration:.9, stagger:.1 }, 'cortina+=.8')
    .to(['.eyebrow', '.sizes'], { opacity:1, duration:.5, stagger:.08 }, 'cortina+=.9')
    .fromTo('.ctas > *', { opacity:0, y:16 }, { opacity:1, y:0, duration:.6, stagger:.08 }, 'cortina+=1')
    .to('.nav', { opacity:1, duration:.6 }, 'cortina+=1')
    .fromTo('.seletor > *', { opacity:0, x:24 }, { opacity:1, x:0, duration:.5, stagger:.06 }, 'cortina+=1.05')
    .to('.rodape-hero', { opacity:1, duration:.6 }, 'cortina+=1.2')
    .call(function(){
      document.body.classList.remove('intro-on');
      document.querySelector('.intro').remove();
      pronto = true;
      reiniciarAuto();
    });

  /* ── Saída do hero na rolagem ────────────────────── */
  var saida = gsap.timeline({
    scrollTrigger:{ trigger:hero, start:'top top', end:'bottom top', scrub:.6 }
  });
  // .palco é centralizado com translate -50% -50%, que o GSAP converte em xPercent/yPercent
  saida.fromTo('.palco', { xPercent:-50, yPercent:-50, scale:1 }, { xPercent:-50, yPercent:-32, scale:1.18, ease:'none' }, 0)
       .fromTo('.word-wrap', { yPercent:0, opacity:1 }, { yPercent:-35, opacity:.15, ease:'none' }, 0)
       .fromTo('.faixas', { xPercent:-50, yPercent:0 }, { xPercent:-50, yPercent:-20, ease:'none' }, 0)
       .fromTo(['.info', '.seletor', '.rodape-hero'], { y:0, autoAlpha:1 }, { y:-40, autoAlpha:0, ease:'none', immediateRender:false }, 0);
})();
