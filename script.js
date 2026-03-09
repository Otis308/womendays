/* ════════════════════════════════════════════════════════════════
   script.js — Women's Day Gift
   ► Edit CONFIG only!
════════════════════════════════════════════════════════════════ */

const CONFIG = {
  images: [
    'assets/img1.jpg', 'assets/img2.jpg', 'assets/img3.jpg', 'assets/img4.jpg', 'assets/img5.jpg',
    'assets/img6.jpg', 'assets/img7.jpg', 'assets/img8.jpg', 'assets/img9.jpg', 'assets/img10.jpg',
    'assets/img11.jpg', 'assets/img12.jpg', 'assets/img13.jpg', 'assets/img14.jpg', 'assets/img15.jpg',
    'assets/img16.jpg', 'assets/img17.jpg', 'assets/img18.jpg', 'assets/img19.jpg', 'assets/img20.jpg',
    'assets/img21.jpg', 'assets/img22.jpg', 'assets/img23.jpg', 'assets/img24.jpg', 'assets/img25.jpg',
    'assets/img26.jpg', 'assets/img27.jpg', 'assets/img28.jpg', 'assets/img29.jpg', 'assets/img30.jpg',
    'assets/img31.jpg', 'assets/img32.jpg', 'assets/img33.jpg', 'assets/img34.jpg', 'assets/img35.jpg',
    'assets/img36.jpg', 'assets/img37.jpg', 'assets/img38.jpg', 'assets/img39.jpg', 'assets/img40.jpg',
    'assets/img41.jpg', 'assets/img42.jpg', 'assets/img43.jpg', 'assets/img44.jpg', 'assets/img45.jpg',
    'assets/img46.jpg', 'assets/img47.jpg', 'assets/img48.jpg', 'assets/img49.jpg', 'assets/img50.jpg',
    'assets/img51.jpg', 'assets/img52.jpg', 'assets/img53.jpg', 'assets/img54.jpg', 'assets/img55.jpg',
    'assets/img56.jpg', 'assets/img57.jpg', 'assets/img58.jpg', 'assets/img59.jpg', 'assets/img60.jpg',
    'assets/img61.jpg', 'assets/img62.jpg', 'assets/img63.jpg', 'assets/img64.jpg', 'assets/img65.jpg',
    'assets/img66.jpg', 'assets/img67.jpg', 'assets/img68.jpg', 'assets/img69.jpg'
  ],


  music:          './assets/music.mp3',
  pin:            '1112',
  particleText1:  'Happy',
  particleText2:  "Women's\nDay 8/3 ♥",
  letterContent: `
    <div class="letter-heading">My dearest,</div>
    <div class="letter-divider">✦ ✦ ✦</div>
    <p>Chúc em bé của anh một ngày lễ trọn vẹn đầy ý nghĩa với những kỷ niệm đẹp nhất.</p>
    <p>Chúc em luôn hạnh phúc, vui vẻ gặp nhiều may mắn.</p>
    <p>Chúc em mãi luôn cười tươi như hoa tặng em.</p>
    <p>Chúc em ngày càng xinh đẹp, giỏi giang.</p>
    <p>Chúc em cuộc sống đong đầy bao nhiêu hạnh phúc đều là của em.</p>
    <p>Và đặc biệt là không tiêu cực, luôn an nhiên — mỗi ngày trải qua đều là một ngày vui.</p>
    <p class="signature">Forever yours,<br/>Anh ❤️</p>
  `,
  particleCount:  3500,
  particleSize:   2.2,
  scene1Duration: 10500,
};

/* ── Globals ── */
let audio        = null;
let currentScene = 'pin';
const $    = id => document.getElementById(id);
const rand = (a, b) => Math.random() * (b - a) + a;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'fade-out'));
  $(id)?.classList.add('active');
}
function fadeOut(id, cb, ms = 820) {
  const el = $(id); if (!el) return;
  el.classList.add('fade-out'); el.classList.remove('active');
  setTimeout(() => cb?.(), ms);
}

