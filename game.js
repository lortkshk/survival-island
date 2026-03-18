// ============================================================
// ISLAND SURVIVAL - Enhanced Graphics Version
// ============================================================
// Visual upgrades:
//   - Procedural canvas textures (grass, sand, bark, leaves)
//   - Custom water shader with animated waves
//   - Post-processing (bloom + tone mapping)
//   - PBR materials (MeshStandardMaterial) for realistic lighting
//   - Smooth-shaded animal models with fur textures
//   - Cloud layer and improved sky
// ============================================================


// ============================================================
// 1. PROCEDURAL TEXTURES
// ============================================================
// Instead of flat colors, we generate textures using Canvas2D.
// This is like painting an image in code, then wrapping it around 3D shapes.

function createGrassTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');

    // Base green
    ctx.fillStyle = '#3d6b2e';
    ctx.fillRect(0, 0, 512, 512);

    // Many small grass blade strokes for detail
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const g = 80 + Math.random() * 70;
        const r = 30 + Math.random() * 40;
        const b = 15 + Math.random() * 30;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 5);
    }

    // Darker patches for variation
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 15 + Math.random() * 50;
        ctx.fillStyle = `rgba(20,40,15,0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
}

function createSandTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#d4b87a';
    ctx.fillRect(0, 0, 512, 512);

    // Sand grain noise
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = 180 + Math.random() * 60;
        ctx.fillStyle = `rgb(${brightness},${brightness * 0.85},${brightness * 0.6})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Subtle ripple lines (like wind-blown sand)
    ctx.strokeStyle = 'rgba(160,130,80,0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const y = Math.random() * 512;
        ctx.moveTo(0, y);
        for (let x = 0; x < 512; x += 10) {
            ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
        }
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
}

function createBarkTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(0, 0, 128, 256);

    // Vertical bark lines
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 128;
        const shade = 40 + Math.random() * 50;
        ctx.strokeStyle = `rgb(${shade + 20},${shade},${shade - 10})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y < 256; y += 8) {
            ctx.lineTo(x + Math.random() * 4 - 2, y);
        }
        ctx.stroke();
    }

    // Knots
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 256;
        ctx.fillStyle = `rgba(30,15,5,0.6)`;
        ctx.beginPath();
        ctx.ellipse(x, y, 6 + Math.random() * 8, 3 + Math.random() * 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createLeafTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');

    // Varied greens
    ctx.fillStyle = '#2d5a1e';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const g = 60 + Math.random() * 80;
        ctx.fillStyle = `rgb(${20 + Math.random() * 30},${g},${10 + Math.random() * 20})`;
        ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }

    // Light spots (sun dappling)
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        ctx.fillStyle = `rgba(150,200,80,0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, 5 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// Animal fur/skin textures
function createFurTexture(baseR, baseG, baseB) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');

    ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
    ctx.fillRect(0, 0, 128, 128);

    // Fur strokes - short lines in random directions
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const vary = Math.random() * 30 - 15;
        ctx.strokeStyle = `rgb(${baseR + vary},${baseG + vary},${baseB + vary})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 4 - 2, y + Math.random() * 3);
        ctx.stroke();
    }

    // Subtle darker spots
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(0,0,0,0.08)`;
        ctx.beginPath();
        ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 12, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// Generate all textures upfront
const TEX = {
    grass: createGrassTexture(),
    sand: createSandTexture(),
    bark: createBarkTexture(),
    leaf: createLeafTexture(),
    deerFur: createFurTexture(155, 123, 77),
    deerBelly: createFurTexture(212, 184, 122),
    rabbitFur: createFurTexture(187, 170, 136),
    boarFur: createFurTexture(74, 53, 32),
};


// ============================================================
// 2. SCENE SETUP - Renderer with PBR + Post-Processing
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.006);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.05, 1000
);
camera.position.set(0, 1.65, 0);

// Renderer with tone mapping - this makes ALL materials look more cinematic
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Cinematic color curve
renderer.toneMappingExposure = 1.1;
renderer.outputEncoding = THREE.sRGBEncoding;         // Correct color space
document.body.appendChild(renderer.domElement);

// -- Post-Processing Pipeline --
// EffectComposer chains visual effects on top of the rendered scene
let composer;
try {
    composer = new THREE.EffectComposer(renderer);

    // RenderPass - renders the base scene
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // UnrealBloomPass - adds glow to bright areas (like sunlight, fire, etc.)
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3,     // Bloom strength (subtle)
        0.4,     // Radius
        0.85     // Threshold (only bright things glow)
    );
    composer.addPass(bloomPass);
} catch (e) {
    // Fallback if post-processing addons didn't load
    console.warn('Post-processing not available, using basic renderer');
    composer = null;
}

// -- Lighting --
const ambientLight = new THREE.AmbientLight(0x8899AA, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xFFEECC, 1.2);
sunLight.position.set(50, 80, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight(0x88CCEE, 0x445522, 0.4);
scene.add(hemiLight);

const moonLight = new THREE.DirectionalLight(0x4455AA, 0);
moonLight.position.set(-50, 40, -30);
scene.add(moonLight);

// Sun/Moon spheres
const sunSphereGeo = new THREE.SphereGeometry(5, 16, 16);
const sunSphereMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44 });
const sunSphere = new THREE.Mesh(sunSphereGeo, sunSphereMat);
scene.add(sunSphere);

const moonSphereGeo = new THREE.SphereGeometry(3, 16, 16);
const moonSphereMat = new THREE.MeshBasicMaterial({ color: 0xCCCCDD });
const moonSphere = new THREE.Mesh(moonSphereGeo, moonSphereMat);
scene.add(moonSphere);

// Stars
const starsGroup = new THREE.Group();
for (let i = 0; i < 400; i++) {
    const s = Math.random() * 0.4 + 0.1;
    const geo = new THREE.SphereGeometry(s, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const star = new THREE.Mesh(geo, mat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    const r = 350;
    star.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 50,
        r * Math.sin(phi) * Math.sin(theta)
    );
    starsGroup.add(star);
}
starsGroup.visible = false;
scene.add(starsGroup);

// Cloud layer - flat plane high up with transparent white patches
const cloudCanvas = document.createElement('canvas');
cloudCanvas.width = 512; cloudCanvas.height = 512;
const cloudCtx = cloudCanvas.getContext('2d');
cloudCtx.fillStyle = 'rgba(0,0,0,0)';
cloudCtx.fillRect(0, 0, 512, 512);
for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 30 + Math.random() * 80;
    const gradient = cloudCtx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(255,255,255,0.25)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    cloudCtx.fillStyle = gradient;
    cloudCtx.beginPath();
    cloudCtx.arc(x, y, r, 0, Math.PI * 2);
    cloudCtx.fill();
}
const cloudTex = new THREE.CanvasTexture(cloudCanvas);
cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
const cloudGeo = new THREE.PlaneGeometry(600, 600);
const cloudMat = new THREE.MeshBasicMaterial({
    map: cloudTex, transparent: true, opacity: 0.6,
    side: THREE.DoubleSide, depthWrite: false,
});
const clouds = new THREE.Mesh(cloudGeo, cloudMat);
clouds.position.y = 80;
clouds.rotation.x = -Math.PI / 2;
scene.add(clouds);


// ============================================================
// HELPERS
// ============================================================

function rand(min, max) { return Math.random() * (max - min) + min; }
function distXZ(x1, z1, x2, z2) { return Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2); }
function distFromCenter(x, z) { return Math.sqrt(x * x + z * z); }

const colliders = [];
const groundItems = [];
const animals = [];

const ITEM_DEFS = {
    stick:        { icon: '/', name: 'Stick', color: 0x8B6B3D, stackMax: 20 },
    stone:        { icon: 'o', name: 'Stone', color: 0x888888, stackMax: 20 },
    meat_raw:     { icon: 'M', name: 'Raw Meat', color: 0xCC3333, stackMax: 10, food: true, healAmount: 15 },
    leather:      { icon: 'L', name: 'Leather', color: 0x8B5A2B, stackMax: 10 },
    stone_axe:    { icon: 'T', name: 'Stone Axe', color: 0x999966, stackMax: 1, damage: 20 },
    stone_spear:  { icon: '|', name: 'Stone Spear', color: 0x998855, stackMax: 1, damage: 30 },
    campfire:     { icon: 'F', name: 'Campfire', color: 0xFF6600, stackMax: 1 },
    leather_wrap: { icon: 'W', name: 'Leather Wrap', color: 0xAA7744, stackMax: 1, armor: 5 },
};


// ============================================================
// 3. TERRAIN - Textured
// ============================================================

const ISLAND_RADIUS = 80;

// Island ground - now with grass texture
const islandGeo = new THREE.CircleGeometry(ISLAND_RADIUS, 64);
const islandMat = new THREE.MeshStandardMaterial({
    map: TEX.grass, roughness: 0.9, metalness: 0.0
});
const island = new THREE.Mesh(islandGeo, islandMat);
island.rotation.x = -Math.PI / 2;
island.receiveShadow = true;
scene.add(island);

// Beach ring with sand texture
const beachGeo = new THREE.RingGeometry(ISLAND_RADIUS - 15, ISLAND_RADIUS + 5, 64);
const beachMat = new THREE.MeshStandardMaterial({
    map: TEX.sand, roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide
});
const beach = new THREE.Mesh(beachGeo, beachMat);
beach.rotation.x = -Math.PI / 2;
beach.position.y = 0.05;
beach.receiveShadow = true;
scene.add(beach);

// Beach extension
const beachExtGeo = new THREE.CircleGeometry(35, 32);
const beachExtMat = new THREE.MeshStandardMaterial({
    map: TEX.sand, roughness: 0.95, metalness: 0.0
});
const beachExt = new THREE.Mesh(beachExtGeo, beachExtMat);
beachExt.rotation.x = -Math.PI / 2;
beachExt.position.set(55, 0.06, 0);
beachExt.receiveShadow = true;
scene.add(beachExt);

// Water - Custom Shader Material with animated waves
const waterUniforms = {
    uTime: { value: 0 },
    uSunHeight: { value: 1.0 },
};

const waterShaderMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vWorldPos;

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Multiple overlapping sine waves for realistic water surface
            // Amplitudes kept small so waves stay below island ground level
            float wave1 = sin(pos.x * 0.15 + uTime * 0.8) * 0.3;
            float wave2 = sin(pos.y * 0.2 + uTime * 0.6) * 0.2;
            float wave3 = sin((pos.x + pos.y) * 0.1 + uTime * 1.2) * 0.15;
            float wave4 = sin(pos.x * 0.4 + pos.y * 0.3 + uTime * 1.5) * 0.08;

            // Fade out waves near the island center so they don't clip through land
            float distFromCenter = length(pos.xy);
            float islandFade = smoothstep(55.0, 75.0, distFromCenter);

            float totalWave = (wave1 + wave2 + wave3 + wave4) * islandFade;
            pos.z += totalWave;
            vElevation = totalWave;
            vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uSunHeight;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vWorldPos;

        void main() {
            // Deep vs shallow color based on wave height
            vec3 deepColor = vec3(0.02, 0.15, 0.35);
            vec3 shallowColor = vec3(0.05, 0.45, 0.55);

            // Night: darker water
            float dayFactor = clamp(uSunHeight * 2.0 + 0.3, 0.15, 1.0);
            deepColor *= dayFactor;
            shallowColor *= dayFactor;

            float mixFactor = clamp((vElevation + 1.0) * 0.4, 0.0, 1.0);
            vec3 color = mix(deepColor, shallowColor, mixFactor);

            // Foam on wave peaks
            float foam = smoothstep(0.5, 1.0, vElevation);
            color += vec3(foam * 0.4 * dayFactor);

            // Sun sparkle - shimmering highlights
            float sparkle = pow(
                max(0.0, sin(vUv.x * 80.0 + uTime * 2.5) * sin(vUv.y * 80.0 + uTime * 1.8)),
                32.0
            );
            color += vec3(sparkle * 0.6 * dayFactor);

            // Fresnel-like edge brightening (simulates reflection)
            float distFromCenter = length(vWorldPos.xz) * 0.003;
            color += vec3(0.02, 0.05, 0.08) * distFromCenter * dayFactor;

            gl_FragColor = vec4(color, 0.72 - foam * 0.1);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
});

const waterGeo = new THREE.PlaneGeometry(800, 800, 150, 150);
const water = new THREE.Mesh(waterGeo, waterShaderMat);
water.rotation.x = -Math.PI / 2;
// Lowered so wave peaks (max ~0.73) stay well below ground level (y=0)
water.position.y = -1.0;
scene.add(water);


// ============================================================
// 4. VEGETATION - Textured trees, bushes, palms
// ============================================================

function createTree(x, z) {
    const group = new THREE.Group();

    // Textured trunk
    const trunkH = rand(4, 7);
    const trunkRBot = rand(0.4, 0.6);
    const trunkGeo = new THREE.CylinderGeometry(trunkRBot * 0.5, trunkRBot, trunkH, 12);
    const trunkMat = new THREE.MeshStandardMaterial({
        map: TEX.bark, roughness: 0.95, metalness: 0.0
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Root bumps
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + rand(-0.3, 0.3);
        const rootGeo = new THREE.SphereGeometry(rand(0.2, 0.4), 8, 6);
        const root = new THREE.Mesh(rootGeo, new THREE.MeshStandardMaterial({
            map: TEX.bark, roughness: 0.9
        }));
        root.position.set(Math.cos(angle) * trunkRBot * 1.1, 0.1, Math.sin(angle) * trunkRBot * 1.1);
        root.scale.y = 0.5;
        group.add(root);
    }

    // Leaf layers - textured cones
    const baseY = trunkH - 0.5;
    for (let layer = 0; layer < 3; layer++) {
        const lr = rand(2.5, 4) - layer * 0.7;
        const lh = rand(2.5, 3.5) - layer * 0.3;
        const lGeo = new THREE.ConeGeometry(lr, lh, 14);
        const lMat = new THREE.MeshStandardMaterial({
            map: TEX.leaf, roughness: 0.8, metalness: 0.0,
            color: new THREE.Color().setHSL(rand(0.25, 0.35), rand(0.5, 0.7), rand(0.2, 0.35))
        });
        const leaf = new THREE.Mesh(lGeo, lMat);
        leaf.position.y = baseY + layer * 1.7;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    colliders.push({ x, z, radius: trunkRBot + 0.3 });

    // Spawn sticks
    for (let i = 0; i < Math.floor(rand(1, 3)); i++) {
        const a = rand(0, Math.PI * 2);
        spawnGroundItem(x + Math.cos(a) * rand(1.5, 3.5), z + Math.sin(a) * rand(1.5, 3.5), 'stick');
    }
    return group;
}

const trees = [];
for (let i = 0; i < 80; i++) {
    const x = rand(-70, 20), z = rand(-60, 60);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 10 && distFromCenter(x, z) > 12) {
        trees.push(createTree(x, z));
    }
}

// Bushes
function createBush(x, z) {
    const group = new THREE.Group();
    const n = Math.floor(rand(3, 6));
    for (let i = 0; i < n; i++) {
        const r = rand(0.4, 1.0);
        const geo = new THREE.SphereGeometry(r, 12, 10);
        const mat = new THREE.MeshStandardMaterial({
            map: TEX.leaf, roughness: 0.85,
            color: new THREE.Color().setHSL(rand(0.25, 0.38), rand(0.5, 0.7), rand(0.15, 0.28))
        });
        const s = new THREE.Mesh(geo, mat);
        s.position.set(rand(-0.5, 0.5), r * 0.5, rand(-0.5, 0.5));
        s.castShadow = true;
        group.add(s);
    }
    if (Math.random() > 0.5) {
        for (let i = 0; i < 5; i++) {
            const bGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const bMat = new THREE.MeshStandardMaterial({
                color: [0xCC2222, 0xDD8800, 0xFFFF44][Math.floor(rand(0, 3))],
                roughness: 0.5, emissive: 0x111111
            });
            const berry = new THREE.Mesh(bGeo, bMat);
            berry.position.set(rand(-0.7, 0.7), rand(0.3, 1), rand(-0.7, 0.7));
            group.add(berry);
        }
    }
    group.position.set(x, 0, z);
    scene.add(group);
    colliders.push({ x, z, radius: 0.8 });
}

for (let i = 0; i < 50; i++) {
    const x = rand(-65, 30), z = rand(-55, 55);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 8 && distFromCenter(x, z) > 8) createBush(x, z);
}

// Palm trees
function createPalmTree(x, z) {
    const group = new THREE.Group();
    const trunkH = rand(7, 11);
    const segs = 8;
    const segH = trunkH / segs;
    let cx = 0, cz = 0;
    const curveDir = rand(0, Math.PI * 2);

    for (let i = 0; i < segs; i++) {
        const r = 0.25 - i * 0.015;
        const geo = new THREE.CylinderGeometry(r * 0.85, r, segH + 0.05, 10);
        const mat = new THREE.MeshStandardMaterial({
            map: TEX.bark, roughness: 0.9,
            color: i % 2 === 0 ? 0xAA8830 : 0x997720
        });
        const seg = new THREE.Mesh(geo, mat);
        cx += Math.cos(curveDir) * rand(0.05, 0.2);
        cz += Math.sin(curveDir) * rand(0.0, 0.1);
        seg.position.set(cx, segH * i + segH / 2, cz);
        seg.castShadow = true;
        group.add(seg);
    }

    const topY = trunkH;
    const numFronds = 9;
    for (let i = 0; i < numFronds; i++) {
        const angle = (i / numFronds) * Math.PI * 2;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(cx, topY, cz);
        frondGroup.rotation.y = angle;

        const frondSegs = 6;
        const frondLen = rand(3.5, 5.5);
        for (let s = 0; s < frondSegs; s++) {
            const sl = frondLen / frondSegs;
            const w = 0.5 - s * 0.07;
            const fGeo = new THREE.BoxGeometry(w, 0.04, sl);
            const fMat = new THREE.MeshStandardMaterial({
                map: TEX.leaf, roughness: 0.7,
                color: new THREE.Color().setHSL(rand(0.28, 0.35), rand(0.5, 0.7), rand(0.22, 0.38))
            });
            const fMesh = new THREE.Mesh(fGeo, fMat);
            fMesh.position.set(0, -s * 0.35, s * sl + sl / 2);
            fMesh.rotation.x = s * 0.12;
            fMesh.castShadow = true;
            frondGroup.add(fMesh);
        }
        group.add(frondGroup);
    }

    for (let i = 0; i < rand(2, 5); i++) {
        const cGeo = new THREE.SphereGeometry(0.18, 10, 10);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x6B4A14, roughness: 0.7 });
        const coconut = new THREE.Mesh(cGeo, cMat);
        coconut.position.set(cx + rand(-0.4, 0.4), topY - rand(0.2, 0.8), cz + rand(-0.4, 0.4));
        group.add(coconut);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    colliders.push({ x, z, radius: 0.5 });
}

for (let i = 0; i < 20; i++) {
    const x = rand(40, 80), z = rand(-40, 40);
    const d = distFromCenter(x, z);
    if (d < ISLAND_RADIUS + 3 && d > ISLAND_RADIUS - 25) createPalmTree(x, z);
}

// Rocks
function createRock(x, z) {
    const size = rand(0.4, 1.8);
    const group = new THREE.Group();

    const mainGeo = new THREE.DodecahedronGeometry(size, 1);
    const grey = rand(0.25, 0.5);
    const mainMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(grey, grey * 0.95, grey * 0.9),
        roughness: 0.85, metalness: 0.1
    });
    const main = new THREE.Mesh(mainGeo, mainMat);
    main.scale.set(rand(0.8, 1.2), rand(0.6, 0.9), rand(0.8, 1.2));
    main.rotation.set(rand(0, 1), rand(0, 1), 0);
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);

    if (size > 0.8) {
        const subGeo = new THREE.DodecahedronGeometry(size * 0.45, 1);
        const sub = new THREE.Mesh(subGeo, mainMat.clone());
        sub.position.set(rand(-0.3, 0.3) * size, -size * 0.1, rand(-0.3, 0.3) * size);
        sub.rotation.set(rand(0, 2), rand(0, 2), 0);
        group.add(sub);
    }

    group.position.set(x, size * 0.25, z);
    scene.add(group);
    if (size > 0.6) colliders.push({ x, z, radius: size * 0.7 });

    if (Math.random() > 0.5) {
        const a = rand(0, Math.PI * 2);
        spawnGroundItem(x + Math.cos(a) * rand(0.8, 2), z + Math.sin(a) * rand(0.8, 2), 'stone');
    }
}

for (let i = 0; i < 45; i++) {
    const x = rand(-70, 70), z = rand(-70, 70);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 3) createRock(x, z);
}

