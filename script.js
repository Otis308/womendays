/* ════════════════════════════════════════════════════════════════
   script.js — Women's Day Gift
   ► Edit CONFIG only — no need to touch the rest!
════════════════════════════════════════════════════════════════ */

const CONFIG = {
  /* ── Photos (up to 20) ── */
  images: [
    './assets/img1.jpg',  './assets/img2.jpg',  './assets/img3.jpg',
    './assets/img4.jpg',  './assets/img5.jpg',  './assets/img6.jpg',
    './assets/img7.jpg',  './assets/img8.jpg',  './assets/img9.jpg',
    './assets/img10.jpg', './assets/img11.jpg', './assets/img12.jpg',
    './assets/img13.jpg', './assets/img14.jpg', './assets/img15.jpg',
    './assets/img16.jpg', './assets/img17.jpg', './assets/img18.jpg',
    './assets/img19.jpg', './assets/img20.jpg',
  ],

  /* ── Music ── */
  music: './assets/music.mp3',

  /* ── PIN (4 digits) ── */
  pin: '1112',

  /* ── Particle text (English titles) ── */
  particleText1: 'Happy',
  particleText2: "Women's Day ♥",

  /* ── Letter content ── */
  letterContent: `
    <div class="letter-heading">My dearest,</div>
    <div class="letter-divider">✦ ✦ ✦</div>
    <p>Chúc  embe cụa anh một ngày lễ trọn vẹn đầy ý nghĩa với những kỷ niệm đẹp nhất.</p>
    <p>Chúc em luôn hạnh phúc, vui vẻ gặp nhiều may mắn</p> 
    <p>Chúc em mãi luôn cười tươi như hoa tặng em</p> 
    <p>Chúc em ngày càng xinh đẹp, giỏi giang</p>
    <p>Chúc em cuộc sống đong đầy bao nhiêu hạnh phúc đều là của em</p> 
    <p>Và đặc biệt là không tiêu cực luôn an nhiên mỗi ngày trải qua đều là một ngày vui</p>
    <p class="signature">Forever yours,<br/>Anh ❤️</p>
  `,

  /* ── Particle scene duration (ms) ── */
  particleCount:  3500,
  particleSize:   2.2,
  scene1Duration: 10500,

  /* ── 3D Heart dome ── */
  heartStep:      0.78,   /* grid spacing = tile size → no gaps */
  photoTileSize:  0.80,   /* tile width/height in world units  */
  heartScale:     7,      /* grid half-size; higher = bigger heart */
  heartDepth:     4.0,    /* dome depth — sphere-like protrusion */
};

/* ════════════════════════════════════════════════════════════════
   GLOBALS
════════════════════════════════════════════════════════════════ */
let audio = null;
let currentScene = 'pin';
const $  = id => document.getElementById(id);
const rand = (a, b) => Math.random() * (b - a) + a;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active','fade-out'));
  $(id)?.classList.add('active');
}
function fadeOut(id, cb, ms = 820) {
  const el = $(id); if (!el) return;
  el.classList.add('fade-out'); el.classList.remove('active');
  setTimeout(() => cb?.(), ms);
}

/* ════════════════════════════════════════════════════════════════
   0 — PIN SCREEN
════════════════════════════════════════════════════════════════ */
let pinEntry = '';

function initPin() {
  buildPinSparkles();
  document.querySelectorAll('.pkey').forEach(btn =>
    btn.addEventListener('click', () => handlePinKey(btn.dataset.v))
  );
}

function handlePinKey(v) {
  const card = $('pin-card');
  if (v === 'del') {
    pinEntry = pinEntry.slice(0, -1);
    updateDots();
    return;
  }
  if (v === 'ok') {
    checkPin(); return;
  }
  if (pinEntry.length >= 4) return;
  pinEntry += v;
  updateDots();
  if (pinEntry.length === 4) setTimeout(checkPin, 180);
}

function updateDots() {
  document.querySelectorAll('.pin-dot').forEach((d, i) => {
    d.classList.toggle('filled', i < pinEntry.length);
    d.classList.remove('err');
  });
}

function checkPin() {
  if (pinEntry === CONFIG.pin) {
    const card = $('pin-card');
    card.style.transition = 'transform .4s, opacity .4s';
    card.style.transform = 'scale(1.05)';
    card.style.opacity   = '0';
    setTimeout(() => fadeOut('pin-screen', () => {
      showScreen('intro-screen');
      initIntro();
    }), 380);
  } else {
    const card = $('pin-card');
    document.querySelectorAll('.pin-dot').forEach(d => d.classList.add('err'));
    $('pin-error').textContent = 'Incorrect PIN — try again';
    card.classList.add('shake');
    setTimeout(() => {
      card.classList.remove('shake');
      $('pin-error').textContent = '\u00a0';
      pinEntry = '';
      updateDots();
    }, 700);
  }
}