/* ════════ 0 — PIN ════════ */
let pinEntry = '';
function initPin() {
  buildPinSparkles();
  document.querySelectorAll('.pkey').forEach(btn =>
    btn.addEventListener('click', () => handlePinKey(btn.dataset.v))
  );
}
function handlePinKey(v) {
  if (v === 'del') { pinEntry = pinEntry.slice(0,-1); updateDots(); return; }
  if (v === 'ok')  { checkPin(); return; }
  if (pinEntry.length >= 4) return;
  pinEntry += v; updateDots();
  if (pinEntry.length === 4) setTimeout(checkPin, 180);
}
function updateDots() {
  document.querySelectorAll('.pin-dot').forEach((d,i) => {
    d.classList.toggle('filled', i < pinEntry.length); d.classList.remove('err');
  });
}
function checkPin() {
  if (pinEntry === CONFIG.pin) {
    const card = $('pin-card');
    card.style.transition = 'transform .4s, opacity .4s';
    card.style.transform  = 'scale(1.05)'; card.style.opacity = '0';
    setTimeout(() => fadeOut('pin-screen', () => { showScreen('intro-screen'); initIntro(); }), 380);
  } else {
    document.querySelectorAll('.pin-dot').forEach(d => d.classList.add('err'));
    $('pin-error').textContent = 'Incorrect PIN — try again';
    $('pin-card').classList.add('shake');
    setTimeout(() => {
      $('pin-card').classList.remove('shake');
      $('pin-error').textContent = '\u00a0';
      pinEntry = ''; updateDots();
    }, 700);
  }
}
function buildPinSparkles() {
  const c = $('pin-sparkles');
  const sym = ['✦','✧','★','✺','✨','♥','🌸','✿'];
  for (let i = 0; i < 35; i++) {
    const s = document.createElement('div'); s.className = 'sp';
    s.textContent = sym[Math.floor(Math.random()*sym.length)];
    s.style.cssText = `left:${rand(0,100)}%;top:${rand(5,90)}%;font-size:${rand(.55,1.3)}rem;--sd:${rand(4,9)}s;--dl:${rand(0,7)}s;--c:hsl(${rand(310,360)},80%,72%);`;
    c.appendChild(s);
  }
}