// Flowers
for (let i = 0; i < 120; i++) {
    const x = rand(-60, 40), z = rand(-60, 60);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15) {
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, rand(0.15, 0.35), 5);
        const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x338833, roughness: 0.8 }));
        stem.position.set(x, 0.1, z);
        scene.add(stem);

        const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const colors = [0xFF6B6B, 0xFFFF6B, 0xFF6BFF, 0xFFFFFF, 0x6B9BFF, 0xFF9B6B];
        const pMat = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(rand(0, colors.length))],
            roughness: 0.5, emissive: 0x222222
        });
        const petal = new THREE.Mesh(pGeo, pMat);
        petal.position.set(x, 0.25, z);
        petal.scale.y = 0.5;
        scene.add(petal);
    }
}

// Tall grass
for (let i = 0; i < 200; i++) {
    const x = rand(-65, 35), z = rand(-60, 60);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 10) {
        const h = rand(0.2, 0.6);
        const gGeo = new THREE.BoxGeometry(0.04, h, 0.04);
        const gMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(rand(0.22, 0.35), rand(0.4, 0.7), rand(0.15, 0.3)),
            roughness: 0.9
        });
        const grass = new THREE.Mesh(gGeo, gMat);
        grass.position.set(x, h / 2, z);
        grass.rotation.y = rand(0, Math.PI);
        scene.add(grass);
    }
}


// ============================================================
// 5. GROUND ITEMS
// ============================================================

function spawnGroundItem(x, z, type) {
    const def = ITEM_DEFS[type];
    if (!def) return;

    const group = new THREE.Group();

    if (type === 'stick') {
        const geo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8);
        const mat = new THREE.MeshStandardMaterial({ map: TEX.bark, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.y = 0.05;
        group.add(mesh);
    } else if (type === 'stone') {
        const geo = new THREE.DodecahedronGeometry(0.12, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.1;
        group.add(mesh);
    } else if (type === 'meat_raw') {
        const geo = new THREE.SphereGeometry(0.15, 10, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0xCC3333, roughness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(1.2, 0.6, 1);
        mesh.position.y = 0.1;
        group.add(mesh);
    } else if (type === 'leather') {
        const geo = new THREE.BoxGeometry(0.3, 0.05, 0.25);
        const mat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.85 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.05;
        group.add(mesh);
    }

    // Glowing pickup ring
    const glowGeo = new THREE.RingGeometry(0.2, 0.3, 16);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFFF88, transparent: true, opacity: 0.4, side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    group.add(glow);

    group.position.set(x, 0, z);
    scene.add(group);

    const item = { mesh: group, glow, x, z, type, bobTime: rand(0, Math.PI * 2) };
    groundItems.push(item);
    return item;
}

for (let i = 0; i < 30; i++) {
    const x = rand(-60, 50), z = rand(-55, 55);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 8) {
        spawnGroundItem(x, z, Math.random() > 0.5 ? 'stick' : 'stone');
    }
}


// ============================================================
// 6. ANIMALS - Smooth, textured, realistic proportions
// ============================================================
// Using higher-polygon geometries with smooth shading,
// canvas fur textures, and MeshStandardMaterial for PBR lighting.

// ----- DEER -----
function createDeer(x, z) {
    const group = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ map: TEX.deerFur, roughness: 0.9, metalness: 0.0 });
    const bellyMat = new THREE.MeshStandardMaterial({ map: TEX.deerBelly, roughness: 0.9, metalness: 0.0 });
    const darkFurMat = new THREE.MeshStandardMaterial({ map: TEX.deerFur, roughness: 0.9, color: 0x5B3B1D });

    // --- TORSO: LatheGeometry creates a natural barrel-shaped body ---
    // Define a profile curve (side silhouette) that gets spun around the Y axis
    const bodyProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.7, 0),    // tail end (narrow)
        new THREE.Vector3(0.32, -0.55, 0), // hip widening
        new THREE.Vector3(0.42, -0.2, 0),  // mid-body (widest - barrel)
        new THREE.Vector3(0.44, 0.0, 0),   // belly area
        new THREE.Vector3(0.40, 0.2, 0),   // rib cage
        new THREE.Vector3(0.35, 0.45, 0),  // shoulder area
        new THREE.Vector3(0.28, 0.6, 0),   // front shoulder narrowing
        new THREE.Vector3(0.18, 0.7, 0),   // chest taper
        new THREE.Vector3(0, 0.75, 0),     // front center
    ]);
    const bodyGeo = new THREE.LatheGeometry(bodyProfile.getPoints(20), 24);
    const body = new THREE.Mesh(bodyGeo, furMat);
    // Rotate so the body runs horizontally (front-to-back along X)
    body.rotation.z = Math.PI / 2;
    body.scale.set(1.0, 1.0, 0.85); // slightly narrower side-to-side
    body.position.set(0, 1.3, 0);
    body.castShadow = true;
    group.add(body);

    // Belly underside - slightly lighter color
    const bellyProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(0.22, -0.3, 0),
        new THREE.Vector3(0.28, 0.0, 0),
        new THREE.Vector3(0.26, 0.3, 0),
        new THREE.Vector3(0.15, 0.55, 0),
        new THREE.Vector3(0, 0.6, 0),
    ]);
    const bellyGeo = new THREE.LatheGeometry(bellyProfile.getPoints(16), 16, 0, Math.PI);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.rotation.z = Math.PI / 2;
    belly.rotation.y = Math.PI / 2; // face the bottom half downward
    belly.scale.set(0.95, 0.95, 0.8);
    belly.position.set(0, 1.15, 0);
    group.add(belly);

    // Shoulder blade bumps for musculature
    for (let side = -1; side <= 1; side += 2) {
        const shoulderGeo = new THREE.SphereGeometry(0.18, 12, 10);
        const shoulder = new THREE.Mesh(shoulderGeo, furMat);
        shoulder.scale.set(1.2, 1.4, 0.7);
        shoulder.position.set(0.55, 1.55, side * 0.22);
        group.add(shoulder);
    }

    // Hip bone bumps
    for (let side = -1; side <= 1; side += 2) {
        const hipBoneGeo = new THREE.SphereGeometry(0.14, 10, 8);
        const hipBone = new THREE.Mesh(hipBoneGeo, furMat);
        hipBone.scale.set(1.0, 1.2, 0.6);
        hipBone.position.set(-0.55, 1.5, side * 0.2);
        group.add(hipBone);
    }

    // --- NECK: curved using a TubeGeometry for natural arc ---
    const neckCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.7, 1.45, 0),   // base at shoulders
        new THREE.Vector3(0.9, 1.65, 0),   // slight forward curve
        new THREE.Vector3(1.05, 1.9, 0),   // upward arc
        new THREE.Vector3(1.15, 2.1, 0),   // top of neck
    ]);
    const neckGeo = new THREE.TubeGeometry(neckCurve, 12, 0.14, 10, false);
    const neck = new THREE.Mesh(neckGeo, furMat);
    // Throat/mane thickening
    const neckThickGeo = new THREE.TubeGeometry(neckCurve, 10, 0.1, 8, false);
    const neckThick = new THREE.Mesh(neckThickGeo, bellyMat);
    group.add(neck);
    group.add(neckThick);

    // --- HEAD: elongated with proper deer proportions ---
    const headGeo = new THREE.SphereGeometry(0.22, 20, 16);
    const head = new THREE.Mesh(headGeo, furMat);
    head.scale.set(1.5, 1.0, 0.85); // long and narrow
    head.position.set(1.35, 2.2, 0);
    head.castShadow = true;
    group.add(head);

    // Forehead - slight dome
    const foreheadGeo = new THREE.SphereGeometry(0.13, 14, 12);
    const forehead = new THREE.Mesh(foreheadGeo, furMat);
    forehead.scale.set(1.0, 1.1, 0.9);
    forehead.position.set(1.25, 2.32, 0);
    group.add(forehead);

    // Snout - tapered muzzle shape using a profile
    const snoutProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.15, 0),
        new THREE.Vector3(0.09, -0.1, 0),
        new THREE.Vector3(0.11, 0.0, 0),
        new THREE.Vector3(0.09, 0.08, 0),
        new THREE.Vector3(0, 0.12, 0),
    ]);
    const snoutGeo = new THREE.LatheGeometry(snoutProfile.getPoints(10), 14);
    const snout = new THREE.Mesh(snoutGeo, bellyMat);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(1.6, 2.15, 0);
    group.add(snout);

    // Nose pad - moist dark nose
    const noseGeo = new THREE.SphereGeometry(0.04, 12, 10);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.3 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.scale.set(1.2, 0.8, 1.0);
    nose.position.set(1.73, 2.17, 0);
    group.add(nose);

    // Nostrils
    for (let side = -1; side <= 1; side += 2) {
        const nostrilGeo = new THREE.SphereGeometry(0.015, 6, 6);
        const nostril = new THREE.Mesh(nostrilGeo, noseMat);
        nostril.position.set(1.75, 2.16, side * 0.025);
        group.add(nostril);
    }

    // Mouth line
    const mouthGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x3A2010, roughness: 0.8 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(1.68, 2.1, 0);
    group.add(mouth);

    // Eyes with realistic look - positioned on sides of head like real deer
    for (let side = -1; side <= 1; side += 2) {
        // Eye socket (slight indent)
        const socketGeo = new THREE.SphereGeometry(0.055, 12, 10);
        const socketMat = new THREE.MeshStandardMaterial({ color: 0x3A2510, roughness: 0.8 });
        const socket = new THREE.Mesh(socketGeo, socketMat);
        socket.scale.set(1.2, 1.0, 0.5);
        socket.position.set(1.38, 2.28, side * 0.17);
        group.add(socket);
        // Eye - large and dark like real deer
        const eyeGeo = new THREE.SphereGeometry(0.04, 14, 14);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1A0800, roughness: 0.2, metalness: 0.6 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.scale.set(1.1, 1.0, 0.6);
        eye.position.set(1.40, 2.29, side * 0.18);
        group.add(eye);
        // Highlight for that lively look
        const hlGeo = new THREE.SphereGeometry(0.012, 6, 6);
        const hl = new THREE.Mesh(hlGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
        hl.position.set(1.42, 2.31, side * 0.17);
        group.add(hl);
    }

    // Ears - leaf-shaped, not cones
    for (let side = -1; side <= 1; side += 2) {
        const earShape = new THREE.Shape();
        earShape.moveTo(0, 0);
        earShape.quadraticCurveTo(0.04, 0.15, 0.01, 0.28);
        earShape.quadraticCurveTo(0, 0.3, -0.01, 0.28);
        earShape.quadraticCurveTo(-0.04, 0.15, 0, 0);
        const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3 });
        const ear = new THREE.Mesh(earGeo, furMat);
        ear.position.set(1.22, 2.35, side * 0.15);
        ear.rotation.set(side * 0.25, side * 0.3, side * 0.5);
        group.add(ear);
        // Inner ear (pink)
        const innerShape = new THREE.Shape();
        innerShape.moveTo(0, 0.03);
        innerShape.quadraticCurveTo(0.02, 0.13, 0, 0.23);
        innerShape.quadraticCurveTo(-0.02, 0.13, 0, 0.03);
        const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.005, bevelEnabled: false });
        const inner = new THREE.Mesh(innerGeo, new THREE.MeshStandardMaterial({ color: 0xDDA0A0, roughness: 0.7 }));
        inner.position.set(1.22, 2.35, side * 0.16);
        inner.rotation.set(side * 0.25, side * 0.3, side * 0.5);
        group.add(inner);
    }

    // Antlers - more organic curved branches using TubeGeometry
    for (let side = -1; side <= 1; side += 2) {
        const antlerMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.7 });
        const antlerGroup = new THREE.Group();

        // Main beam - curved upward and back
        const beamCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(side * 0.05, 0.3, -0.05),
            new THREE.Vector3(side * 0.12, 0.55, -0.08),
            new THREE.Vector3(side * 0.15, 0.75, -0.03),
        ]);
        const beamGeo = new THREE.TubeGeometry(beamCurve, 10, 0.025, 8, false);
        antlerGroup.add(new THREE.Mesh(beamGeo, antlerMat));

        // Brow tine (low, forward-pointing)
        const t1Curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 0.04, 0.2, -0.04),
            new THREE.Vector3(side * 0.06, 0.35, 0.08),
        ]);
        const t1Geo = new THREE.TubeGeometry(t1Curve, 6, 0.015, 6, false);
        antlerGroup.add(new THREE.Mesh(t1Geo, antlerMat));

        // Trez tine (mid, angled outward)
        const t2Curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 0.1, 0.48, -0.06),
            new THREE.Vector3(side * 0.22, 0.62, -0.02),
        ]);
        const t2Geo = new THREE.TubeGeometry(t2Curve, 6, 0.012, 6, false);
        antlerGroup.add(new THREE.Mesh(t2Geo, antlerMat));

        // Top tine
        const t3Curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 0.14, 0.7, -0.04),
            new THREE.Vector3(side * 0.08, 0.88, 0.04),
        ]);
        const t3Geo = new THREE.TubeGeometry(t3Curve, 5, 0.01, 5, false);
        antlerGroup.add(new THREE.Mesh(t3Geo, antlerMat));

        // Small tip spheres at end of each tine for polished look
        [new THREE.Vector3(side*0.06, 0.35, 0.08),
         new THREE.Vector3(side*0.22, 0.62, -0.02),
         new THREE.Vector3(side*0.08, 0.88, 0.04),
         new THREE.Vector3(side*0.15, 0.75, -0.03)].forEach(p => {
            const tipGeo = new THREE.SphereGeometry(0.012, 6, 6);
            const tip = new THREE.Mesh(tipGeo, antlerMat);
            tip.position.copy(p);
            antlerGroup.add(tip);
        });

        antlerGroup.position.set(1.25, 2.3, side * 0.08);
        group.add(antlerGroup);
    }

    // --- LEGS: anatomically correct with muscle shapes ---
    // Front legs are straighter, back legs have the "reverse knee" (hock joint)
    const legData = [
        { x: 0.55, z: 0.2, front: true }, { x: 0.55, z: -0.2, front: true },
        { x: -0.55, z: 0.2, front: false }, { x: -0.55, z: -0.2, front: false }
    ];
    const legs = [];
    legData.forEach(pos => {
        const legGroup = new THREE.Group();

        if (pos.front) {
            // Front leg - shoulder muscle
            const shoulderGeo = new THREE.SphereGeometry(0.1, 10, 8);
            const shoulderMesh = new THREE.Mesh(shoulderGeo, furMat);
            shoulderMesh.scale.set(0.8, 1.3, 0.9);
            shoulderMesh.position.y = 0.05;
            legGroup.add(shoulderMesh);

            // Upper front leg - tapered cylinder
            const uGeo = new THREE.CylinderGeometry(0.045, 0.075, 0.5, 10);
            const upper = new THREE.Mesh(uGeo, furMat);
            upper.position.y = -0.25;
            legGroup.add(upper);

            // Knee
            const kneeGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const knee = new THREE.Mesh(kneeGeo, furMat);
            knee.position.y = -0.5;
            legGroup.add(knee);

            // Lower front leg - thinner
            const lGeo = new THREE.CylinderGeometry(0.028, 0.04, 0.5, 10);
            const lower = new THREE.Mesh(lGeo, darkFurMat);
            lower.position.y = -0.78;
            legGroup.add(lower);
        } else {
            // Back leg - larger haunch muscle
            const haunchGeo = new THREE.SphereGeometry(0.14, 12, 10);
            const haunch = new THREE.Mesh(haunchGeo, furMat);
            haunch.scale.set(0.9, 1.5, 0.8);
            haunch.position.y = 0.0;
            legGroup.add(haunch);

            // Upper back leg
            const uGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.45, 10);
            const upper = new THREE.Mesh(uGeo, furMat);
            upper.position.y = -0.28;
            legGroup.add(upper);

            // Hock joint (the backward-bending "knee") - more prominent
            const hockGeo = new THREE.SphereGeometry(0.055, 8, 8);
            const hock = new THREE.Mesh(hockGeo, darkFurMat);
            hock.position.y = -0.52;
            legGroup.add(hock);

            // Lower back leg - thin and straight
            const lGeo = new THREE.CylinderGeometry(0.025, 0.045, 0.55, 10);
            const lower = new THREE.Mesh(lGeo, darkFurMat);
            lower.position.y = -0.82;
            legGroup.add(lower);
        }

        // Hoof - split hoof shape (two-toed)
        for (let toe = -1; toe <= 1; toe += 2) {
            const hoofGeo = new THREE.SphereGeometry(0.025, 8, 6);
            const hoofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.scale.set(1.2, 0.6, 1.5);
            hoof.position.set(0.01, pos.front ? -1.05 : -1.1, toe * 0.018);
            legGroup.add(hoof);
        }

        legGroup.position.set(pos.x, 1.3, pos.z);
        group.add(legGroup);
        legs.push(legGroup);
    });

    // --- TAIL: small upright white tail (whitetail deer style) ---
    const tailGeo = new THREE.SphereGeometry(0.08, 10, 8);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xEEDDCC, roughness: 0.85 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.scale.set(0.5, 1.2, 0.4);
    tail.position.set(-0.75, 1.5, 0);
    group.add(tail);

    // White rump patch (like real whitetail deer)
    const rumpPatchGeo = new THREE.SphereGeometry(0.15, 10, 8);
    const rumpPatchMat = new THREE.MeshStandardMaterial({ color: 0xEEDDBB, roughness: 0.9 });
    const rumpPatch = new THREE.Mesh(rumpPatchGeo, rumpPatchMat);
    rumpPatch.scale.set(0.6, 0.8, 1.0);
    rumpPatch.position.set(-0.7, 1.4, 0);
    group.add(rumpPatch);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'deer',
        x, z, speed: rand(1.5, 2.5),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(3, 7), walkTimer: 0,
        fleeing: false, hp: 60, maxHp: 60,
        loot: [{ type: 'meat_raw', count: 2 }, { type: 'leather', count: 2 }],
        hurtTimer: 0, dead: false, bodyRadius: 1.5,
    };
}