function buildPinSparkles() {
  const c = $('pin-sparkles');
  const symbols = ['✦','✧','★','✺','✨','♥','🌸','✿'];
  for (let i = 0; i < 35; i++) {
    const s = document.createElement('div');
    s.className = 'sp';
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.cssText = `
      left:${rand(0,100)}%; top:${rand(5,90)}%;
      font-size:${rand(.55,1.3)}rem;
      --sd:${rand(4,9)}s; --dl:${rand(0,7)}s;
      --c:hsl(${rand(310,360)},80%,72%);
    `;
    c.appendChild(s);
  }
}

/* ════════════════════════════════════════════════════════════════
   1 — INTRO
════════════════════════════════════════════════════════════════ */
function initIntro() {
  buildStars();
  buildFloatingHearts();
}

function buildStars() {
  const c = $('intro-stars');
  for (let i = 0; i < 140; i++) {
    const s = document.createElement('div');
    s.className = 'star-dot';
    const sz = rand(1, 3.5);
    s.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${rand(0,100)}%; top:${rand(0,100)}%;
      --dur:${rand(2,5)}s; --dl:${rand(0,6)}s; --br:${rand(.4,1)};
    `;
    c.appendChild(s);
  }
}

function buildFloatingHearts() {
  const c = $('hearts-bg');
  const emojis = ['💕','💗','💖','💝','✨','🌸','🌹','💫'];
  for (let i = 0; i < 22; i++) {
    const h = document.createElement('div');
    h.className = 'fh';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.cssText = `
      left:${rand(3,97)}%;
      --fs:${rand(.85,1.7)}rem;
      --dur:${rand(8,15)}s; --dl:${rand(0,9)}s;
      --r1:${rand(-18,18)}deg; --r2:${rand(-18,18)}deg;
    `;
    c.appendChild(h);
  }
}

function startAudio() {
  audio = new Audio(CONFIG.music);
  audio.loop = true; audio.volume = 0.42;
  audio.play().catch(() => {});
}

/* ════════════════════════════════════════════════════════════════
   2 — PARTICLE TEXT (Three.js)
════════════════════════════════════════════════════════════════ */
let pRenderer, pScene, pCamera, pStars, pPoints, pFrame;
let pCurrent, pTarget, pScatter, pText1, pText2;
let pLerpSpd = 0.055;

function sampleText(text, count) {
  const W = 900, H = 250;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const fs = text.length > 8 ? 88 : 120;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fs}px Georgia, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W/2, H/2);
  const data = ctx.getImageData(0,0,W,H).data;
  const valid = [];
  for (let y=0;y<H;y+=3) for (let x=0;x<W;x+=3)
    if (data[(y*W+x)*4+3] > 100) valid.push({x:(x-W/2)/55, y:-(y-H/2)/55});
  const out = new Float32Array(count*3);
  for (let i=0;i<count;i++) {
    const p = valid.length ? valid[Math.floor(Math.random()*valid.length)] : {x:0,y:0};
    out[i*3]=p.x+rand(-.06,.06); out[i*3+1]=p.y+rand(-.06,.06); out[i*3+2]=rand(-.3,.3);
  }
  return out;
}

function makeScatter(n) {
  const a = new Float32Array(n*3);
  for (let i=0;i<n*3;i++) a[i] = rand(-12,12);
  return a;
}

function initParticles() {
  const canvas = $('particle-canvas');
  const W = innerWidth, H = innerHeight;
  pRenderer = new THREE.WebGLRenderer({canvas, antialias:true});
  pRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  pRenderer.setSize(W,H); pRenderer.setClearColor(0x060011,1);

  pScene  = new THREE.Scene();
  pCamera = new THREE.PerspectiveCamera(60,W/H,.1,100);
  pCamera.position.z = W < 768 ? 13 : 7;

  /* Stars */
  const sg = new THREE.BufferGeometry();
  const sa = new Float32Array(2000*3);
  for (let i=0;i<sa.length;i++) sa[i]=rand(-30,30);
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sa,3));
  pStars = new THREE.Points(sg, new THREE.PointsMaterial({color:0xffffff,size:.055,transparent:true,opacity:.6}));
  pScene.add(pStars);

  /* Text particles */
  const N = CONFIG.particleCount;
  pScatter = makeScatter(N);
  pText1   = sampleText(CONFIG.particleText1, N);
  pText2   = sampleText(CONFIG.particleText2, N);
  pCurrent = new Float32Array(pScatter);
  pTarget  = new Float32Array(pScatter);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pCurrent,3));
  const col = new Float32Array(N*3);
  for (let i=0;i<N;i++) {
    const t=i/N;
    col[i*3]=1-t*.25; col[i*3+1]=.3+t*.12; col[i*3+2]=.5+t*.5;
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  pPoints = new THREE.Points(geo, new THREE.PointsMaterial({
    size: CONFIG.particleSize*.04, vertexColors:true, transparent:true, opacity:.95
  }));
  pScene.add(pPoints);

  setTimeout(()=>setPT(pText1,.065),   900);
  setTimeout(()=>setPT(pScatter,.042), 4500);
  setTimeout(()=>setPT(pText2,.065),   6600);
  setTimeout(()=>toHeart(),            CONFIG.scene1Duration);

  animParticles();

  window._pR = () => {
    if (!pRenderer) return;
    pCamera.aspect = innerWidth/innerHeight;
    pCamera.updateProjectionMatrix();
    pRenderer.setSize(innerWidth,innerHeight);
  };
  window.addEventListener('resize', window._pR);
}

function setPT(arr, spd=.055) { pTarget=arr; pLerpSpd=spd; }

function animParticles() {
  pFrame = requestAnimationFrame(animParticles);
  const pos = pPoints.geometry.attributes.position.array;
  for (let i=0;i<pos.length;i++) pos[i]+=(pTarget[i]-pos[i])*pLerpSpd;
  pPoints.geometry.attributes.position.needsUpdate = true;
  pStars.rotation.y+=.0003; pStars.rotation.x+=.0001;
  pRenderer.render(pScene,pCamera);
}

function destroyParticles() {
  cancelAnimationFrame(pFrame);
  window.removeEventListener('resize', window._pR);
  if (pRenderer) { pRenderer.dispose(); pRenderer=null; }
}

/* ════════════════════════════════════════════════════════════════
   3 — 3D PHOTO SPHERE (Hình cầu tròn đều)
════════════════════════════════════════════════════════════════ */
let hRenderer, hScene, hCamera, hGroup, hFrame;
let hMeshes=[], hDrag=false, hPX=0, hPY=0, hRX=0, hRY=0;
let hDownX=0, hDownY=0;

/* Công thức toán học cho hình cầu */
function spherePoint(u, v, sc) {
  const r = 16 * sc;
  return new THREE.Vector3(
    r * Math.sin(u) * Math.cos(v),
    r * Math.cos(u),
    r * Math.sin(u) * Math.sin(v)
  );
}

/* Vector pháp tuyến (để ảnh hướng ra ngoài) */
function sphereNormal(u, v, sc) {
  return spherePoint(u, v, sc).normalize();
}

/* Tính toán lưới tọa độ dán ảnh */
function buildSphere3D(sc, tileSize) {
  const pts = [];
  const uSteps = 16; 
  for (let ui = 1; ui < uSteps; ui++) {
    const u = (ui / uSteps) * Math.PI;
    const ringR = 16 * sc * Math.sin(u); 
    const vN = Math.max(1, Math.round(2 * Math.PI * ringR / tileSize));
    for (let vi = 0; vi < vN; vi++) {
      const v = (vi / vN) * 2 * Math.PI;
      pts.push({ pos: spherePoint(u, v, sc), nrm: sphereNormal(u, v, sc) });
    }
  }
  return pts;
}

function loadTex(url) {
  return new Promise(resolve => {
    new THREE.TextureLoader().load(url, tex => {
      tex._url = url; resolve(tex);
    }, undefined, () => {
      const cv = document.createElement('canvas'); cv.width=256; cv.height=256;
      const ctx = cv.getContext('2d');
      const h = Math.random()*360;
      const g = ctx.createLinearGradient(0,0,256,256);
      g.addColorStop(0,`hsl(${h},72%,65%)`);
      g.addColorStop(1,`hsl(${(h+55)%360},82%,45%)`);
      ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
      ctx.fillStyle='rgba(255,255,255,.16)';
      ctx.font='bold 54px serif'; ctx.textAlign='center';
      ctx.fillText('💕',128,152);
      const t = new THREE.CanvasTexture(cv); t._url=null; resolve(t);
    });
  });
}

async function initHeart() {
  const canvas = $('sphere-canvas');
  const W=innerWidth, H=innerHeight;

  hRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  hRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  hRenderer.setSize(W, H);
  hRenderer.setClearColor(0x060011, 1);

  hScene  = new THREE.Scene();
  hCamera = new THREE.PerspectiveCamera(46, W/H, 0.1, 100);
  
  // FIX CHO IPHONE: Đẩy camera ra xa 22 đơn vị nếu là điện thoại để không bị cắt viền
  hCamera.position.z = W < 768 ? 22 : 14;

  /* Background stars */
  const sg = new THREE.BufferGeometry();
  const sa = new Float32Array(1800 * 3);
  for (let i = 0; i < sa.length; i++) sa[i] = rand(-40, 40);
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sa, 3));
  hScene.add(new THREE.Points(sg, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.07, transparent: true, opacity: 0.38
  })));

  /* Soft pink sparkles near sphere */
  const spGeo = new THREE.BufferGeometry();
  const spArr = new Float32Array(400 * 3);
  for (let i = 0; i < spArr.length; i++) spArr[i] = rand(-9, 9);
  spGeo.setAttribute('position', new THREE.Float32BufferAttribute(spArr, 3));
  hScene.add(new THREE.Points(spGeo, new THREE.PointsMaterial({
    color: 0xffb0d0, size: 0.055, transparent: true, opacity: 0.5
  })));

  /* Lights */
  hScene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const kl = new THREE.DirectionalLight(0xffe0f0, 1.4);
  kl.position.set(6, 8, 10); hScene.add(kl);
  const fl = new THREE.DirectionalLight(0xb0d0ff, 0.38);
  fl.position.set(-6, -4, -6); hScene.add(fl);
  const rl = new THREE.PointLight(0xff80b0, 0.7, 35);
  rl.position.set(0, 0, 13); hScene.add(rl);

  hGroup = new THREE.Group();
  hScene.add(hGroup);

  /* Load textures */
  const textures = await Promise.all(CONFIG.images.map(loadTex));
  $('sphere-loading').classList.add('hidden');

  /* ── Xây dựng hình cầu ── */
  const sc       = 0.35;  /* Kích thước quả cầu */
  const tileSize = 0.95;  /* Kích thước ảnh */
  const pts      = buildSphere3D(sc, tileSize);

  hMeshes = [];
  pts.forEach((pt, i) => {
    const tex = textures[i % textures.length];
    tex.minFilter = tex.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(tileSize * 0.98, tileSize * 0.98);
    const mat = new THREE.MeshPhongMaterial({
      map: tex,
      side: THREE.DoubleSide,
      shininess: 22,
      specular: new THREE.Color(0xffd0e0),
    });
    const mesh = new THREE.Mesh(geo, mat);

    /* Căn tọa độ (Hình cầu đã tự căn giữa, không cần trừ yCentre nữa) */
    mesh.position.copy(pt.pos);

    /* Xoay ảnh hướng ra ngoài theo mặt cầu */
    const fwd = new THREE.Vector3(0, 0, 1);
    const q   = new THREE.Quaternion().setFromUnitVectors(fwd, pt.nrm);
    mesh.setRotationFromQuaternion(q);

    mesh.userData.srcUrl = tex._url;
    hMeshes.push(mesh);
    hGroup.add(mesh);
  });

  hRX = 0; hRY = 0;
  animHeart();
  attachHeartEvents();

  window._hR = () => {
    if (!hRenderer) return;
    hCamera.aspect = innerWidth / innerHeight;
    hCamera.updateProjectionMatrix();
    hRenderer.setSize(innerWidth, innerHeight);
  };
  window.addEventListener('resize', window._hR);
}

const hRay = new THREE.Raycaster();
const hMV  = new THREE.Vector2();

function animHeart() {
  hFrame = requestAnimationFrame(animHeart);
  if (!hDrag) hRY += 0.007;
  hGroup.rotation.y = hRY;
  hGroup.rotation.x = hRX;
  hRenderer.render(hScene, hCamera);
}

function attachHeartEvents() {
  const cv = $('sphere-canvas');

  cv.addEventListener('mousedown', e => {
    hDrag=true; hPX=hDownX=e.clientX; hPY=hDownY=e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (!hDrag) return;
    hRY += (e.clientX-hPX)*0.008; hRX += (e.clientY-hPY)*0.006;
    hPX=e.clientX; hPY=e.clientY;
  });
  window.addEventListener('mouseup', e => {
    const moved = Math.hypot(e.clientX-hDownX, e.clientY-hDownY) > 5;
    if (!moved) hitHeart(e.clientX, e.clientY);
    hDrag=false;
  });

  let tDownX=0, tDownY=0;
  cv.addEventListener('touchstart', e => {
    hDrag=true; hPX=tDownX=e.touches[0].clientX; hPY=tDownY=e.touches[0].clientY;
  },{passive:true});
  window.addEventListener('touchmove', e => {
    if (!hDrag) return;
    hRY+=(e.touches[0].clientX-hPX)*.011; hRX+=(e.touches[0].clientY-hPY)*.008;
    hPX=e.touches[0].clientX; hPY=e.touches[0].clientY;
  },{passive:true});
  window.addEventListener('touchend', e => {
    const t=e.changedTouches[0];
    if (Math.hypot(t.clientX-tDownX,t.clientY-tDownY)<10) hitHeart(t.clientX,t.clientY);
    hDrag=false;
  });
}

function hitHeart(cx, cy) {
  hMV.x=(cx/innerWidth)*2-1; hMV.y=-(cy/innerHeight)*2+1;
  hRay.setFromCamera(hMV, hCamera);
  const hits = hRay.intersectObjects(hMeshes);
  if (hits.length > 0 && hits[0].object.userData.srcUrl) {
    openLightbox(hits[0].object.userData.srcUrl);
  }
}

function destroyHeart() {
  cancelAnimationFrame(hFrame);
  window.removeEventListener('resize', window._hR);
  if (hRenderer) { hRenderer.dispose(); hRenderer=null; }
}

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX
════════════════════════════════════════════════════════════════ */
function openLightbox(url) {
  $('lb-img').src = url;
  $('lightbox').classList.add('active');
}
function closeLightbox() { $('lightbox').classList.remove('active'); }

/* ════════════════════════════════════════════════════════════════
   4 — LOVE LETTER
════════════════════════════════════════════════════════════════ */
let petalsInt = null;

function initLetter() {
  spawnPetals();
  $('envelope').addEventListener('click', openEnvelope);
}

function openEnvelope() {
  const env = $('envelope');
  if (env.classList.contains('opened')) return;
  const p = $('env-prompt'); if (p) { p.style.opacity='0'; p.style.pointerEvents='none'; }
  env.classList.add('opened');
  /* After flap animation, show scrollable full-screen letter */
  setTimeout(showFullLetter, 1380);
}

function showFullLetter() {
  $('full-letter-content').innerHTML = CONFIG.letterContent;
  $('full-letter-overlay').classList.add('visible');
  const rb = $('replay-btn'); if (rb) rb.style.display='block';
}

const PETALS = ['🌸','🌹','💐','🌺','🏵️','💮'];
function spawnPetals() {
  const c = $('petals-container');
  petalsInt = setInterval(() => {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = PETALS[Math.floor(Math.random()*PETALS.length)];
    p.style.cssText = `
      left:${rand(0,100)}%;
      font-size:${rand(.9,1.8)}rem;
      animation-duration:${rand(5,9)}s;
      animation-delay:${rand(0,2)}s;
      --drift:${rand(-80,80)}px;
    `;
    c.appendChild(p);
    setTimeout(() => p.remove(), 11000);
  }, 550);
}

/* ════════════════════════════════════════════════════════════════
   TRANSITIONS
════════════════════════════════════════════════════════════════ */
function toParticles() {
  currentScene = 'particles';
  fadeOut('intro-screen', () => {
    showScreen('scene-particles');
    initParticles();
  });
}

function toHeart() {
  currentScene = 'sphere';
  fadeOut('scene-particles', () => {
    destroyParticles();
    showScreen('scene-sphere');
    initHeart();
    /* Show shaking letter FAB after heart loads */
    setTimeout(() => $('letter-fab').classList.add('visible'), 2200);
  });
}

function toLetter() {
  currentScene = 'letter';
  $('letter-fab').classList.add('hidden');
  fadeOut('scene-sphere', () => {
    destroyHeart();
    showScreen('scene-letter');
    initLetter();
  });
}

/* ════════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
function init() {
  showScreen('pin-screen');
  initPin();

  /* Intro start button */
  $('start-btn').addEventListener('click', () => {
    startAudio();
    toParticles();
  });

  /* Particle skip */
  $('particle-skip').addEventListener('click', () => {
    if (currentScene !== 'particles') return;
    toHeart();
  });

  /* Shaking letter FAB → go to letter scene */
  $('letter-fab').addEventListener('click', () => {
    if (currentScene !== 'sphere') return;
    toLetter();
  });

  /* Lightbox */
  $('lightbox').addEventListener('click', closeLightbox);
  $('lb-close').addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });

  /* Close full letter overlay */
  $('close-letter-btn').addEventListener('click', () => {
    $('full-letter-overlay').classList.remove('visible');
  });

  /* Replay */
  $('replay-btn').addEventListener('click', () => {
    if (petalsInt) clearInterval(petalsInt);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', init);