/* ════════ 1 — INTRO ════════ */
function initIntro() { buildStars(); buildFloatingHearts(); }
function buildStars() {
  const c = $('intro-stars');
  for (let i = 0; i < 140; i++) {
    const s = document.createElement('div'); s.className = 'star-dot';
    const sz = rand(1,3.5);
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${rand(0,100)}%;top:${rand(0,100)}%;--dur:${rand(2,5)}s;--dl:${rand(0,6)}s;--br:${rand(.4,1)};`;
    c.appendChild(s);
  }
}
function buildFloatingHearts() {
  const c = $('hearts-bg');
  const em = ['💕','💗','💖','💝','✨','🌸','🌹','💫'];
  for (let i = 0; i < 22; i++) {
    const h = document.createElement('div'); h.className = 'fh';
    h.textContent = em[Math.floor(Math.random()*em.length)];
    h.style.cssText = `left:${rand(3,97)}%;--fs:${rand(.85,1.7)}rem;--dur:${rand(8,15)}s;--dl:${rand(0,9)}s;--r1:${rand(-18,18)}deg;--r2:${rand(-18,18)}deg;`;
    c.appendChild(h);
  }
}
function startAudio() {
  if (audio) return;
  audio = new Audio(CONFIG.music);
  audio.loop = true; audio.volume = 0.42; audio.play().catch(()=>{});
}

/* ════════ 2 — PARTICLE TEXT ════════ */
let pRenderer, pScene, pCamera, pStars, pPoints, pFrame;
let pCurrent, pTarget, pScatter, pText1, pText2;
let pLerpSpd = 0.055;
let particleTimers = [];

function sampleText(text, count) {
  const W = 900, H = 250;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const isML = text.includes('\n');
  const fs   = isML ? 80 : (text.length > 8 ? 88 : 120);
  ctx.fillStyle = '#fff'; ctx.font = `bold ${fs}px Georgia,serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = text.split('\n'), lh = fs * 1.2;
  const sy = (H/2) - ((lines.length-1)*lh)/2;
  lines.forEach((l,i) => ctx.fillText(l, W/2, sy+i*lh));
  const data = ctx.getImageData(0,0,W,H).data;
  const valid = [];
  const scale = innerWidth < 768 ? 95 : 55;
  for (let y=0;y<H;y+=3) for (let x=0;x<W;x+=3)
    if (data[(y*W+x)*4+3]>100) valid.push({x:(x-W/2)/scale, y:-(y-H/2)/scale});
  const out = new Float32Array(count*3);
  for (let i=0;i<count;i++) {
    const p = valid.length ? valid[Math.floor(Math.random()*valid.length)] : {x:0,y:0};
    out[i*3]=p.x+rand(-.06,.06); out[i*3+1]=p.y+rand(-.06,.06); out[i*3+2]=rand(-.3,.3);
  }
  return out;
}
function makeScatter(n) {
  const a = new Float32Array(n*3);
  for (let i=0;i<n*3;i++) a[i]=rand(-12,12);
  return a;
}
function triggerPlane(mode) {
  const w = $('plane-wrap'); if (!w) return;
  // Xóa cả 2 class trước, force reflow, rồi thêm class mới
  w.classList.remove('fly-half', 'fly-full');
  void w.offsetWidth;
  w.classList.add(mode === 'full' ? 'fly-full' : 'fly-half');
}

function initParticles() {
  const canvas = $('particle-canvas');
  const W = innerWidth, H = innerHeight;
  pRenderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  pRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  pRenderer.setSize(W,H);
  pRenderer.setClearColor(0x060011, 1);
  pRenderer.clear();

  pScene  = new THREE.Scene();
  pCamera = new THREE.PerspectiveCamera(60, W/H, .1, 100);
  pCamera.position.z = W < 768 ? 13 : 7;

  const sg = new THREE.BufferGeometry();
  const sa = new Float32Array(2000*3);
  for (let i=0;i<sa.length;i++) sa[i]=rand(-30,30);
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sa,3));
  pStars = new THREE.Points(sg, new THREE.PointsMaterial({color:0xffffff,size:.055,transparent:true,opacity:.6}));
  pScene.add(pStars);

  const N = CONFIG.particleCount;
  pScatter = makeScatter(N); pText1 = sampleText(CONFIG.particleText1,N); pText2 = sampleText(CONFIG.particleText2,N);
  pCurrent = new Float32Array(pScatter); pTarget = new Float32Array(pScatter);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pCurrent,3));
  const col = new Float32Array(N*3);
  for (let i=0;i<N;i++) { const t=i/N; col[i*3]=1-t*.25; col[i*3+1]=.3+t*.12; col[i*3+2]=.5+t*.5; }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  pPoints = new THREE.Points(geo, new THREE.PointsMaterial({size:CONFIG.particleSize*.04,vertexColors:true,transparent:true,opacity:.95}));
  pScene.add(pPoints);

  particleTimers.push(setTimeout(()=>setPT(pText1,.065),  900));
  particleTimers.push(setTimeout(()=>setPT(pScatter,.042),4500));
  particleTimers.push(setTimeout(()=>setPT(pText2,.065),  6600));
  /* Lần 1: chữ "Happy" đang hiện → máy bay từ trái vào giữa */
  particleTimers.push(setTimeout(()=>triggerPlane('half'), 1200));
  /* Lần 2: chữ "Women's Day" đang hiện → máy bay từ giữa ra phải */
  particleTimers.push(setTimeout(()=>triggerPlane('full'), 7000));
  particleTimers.push(setTimeout(()=>toHeart(), CONFIG.scene1Duration));

  animParticles();
  window._pR = () => { if(!pRenderer)return; pCamera.aspect=innerWidth/innerHeight; pCamera.updateProjectionMatrix(); pRenderer.setSize(innerWidth,innerHeight); };
  window.addEventListener('resize', window._pR);
}
function setPT(arr,spd=.055) { pTarget=arr; pLerpSpd=spd; }
function animParticles() {
  if (!pPoints||!pRenderer) return;
  pFrame = requestAnimationFrame(animParticles);
  const pos = pPoints.geometry.attributes.position.array;
  for (let i=0;i<pos.length;i++) pos[i]+=(pTarget[i]-pos[i])*pLerpSpd;
  pPoints.geometry.attributes.position.needsUpdate = true;
  pStars.rotation.y+=.0003; pStars.rotation.x+=.0001;
  pRenderer.render(pScene,pCamera);
}
function destroyParticles() {
  particleTimers.forEach(clearTimeout); particleTimers=[];
  if (pFrame) { cancelAnimationFrame(pFrame); pFrame=null; }
  window.removeEventListener('resize', window._pR);
  if (pRenderer) { pRenderer.dispose(); pRenderer=null; }
  pScene=null; pCamera=null; pStars=null; pPoints=null;
}