for (let i = 0; i < 7; i++) {
    const x = rand(-55, 15), z = rand(-50, 50);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15 && distFromCenter(x, z) > 15)
        animals.push(createDeer(x, z));
}


// ----- RABBITS -----
function createRabbit(x, z) {
    const group = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ map: TEX.rabbitFur, roughness: 0.9 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xDDCCBB, roughness: 0.85 });

    // --- BODY: LatheGeometry for a plump, rounded rabbit body ---
    const bodyProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.18, 0),    // rear
        new THREE.Vector3(0.14, -0.1, 0),  // hip (rabbits have big round rumps)
        new THREE.Vector3(0.18, 0.0, 0),   // widest point
        new THREE.Vector3(0.16, 0.1, 0),   // mid-body
        new THREE.Vector3(0.12, 0.18, 0),  // shoulder taper
        new THREE.Vector3(0, 0.22, 0),     // front
    ]);
    const bodyGeo = new THREE.LatheGeometry(bodyProfile.getPoints(14), 18);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1.0, 1.0, 0.9);
    body.position.set(0, 0.28, 0);
    body.castShadow = true;
    group.add(body);

    // Belly underside
    const belGeo = new THREE.SphereGeometry(0.13, 14, 10);
    const bel = new THREE.Mesh(belGeo, bellyMat);
    bel.scale.set(1.2, 0.5, 0.8);
    bel.position.set(0, 0.18, 0);
    group.add(bel);

    // --- HEAD: round with puffy cheeks ---
    const headGeo = new THREE.SphereGeometry(0.13, 18, 16);
    const head = new THREE.Mesh(headGeo, furMat);
    head.scale.set(1.1, 1.0, 0.95);
    head.position.set(0.22, 0.42, 0);
    group.add(head);

    // Cheeks - puffy, characteristic rabbit look
    for (let side = -1; side <= 1; side += 2) {
        const cheekGeo = new THREE.SphereGeometry(0.055, 10, 8);
        const cheek = new THREE.Mesh(cheekGeo, furMat);
        cheek.scale.set(1.0, 0.8, 0.7);
        cheek.position.set(0.28, 0.38, side * 0.075);
        group.add(cheek);
    }

    // Eyes - large and on the sides (prey animal)
    for (let side = -1; side <= 1; side += 2) {
        const eyeGeo = new THREE.SphereGeometry(0.028, 14, 14);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x110000, roughness: 0.2, metalness: 0.5 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.scale.set(1.0, 1.0, 0.6);
        eye.position.set(0.3, 0.46, side * 0.09);
        group.add(eye);
        const hlGeo = new THREE.SphereGeometry(0.008, 6, 6);
        const hl = new THREE.Mesh(hlGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
        hl.position.set(0.32, 0.47, side * 0.08);
        group.add(hl);
    }

    // Nose - Y-shaped rabbit nose
    const nGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const nose = new THREE.Mesh(nGeo, new THREE.MeshStandardMaterial({ color: 0xFFAAAA, roughness: 0.4 }));
    nose.scale.set(1.2, 0.7, 1.0);
    nose.position.set(0.36, 0.42, 0);
    group.add(nose);

    // Whiskers - thin and delicate
    for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < 3; w++) {
            const wCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0.06, (w - 1) * 0.015, side * 0.06),
            ]);
            const wGeo = new THREE.TubeGeometry(wCurve, 4, 0.002, 3, false);
            const whisker = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }));
            whisker.position.set(0.34, 0.40 + w * 0.015, side * 0.04);
            group.add(whisker);
        }
    }

    // --- EARS: long and upright, iconic rabbit shape ---
    for (let side = -1; side <= 1; side += 2) {
        const earShape = new THREE.Shape();
        earShape.moveTo(0, 0);
        earShape.quadraticCurveTo(0.03, 0.15, 0.015, 0.32);
        earShape.quadraticCurveTo(0, 0.34, -0.015, 0.32);
        earShape.quadraticCurveTo(-0.03, 0.15, 0, 0);
        const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 });
        const ear = new THREE.Mesh(earGeo, furMat);
        ear.position.set(0.16, 0.55, side * 0.04);
        ear.rotation.set(side * 0.1, 0, side * 0.15);
        group.add(ear);
        // Inner ear - pink
        const innerShape = new THREE.Shape();
        innerShape.moveTo(0, 0.03);
        innerShape.quadraticCurveTo(0.015, 0.14, 0, 0.28);
        innerShape.quadraticCurveTo(-0.015, 0.14, 0, 0.03);
        const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.003, bevelEnabled: false });
        const inner = new THREE.Mesh(innerGeo, new THREE.MeshStandardMaterial({ color: 0xFFBBBB, roughness: 0.7 }));
        inner.position.set(0.16, 0.55, side * 0.045);
        inner.rotation.set(side * 0.1, 0, side * 0.15);
        group.add(inner);
    }

    // Front paws - tucked under
    for (let side = -1; side <= 1; side += 2) {
        const pawGroup = new THREE.Group();
        const armGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.12, 6);
        const arm = new THREE.Mesh(armGeo, furMat);
        arm.position.y = -0.06;
        pawGroup.add(arm);
        const pGeo = new THREE.SphereGeometry(0.025, 8, 6);
        const paw = new THREE.Mesh(pGeo, bellyMat);
        paw.scale.set(0.7, 0.4, 1.2);
        paw.position.y = -0.13;
        pawGroup.add(paw);
        pawGroup.position.set(0.15, 0.16, side * 0.08);
        group.add(pawGroup);
    }

    // --- BACK LEGS: powerful and large (rabbits hop!) ---
    const legs = [];
    for (let side = -1; side <= 1; side += 2) {
        const legGroup = new THREE.Group();
        // Thigh - large and muscular
        const thighGeo = new THREE.SphereGeometry(0.065, 12, 10);
        const thigh = new THREE.Mesh(thighGeo, furMat);
        thigh.scale.set(0.8, 1.4, 0.9);
        thigh.position.y = 0;
        legGroup.add(thigh);
        // Foot - long rabbit foot
        const footGeo = new THREE.SphereGeometry(0.035, 10, 8);
        const foot = new THREE.Mesh(footGeo, bellyMat);
        foot.scale.set(0.7, 0.4, 2.0); // long flat foot
        foot.position.set(-0.02, -0.1, 0);
        legGroup.add(foot);
        legGroup.position.set(-0.1, 0.14, side * 0.1);
        group.add(legGroup);
        legs.push(legGroup);
    }

    // Fluffy cotton tail - multiple spheres for fluffy look
    const tailBase = new THREE.SphereGeometry(0.06, 12, 10);
    const tail = new THREE.Mesh(tailBase, new THREE.MeshStandardMaterial({ color: 0xFFFFEE, roughness: 0.85 }));
    tail.position.set(-0.22, 0.3, 0);
    group.add(tail);
    // Extra fluff puffs
    for (let i = 0; i < 4; i++) {
        const puffGeo = new THREE.SphereGeometry(0.03, 8, 6);
        const puff = new THREE.Mesh(puffGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFEE, roughness: 0.9 }));
        const angle = (i / 4) * Math.PI * 2;
        puff.position.set(-0.22 + Math.cos(angle) * 0.03, 0.3 + Math.sin(angle) * 0.03, Math.sin(angle + 1) * 0.02);
        group.add(puff);
    }

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'rabbit',
        x, z, speed: rand(3, 5),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(1, 3), hopTimer: 0,
        fleeing: false, hp: 15, maxHp: 15,
        loot: [{ type: 'meat_raw', count: 1 }],
        hurtTimer: 0, dead: false, bodyRadius: 0.6,
    };
}

