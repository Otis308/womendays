/* ═══════════════════════════════════════════════════════════════════
   sphere.js  —  3D Photo Sphere · Enhanced Edition
   API: initSphere(imageUrls) / destroySphere()
═══════════════════════════════════════════════════════════════════ */

;(function(window) {
  'use strict';

  const PHOTO_COUNT = 50;
  const SPHERE_R    = 5.4;

  const PALETTES = [
    ['#ff6b9d','#c44dff'], ['#ff4757','#ff6b35'], ['#ff9f43','#ffeaa7'],
    ['#00cec9','#6c5ce7'], ['#fd79a8','#e17055'], ['#74b9ff','#0984e3'],
    ['#55efc4','#00b894'], ['#a29bfe','#6c5ce7'], ['#fab1a0','#e17055'],
    ['#ffeaa7','#fdcb6e'], ['#ff7675','#fd79a8'], ['#6c5ce7','#a29bfe'],
    ['#e17055','#d63031'], ['#00b894','#00cec9'], ['#fdcb6e','#e17055'],
  ];

  let renderer, scene, camera, clock;
  let sphereGroup, heartGroup, heartMesh, heartLight, heartGlow;
  let rings = [];
  let floatingHearts3D = [];
  let outerParticles, nebulaParticles;
  let stars, sparkles;
  let shootingStars3D = [];   // ← NEW
  let sideEffectsTimer = null; // ← NEW
  let photoMeshes   = [];
  let photoCanvases = [];
  let photoTextures = [];
  let rafId = null;
  let isRunning = false;

  let isDragging = false, dragMoved = false;
  let lastMX = 0, lastMY = 0;
  let velX = 0, velY = 0;
  let autoRotate = true;
  let autoTimer  = null;

  let oc, octx;
  const burst2d = [];
  let currentPhoto = 0;
  let totalPhotos  = PHOTO_COUNT;
  let _onMouseDown, _onMouseMove, _onMouseUp;
  let _onTouchStart, _onTouchMove, _onTouchEnd;
  let _onResize, _onKeyDown;
  let tStart = null;

  window.initSphere    = initSphere;
  window.destroySphere = destroySphere;

  function initSphere(imageUrls) {
    if (isRunning) return;
    isRunning = true;
    buildTextures(imageUrls || []);
    buildScene();
    buildOverlay();
    bindEvents();
    hideSphereLoading();
    animate();
  }

  function destroySphere() {
    isRunning = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    unbindEvents();
    if (renderer) { renderer.dispose(); renderer = null; }
    photoMeshes = []; photoCanvases = []; photoTextures = [];
    burst2d.length = 0; rings = []; floatingHearts3D = []; shootingStars3D = [];
    if (sideEffectsTimer) { clearInterval(sideEffectsTimer); sideEffectsTimer = null; }
    clearTimeout(autoTimer);
    scene = null; camera = null;
  }

  /* ═══ TEXTURES ═══ */
  function buildTextures(urls) {
    photoCanvases = []; photoTextures = [];
    const hasUrls = urls && urls.length > 0;
    for (let i = 0; i < PHOTO_COUNT; i++) {
      const url = hasUrls ? urls[i % urls.length] : null;
      if (url) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = 512;
        const ctx = cvs.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const tex = new THREE.CanvasTexture(cvs);
        img.onload = () => {
          const s = Math.min(img.width, img.height);
          ctx.save();
          roundRect(ctx, 8, 8, 496, 496, 28); ctx.clip();
          ctx.drawImage(img, (img.width-s)/2, (img.height-s)/2, s, s, 0, 0, 512, 512);
          ctx.restore();
          const bd = ctx.createLinearGradient(0,0,512,512);
          bd.addColorStop(0,'rgba(255,180,220,0.75)');
          bd.addColorStop(0.5,'rgba(255,255,255,0.9)');
          bd.addColorStop(1,'rgba(200,100,180,0.65)');
          ctx.strokeStyle = bd; ctx.lineWidth = 10;
          roundRect(ctx, 5, 5, 502, 502, 26); ctx.stroke();
          tex.needsUpdate = true;
        };
        img.onerror = () => { ctx.drawImage(generatePlaceholder(i),0,0); tex.needsUpdate=true; };
        img.src = url;
        photoCanvases.push(cvs); photoTextures.push(tex);
      } else {
        const cvs = generatePlaceholder(i);
        photoCanvases.push(cvs);
        photoTextures.push(new THREE.CanvasTexture(cvs));
      }
    }
    totalPhotos = PHOTO_COUNT;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }

  function generatePlaceholder(idx) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    const pal = PALETTES[idx % PALETTES.length];
    roundRect(ctx, 0, 0, 512, 512, 28); ctx.clip();
    const g = ctx.createLinearGradient(0,0,512,512);
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
    const rg = ctx.createRadialGradient(256,180,10,256,180,260);
    rg.addColorStop(0,'rgba(255,255,255,0.22)'); rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0,0,512,512);
    for (let r=55; r<=220; r+=55) {
      ctx.beginPath(); ctx.arc(256,256,r,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=1.5; ctx.stroke();
    }
    for (let i=0; i<18; i++) {
      ctx.beginPath();
      ctx.arc(40+Math.random()*432, 40+Math.random()*432, 2+Math.random()*6, 0, Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${0.1+Math.random()*0.2})`; ctx.fill();
    }
    ctx.save(); ctx.translate(256,215);
    drawCanvasHeart(ctx,62);
    const hg = ctx.createRadialGradient(0,-10,4,0,0,68);
    hg.addColorStop(0,'rgba(255,255,255,0.98)');
    hg.addColorStop(0.55,'rgba(255,200,220,0.7)');
    hg.addColorStop(1,'rgba(255,100,160,0.2)');
    ctx.fillStyle=hg; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,0.92)';
    ctx.font='bold 28px Georgia,serif'; ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=12;
    ctx.fillText(`✦  ${idx+1}  ✦`, 256, 370);
    const strip = ctx.createLinearGradient(0,400,0,512);
    strip.addColorStop(0,'rgba(0,0,0,0)'); strip.addColorStop(1,'rgba(0,0,0,0.3)');
    ctx.fillStyle=strip; ctx.fillRect(0,400,512,112);
    ctx.shadowBlur=0;
    const bd = ctx.createLinearGradient(0,0,512,512);
    bd.addColorStop(0,'rgba(255,220,240,0.8)'); bd.addColorStop(1,'rgba(255,150,200,0.5)');
    ctx.strokeStyle=bd; ctx.lineWidth=8;
    roundRect(ctx,4,4,504,504,26); ctx.stroke();
    return c;
  }

  function drawCanvasHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0,s*.3);
    ctx.bezierCurveTo(s*.5,s*.9,s,s*.3,s*.5,-s*.1);
    ctx.bezierCurveTo(s*.3,-s*.4,0,-s*.5,0,-s*.4);
    ctx.bezierCurveTo(0,-s*.5,-s*.3,-s*.4,-s*.5,-s*.1);
    ctx.bezierCurveTo(-s,s*.3,-s*.5,s*.9,0,s*.3);
  }

  /* ═══ SCENE ═══ */
  function buildScene() {
    const canvas = document.getElementById('sphere-canvas');
    const W = window.innerWidth, H = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x08000f, 1);
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 200);
    camera.position.z = W < 768 ? 16 : 13;
    clock  = new THREE.Clock();

    scene.add(new THREE.AmbientLight(0xffd6e8, 0.35));
    heartLight = new THREE.PointLight(0xff1155, 6, 14);
    scene.add(heartLight);
    const rimA = new THREE.DirectionalLight(0xff88cc, 0.9);
    rimA.position.set(8,5,8); scene.add(rimA);
    const rimB = new THREE.DirectionalLight(0x5588ff, 0.5);
    rimB.position.set(-8,-5,-8); scene.add(rimB);
    const rimC = new THREE.DirectionalLight(0xffaadd, 0.4);
    rimC.position.set(0,10,0); scene.add(rimC);

    buildPhotoSphere();
    buildInnerHeart();
    buildOrbitalRings();
    buildOuterEffects();
    buildStarField();
    buildShootingStars3D();
    buildCssSideEffects();
  }

  function buildPhotoSphere() {
    sphereGroup = new THREE.Group();
    photoMeshes = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    /* ── Lưu vị trí từng ảnh để vẽ đường nối ── */
    const positions = [];

    for (let i = 0; i < PHOTO_COUNT; i++) {
      const yn = 1 - (i/(PHOTO_COUNT-1))*2;
      const r  = Math.sqrt(Math.max(0,1-yn*yn));
      const th = golden * i;
      const nx = Math.cos(th)*r, nz = Math.sin(th)*r;

      positions.push(new THREE.Vector3(nx*SPHERE_R, yn*SPHERE_R, nz*SPHERE_R));

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15,1.15),
        new THREE.MeshStandardMaterial({
          map: photoTextures[i], metalness:0.1, roughness:0.3,
          emissive: new THREE.Color(0x150008), emissiveIntensity:0.2,
        })
      );
      mesh.userData.photoIndex = i;

      const glowFrame = new THREE.Mesh(
        new THREE.PlaneGeometry(1.35,1.35),
        new THREE.MeshBasicMaterial({ color:0xff88cc, transparent:true, opacity:0.18 })
      );
      glowFrame.position.z = -0.008;

      const border = new THREE.Mesh(
        new THREE.PlaneGeometry(1.22,1.22),
        new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.35 })
      );
      border.position.z = -0.004;

      const frame = new THREE.Group();
      frame.add(glowFrame, border, mesh);
      frame.position.set(nx*SPHERE_R, yn*SPHERE_R, nz*SPHERE_R);
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(nx,yn,nz).normalize());
      frame.quaternion.copy(q);
      sphereGroup.add(frame);
      photoMeshes.push(mesh);
    }

    /* ── Đường nối trắng giữa các ảnh gần nhau nhất ── */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
    });

    /* Với mỗi ảnh, tìm 3 láng giềng gần nhất theo khoảng cách 3D thực,
       chỉ vẽ khi i < j để tránh vẽ đường trùng */
    const NEIGHBORS = 3;
    const drawn = new Set();

    for (let i = 0; i < PHOTO_COUNT; i++) {
      /* Tính khoảng cách từ i đến tất cả j khác, sắp xếp tăng dần */
      const dists = [];
      for (let j = 0; j < PHOTO_COUNT; j++) {
        if (i === j) continue;
        dists.push({ j, d: positions[i].distanceTo(positions[j]) });
      }
      dists.sort((a, b) => a.d - b.d);

      /* Lấy NEIGHBORS láng giềng gần nhất */
      for (let k = 0; k < NEIGHBORS; k++) {
        const j = dists[k].j;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (drawn.has(key)) continue;
        drawn.add(key);
        const geo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        sphereGroup.add(new THREE.Line(geo, lineMat));
      }
    }

    scene.add(sphereGroup);
  }

  function buildInnerHeart() {
    heartGroup = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo( 0,    .45);
    shape.bezierCurveTo( .25,  .85,  .75,  .75,  .75,  .25);
    shape.bezierCurveTo( .75, -.18,  .42, -.42,  0,   -.68);
    shape.bezierCurveTo(-.42, -.42, -.75, -.18, -.75,  .25);
    shape.bezierCurveTo(-.75,  .75, -.25,  .85,  0,    .45);
    const heartGeo = new THREE.ExtrudeGeometry(shape, {
      depth:0.35, bevelEnabled:true,
      bevelThickness:0.08, bevelSize:0.06, bevelSegments:16,
    });
    heartGeo.center();
    heartMesh = new THREE.Mesh(heartGeo, new THREE.MeshPhongMaterial({
      color: new THREE.Color(0xff0844),
      emissive: new THREE.Color(0xcc0033), emissiveIntensity:1.1,
      specular: new THREE.Color(0xffaacc), shininess:180,
    }));
    heartMesh.scale.setScalar(2.0);
    heartGroup.add(heartMesh);

    heartGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.55,32,32),
      new THREE.MeshBasicMaterial({ color:0xff2255, transparent:true, opacity:0.06, side:THREE.BackSide })
    );
    heartGroup.add(heartGlow);
    heartGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.2,32,32),
      new THREE.MeshBasicMaterial({ color:0xff3366, transparent:true, opacity:0.035, side:THREE.BackSide })
    ));
    heartGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(3.0,32,32),
      new THREE.MeshBasicMaterial({ color:0xff4488, transparent:true, opacity:0.018, side:THREE.BackSide })
    ));

    /* Particles orbiting heart */
    const oHP = new Float32Array(30*3);
    for (let i=0; i<30; i++) {
      const th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*2-1);
      const r=1.1+Math.random()*0.8;
      oHP[i*3]=r*Math.sin(ph)*Math.cos(th);
      oHP[i*3+1]=r*Math.sin(ph)*Math.sin(th);
      oHP[i*3+2]=r*Math.cos(ph);
    }
    const oHGeo = new THREE.BufferGeometry();
    oHGeo.setAttribute('position', new THREE.BufferAttribute(oHP,3));
    heartGroup.add(new THREE.Points(oHGeo, new THREE.PointsMaterial({
      color:0xffaacc, size:0.08, transparent:true, opacity:0.85, sizeAttenuation:true,
    })));
    scene.add(heartGroup);
  }

  function buildOrbitalRings() {
    rings = [];
    const defs = [
      {r:6.3,  tube:0.055, color:0xff69b4, op:0.60, rx:Math.PI/2,   ry:0,          rz:0         },
      {r:6.7,  tube:0.040, color:0xff99dd, op:0.40, rx:Math.PI/3,   ry:0,          rz:Math.PI/6 },
      {r:7.1,  tube:0.030, color:0xffbbee, op:0.28, rx:Math.PI/5,   ry:0,          rz:-Math.PI/4},
      {r:5.9,  tube:0.025, color:0xffe0f0, op:0.22, rx:Math.PI/2,   ry:Math.PI/8,  rz:0         },
      {r:7.5,  tube:0.022, color:0xcc88ff, op:0.18, rx:Math.PI*0.4, ry:Math.PI/5,  rz:Math.PI/7 },
      {r:6.0,  tube:0.018, color:0x88ccff, op:0.15, rx:Math.PI*0.15,ry:Math.PI*0.3,rz:Math.PI/4 },
    ];
    defs.forEach(d => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(d.r, d.tube, 8, 160),
        new THREE.MeshBasicMaterial({ color:d.color, transparent:true, opacity:d.op })
      );
      m.rotation.set(d.rx, d.ry, d.rz);
      scene.add(m); rings.push(m);
    });
  }

  function buildOuterEffects() {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(8.5,32,32),
      new THREE.MeshBasicMaterial({ color:0xff2255, transparent:true, opacity:0.025, side:THREE.BackSide })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(10,32,32),
      new THREE.MeshBasicMaterial({ color:0xcc44ff, transparent:true, opacity:0.015, side:THREE.BackSide })
    ));

    /* Floating mini 3D hearts */
    floatingHearts3D = [];
    const ms = new THREE.Shape();
    ms.moveTo(0,.22); ms.bezierCurveTo(.12,.42,.38,.38,.38,.12);
    ms.bezierCurveTo(.38,-.09,.21,-.21,0,-.34);
    ms.bezierCurveTo(-.21,-.21,-.38,-.09,-.38,.12);
    ms.bezierCurveTo(-.38,.38,-.12,.42,0,.22);
    const mg = new THREE.ExtrudeGeometry(ms, {
      depth:0.12, bevelEnabled:true, bevelThickness:0.03, bevelSize:0.02, bevelSegments:6,
    });
    mg.center();
    const hColors = [0xff3366,0xff6699,0xff99bb,0xffaacc,0xff4477,0xff55aa];
    for (let i=0; i<14; i++) {
      const h = new THREE.Mesh(mg, new THREE.MeshPhongMaterial({
        color: hColors[i%hColors.length],
        emissive: new THREE.Color(hColors[i%hColors.length]).multiplyScalar(0.4),
        shininess:120,
      }));
      const angle=(i/14)*Math.PI*2;
      const elev=(Math.random()-0.5)*Math.PI*0.6;
      const dist=8.5+Math.random()*3.5;
      h.position.set(
        Math.cos(angle)*Math.cos(elev)*dist,
        Math.sin(elev)*dist,
        Math.sin(angle)*Math.cos(elev)*dist
      );
      h.scale.setScalar(0.35+Math.random()*0.45);
      h.userData = {baseAngle:angle,baseElev:elev,dist,phase:Math.random()*Math.PI*2,speed:0.2+Math.random()*0.5};
      scene.add(h); floatingHearts3D.push(h);
    }

    /* Outer nebula particles */
    const NP=300, npP=new Float32Array(NP*3), npC=new Float32Array(NP*3);
    for (let i=0; i<NP; i++) {
      const th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*2-1);
      const r=8+Math.random()*5;
      npP[i*3]=r*Math.sin(ph)*Math.cos(th); npP[i*3+1]=r*Math.sin(ph)*Math.sin(th); npP[i*3+2]=r*Math.cos(ph);
      const col=new THREE.Color(`hsl(${300+Math.random()*60},100%,72%)`);
      npC[i*3]=col.r; npC[i*3+1]=col.g; npC[i*3+2]=col.b;
    }
    const npGeo=new THREE.BufferGeometry();
    npGeo.setAttribute('position',new THREE.BufferAttribute(npP,3));
    npGeo.setAttribute('color',new THREE.BufferAttribute(npC,3));
    outerParticles=new THREE.Points(npGeo,new THREE.PointsMaterial({
      size:0.18, vertexColors:true, transparent:true, opacity:0.65, sizeAttenuation:true,
    }));
    scene.add(outerParticles);

    /* Inner nebula (between heart & photos) */
    const IN=120, inP=new Float32Array(IN*3);
    for (let i=0; i<IN; i++) {
      const th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*2-1);
      const r=3.2+Math.random()*2.0;
      inP[i*3]=r*Math.sin(ph)*Math.cos(th); inP[i*3+1]=r*Math.sin(ph)*Math.sin(th); inP[i*3+2]=r*Math.cos(ph);
    }
    const inGeo=new THREE.BufferGeometry();
    inGeo.setAttribute('position',new THREE.BufferAttribute(inP,3));
    nebulaParticles=new THREE.Points(inGeo,new THREE.PointsMaterial({
      color:0xffccee, size:0.1, transparent:true, opacity:0.5, sizeAttenuation:true,
    }));
    scene.add(nebulaParticles);
  }

  function buildStarField() {
    const FC=600, fP=new Float32Array(FC*3), fC=new Float32Array(FC*3);
    for (let i=0; i<FC; i++) {
      const theta=Math.random()*Math.PI*2, phi=Math.acos(Math.random()*2-1);
      const r=12+Math.random()*8;
      fP[i*3]=r*Math.sin(phi)*Math.cos(theta); fP[i*3+1]=r*Math.sin(phi)*Math.sin(theta); fP[i*3+2]=r*Math.cos(phi);
      const col=new THREE.Color(`hsl(${280+Math.random()*80},100%,78%)`);
      fC[i*3]=col.r; fC[i*3+1]=col.g; fC[i*3+2]=col.b;
    }
    const sGeo=new THREE.BufferGeometry();
    sGeo.setAttribute('position',new THREE.BufferAttribute(fP,3));
    sGeo.setAttribute('color',new THREE.BufferAttribute(fC,3));
    stars=new THREE.Points(sGeo,new THREE.PointsMaterial({
      size:0.13, vertexColors:true, transparent:true, opacity:0.85, sizeAttenuation:true,
    }));
    scene.add(stars);
    const SC=90, spP=new Float32Array(SC*3);
    for (let i=0; i<SC; i++) {
      const a=(i/SC)*Math.PI*2, r=7.0+Math.random()*0.8, y=(Math.random()-0.5)*2.5;
      spP[i*3]=Math.cos(a)*r; spP[i*3+1]=y; spP[i*3+2]=Math.sin(a)*r;
    }
    const spGeo=new THREE.BufferGeometry();
    spGeo.setAttribute('position',new THREE.BufferAttribute(spP,3));
    sparkles=new THREE.Points(spGeo,new THREE.PointsMaterial({
      color:0xffddee, size:0.22, transparent:true, opacity:0.75, sizeAttenuation:true,
    }));
    scene.add(sparkles);
  }

  /* ═══ SHOOTING STARS 3D ═══ */
  function buildShootingStars3D() {
    shootingStars3D = [];
    const mat = new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0 });
    for (let i = 0; i < 12; i++) {
      // Vị trí ngẫu nhiên hai bên trái/phải (xa trung tâm)
      const side   = (Math.random() < 0.5) ? -1 : 1;
      const startX = side * (10 + Math.random() * 6);
      const startY = (Math.random() - 0.5) * 10;
      const startZ = -4 + Math.random() * 8;
      const len    = 1.5 + Math.random() * 2.5;
      const ang    = (Math.random() - 0.5) * 0.4;
      const endX   = startX + side * len * Math.cos(ang);
      const endY   = startY - len * 0.3;
      const endZ   = startZ + len * 0.2;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX,   endY,   endZ),
      ]);
      const line = new THREE.Line(geo, mat.clone());
      line.userData = {
        phase:    Math.random() * Math.PI * 2,
        period:   3.5 + Math.random() * 5,
        startX, startY, startZ, endX, endY, endZ,
      };
      scene.add(line);
      shootingStars3D.push(line);
    }
  }

  /* ═══ CSS SIDE EFFECTS ═══ */
  function buildCssSideEffects() {
    const emojis  = ['💕','💗','💖','💝','✨','🌸','💫','⭐','🌟','💞'];
    const leftEl  = document.getElementById('side-floats-left');
    const rightEl = document.getElementById('side-floats-right');
    const rainEl  = document.getElementById('sparkle-rain');
    const shootEl = document.getElementById('shooting-stars');

    // Floating hearts/emojis hai bên
    function spawnSideFloat(container, isRight) {
      const el = document.createElement('div');
      el.className = 'sf-item';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const dx = isRight ? -(10 + Math.random() * 40) : (10 + Math.random() * 40);
      el.style.cssText = `
        left:  ${Math.random() * 90}%;
        bottom: ${-5 + Math.random() * 15}%;
        font-size: ${0.7 + Math.random() * 0.9}rem;
        --dur: ${7 + Math.random() * 7}s;
        --dl:  ${Math.random() * 5}s;
        --dx:  ${dx}px;
        --rot: ${-30 + Math.random() * 60}deg;
      `;
      container.appendChild(el);
      const dur = parseFloat(el.style.getPropertyValue('--dur') || '10') * 1000 +
                  parseFloat(el.style.getPropertyValue('--dl')  || '0')  * 1000 + 500;
      setTimeout(() => el.remove(), dur + 8000);
    }

    // Sparkle rain dots — rải đều toàn màn hình nhưng tránh trung tâm
    if (rainEl) {
      for (let i = 0; i < 55; i++) {
        const sp = document.createElement('div');
        sp.className = 'sp-rain';
        // Tập trung hai bên: 0-25% và 75-100% theo chiều ngang
        let lx;
        if (Math.random() < 0.5) lx = Math.random() * 22;
        else                      lx = 78 + Math.random() * 22;
        const sz = 2 + Math.random() * 4;
        sp.style.cssText = `
          left:${lx}%; top:${5 + Math.random() * 88}%;
          width:${sz}px; height:${sz}px;
          --dur: ${1.5 + Math.random() * 3.5}s;
          --dl:  ${Math.random() * 6}s;
          background: hsl(${290 + Math.random()*80},100%,${75 + Math.random()*20}%);
        `;
        rainEl.appendChild(sp);
      }
    }

    // CSS shooting stars
    if (shootEl) {
      const shootData = [
        // [top%, left%, width, angle-deg, delay]
        [8,  2,  160, -15, 0],   [18, 75, 140, -18, 1.4],
        [35, 0,  120, -12, 2.8], [52, 80, 180, -22, 0.7],
        [65, 5,  100, -10, 3.5], [78, 70, 150, -16, 1.9],
        [12, 82, 130, -20, 4.2], [42, 0,  110, -14, 2.1],
        [88, 78, 140, -18, 0.5], [25, 3,  170, -25, 3.1],
      ];
      shootData.forEach(([tp, lp, w, ang, dl]) => {
        const s = document.createElement('div');
        s.className = 'shoot';
        const tx = (ang < 0 ? 1 : -1) * (200 + Math.random() * 150);
        const ty = Math.abs(ang) * 4;
        s.style.cssText = `
          top:${tp}%; left:${lp}%; width:${w}px;
          --angle:${ang}deg; --tx:${tx}px; --ty:${ty}px;
          --dur:${1.4 + Math.random() * 1.2}s; --dl:${dl + Math.random() * 2}s;
        `;
        shootEl.appendChild(s);
      });
    }

    // Spawn floating emojis đều đặn
    if (leftEl && rightEl) {
      // Spawn ngay lập tức một batch đầu
      for (let i = 0; i < 6; i++) spawnSideFloat(leftEl,  false);
      for (let i = 0; i < 6; i++) spawnSideFloat(rightEl, true);
      // Rồi cứ 2.5s spawn thêm
      sideEffectsTimer = setInterval(() => {
        if (!isRunning) return;
        if (Math.random() < 0.6) spawnSideFloat(leftEl,  false);
        if (Math.random() < 0.6) spawnSideFloat(rightEl, true);
      }, 2500);
    }
  }

  /* ═══ 2D OVERLAY ═══ */
  function buildOverlay() {
    oc=document.getElementById('sphere-overlay-canvas');
    if (!oc) return;
    octx=oc.getContext('2d'); resizeOverlay();
  }
  function resizeOverlay() {
    if (!oc) return; oc.width=window.innerWidth; oc.height=window.innerHeight;
  }
  function spawnBurst(cx,cy,count) {
    for (let i=0; i<(count||70); i++) {
      const angle=Math.random()*Math.PI*2, speed=2+Math.random()*10;
      burst2d.push({
        x:cx,y:cy, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
        life:1, decay:.015+Math.random()*.025, size:4+Math.random()*8,
        color:`hsl(${290+Math.random()*80},100%,70%)`,
        type:Math.random()<.45?'heart':'circle', rot:Math.random()*Math.PI*2,
      });
    }
  }
  function draw2dHeart(ctx,x,y,s,rot) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(s,s);
    ctx.beginPath();
    ctx.moveTo(0,.3); ctx.bezierCurveTo(.5,.9,1,.3,.5,-.1);
    ctx.bezierCurveTo(.3,-.4,0,-.5,0,-.4); ctx.bezierCurveTo(0,-.5,-.3,-.4,-.5,-.1);
    ctx.bezierCurveTo(-1,.3,-.5,.9,0,.3); ctx.fill(); ctx.restore();
  }
  function tickOverlay() {
    if (!oc||!octx) return;
    octx.clearRect(0,0,oc.width,oc.height);
    for (let i=burst2d.length-1;i>=0;i--) {
      const p=burst2d[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=.18;
      p.life-=p.decay; p.rot+=.07;
      if (p.life<=0) { burst2d.splice(i,1); continue; }
      octx.globalAlpha=p.life*p.life; octx.fillStyle=p.color;
      if (p.type==='heart') draw2dHeart(octx,p.x,p.y,p.size*.85,p.rot);
      else { octx.beginPath(); octx.arc(p.x,p.y,p.size*p.life*.6,0,Math.PI*2); octx.fill(); }
    }
    octx.globalAlpha=1;
  }

  /* ═══ EVENTS ═══ */
  const raycaster = new THREE.Raycaster();
  const mouse2d   = new THREE.Vector2();

  function bindEvents() {
    const canvas = document.getElementById('sphere-canvas');
    _onMouseDown = e => { isDragging=true; dragMoved=false; lastMX=e.clientX; lastMY=e.clientY; pauseAuto(); };
    _onMouseMove = e => {
      if (!isDragging) return;
      const dx=e.clientX-lastMX, dy=e.clientY-lastMY;
      if (Math.abs(dx)>3||Math.abs(dy)>3) dragMoved=true;
      velY=dx*.004; velX=dy*.004;
      sphereGroup.rotation.x+=velX; sphereGroup.rotation.y+=velY;
      lastMX=e.clientX; lastMY=e.clientY;
    };
    _onMouseUp = e => {
      if (!isDragging) return; isDragging=false;
      if (!dragMoved) doClick(e.clientX,e.clientY); else resumeAuto();
    };
    _onTouchStart = e => {
      tStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
      isDragging=true; dragMoved=false; pauseAuto();
    };
    _onTouchMove = e => {
      if (!isDragging||!tStart) return;
      const dx=e.touches[0].clientX-tStart.x, dy=e.touches[0].clientY-tStart.y;
      if (Math.abs(dx)>4||Math.abs(dy)>4) dragMoved=true;
      sphereGroup.rotation.x+=dy*.004; sphereGroup.rotation.y+=dx*.004;
      tStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    };
    _onTouchEnd = () => {
      if (!isDragging) return; isDragging=false;
      if (!dragMoved&&tStart) doClick(tStart.x,tStart.y); else resumeAuto();
    };
    _onResize=onResize; _onKeyDown=onKeyDown;
    canvas.addEventListener('mousedown',_onMouseDown);
    window.addEventListener('mousemove',_onMouseMove);
    window.addEventListener('mouseup',_onMouseUp);
    canvas.addEventListener('touchstart',_onTouchStart,{passive:true});
    window.addEventListener('touchmove',_onTouchMove,{passive:true});
    window.addEventListener('touchend',_onTouchEnd);
    window.addEventListener('resize',_onResize);
    document.addEventListener('keydown',_onKeyDown);
    const lbPrev=document.getElementById('lb-prev');
    const lbNext=document.getElementById('lb-next');
    if (lbPrev) lbPrev.addEventListener('click',lbPrevPhoto);
    if (lbNext) lbNext.addEventListener('click',lbNextPhoto);
  }

  function unbindEvents() {
    const canvas=document.getElementById('sphere-canvas');
    if (!canvas) return;
    canvas.removeEventListener('mousedown',_onMouseDown);
    window.removeEventListener('mousemove',_onMouseMove);
    window.removeEventListener('mouseup',_onMouseUp);
    canvas.removeEventListener('touchstart',_onTouchStart);
    window.removeEventListener('touchmove',_onTouchMove);
    window.removeEventListener('touchend',_onTouchEnd);
    window.removeEventListener('resize',_onResize);
    document.removeEventListener('keydown',_onKeyDown);
    const lbPrev=document.getElementById('lb-prev');
    const lbNext=document.getElementById('lb-next');
    if (lbPrev) lbPrev.removeEventListener('click',lbPrevPhoto);
    if (lbNext) lbNext.removeEventListener('click',lbNextPhoto);
  }

  function pauseAuto() { clearTimeout(autoTimer); autoRotate=false; }
  function resumeAuto() { autoTimer=setTimeout(()=>{autoRotate=true;},2500); }

  function doClick(cx,cy) {
    if (!scene||!camera) return;
    mouse2d.x=(cx/window.innerWidth)*2-1;
    mouse2d.y=-(cy/window.innerHeight)*2+1;
    raycaster.setFromCamera(mouse2d,camera);
    const hits=raycaster.intersectObjects(photoMeshes);
    if (hits.length) openLightbox(hits[0].object.userData.photoIndex,cx,cy);
    else resumeAuto();
  }
  function onResize() {
    if (!renderer||!camera) return;
    const W=window.innerWidth,H=window.innerHeight;
    camera.aspect=W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H); resizeOverlay();
  }
  function onKeyDown(e) {
    const lb=document.getElementById('lightbox');
    if (!lb||!lb.classList.contains('active')) return;
    if (e.key==='ArrowLeft') lbPrevPhoto();
    if (e.key==='ArrowRight') lbNextPhoto();
    if (e.key==='Escape'&&typeof closeLightbox==='function') closeLightbox();
  }

  /* ═══ LIGHTBOX ═══ */
  function openLightbox(idx,cx,cy) {
    currentPhoto=idx; renderLbPhoto();
    const lb=document.getElementById('lightbox');
    if (lb) lb.classList.add('active');
    spawnBurst(cx!==undefined?cx:window.innerWidth/2, cy!==undefined?cy:window.innerHeight/2, 90);
  }
  function lbPrevPhoto(e) {
    if (e) e.stopPropagation();
    currentPhoto=(currentPhoto-1+totalPhotos)%totalPhotos;
    spawnBurst(window.innerWidth/2,window.innerHeight/2,40); renderLbPhoto();
  }
  function lbNextPhoto(e) {
    if (e) e.stopPropagation();
    currentPhoto=(currentPhoto+1)%totalPhotos;
    spawnBurst(window.innerWidth/2,window.innerHeight/2,40); renderLbPhoto();
  }
  function renderLbPhoto() {
    const img=document.getElementById('lb-img');
    const cap=document.getElementById('lb-caption');
    if (!img||!photoCanvases[currentPhoto]) return;
    img.src=photoCanvases[currentPhoto].toDataURL('image/png');
    if (cap) cap.textContent=`✦  Photo ${currentPhoto+1} / ${totalPhotos}  ✦`;
  }
  function hideSphereLoading() {
    const el=document.getElementById('sphere-loading');
    if (!el) return;
    setTimeout(()=>{
      el.style.transition='opacity .5s'; el.style.opacity='0';
      setTimeout(()=>{el.style.display='none';},500);
    },600);
  }

  /* ═══ ANIMATION LOOP ═══ */
  function animate() {
    if (!isRunning) return;
    rafId=requestAnimationFrame(animate);
    const t=clock.getElapsedTime();

    /* Sphere: quay thuận chiều đứng */
    if (autoRotate) {
      sphereGroup.rotation.y += 0.0045;
      sphereGroup.rotation.x += 0.0008;
    } else if (!isDragging) {
      velX*=0.92; velY*=0.92;
      sphereGroup.rotation.x+=velX; sphereGroup.rotation.y+=velY;
    }

    /* Heart: quay NGƯỢC chiều hoàn toàn độc lập bằng thời gian */
    heartGroup.rotation.y = t * -0.55;
    heartGroup.rotation.x = t *  0.25;
    heartGroup.rotation.z = Math.sin(t*0.4)*0.15;

    /* Pulse */
    const pulse = (1+Math.sin(t*2.8)*0.07)*2.0;
    heartMesh.scale.setScalar(pulse);
    if (heartGlow) heartGlow.material.opacity = 0.05+Math.sin(t*2.8)*0.03;
    if (heartLight) {
      heartLight.intensity = 5.5+Math.sin(t*2.8)*2.5;
      heartLight.color.setHSL(0.93+Math.sin(t*0.7)*0.03,1.0,0.55);
    }

    /* Rings */
    if (rings.length>=6) {
      rings[0].rotation.z+=0.004; rings[1].rotation.y+=0.003;
      rings[2].rotation.z-=0.003; rings[3].rotation.x+=0.002;
      rings[4].rotation.y-=0.0025; rings[5].rotation.z+=0.0015;
    }

    /* Floating mini hearts */
    floatingHearts3D.forEach(h => {
      const {phase,speed,dist,baseElev,baseAngle} = h.userData;
      const a = baseAngle + t*speed*0.12;
      const bob = Math.sin(t*speed+phase)*0.6;
      h.position.set(
        Math.cos(a)*Math.cos(baseElev)*dist,
        Math.sin(baseElev)*dist+bob,
        Math.sin(a)*Math.cos(baseElev)*dist
      );
      h.rotation.y = t*speed*0.8;
      h.rotation.z = Math.sin(t*speed+phase)*0.3;
      h.scale.setScalar(0.38+Math.sin(t*speed*1.5+phase)*0.04);
    });

    /* Outer particles */
    if (outerParticles) {
      outerParticles.rotation.y+=0.0004; outerParticles.rotation.x-=0.0002;
      outerParticles.material.opacity=0.5+Math.sin(t*0.9)*0.2;
    }
    if (nebulaParticles) {
      nebulaParticles.rotation.y-=0.0015; nebulaParticles.rotation.x+=0.0008;
      nebulaParticles.material.opacity=0.4+Math.sin(t*1.2)*0.15;
    }

    if (stars) { stars.material.opacity=0.7+Math.sin(t*0.8)*0.2; stars.rotation.y+=0.0003; }
    if (sparkles) {
      sparkles.rotation.y-=0.0025; sparkles.rotation.x+=0.0012;
      sparkles.material.opacity=0.6+Math.sin(t*1.5)*0.2;
    }

    /* Shooting stars 3D — nhấp nháy hai bên */
    shootingStars3D.forEach(line => {
      const { phase, period } = line.userData;
      const cycle = ((t + phase) % period) / period; // 0..1
      // Chỉ sáng trong 0..0.15 của chu kỳ (flash nhanh)
      if (cycle < 0.15) {
        const frac = cycle / 0.15;
        line.material.opacity = Math.sin(frac * Math.PI) * 0.85;
      } else {
        line.material.opacity = 0;
      }
    });

    tickOverlay();
    renderer.render(scene,camera);
  }

})(window);