/* ════════ LIGHTBOX ════════ */
function closeLightbox() { $('lightbox').classList.remove('active'); }

/* ════════ 4 — LOVE LETTER ════════ */
let petalsInt = null;
function initLetter() {
  spawnPetals();
  $('envelope').addEventListener('click', openEnvelope);
}
function openEnvelope() {
  const env = $('envelope'); if (env.classList.contains('opened')) return;
  const p = $('env-prompt');
  if (p) { p.style.opacity='0'; p.style.pointerEvents='none'; }
  env.classList.add('opened'); setTimeout(showFullLetter,1380);
}
function showFullLetter() {
  $('full-letter-content').innerHTML = CONFIG.letterContent;
  $('full-letter-overlay').classList.add('visible');
  const rb=$('replay-btn'); if(rb) rb.style.display='block';
}
const PETALS=['🌸','🌹','💐','🌺','🏵️','💮'];
function spawnPetals() {
  const c=$('petals-container');
  petalsInt=setInterval(()=>{
    const p=document.createElement('div'); p.className='petal';
    p.textContent=PETALS[Math.floor(Math.random()*PETALS.length)];
    p.style.cssText=`left:${rand(0,100)}%;font-size:${rand(.9,1.8)}rem;animation-duration:${rand(5,9)}s;animation-delay:${rand(0,2)}s;--drift:${rand(-80,80)}px;`;
    c.appendChild(p); setTimeout(()=>p.remove(),11000);
  },550);
}

/* ════════ TRANSITIONS ════════ */
function toParticles() {
  currentScene='particles';
  fadeOut('intro-screen',()=>{ showScreen('scene-particles'); initParticles(); });
}

function toHeart() {
  if (currentScene==='sphere') return;
  currentScene='sphere';
  particleTimers.forEach(clearTimeout); particleTimers=[];

  fadeOut('scene-particles',()=>{
    destroyParticles();
    showScreen('scene-sphere');

    /* ✅ Delay 300ms để browser hoàn tất giải phóng particle context
       trước khi Three.js khởi tạo WebGL context mới cho sphere */
    setTimeout(()=>{
      if (typeof initSphere==='function') initSphere(CONFIG.images);
      setTimeout(()=>{
        const fab=$('letter-fab');
        fab.classList.remove('hidden'); fab.classList.add('visible');
      }, 2200);
    }, 300);
  });
}

function toLetter() {
  currentScene='letter';
  const fab=$('letter-fab'); fab.classList.remove('visible'); fab.classList.add('hidden');
  fadeOut('scene-sphere',()=>{
    if (typeof destroySphere==='function') destroySphere();
    showScreen('scene-letter'); initLetter();
  });
}

/* ════════ INIT ════════ */
function init() {
  showScreen('pin-screen'); initPin();
  $('start-btn').addEventListener('click',()=>{ startAudio(); toParticles(); });
  $('particle-skip').addEventListener('click',()=>{ if(currentScene!=='particles')return; toHeart(); });
  $('letter-fab').addEventListener('click',()=>{ if(currentScene!=='sphere')return; toLetter(); });
  $('lightbox').addEventListener('click', closeLightbox);
  $('lb-close').addEventListener('click', e=>{ e.stopPropagation(); closeLightbox(); });
  $('close-letter-btn').addEventListener('click',()=>{ $('full-letter-overlay').classList.remove('visible'); });
  $('replay-btn').addEventListener('click',()=>{
    if (petalsInt) clearInterval(petalsInt);
    fadeOut('scene-letter',()=>{
      $('envelope').classList.remove('opened');
      $('full-letter-overlay').classList.remove('visible');
      const p=$('env-prompt'); if(p){p.style.opacity='1';p.style.pointerEvents='all';}
      const fab=$('letter-fab'); fab.classList.remove('visible','hidden');
      currentScene='intro'; showScreen('intro-screen');
    });
  });
}
document.addEventListener('DOMContentLoaded', init);