for (let i = 0; i < 10; i++) {
    const x = rand(-60, 30), z = rand(-55, 55);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 10 && distFromCenter(x, z) > 8)
        animals.push(createRabbit(x, z));
}


// ----- BOARS -----
function createBoar(x, z) {
    const group = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ map: TEX.boarFur, roughness: 0.9 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2A1810, roughness: 0.85 });

    // --- BODY: LatheGeometry for a barrel-shaped, heavy boar torso ---
    const boarProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.55, 0),    // rear (narrower)
        new THREE.Vector3(0.28, -0.4, 0),  // hip
        new THREE.Vector3(0.42, -0.15, 0), // mid-body (thick)
        new THREE.Vector3(0.45, 0.1, 0),   // belly (widest - boars are barrel-chested)
        new THREE.Vector3(0.43, 0.3, 0),   // front body
        new THREE.Vector3(0.38, 0.45, 0),  // shoulder area
        new THREE.Vector3(0.25, 0.55, 0),  // upper shoulder
        new THREE.Vector3(0, 0.6, 0),      // front center
    ]);
    const bodyGeo = new THREE.LatheGeometry(boarProfile.getPoints(18), 22);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1.0, 1.0, 0.9);
    body.position.set(0, 0.82, 0);
    body.castShadow = true;
    group.add(body);

    // Shoulder hump - boars have a distinctive muscular hump
    const humpProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.15, 0),
        new THREE.Vector3(0.22, -0.05, 0),
        new THREE.Vector3(0.25, 0.05, 0),
        new THREE.Vector3(0.18, 0.15, 0),
        new THREE.Vector3(0, 0.2, 0),
    ]);
    const humpGeo = new THREE.LatheGeometry(humpProfile.getPoints(10), 14);
    const hump = new THREE.Mesh(humpGeo, furMat);
    hump.rotation.z = Math.PI / 2;
    hump.position.set(0.25, 1.18, 0);
    group.add(hump);

    // Bristle ridge - coarse hair along the spine
    for (let i = 0; i < 10; i++) {
        const bGeo = new THREE.ConeGeometry(0.015, 0.08 + Math.sin(i * 0.5) * 0.03, 4);
        const bristle = new THREE.Mesh(bGeo, darkMat);
        bristle.position.set(-0.35 + i * 0.1, 1.22 + Math.sin(i * 0.8) * 0.03, 0);
        group.add(bristle);
    }

    // --- HEAD: heavy and wedge-shaped ---
    const headProfile = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.2, 0),
        new THREE.Vector3(0.2, -0.1, 0),
        new THREE.Vector3(0.25, 0.05, 0),
        new THREE.Vector3(0.2, 0.2, 0),
        new THREE.Vector3(0, 0.25, 0),
    ]);
    const headGeo = new THREE.LatheGeometry(headProfile.getPoints(12), 16);
    const head = new THREE.Mesh(headGeo, furMat);
    head.rotation.z = Math.PI / 2;
    head.scale.set(0.9, 1.0, 0.85);
    head.position.set(0.85, 0.85, 0);
    group.add(head);

    // Snout disc - flat pig-like nose
    const snoutGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.1, 14);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0x7B5530, roughness: 0.5 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(1.15, 0.82, 0);
    snout.rotation.z = Math.PI / 2;
    group.add(snout);

    // Nostrils
    for (let side = -1; side <= 1; side += 2) {
        const nGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const nostril = new THREE.Mesh(nGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }));
        nostril.position.set(1.21, 0.83, side * 0.055);
        group.add(nostril);
    }

    // Eyes - small and deep-set like real boars
    for (let side = -1; side <= 1; side += 2) {
        const socketGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const socket = new THREE.Mesh(socketGeo, darkMat);
        socket.position.set(1.0, 0.97, side * 0.2);
        group.add(socket);
        const eyeGeo = new THREE.SphereGeometry(0.028, 12, 12);
        const eye = new THREE.Mesh(eyeGeo, new THREE.MeshStandardMaterial({ color: 0x331100, roughness: 0.2, metalness: 0.4 }));
        eye.position.set(1.02, 0.98, side * 0.21);
        group.add(eye);
    }

    // Tusks - curved using TubeGeometry
    for (let side = -1; side <= 1; side += 2) {
        const tuskCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.06, -0.08, side * 0.05),
            new THREE.Vector3(0.1, -0.02, side * 0.08),
        ]);
        const tuskGeo = new THREE.TubeGeometry(tuskCurve, 8, 0.015, 6, false);
        const tMat = new THREE.MeshStandardMaterial({ color: 0xEEEECC, roughness: 0.3, metalness: 0.2 });
        const tusk = new THREE.Mesh(tuskGeo, tMat);
        tusk.position.set(1.08, 0.72, side * 0.12);
        group.add(tusk);
    }

    // Ears - floppy and triangular
    for (let side = -1; side <= 1; side += 2) {
        const earShape = new THREE.Shape();
        earShape.moveTo(0, 0);
        earShape.quadraticCurveTo(0.05, 0.08, 0.02, 0.16);
        earShape.quadraticCurveTo(0, 0.17, -0.02, 0.16);
        earShape.quadraticCurveTo(-0.05, 0.08, 0, 0);
        const eGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 });
        const ear = new THREE.Mesh(eGeo, darkMat);
        ear.position.set(0.8, 1.1, side * 0.22);
        ear.rotation.set(side * 0.3, 0, side * 0.6);
        group.add(ear);
    }

    // --- LEGS: stocky with proper proportions ---
    const legPos = [
        { x: 0.38, z: 0.25, front: true }, { x: 0.38, z: -0.25, front: true },
        { x: -0.38, z: 0.25, front: false }, { x: -0.38, z: -0.25, front: false }
    ];
    const legs = [];
    legPos.forEach(pos => {
        const lg = new THREE.Group();

        // Upper leg - thick and muscular
        const uGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.38, 10);
        const upper = new THREE.Mesh(uGeo, furMat);
        upper.position.y = -0.18;
        lg.add(upper);

        // Joint
        const jointGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const joint = new THREE.Mesh(jointGeo, furMat);
        joint.position.y = -0.38;
        lg.add(joint);

        // Lower leg
        const lGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.28, 10);
        const lower = new THREE.Mesh(lGeo, darkMat);
        lower.position.y = -0.55;
        lg.add(lower);

        // Split hooves
        for (let toe = -1; toe <= 1; toe += 2) {
            const hGeo = new THREE.SphereGeometry(0.03, 6, 6);
            const hoof = new THREE.Mesh(hGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
            hoof.scale.set(1.0, 0.5, 1.3);
            hoof.position.set(0, -0.7, toe * 0.02);
            lg.add(hoof);
        }

        lg.position.set(pos.x, 0.78, pos.z);
        group.add(lg);
        legs.push(lg);
    });

    // Curly tail - using TubeGeometry for a better spiral
    const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.06, 0.06, 0.03),
        new THREE.Vector3(-0.02, 0.1, -0.03),
        new THREE.Vector3(-0.08, 0.12, 0.02),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 10, 0.012, 6, false);
    const cTail = new THREE.Mesh(tailGeo, furMat);
    cTail.position.set(-0.6, 0.88, 0);
    group.add(cTail);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'boar',
        x, z, speed: rand(1, 2),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(3, 8), walkTimer: 0,
        fleeing: false, hp: 80, maxHp: 80,
        loot: [{ type: 'meat_raw', count: 3 }, { type: 'leather', count: 1 }],
        hurtTimer: 0, dead: false, bodyRadius: 1.2,
    };
}

for (let i = 0; i < 5; i++) {
    const x = rand(-50, 25), z = rand(-45, 45);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15 && distFromCenter(x, z) > 12)
        animals.push(createBoar(x, z));
}


// ----- SEAGULLS -----
function createSeagull(x, z) {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE, roughness: 0.6 });
    const greyMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 });

    const bodyGeo = new THREE.SphereGeometry(0.22, 14, 12);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    body.scale.set(1.6, 0.7, 0.8);
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const head = new THREE.Mesh(headGeo, whiteMat);
    head.position.set(0.3, 0.08, 0);
    group.add(head);

    for (let side = -1; side <= 1; side += 2) {
        const eGeo = new THREE.SphereGeometry(0.018, 8, 8);
        const eye = new THREE.Mesh(eGeo, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 }));
        eye.position.set(0.37, 0.1, side * 0.055);
        group.add(eye);
    }

    const beakGeo = new THREE.ConeGeometry(0.025, 0.15, 8);
    const beak = new THREE.Mesh(beakGeo, new THREE.MeshStandardMaterial({ color: 0xFF8800, roughness: 0.5 }));
    beak.position.set(0.42, 0.05, 0);
    beak.rotation.z = -Math.PI / 2;
    group.add(beak);

    const tailGeo = new THREE.BoxGeometry(0.15, 0.02, 0.12);
    const tail = new THREE.Mesh(tailGeo, greyMat);
    tail.position.set(-0.35, 0.02, 0);
    group.add(tail);

    const wings = [];
    for (let side = -1; side <= 1; side += 2) {
        const wg = new THREE.Group();
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.5), whiteMat);
        w1.position.z = 0.25 * side;
        wg.add(w1);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.35), greyMat);
        w2.position.z = 0.6 * side;
        wg.add(w2);
        group.add(wg);
        wings.push(wg);
    }

    const fH = rand(15, 30);
    group.position.set(x, fH, z);
    scene.add(group);

    return {
        mesh: group, wings, type: 'seagull',
        x, z, centerX: x, centerZ: z,
        circleRadius: rand(8, 20), circleSpeed: rand(0.3, 0.7),
        circleAngle: rand(0, Math.PI * 2), flyHeight: fH, flapTime: 0,
        hp: 999, maxHp: 999, dead: false, bodyRadius: 0, loot: [], hurtTimer: 0,
    };
}

for (let i = 0; i < 8; i++) {
    animals.push(createSeagull(rand(20, 60), rand(-30, 30)));
}


// ----- ANIMAL AI -----
function updateAnimals(dt) {
    for (let i = animals.length - 1; i >= 0; i--) {
        const a = animals[i];
        if (a.dead) continue;

        // Hurt flash (emissive red glow)
        if (a.hurtTimer > 0) {
            a.hurtTimer -= dt;
            const flash = a.hurtTimer > 0 ? Math.sin(a.hurtTimer * 30) * 0.5 + 0.5 : 0;
            a.mesh.traverse(child => {
                if (child.isMesh && child.material && child.material.emissive) {
                    child.material.emissive.setRGB(flash * 0.8, 0, 0);
                }
            });
        }

        if (a.type === 'seagull') {
            a.circleAngle += a.circleSpeed * dt;
            a.flapTime += dt * 5;
            a.x = a.centerX + Math.cos(a.circleAngle) * a.circleRadius;
            a.z = a.centerZ + Math.sin(a.circleAngle) * a.circleRadius;
            a.mesh.position.set(a.x, a.flyHeight + Math.sin(a.flapTime * 0.3), a.z);
            a.mesh.rotation.y = -a.circleAngle + Math.PI / 2;
            if (a.wings) {
                a.wings[0].rotation.x = Math.sin(a.flapTime) * 0.6;
                a.wings[1].rotation.x = -Math.sin(a.flapTime) * 0.6;
            }
            continue;
        }

        const distToPlayer = distXZ(a.x, a.z, player.x, player.z);
        const fleeDistance = a.type === 'rabbit' ? 6 : 10;

        if (distToPlayer < fleeDistance) {
            a.direction = Math.atan2(a.x - player.x, a.z - player.z);
            a.fleeing = true;
        } else {
            a.fleeing = false;
            a.turnTimer -= dt;
            if (a.turnTimer <= 0) {
                a.direction += rand(-1.5, 1.5);
                a.turnTimer = rand(2, 6);
            }
        }

        const speed = a.fleeing ? a.speed * 2.5 : a.speed;
        const nx = a.x + Math.sin(a.direction) * speed * dt;
        const nz = a.z + Math.cos(a.direction) * speed * dt;

        if (distFromCenter(nx, nz) < ISLAND_RADIUS - 5) {
            a.x = nx; a.z = nz;
        } else {
            a.direction = Math.atan2(-a.x, -a.z);
        }

        a.mesh.position.x = a.x;
        a.mesh.position.z = a.z;
        // Rotate -PI/2 so the model's +X front aligns with the +Z movement direction
        a.mesh.rotation.y = a.direction - Math.PI / 2;

        // Realistic leg animation: bend at the knee/hock joint
        // rotation.z swings legs in the X-Y plane (forward/back for a model facing +X)
        if (a.legs && (a.fleeing || speed > 0.5)) {
            a.walkTimer += dt * speed * 2;
            const intensity = a.fleeing ? 1.5 : 1;
            a.legs.forEach((leg, idx) => {
                // Front and back legs move in opposite phase (like real walking)
                const phase = idx < 2 ? 0 : Math.PI;
                const swing = Math.sin(a.walkTimer + phase);

                // Hip rotation - the whole leg swings forward/back along Z axis
                leg.rotation.z = swing * 0.4 * intensity;

                // Bend the lower leg when lifting (knee bend effect)
                const liftAmount = Math.max(0, swing);
                const children = leg.children;
                if (a.type === 'deer' || a.type === 'boar') {
                    // Lower leg bends backward when lifting
                    if (children.length >= 4) {
                        children[3].rotation.z = liftAmount * 0.6 * intensity;
                    }
                    // Slight knee bend
                    if (children.length >= 3) {
                        children[2].rotation.z = liftAmount * 0.3 * intensity;
                    }
                }
            });
        } else if (a.legs) {
            // When standing still, smoothly return legs to neutral
            a.legs.forEach(leg => {
                leg.rotation.z *= 0.9;
                leg.children.forEach(child => { child.rotation.z *= 0.9; });
            });
        }

        if (a.type === 'rabbit') {
            a.hopTimer += dt * speed * 1.5;
            // Rabbits hop - body bounces up and down
            a.mesh.position.y = Math.abs(Math.sin(a.hopTimer)) * 0.25;
            // Back legs stretch and compress during hop
            if (a.legs) {
                const hopPhase = Math.sin(a.hopTimer);
                a.legs.forEach(leg => {
                    // Crouch before jump, extend during jump
                    leg.rotation.z = hopPhase * 0.4;
                    if (leg.children.length >= 2) {
                        leg.children[1].rotation.z = Math.max(0, -hopPhase) * 0.5;
                    }
                });
            }
        }
    }
}


// ============================================================
// 7. INVENTORY
// ============================================================

const HOTBAR_SIZE = 8;
const inventory = [];
for (let i = 0; i < HOTBAR_SIZE; i++) inventory.push(null);
let selectedSlot = 0;

function addToInventory(type, count = 1) {
    const def = ITEM_DEFS[type];
    if (!def) return false;
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        if (inventory[i] && inventory[i].type === type && inventory[i].count < def.stackMax) {
            const canAdd = Math.min(count, def.stackMax - inventory[i].count);
            inventory[i].count += canAdd;
            count -= canAdd;
            if (count <= 0) { renderInventory(); return true; }
        }
    }
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        if (!inventory[i]) {
            const canAdd = Math.min(count, def.stackMax);
            inventory[i] = { type, count: canAdd };
            count -= canAdd;
            if (count <= 0) { renderInventory(); return true; }
        }
    }
    renderInventory();
    return count <= 0;
}

function removeFromInventory(slot, count = 1) {
    if (!inventory[slot]) return false;
    inventory[slot].count -= count;
    if (inventory[slot].count <= 0) inventory[slot] = null;
    renderInventory();
    return true;
}

function hasItem(type, count = 1) {
    let total = 0;
    for (const slot of inventory) if (slot && slot.type === type) total += slot.count;
    return total >= count;
}

function consumeItems(type, count) {
    let remaining = count;
    for (let i = 0; i < HOTBAR_SIZE && remaining > 0; i++) {
        if (inventory[i] && inventory[i].type === type) {
            const take = Math.min(remaining, inventory[i].count);
            inventory[i].count -= take;
            remaining -= take;
            if (inventory[i].count <= 0) inventory[i] = null;
        }
    }
    renderInventory();
    return remaining <= 0;
}

function renderInventory() {
    const bar = document.getElementById('inventory-bar');
    bar.innerHTML = '';
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot' + (i === selectedSlot ? ' selected' : '');
        const keyLabel = document.createElement('span');
        keyLabel.className = 'slot-key';
        keyLabel.textContent = i + 1;
        slot.appendChild(keyLabel);
        if (inventory[i]) {
            const def = ITEM_DEFS[inventory[i].type];
            const icon = document.createElement('span');
            icon.className = 'slot-icon';
            icon.textContent = def.icon;
            icon.style.color = '#' + def.color.toString(16).padStart(6, '0');
            slot.appendChild(icon);
            if (inventory[i].count > 1) {
                const cnt = document.createElement('span');
                cnt.className = 'slot-count';
                cnt.textContent = inventory[i].count;
                slot.appendChild(cnt);
            }
            slot.title = def.name + (def.damage ? ` (DMG: ${def.damage})` : '') + (def.food ? ` (Heals: ${def.healAmount})` : '');
        }
        slot.addEventListener('click', () => { selectedSlot = i; renderInventory(); });
        bar.appendChild(slot);
    }
}
renderInventory();

document.addEventListener('keydown', (e) => {
    if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        selectedSlot = parseInt(e.code.charAt(5)) - 1;
        renderInventory();
    }
});


// ============================================================
// 8. CRAFTING
// ============================================================

const RECIPES = [
    { result: 'stone_axe', resultCount: 1, ingredients: [{ type: 'stick', count: 3 }, { type: 'stone', count: 2 }], name: 'Stone Axe', icon: 'T', desc: 'A basic axe. Deals 20 damage.' },
    { result: 'stone_spear', resultCount: 1, ingredients: [{ type: 'stick', count: 4 }, { type: 'stone', count: 1 }], name: 'Stone Spear', icon: '|', desc: 'A sharp spear. Deals 30 damage.' },
    { result: 'leather_wrap', resultCount: 1, ingredients: [{ type: 'leather', count: 3 }], name: 'Leather Wrap', icon: 'W', desc: 'Basic armor. +5 protection.' },
    { result: 'campfire', resultCount: 1, ingredients: [{ type: 'stick', count: 5 }, { type: 'stone', count: 3 }], name: 'Campfire', icon: 'F', desc: 'A warm fire. (Decorative)' },
];

let craftMenuOpen = false;

function renderCraftMenu() {
    const container = document.getElementById('craft-recipes');
    container.innerHTML = '';
    RECIPES.forEach(recipe => {
        const canCraft = recipe.ingredients.every(ing => hasItem(ing.type, ing.count));
        const div = document.createElement('div');
        div.className = 'craft-recipe' + (canCraft ? '' : ' cant-craft');
        const costStr = recipe.ingredients.map(ing => `${ing.count}x ${ITEM_DEFS[ing.type].name}`).join(' + ');
        div.innerHTML = `<span class="recipe-icon">${recipe.icon}</span><div><div class="recipe-name">${recipe.name}</div><div class="recipe-cost">${costStr}</div><div style="font-size:10px;color:#888">${recipe.desc}</div></div>`;
        if (canCraft) {
            div.addEventListener('click', () => {
                recipe.ingredients.forEach(ing => consumeItems(ing.type, ing.count));
                addToInventory(recipe.result, recipe.resultCount);
                renderCraftMenu();
            });
        }
        container.appendChild(div);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
        e.preventDefault();
        craftMenuOpen = !craftMenuOpen;
        document.getElementById('craft-menu').style.display = craftMenuOpen ? 'block' : 'none';
        if (craftMenuOpen) { renderCraftMenu(); document.exitPointerLock(); }
        else renderer.domElement.requestPointerLock();
    }
});


// ============================================================
// 9. FIRST PERSON HANDS
// ============================================================

const SKIN_COLOR = 0xD4A574;
const SKIN_DARK = 0xC49564;

const handsGroup = new THREE.Group();
camera.add(handsGroup);
scene.add(camera);

// Left hand
const leftHand = new THREE.Group();
const lArmMat = new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.7 });
const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), lArmMat);
lArm.position.set(0, -0.05, -0.15);
leftHand.add(lArm);
const lFist = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), lArmMat);
lFist.position.set(0, -0.02, -0.42);
leftHand.add(lFist);
for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: SKIN_DARK, roughness: 0.7 }));
    f.position.set(-0.03 + i * 0.02, -0.08, -0.42);
    leftHand.add(f);
}
const lThumb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), lArmMat);
lThumb.position.set(0.06, -0.03, -0.4);
lThumb.rotation.z = 0.3;
leftHand.add(lThumb);
leftHand.position.set(-0.35, -0.25, -0.4);
handsGroup.add(leftHand);

// Right hand
const rightHand = new THREE.Group();
const rArmMat = new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.7 });
const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), rArmMat);
rArm.position.set(0, -0.05, -0.15);
rightHand.add(rArm);
const rFist = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), rArmMat);
rFist.position.set(0, -0.02, -0.42);
rightHand.add(rFist);
for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: SKIN_DARK, roughness: 0.7 }));
    f.position.set(-0.03 + i * 0.02, -0.08, -0.42);
    rightHand.add(f);
}
const rThumb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), rArmMat);
rThumb.position.set(-0.06, -0.03, -0.4);
rThumb.rotation.z = -0.3;
rightHand.add(rThumb);

const middleFinger = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.025), lArmMat);
middleFinger.position.set(0.005, 0.04, -0.42);
middleFinger.visible = false;
rightHand.add(middleFinger);

rightHand.position.set(0.35, -0.25, -0.4);
handsGroup.add(rightHand);

const handAnim = {
    bobTime: 0,
    punching: false, punchHand: 'left', punchProgress: 0, punchSpeed: 8,
    flipping: false, flipDuration: 2.0, flipTimer: 0,
};

document.addEventListener('mousedown', (e) => {
    if (!mouseLocked || !player.alive || craftMenuOpen) return;
    if (e.button === 0 && !handAnim.punching && !handAnim.flipping) {
        handAnim.punching = true;
        handAnim.punchProgress = 0;
        handAnim.punchHand = handAnim.punchHand === 'left' ? 'right' : 'left';
        tryHitAnimal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyX' && !handAnim.flipping && !handAnim.punching && player.alive) {
        handAnim.flipping = true;
        handAnim.flipTimer = 0;
    }
});

function updateHands(dt) {
    const isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
    const bobSpeed = isMoving ? (keys['ShiftLeft'] ? 12 : 8) : 2;
    const bobAmt = isMoving ? (keys['ShiftLeft'] ? 0.04 : 0.025) : 0.008;
    handAnim.bobTime += dt * bobSpeed;

    let lx = -0.35, ly = -0.25 + Math.sin(handAnim.bobTime) * bobAmt, lz = -0.4, lrx = 0;
    let rx = 0.35, ry = -0.25 + Math.sin(handAnim.bobTime + Math.PI) * bobAmt, rz = -0.4, rrx = 0;

    if (handAnim.punching) {
        handAnim.punchProgress += dt * handAnim.punchSpeed;
        const p = handAnim.punchProgress;
        let pf = 0, pu = 0;
        if (p < 0.3) { pf = (p / 0.3) * 0.1; pu = (p / 0.3) * 0.05; }
        else if (p < 0.6) { const t = (p - 0.3) / 0.3; pf = 0.1 - t * 0.5; pu = 0.05 + t * 0.1; }
        else if (p < 1.0) { const t = (p - 0.6) / 0.4; pf = -0.4 + t * 0.4; pu = 0.15 - t * 0.15; }
        else handAnim.punching = false;
        if (handAnim.punchHand === 'left') { lz += pf; ly += pu; lx += 0.15; lrx = pf * 2; }
        else { rz += pf; ry += pu; rx -= 0.15; rrx = pf * 2; }
    }

    if (handAnim.flipping) {
        handAnim.flipTimer += dt;
        if (handAnim.flipTimer < 0.3) {
            const t = handAnim.flipTimer / 0.3;
            rx = 0.35 - t * 0.35; ry = -0.25 + t * 0.15; rz = -0.4 - t * 0.15;
            middleFinger.visible = true; middleFinger.scale.y = t;
        } else if (handAnim.flipTimer < 0.3 + handAnim.flipDuration) {
            rx = 0; ry = -0.1; rz = -0.55;
            middleFinger.visible = true; middleFinger.scale.y = 1;
            rx += Math.sin(handAnim.flipTimer * 3) * 0.02;
        } else if (handAnim.flipTimer < 0.3 + handAnim.flipDuration + 0.3) {
            const t = (handAnim.flipTimer - 0.3 - handAnim.flipDuration) / 0.3;
            rx = t * 0.35; ry = -0.1 - t * 0.15; rz = -0.55 + t * 0.15;
            middleFinger.visible = true; middleFinger.scale.y = 1 - t;
        } else { handAnim.flipping = false; middleFinger.visible = false; }
    }

    const s = 12;
    leftHand.position.x += (lx - leftHand.position.x) * s * dt;
    leftHand.position.y += (ly - leftHand.position.y) * s * dt;
    leftHand.position.z += (lz - leftHand.position.z) * s * dt;
    leftHand.rotation.x += (lrx - leftHand.rotation.x) * s * dt;
    rightHand.position.x += (rx - rightHand.position.x) * s * dt;
    rightHand.position.y += (ry - rightHand.position.y) * s * dt;
    rightHand.position.z += (rz - rightHand.position.z) * s * dt;
    rightHand.rotation.x += (rrx - rightHand.rotation.x) * s * dt;
}


// ============================================================
// 10. COMBAT
// ============================================================

function getPlayerDamage() {
    const held = inventory[selectedSlot];
    if (held) { const def = ITEM_DEFS[held.type]; if (def && def.damage) return def.damage; }
    return 8;
}

function tryHitAnimal() {
    const reach = 3.5;
    const lookX = -Math.sin(player.yaw);
    const lookZ = -Math.cos(player.yaw);
    let closest = null, closestDist = reach;

    for (const a of animals) {
        if (a.dead || a.type === 'seagull') continue;
        const dx = a.x - player.x, dz = a.z - player.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > reach + a.bodyRadius) continue;
        const ndx = dx / dist, ndz = dz / dist;
        if (ndx * lookX + ndz * lookZ < 0.3) continue;
        if (dist < closestDist + a.bodyRadius) { closestDist = dist; closest = a; }
    }
    if (closest) damageAnimal(closest, getPlayerDamage());
}

function damageAnimal(animal, damage) {
    animal.hp -= damage;
    animal.hurtTimer = 0.4;
    animal.fleeing = true;
    animal.direction = Math.atan2(animal.x - player.x, animal.z - player.z);
    if (animal.hp <= 0) killAnimal(animal);
}

function killAnimal(animal) {
    animal.dead = true;
    animal.loot.forEach(l => {
        for (let i = 0; i < l.count; i++) {
            spawnGroundItem(animal.x + rand(-1, 1), animal.z + rand(-1, 1), l.type);
        }
    });
    scene.remove(animal.mesh);
}


// ============================================================
// 11. DAY/NIGHT CYCLE
// ============================================================

const dayNight = {
    time: 0.3,
    speed: 0.003,
    dayColor: new THREE.Color(0x87CEEB),
    nightColor: new THREE.Color(0x0A0A2E),
    sunsetColor: new THREE.Color(0xFF6633),
};

function updateDayNight(dt) {
    dayNight.time = (dayNight.time + dt * dayNight.speed) % 1.0;
    const t = dayNight.time;
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    const sunH = Math.sin(sunAngle);
    const sunHoriz = Math.cos(sunAngle);

    sunSphere.position.set(sunHoriz * 150, sunH * 150, 50);
    sunLight.position.set(sunHoriz * 50, Math.max(sunH * 80, 1), 30);
    moonSphere.position.set(-sunHoriz * 120, -sunH * 120, -30);
    moonLight.position.set(-sunHoriz * 50, Math.max(-sunH * 60, 1), -30);
    sunSphere.visible = sunH > -0.1;
    moonSphere.visible = sunH < 0.1;

    let sky;
    if (sunH > 0.2) sky = dayNight.dayColor.clone();
    else if (sunH > 0) sky = dayNight.sunsetColor.clone().lerp(dayNight.dayColor, sunH / 0.2);
    else if (sunH > -0.2) sky = dayNight.nightColor.clone().lerp(dayNight.sunsetColor, (sunH + 0.2) / 0.2);
    else sky = dayNight.nightColor.clone();

    scene.background = sky;
    scene.fog.color = sky;
    sunLight.intensity = Math.max(0, sunH) * 1.2;
    ambientLight.intensity = 0.15 + Math.max(0, sunH) * 0.4;
    hemiLight.intensity = 0.08 + Math.max(0, sunH) * 0.35;
    moonLight.intensity = Math.max(0, -sunH) * 0.3;
    starsGroup.visible = sunH < 0;

    // Cloud visibility (dimmer at night)
    cloudMat.opacity = sunH > 0 ? 0.6 : 0.15;

    // Pass sun height to water shader
    waterUniforms.uSunHeight.value = sunH;

    if (sunH > 0 && sunH < 0.3) {
        const o = 1 - sunH / 0.3;
        sunSphereMat.color.setRGB(1, 0.8 + o * 0.1, 0.3 + (1 - o) * 0.7);
    } else sunSphereMat.color.set(0xFFDD44);

    // Tone mapping exposure shifts with time of day
    renderer.toneMappingExposure = 0.4 + Math.max(0, sunH) * 0.8;
}

function getTimeString() {
    const t = dayNight.time;
    const h = Math.floor(t * 24);
    const m = Math.floor((t * 24 - h) * 60);
    const ts = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    let p;
    if (t > 0.2 && t < 0.35) p = 'Dawn';
    else if (t > 0.35 && t < 0.7) p = 'Day';
    else if (t > 0.7 && t < 0.85) p = 'Dusk';
    else p = 'Night';
    return `${ts} ${p}`;
}


// ============================================================
// 12. PLAYER
// ============================================================

const player = {
    x: 0, z: 0, y: 1.65,
    yaw: 0, pitch: 0,
    speed: 8, sprintSpeed: 14,
    alive: true, inWater: false,
    hp: 100, maxHp: 100,
    hunger: 100, maxHunger: 100,
    // Jump physics
    velY: 0,             // vertical velocity
    onGround: true,      // whether the player is on solid ground
    jumpStrength: 7,     // how high the player jumps
    gravity: -18,        // gravity pulling the player down
};

const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

let mouseLocked = false;

document.addEventListener('mousemove', (e) => {
    if (!mouseLocked || !player.alive) return;
    player.yaw -= e.movementX * 0.002;
    player.pitch -= e.movementY * 0.002;
    player.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, player.pitch));
});

document.addEventListener('click', () => {
    const ss = document.getElementById('start-screen');
    if (ss.style.display !== 'none') { ss.style.display = 'none'; renderer.domElement.requestPointerLock(); return; }
    if (!player.alive) { respawnPlayer(); return; }
    if (!craftMenuOpen) renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE' && player.alive) tryPickup();
    if (e.code === 'KeyF' && player.alive) tryEat();
});

function tryPickup() {
    let ci = null, cd = 3;
    for (let i = groundItems.length - 1; i >= 0; i--) {
        const d = distXZ(player.x, player.z, groundItems[i].x, groundItems[i].z);
        if (d < cd) { cd = d; ci = i; }
    }
    if (ci !== null) {
        const item = groundItems[ci];
        if (addToInventory(item.type)) {
            scene.remove(item.mesh);
            groundItems.splice(ci, 1);
        }
    }
}

function tryEat() {
    const held = inventory[selectedSlot];
    if (!held) return;
    const def = ITEM_DEFS[held.type];
    if (!def || !def.food) return;
    player.hp = Math.min(player.maxHp, player.hp + def.healAmount);
    player.hunger = Math.min(player.maxHunger, player.hunger + 25);
    removeFromInventory(selectedSlot, 1);
    updateHealthBars();
}

function updatePlayer(dt) {
    if (!player.alive) return;

    const speed = keys['ShiftLeft'] ? player.sprintSpeed : player.speed;
    const fX = -Math.sin(player.yaw), fZ = -Math.cos(player.yaw);
    const rX = Math.cos(player.yaw), rZ = -Math.sin(player.yaw);

    let mx = 0, mz = 0;
    if (keys['KeyW']) { mx += fX; mz += fZ; }
    if (keys['KeyS']) { mx -= fX; mz -= fZ; }
    if (keys['KeyA']) { mx -= rX; mz -= rZ; }
    if (keys['KeyD']) { mx += rX; mz += rZ; }

    const ml = Math.sqrt(mx * mx + mz * mz);
    if (ml > 0) { mx = (mx / ml) * speed * dt; mz = (mz / ml) * speed * dt; }

    let nx = player.x + mx, nz = player.z + mz;
    const PR = 0.4;

    for (const col of colliders) {
        const dx = nx - col.x, dz = nz - col.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        const minD = PR + col.radius;
        if (d < minD && d > 0.001) {
            nx += (dx / d) * (minD - d);
            nz += (dz / d) * (minD - d);
        }
    }

    player.x = nx; player.z = nz;
    const dfi = distFromCenter(player.x, player.z);
    player.inWater = dfi > ISLAND_RADIUS;

    // Ground height: eye level is 1.65 on land, 0.9 in water
    const groundY = player.inWater ? 0.9 : 1.65;

    // Jump: press Space to jump when on the ground
    if (keys['Space'] && player.onGround && !player.inWater) {
        player.velY = player.jumpStrength;
        player.onGround = false;
    }

    // Apply gravity and update vertical position
    if (!player.onGround) {
        player.velY += player.gravity * dt;
        player.y += player.velY * dt;

        // Check if we've landed
        if (player.y <= groundY) {
            player.y = groundY;
            player.velY = 0;
            player.onGround = true;
        }
    } else {
        player.y = groundY;
    }

    if (dfi > ISLAND_RADIUS + 25) killPlayer('You swam too far from the island...');

    player.hunger -= dt * 0.4;
    if (player.hunger <= 0) {
        player.hunger = 0;
        player.hp -= dt * 5;
        if (player.hp <= 0) { player.hp = 0; killPlayer('You starved to death...'); }
    }

    camera.position.set(player.x, player.y, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
}

function killPlayer(reason) {
    if (!player.alive) return;
    player.alive = false;
    document.getElementById('death-reason').textContent = reason || 'You died...';
    document.getElementById('death-screen').style.display = 'flex';
    document.exitPointerLock();
}

function respawnPlayer() {
    player.alive = true;
    player.x = 0; player.z = 0; player.y = 1.65;
    player.yaw = 0; player.pitch = 0;
    player.velY = 0; player.onGround = true;
    player.hp = player.maxHp; player.hunger = player.maxHunger;
    document.getElementById('death-screen').style.display = 'none';
    renderer.domElement.requestPointerLock();
    updateHealthBars();
}

function updateHealthBars() {
    document.getElementById('health-bar').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('hunger-bar').style.width = (player.hunger / player.maxHunger * 100) + '%';
}
updateHealthBars();

function updateHUD() {
    const hud = document.getElementById('hud');
    const prompt = document.getElementById('interact-prompt');
    let nearItem = false;
    for (const item of groundItems) {
        if (distXZ(player.x, player.z, item.x, item.z) < 3) {
            prompt.textContent = `[E] Pick up ${ITEM_DEFS[item.type].name}`;
            prompt.style.display = 'block';
            nearItem = true; break;
        }
    }
    if (!nearItem) prompt.style.display = 'none';
    const held = inventory[selectedSlot];
    const heldName = held ? ITEM_DEFS[held.type].name : 'Bare Hands';
    if (player.inWater) { hud.textContent = '!! SWIMMING - Turn back! !!'; hud.style.color = '#FF4444'; }
    else { hud.textContent = `Island Survival | ${heldName} | ${getTimeString()}`; hud.style.color = 'white'; }
    updateHealthBars();
}

function updateGroundItems(dt) {
    for (const item of groundItems) {
        item.bobTime += dt * 2;
        item.mesh.position.y = 0.05 + Math.sin(item.bobTime) * 0.08;
        item.glow.material.opacity = 0.2 + Math.sin(item.bobTime * 1.5) * 0.15;
    }
}

let damageFlashTimer = 0;
function updateDamageFlash(dt) {
    if (damageFlashTimer > 0) {
        damageFlashTimer -= dt;
        if (damageFlashTimer <= 0) document.getElementById('damage-flash').style.background = 'rgba(255,0,0,0)';
    }
}


// ============================================================
// 13. GAME LOOP
// ============================================================

let lastTime = performance.now();
let cloudTime = 0;

function gameLoop() {
    requestAnimationFrame(gameLoop);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    cloudTime += dt;

    updatePlayer(dt);
    updateHands(dt);
    updateAnimals(dt);
    updateDayNight(dt);
    updateGroundItems(dt);
    updateDamageFlash(dt);
    updateHUD();

    // Animate water shader
    waterUniforms.uTime.value = cloudTime;

    // Slowly drift clouds
    clouds.position.x = Math.sin(cloudTime * 0.01) * 20;
    clouds.position.z = Math.cos(cloudTime * 0.008) * 15;

    // Use post-processing composer if available, otherwise basic render
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

gameLoop();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});
