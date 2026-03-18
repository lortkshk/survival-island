// ============================================================
// ISLAND SURVIVAL - Main Game File
// ============================================================
// Architecture:
//   1. SCENE SETUP     - renderer, camera, lights
//   2. TERRAIN         - island, beach, water
//   3. VEGETATION      - improved trees, bushes, palms (with collision)
//   4. ITEMS           - pickable sticks, stones, etc.
//   5. ANIMALS         - detailed deer, rabbits, boars, seagulls (with HP)
//   6. INVENTORY       - hotbar, item stacking
//   7. CRAFTING        - recipes and menu
//   8. FIRST PERSON    - hands, punch, animations
//   9. COMBAT          - hitting animals, loot drops
//  10. DAY/NIGHT       - slower cycle, sky colors
//  11. PLAYER          - movement, collision, HP, hunger
//  12. GAME LOOP       - ties everything together
// ============================================================


// ============================================================
// 1. SCENE SETUP
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.007);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.05, 1000
);
camera.position.set(0, 1.65, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// -- Lighting --
const ambientLight = new THREE.AmbientLight(0x6688AA, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xFFEECC, 1.0);
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
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a7a3a, 0.3);
scene.add(hemiLight);

const moonLight = new THREE.DirectionalLight(0x4444AA, 0);
moonLight.position.set(-50, 40, -30);
scene.add(moonLight);

// Sun/Moon visuals
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
for (let i = 0; i < 300; i++) {
    const geo = new THREE.SphereGeometry(rand(0.2, 0.5), 4, 4);
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


// ============================================================
// HELPERS
// ============================================================

function rand(min, max) { return Math.random() * (max - min) + min; }
function distXZ(x1, z1, x2, z2) { return Math.sqrt((x1-x2)**2 + (z1-z2)**2); }
function distFromCenter(x, z) { return Math.sqrt(x * x + z * z); }

// Master collision list - everything solid in the world
// Each entry: { x, z, radius } (circle collision)
const colliders = [];

// Master list of ground items you can pick up
const groundItems = [];

// Master list of animals
const animals = [];

// Item definitions - must be here before vegetation spawns sticks/stones
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
// 2. TERRAIN
// ============================================================

const ISLAND_RADIUS = 80;

const islandGeo = new THREE.CircleGeometry(ISLAND_RADIUS, 64);
const islandMat = new THREE.MeshLambertMaterial({ color: 0x4A7A3B });
const island = new THREE.Mesh(islandGeo, islandMat);
island.rotation.x = -Math.PI / 2;
island.receiveShadow = true;
scene.add(island);

// Beach ring
const beachGeo = new THREE.RingGeometry(ISLAND_RADIUS - 15, ISLAND_RADIUS + 5, 64);
const beachMat = new THREE.MeshLambertMaterial({ color: 0xE8D68E, side: THREE.DoubleSide });
const beach = new THREE.Mesh(beachGeo, beachMat);
beach.rotation.x = -Math.PI / 2;
beach.position.y = 0.05;
beach.receiveShadow = true;
scene.add(beach);

// Beach extension
const beachExtGeo = new THREE.CircleGeometry(35, 32);
const beachExtMat = new THREE.MeshLambertMaterial({ color: 0xE8D68E });
const beachExt = new THREE.Mesh(beachExtGeo, beachExtMat);
beachExt.rotation.x = -Math.PI / 2;
beachExt.position.set(55, 0.06, 0);
beachExt.receiveShadow = true;
scene.add(beachExt);

// Water
const waterGeo = new THREE.PlaneGeometry(800, 800);
const waterMat = new THREE.MeshLambertMaterial({ color: 0x1A6B8A, transparent: true, opacity: 0.8 });
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.3;
water.receiveShadow = true;
scene.add(water);

let waterTime = 0;


// ============================================================
// 3. VEGETATION - Improved trees with collision
// ============================================================

// ----- FOREST TREES (more detailed, multiple leaf layers) -----
function createTree(x, z) {
    const group = new THREE.Group();

    // Trunk - tapered cylinder with slight color variation
    const trunkHeight = rand(4, 7);
    const trunkRadBot = rand(0.4, 0.6);
    const trunkRadTop = trunkRadBot * 0.5;
    const trunkGeo = new THREE.CylinderGeometry(trunkRadTop, trunkRadBot, trunkHeight, 10);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Bark texture lines (thin darker strips on trunk)
    for (let i = 0; i < 3; i++) {
        const stripGeo = new THREE.BoxGeometry(0.02, trunkHeight * 0.6, trunkRadBot * 0.3);
        const stripMat = new THREE.MeshLambertMaterial({ color: 0x3A2510 });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        const angle = (i / 3) * Math.PI * 2;
        strip.position.set(
            Math.cos(angle) * trunkRadBot * 0.85,
            trunkHeight * 0.4,
            Math.sin(angle) * trunkRadBot * 0.85
        );
        strip.rotation.y = angle;
        group.add(strip);
    }

    // Root bumps at base
    for (let i = 0; i < 4; i++) {
        const rootGeo = new THREE.SphereGeometry(rand(0.2, 0.4), 6, 4);
        const rootMat = new THREE.MeshLambertMaterial({ color: 0x4A2A10 });
        const root = new THREE.Mesh(rootGeo, rootMat);
        const angle = (i / 4) * Math.PI * 2 + rand(-0.3, 0.3);
        root.position.set(Math.cos(angle) * trunkRadBot * 1.1, 0.1, Math.sin(angle) * trunkRadBot * 1.1);
        root.scale.y = 0.5;
        group.add(root);
    }

    // Multiple leaf layers (3 cones stacked, getting smaller toward top)
    const baseLeafY = trunkHeight - 0.5;
    for (let layer = 0; layer < 3; layer++) {
        const layerRadius = rand(2.5, 4) - layer * 0.8;
        const layerHeight = rand(2.5, 3.5) - layer * 0.3;
        const lGeo = new THREE.ConeGeometry(layerRadius, layerHeight, 12);
        const green = new THREE.Color().setHSL(rand(0.25, 0.35), rand(0.5, 0.8), rand(0.15, 0.3));
        const lMat = new THREE.MeshLambertMaterial({ color: green });
        const leaf = new THREE.Mesh(lGeo, lMat);
        leaf.position.y = baseLeafY + layer * 1.8;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
    }

    group.position.set(x, 0, z);
    scene.add(group);

    // Add collision for this tree trunk
    colliders.push({ x: x, z: z, radius: trunkRadBot + 0.3 });

    // Spawn sticks near the tree base
    const numSticks = Math.floor(rand(1, 3));
    for (let i = 0; i < numSticks; i++) {
        const stickAngle = rand(0, Math.PI * 2);
        const stickDist = rand(1.5, 3.5);
        spawnGroundItem(
            x + Math.cos(stickAngle) * stickDist,
            z + Math.sin(stickAngle) * stickDist,
            'stick'
        );
    }

    return group;
}

// Place forest trees
const trees = [];
for (let i = 0; i < 80; i++) {
    const x = rand(-70, 20);
    const z = rand(-60, 60);
    const dist = distFromCenter(x, z);
    if (dist < ISLAND_RADIUS - 10 && dist > 12) {
        trees.push(createTree(x, z));
    }
}


// ----- BUSHES (more detailed) -----
function createBush(x, z) {
    const group = new THREE.Group();
    const numBalls = Math.floor(rand(3, 6));
    for (let i = 0; i < numBalls; i++) {
        const radius = rand(0.4, 1.0);
        const geo = new THREE.SphereGeometry(radius, 10, 8);
        const green = new THREE.Color().setHSL(rand(0.25, 0.38), rand(0.5, 0.7), rand(0.12, 0.25));
        const mat = new THREE.MeshLambertMaterial({ color: green });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.set(rand(-0.6, 0.6), radius * 0.5, rand(-0.6, 0.6));
        sphere.castShadow = true;
        group.add(sphere);
    }
    // Small berries/flowers on some bushes
    if (Math.random() > 0.5) {
        for (let i = 0; i < 5; i++) {
            const bGeo = new THREE.SphereGeometry(0.08, 4, 4);
            const bMat = new THREE.MeshLambertMaterial({
                color: [0xCC2222, 0xDD8800, 0xFFFF44][Math.floor(rand(0, 3))]
            });
            const berry = new THREE.Mesh(bGeo, bMat);
            berry.position.set(rand(-0.8, 0.8), rand(0.3, 1), rand(-0.8, 0.8));
            group.add(berry);
        }
    }

    group.position.set(x, 0, z);
    scene.add(group);
    colliders.push({ x, z, radius: 0.8 });
}

for (let i = 0; i < 50; i++) {
    const x = rand(-65, 30);
    const z = rand(-55, 55);
    const dist = distFromCenter(x, z);
    if (dist < ISLAND_RADIUS - 8 && dist > 8) createBush(x, z);
}


// ----- PALM TREES (improved) -----
function createPalmTree(x, z) {
    const group = new THREE.Group();
    const trunkHeight = rand(7, 11);
    const segments = 8;
    const segHeight = trunkHeight / segments;
    let curveX = 0, curveZ = 0;
    const curveDir = rand(0, Math.PI * 2);

    // Trunk - stacked cylinders with ring details
    for (let i = 0; i < segments; i++) {
        const rad = 0.25 - i * 0.015;
        const geo = new THREE.CylinderGeometry(rad * 0.85, rad, segHeight + 0.05, 8);
        const mat = new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x8B7014 : 0x7B6010 });
        const seg = new THREE.Mesh(geo, mat);
        curveX += Math.cos(curveDir) * rand(0.05, 0.2);
        curveZ += Math.sin(curveDir) * rand(0.0, 0.1);
        seg.position.set(curveX, segHeight * i + segHeight / 2, curveZ);
        seg.castShadow = true;
        group.add(seg);

        // Ring detail at each segment
        const ringGeo = new THREE.TorusGeometry(rad + 0.02, 0.02, 4, 8);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0x6B5010 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(curveX, segHeight * i + segHeight, curveZ);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
    }

    const topX = curveX, topZ = curveZ, topY = trunkHeight;

    // Palm fronds - longer, with multiple segments for a drooping look
    const numFronds = 9;
    for (let i = 0; i < numFronds; i++) {
        const angle = (i / numFronds) * Math.PI * 2;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(topX, topY, topZ);
        frondGroup.rotation.y = angle;

        // Each frond = several flat boxes angled down progressively
        const segs = 5;
        const frondLen = rand(3.5, 5.5);
        for (let s = 0; s < segs; s++) {
            const segLen = frondLen / segs;
            const width = 0.5 - s * 0.08;
            const fGeo = new THREE.BoxGeometry(width, 0.04, segLen);
            const green = new THREE.Color().setHSL(rand(0.28, 0.35), rand(0.5, 0.7), rand(0.2, 0.35));
            const fMat = new THREE.MeshLambertMaterial({ color: green });
            const fMesh = new THREE.Mesh(fGeo, fMat);
            fMesh.position.z = s * segLen + segLen / 2;
            fMesh.position.y = -s * 0.35;  // Droop more with each segment
            fMesh.rotation.x = s * 0.12;
            fMesh.castShadow = true;
            frondGroup.add(fMesh);
        }
        group.add(frondGroup);
    }

    // Coconuts
    for (let i = 0; i < rand(2, 5); i++) {
        const cGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const cMat = new THREE.MeshLambertMaterial({ color: 0x6B4A14 });
        const coconut = new THREE.Mesh(cGeo, cMat);
        coconut.position.set(topX + rand(-0.4, 0.4), topY - rand(0.2, 0.8), topZ + rand(-0.4, 0.4));
        group.add(coconut);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    colliders.push({ x, z, radius: 0.5 });
}

for (let i = 0; i < 20; i++) {
    const x = rand(40, 80);
    const z = rand(-40, 40);
    const dist = distFromCenter(x, z);
    if (dist < ISLAND_RADIUS + 3 && dist > ISLAND_RADIUS - 25) createPalmTree(x, z);
}


// ----- ROCKS (with collision) -----
function createRock(x, z) {
    const size = rand(0.4, 1.8);
    const group = new THREE.Group();

    // Main rock body - irregular by combining a few shapes
    const mainGeo = new THREE.DodecahedronGeometry(size, 1);
    const grey = new THREE.Color().setHSL(0, 0, rand(0.25, 0.45));
    const mainMat = new THREE.MeshLambertMaterial({ color: grey });
    const main = new THREE.Mesh(mainGeo, mainMat);
    main.scale.set(rand(0.8, 1.2), rand(0.6, 0.9), rand(0.8, 1.2));
    main.rotation.set(rand(0, 1), rand(0, 1), rand(0, 1));
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);

    // Smaller attached rock for detail
    if (size > 0.8) {
        const subGeo = new THREE.DodecahedronGeometry(size * 0.5, 0);
        const subMat = new THREE.MeshLambertMaterial({ color: grey.clone().offsetHSL(0, 0, rand(-0.05, 0.05)) });
        const sub = new THREE.Mesh(subGeo, subMat);
        sub.position.set(rand(-0.3, 0.3) * size, -size * 0.1, rand(-0.3, 0.3) * size);
        sub.rotation.set(rand(0, 2), rand(0, 2), 0);
        group.add(sub);
    }

    group.position.set(x, size * 0.25, z);
    scene.add(group);

    if (size > 0.6) {
        colliders.push({ x, z, radius: size * 0.7 });
    }

    // Spawn stones nearby
    if (Math.random() > 0.5) {
        const stoneAngle = rand(0, Math.PI * 2);
        spawnGroundItem(
            x + Math.cos(stoneAngle) * rand(0.8, 2),
            z + Math.sin(stoneAngle) * rand(0.8, 2),
            'stone'
        );
    }
}

for (let i = 0; i < 45; i++) {
    const x = rand(-70, 70);
    const z = rand(-70, 70);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 3) createRock(x, z);
}


// ----- FLOWERS -----
for (let i = 0; i < 120; i++) {
    const x = rand(-60, 40);
    const z = rand(-60, 60);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15) {
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, rand(0.15, 0.35), 4);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x338833 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(x, 0.1, z);
        scene.add(stem);

        const petalGeo = new THREE.SphereGeometry(0.1, 6, 6);
        const colors = [0xFF6B6B, 0xFFFF6B, 0xFF6BFF, 0xFFFFFF, 0x6B9BFF, 0xFF9B6B];
        const petalMat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(rand(0, colors.length))] });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(x, 0.25, z);
        petal.scale.y = 0.5;
        scene.add(petal);
    }
}

// Tall grass patches
for (let i = 0; i < 200; i++) {
    const x = rand(-65, 35);
    const z = rand(-60, 60);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 10) {
        const h = rand(0.2, 0.6);
        const grassGeo = new THREE.BoxGeometry(0.04, h, 0.04);
        const grassMat = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(rand(0.22, 0.35), rand(0.4, 0.7), rand(0.15, 0.3))
        });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.set(x, h / 2, z);
        grass.rotation.y = rand(0, Math.PI);
        scene.add(grass);
    }
}


// ============================================================
// 4. GROUND ITEMS - Sticks, stones, and loot drops
// ============================================================

function spawnGroundItem(x, z, type) {
    const def = ITEM_DEFS[type];
    if (!def) return;

    const group = new THREE.Group();

    if (type === 'stick') {
        // A small brown cylinder lying on the ground
        const geo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 6);
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6B3D });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.y = 0.05;
        group.add(mesh);
    } else if (type === 'stone') {
        const geo = new THREE.DodecahedronGeometry(0.12, 0);
        const mat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.1;
        group.add(mesh);
    } else if (type === 'meat_raw') {
        // Red-ish lump
        const geo = new THREE.SphereGeometry(0.15, 6, 6);
        const mat = new THREE.MeshLambertMaterial({ color: 0xCC3333 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(1.2, 0.6, 1);
        mesh.position.y = 0.1;
        group.add(mesh);
    } else if (type === 'leather') {
        const geo = new THREE.BoxGeometry(0.3, 0.05, 0.25);
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.05;
        group.add(mesh);
    }

    // Floating glow effect - small light-colored ring
    const glowGeo = new THREE.RingGeometry(0.2, 0.3, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xFFFF88, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
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

// Scatter some extra sticks and stones
for (let i = 0; i < 30; i++) {
    const x = rand(-60, 50);
    const z = rand(-55, 55);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 8) {
        spawnGroundItem(x, z, Math.random() > 0.5 ? 'stick' : 'stone');
    }
}


// ============================================================
// 5. ANIMALS - Much more detailed, with HP
// ============================================================

const ANIMAL_SKIN = {
    deer_body: 0x9B7B4D,
    deer_belly: 0xD4B87A,
    deer_dark: 0x6B4B2D,
    boar_body: 0x4A3520,
    boar_dark: 0x2A1810,
    rabbit_body: 0xBBAA88,
    rabbit_belly: 0xDDCCBB,
};

// ----- DEER (detailed) -----
function createDeer(x, z) {
    const group = new THREE.Group();

    // Body - rounded using stretched sphere
    const bodyGeo = new THREE.SphereGeometry(1, 12, 10);
    const bodyMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_body });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.4, 0.7, 0.6);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Belly (lighter underside)
    const bellyGeo = new THREE.SphereGeometry(0.8, 10, 8);
    const bellyMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_belly });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.scale.set(1.2, 0.4, 0.5);
    belly.position.y = 0.95;
    group.add(belly);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.8, 8);
    const neckMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_body });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.set(1.2, 1.6, 0);
    neck.rotation.z = -0.6;
    group.add(neck);

    // Head - elongated sphere
    const headGeo = new THREE.SphereGeometry(0.25, 10, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_body });
    const head = new THREE.Mesh(headGeo, headMat);
    head.scale.set(1.5, 1, 0.9);
    head.position.set(1.55, 1.95, 0);
    head.castShadow = true;
    group.add(head);

    // Snout - lighter
    const snoutGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const snoutMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_belly });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.scale.set(1.2, 0.8, 0.9);
    snout.position.set(1.82, 1.88, 0);
    group.add(snout);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(1.95, 1.9, 0);
    group.add(nose);

    // Eyes
    for (let side = -1; side <= 1; side += 2) {
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x221100 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(1.65, 2.02, side * 0.18);
        group.add(eye);
        // Eye highlight
        const hlGeo = new THREE.SphereGeometry(0.015, 4, 4);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const hl = new THREE.Mesh(hlGeo, hlMat);
        hl.position.set(1.67, 2.04, side * 0.17);
        group.add(hl);
    }

    // Ears - thin cones
    for (let side = -1; side <= 1; side += 2) {
        const earGeo = new THREE.ConeGeometry(0.08, 0.25, 6);
        const earMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_body });
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(1.45, 2.2, side * 0.2);
        ear.rotation.z = side * 0.4;
        ear.rotation.x = side * 0.2;
        group.add(ear);
        // Inner ear (pink)
        const innerGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
        const innerMat = new THREE.MeshLambertMaterial({ color: 0xDDA0A0 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(1.45, 2.18, side * 0.2);
        inner.rotation.z = side * 0.4;
        group.add(inner);
    }

    // Antlers - branching structure
    for (let side = -1; side <= 1; side += 2) {
        const antlerGroup = new THREE.Group();
        // Main beam
        const beamGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.7, 5);
        const beamMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 0.35;
        antlerGroup.add(beam);
        // Tine 1
        const tine1Geo = new THREE.CylinderGeometry(0.015, 0.025, 0.3, 4);
        const tine1 = new THREE.Mesh(tine1Geo, beamMat);
        tine1.position.set(0, 0.5, 0.08 * side);
        tine1.rotation.z = side * 0.5;
        antlerGroup.add(tine1);
        // Tine 2
        const tine2Geo = new THREE.CylinderGeometry(0.01, 0.02, 0.25, 4);
        const tine2 = new THREE.Mesh(tine2Geo, beamMat);
        tine2.position.set(0, 0.65, -0.05 * side);
        tine2.rotation.z = side * -0.3;
        antlerGroup.add(tine2);

        antlerGroup.position.set(1.45, 2.15, side * 0.15);
        antlerGroup.rotation.z = side * 0.3;
        group.add(antlerGroup);
    }

    // Legs with joints
    const legData = [
        { x: 0.7, z: 0.25 }, { x: 0.7, z: -0.25 },
        { x: -0.7, z: 0.25 }, { x: -0.7, z: -0.25 }
    ];
    const legs = [];
    legData.forEach(pos => {
        const legGroup = new THREE.Group();
        // Upper leg
        const upperGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.55, 6);
        const upperMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_body });
        const upper = new THREE.Mesh(upperGeo, upperMat);
        upper.position.y = -0.28;
        legGroup.add(upper);
        // Lower leg (thinner)
        const lowerGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6);
        const lowerMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.deer_dark });
        const lower = new THREE.Mesh(lowerGeo, lowerMat);
        lower.position.y = -0.75;
        legGroup.add(lower);
        // Hoof
        const hoofGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.06, 6);
        const hoofMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const hoof = new THREE.Mesh(hoofGeo, hoofMat);
        hoof.position.y = -1.02;
        legGroup.add(hoof);

        legGroup.position.set(pos.x, 1.2, pos.z);
        group.add(legGroup);
        legs.push(legGroup);
    });

    // Tail
    const tailGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xEEDDCC });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.scale.set(0.6, 1, 0.6);
    tail.position.set(-1.3, 1.35, 0);
    group.add(tail);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'deer',
        x, z, speed: rand(1.5, 2.5),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(3, 7), walkTimer: 0,
        fleeing: false,
        hp: 60, maxHp: 60,
        loot: [
            { type: 'meat_raw', count: 2 },
            { type: 'leather', count: 2 },
        ],
        hurtTimer: 0,    // Flash red when hit
        dead: false,
        bodyRadius: 1.5,  // For hit detection
    };
}

for (let i = 0; i < 7; i++) {
    const x = rand(-55, 15);
    const z = rand(-50, 50);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15 && distFromCenter(x, z) > 15) {
        animals.push(createDeer(x, z));
    }
}


// ----- RABBITS (detailed) -----
function createRabbit(x, z) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_body });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.3, 0.9, 1.0);
    body.position.y = 0.28;
    body.castShadow = true;
    group.add(body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.15, 8, 6);
    const bellyMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_belly });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.scale.set(1.1, 0.6, 0.9);
    belly.position.y = 0.2;
    group.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.14, 10, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_body });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.22, 0.42, 0);
    group.add(head);

    // Eyes
    for (let side = -1; side <= 1; side += 2) {
        const eyeGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x110000 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0.32, 0.46, side * 0.08);
        group.add(eye);
    }

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.02, 4, 4);
    const noseMat = new THREE.MeshLambertMaterial({ color: 0xFFAAAA });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0.36, 0.42, 0);
    group.add(nose);

    // Ears - tall and rounded
    for (let side = -1; side <= 1; side += 2) {
        const earGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6);
        const earMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_body });
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(0.18, 0.65, side * 0.06);
        ear.rotation.z = side * 0.15;
        group.add(ear);
        // Inner ear (pink)
        const innerGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.2, 4);
        const innerMat = new THREE.MeshLambertMaterial({ color: 0xFFBBBB });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(0.18, 0.63, side * 0.06);
        inner.rotation.z = side * 0.15;
        group.add(inner);
    }

    // Front paws
    for (let side = -1; side <= 1; side += 2) {
        const pawGeo = new THREE.SphereGeometry(0.04, 6, 4);
        const pawMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_belly });
        const paw = new THREE.Mesh(pawGeo, pawMat);
        paw.scale.y = 0.6;
        paw.position.set(0.15, 0.08, side * 0.1);
        group.add(paw);
    }

    // Back legs (bigger)
    const legs = [];
    for (let side = -1; side <= 1; side += 2) {
        const legGeo = new THREE.SphereGeometry(0.07, 8, 6);
        const legMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.rabbit_body });
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.scale.set(0.8, 1.2, 1);
        leg.position.set(-0.12, 0.15, side * 0.12);
        group.add(leg);
        legs.push(leg);
    }

    // Fluffy tail
    const tailGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xFFFFEE });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(-0.28, 0.3, 0);
    group.add(tail);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'rabbit',
        x, z, speed: rand(3, 5),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(1, 3), hopTimer: 0,
        fleeing: false,
        hp: 15, maxHp: 15,
        loot: [{ type: 'meat_raw', count: 1 }],
        hurtTimer: 0, dead: false,
        bodyRadius: 0.6,
    };
}

for (let i = 0; i < 10; i++) {
    const x = rand(-60, 30);
    const z = rand(-55, 55);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 10 && distFromCenter(x, z) > 8) {
        animals.push(createRabbit(x, z));
    }
}


// ----- BOARS (detailed) -----
function createBoar(x, z) {
    const group = new THREE.Group();

    // Body - stocky
    const bodyGeo = new THREE.SphereGeometry(0.7, 12, 10);
    const bodyMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_body });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.5, 0.9, 1.0);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Coarse hair ridge on back
    for (let i = 0; i < 6; i++) {
        const hairGeo = new THREE.BoxGeometry(0.03, 0.12, 0.06);
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x1A0A00 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.set(-0.3 + i * 0.15, 1.2, 0);
        group.add(hair);
    }

    // Head - big blocky
    const headGeo = new THREE.SphereGeometry(0.35, 10, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_body });
    const head = new THREE.Mesh(headGeo, headMat);
    head.scale.set(1.2, 1, 0.9);
    head.position.set(0.9, 0.8, 0);
    group.add(head);

    // Snout - flat disc shape
    const snoutGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.12, 8);
    const snoutMat = new THREE.MeshLambertMaterial({ color: 0x6B4530 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(1.2, 0.75, 0);
    snout.rotation.z = Math.PI / 2;
    group.add(snout);

    // Nostrils
    for (let side = -1; side <= 1; side += 2) {
        const nGeo = new THREE.SphereGeometry(0.03, 4, 4);
        const nMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const nostril = new THREE.Mesh(nGeo, nMat);
        nostril.position.set(1.27, 0.76, side * 0.06);
        group.add(nostril);
    }

    // Eyes - small, mean
    for (let side = -1; side <= 1; side += 2) {
        const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x331100 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(1.05, 0.92, side * 0.22);
        group.add(eye);
    }

    // Tusks
    for (let side = -1; side <= 1; side += 2) {
        const tuskGeo = new THREE.ConeGeometry(0.025, 0.2, 5);
        const tuskMat = new THREE.MeshLambertMaterial({ color: 0xEEEECC });
        const tusk = new THREE.Mesh(tuskGeo, tuskMat);
        tusk.position.set(1.15, 0.6, side * 0.18);
        tusk.rotation.z = 0.4;
        tusk.rotation.x = side * 0.3;
        group.add(tusk);
    }

    // Ears
    for (let side = -1; side <= 1; side += 2) {
        const earGeo = new THREE.ConeGeometry(0.07, 0.15, 5);
        const earMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_dark });
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(0.8, 1.1, side * 0.25);
        ear.rotation.z = side * 0.5;
        group.add(ear);
    }

    // Legs
    const legPos = [[0.45, 0.25], [0.45, -0.25], [-0.45, 0.25], [-0.45, -0.25]];
    const legs = [];
    legPos.forEach(([lx, lz]) => {
        const legGroup = new THREE.Group();
        const upperGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6);
        const upperMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_body });
        const upper = new THREE.Mesh(upperGeo, upperMat);
        upper.position.y = -0.2;
        legGroup.add(upper);
        const lowerGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6);
        const lowerMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_dark });
        const lower = new THREE.Mesh(lowerGeo, lowerMat);
        lower.position.y = -0.5;
        legGroup.add(lower);
        const hoofGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.04, 6);
        const hoofMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const hoof = new THREE.Mesh(hoofGeo, hoofMat);
        hoof.position.y = -0.65;
        legGroup.add(hoof);
        legGroup.position.set(lx, 0.75, lz);
        group.add(legGroup);
        legs.push(legGroup);
    });

    // Curly tail
    const ctGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 8, Math.PI * 1.5);
    const ctMat = new THREE.MeshLambertMaterial({ color: ANIMAL_SKIN.boar_body });
    const cTail = new THREE.Mesh(ctGeo, ctMat);
    cTail.position.set(-0.95, 0.85, 0);
    cTail.rotation.y = Math.PI / 2;
    group.add(cTail);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group, legs, type: 'boar',
        x, z, speed: rand(1, 2),
        direction: rand(0, Math.PI * 2),
        turnTimer: rand(3, 8), walkTimer: 0,
        fleeing: false,
        hp: 80, maxHp: 80,
        loot: [
            { type: 'meat_raw', count: 3 },
            { type: 'leather', count: 1 },
        ],
        hurtTimer: 0, dead: false,
        bodyRadius: 1.2,
    };
}

for (let i = 0; i < 5; i++) {
    const x = rand(-50, 25);
    const z = rand(-45, 45);
    if (distFromCenter(x, z) < ISLAND_RADIUS - 15 && distFromCenter(x, z) > 12) {
        animals.push(createBoar(x, z));
    }
}


// ----- SEAGULLS -----
function createSeagull(x, z) {
    const group = new THREE.Group();

    const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.6, 0.7, 0.8);
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.3, 0.08, 0);
    group.add(head);

    // Eyes
    for (let side = -1; side <= 1; side += 2) {
        const eGeo = new THREE.SphereGeometry(0.02, 4, 4);
        const eMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const eye = new THREE.Mesh(eGeo, eMat);
        eye.position.set(0.36, 0.1, side * 0.06);
        group.add(eye);
    }

    const beakGeo = new THREE.ConeGeometry(0.03, 0.15, 5);
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xFF8800 });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0.42, 0.05, 0);
    beak.rotation.z = -Math.PI / 2;
    group.add(beak);

    // Tail feathers
    const tailGeo = new THREE.BoxGeometry(0.15, 0.02, 0.12);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(-0.35, 0.02, 0);
    group.add(tail);

    const wings = [];
    for (let side = -1; side <= 1; side += 2) {
        const wingGroup = new THREE.Group();
        // Inner wing
        const w1Geo = new THREE.BoxGeometry(0.05, 0.02, 0.5);
        const w1Mat = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
        const w1 = new THREE.Mesh(w1Geo, w1Mat);
        w1.position.z = 0.25 * side;
        wingGroup.add(w1);
        // Outer wing (darker tips)
        const w2Geo = new THREE.BoxGeometry(0.04, 0.02, 0.35);
        const w2Mat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const w2 = new THREE.Mesh(w2Geo, w2Mat);
        w2.position.z = 0.6 * side;
        wingGroup.add(w2);
        group.add(wingGroup);
        wings.push(wingGroup);
    }

    const flyHeight = rand(15, 30);
    group.position.set(x, flyHeight, z);
    scene.add(group);

    return {
        mesh: group, wings, type: 'seagull',
        x, z, centerX: x, centerZ: z,
        circleRadius: rand(8, 20), circleSpeed: rand(0.3, 0.7),
        circleAngle: rand(0, Math.PI * 2), flyHeight, flapTime: 0,
        hp: 999, maxHp: 999, dead: false, bodyRadius: 0, loot: [],
        hurtTimer: 0,
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

        // Hurt flash
        if (a.hurtTimer > 0) {
            a.hurtTimer -= dt;
            // Flash red by toggling visibility rapidly
            a.mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive = child.material.emissive || new THREE.Color();
                    child.material.emissive.setRGB(
                        a.hurtTimer > 0 ? Math.sin(a.hurtTimer * 30) * 0.5 + 0.5 : 0, 0, 0
                    );
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

        // Ground animal AI
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
        const newX = a.x + Math.sin(a.direction) * speed * dt;
        const newZ = a.z + Math.cos(a.direction) * speed * dt;

        // Keep on island
        if (distFromCenter(newX, newZ) < ISLAND_RADIUS - 5) {
            a.x = newX;
            a.z = newZ;
        } else {
            a.direction = Math.atan2(-a.x, -a.z);
        }

        a.mesh.position.x = a.x;
        a.mesh.position.z = a.z;
        a.mesh.rotation.y = a.direction;

        // Leg animation
        if (a.legs && (a.fleeing || speed > 0.5)) {
            a.walkTimer += dt * speed * 2;
            a.legs.forEach((leg, idx) => {
                const offset = idx < 2 ? 0 : Math.PI;
                leg.rotation.x = Math.sin(a.walkTimer + offset) * 0.5 * (a.fleeing ? 1.5 : 1);
            });
        }

        // Rabbit hop
        if (a.type === 'rabbit') {
            a.hopTimer += dt * speed * 1.5;
            a.mesh.position.y = Math.abs(Math.sin(a.hopTimer)) * 0.25;
        }
    }
}


// ============================================================
// 6. INVENTORY SYSTEM
// ============================================================

// 8 hotbar slots
const HOTBAR_SIZE = 8;
const inventory = [];  // Array of { type, count } or null
for (let i = 0; i < HOTBAR_SIZE; i++) inventory.push(null);

let selectedSlot = 0;

// Add item to inventory. Returns true if successful.
function addToInventory(type, count = 1) {
    const def = ITEM_DEFS[type];
    if (!def) return false;

    // First try to stack with existing
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        if (inventory[i] && inventory[i].type === type && inventory[i].count < def.stackMax) {
            const canAdd = Math.min(count, def.stackMax - inventory[i].count);
            inventory[i].count += canAdd;
            count -= canAdd;
            if (count <= 0) { renderInventory(); return true; }
        }
    }
    // Then find empty slot
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        if (!inventory[i]) {
            const canAdd = Math.min(count, def.stackMax);
            inventory[i] = { type, count: canAdd };
            count -= canAdd;
            if (count <= 0) { renderInventory(); return true; }
        }
    }
    renderInventory();
    return count <= 0;  // False if couldn't fit everything
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
    for (const slot of inventory) {
        if (slot && slot.type === type) total += slot.count;
    }
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

// Render the hotbar UI
function renderInventory() {
    const bar = document.getElementById('inventory-bar');
    bar.innerHTML = '';
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot' + (i === selectedSlot ? ' selected' : '');

        // Key number
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

            // Tooltip on hover
            slot.title = def.name + (def.damage ? ` (DMG: ${def.damage})` : '')
                + (def.food ? ` (Heals: ${def.healAmount})` : '');
        }

        slot.addEventListener('click', () => {
            selectedSlot = i;
            renderInventory();
        });
        bar.appendChild(slot);
    }
}
renderInventory();

// Hotbar key selection (1-8)
document.addEventListener('keydown', (e) => {
    if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        selectedSlot = parseInt(e.code.charAt(5)) - 1;
        renderInventory();
    }
});


// ============================================================
// 7. CRAFTING SYSTEM
// ============================================================

const RECIPES = [
    {
        result: 'stone_axe', resultCount: 1,
        ingredients: [{ type: 'stick', count: 3 }, { type: 'stone', count: 2 }],
        name: 'Stone Axe', icon: 'T', desc: 'A basic axe. Deals 20 damage.',
    },
    {
        result: 'stone_spear', resultCount: 1,
        ingredients: [{ type: 'stick', count: 4 }, { type: 'stone', count: 1 }],
        name: 'Stone Spear', icon: '|', desc: 'A sharp spear. Deals 30 damage.',
    },
    {
        result: 'leather_wrap', resultCount: 1,
        ingredients: [{ type: 'leather', count: 3 }],
        name: 'Leather Wrap', icon: 'W', desc: 'Basic armor. +5 protection.',
    },
    {
        result: 'campfire', resultCount: 1,
        ingredients: [{ type: 'stick', count: 5 }, { type: 'stone', count: 3 }],
        name: 'Campfire', icon: 'F', desc: 'A warm fire. (Decorative for now)',
    },
];

let craftMenuOpen = false;

function renderCraftMenu() {
    const container = document.getElementById('craft-recipes');
    container.innerHTML = '';

    RECIPES.forEach((recipe, idx) => {
        const canCraft = recipe.ingredients.every(ing => hasItem(ing.type, ing.count));
        const div = document.createElement('div');
        div.className = 'craft-recipe' + (canCraft ? '' : ' cant-craft');

        const costStr = recipe.ingredients.map(ing => {
            const def = ITEM_DEFS[ing.type];
            return `${ing.count}x ${def.name}`;
        }).join(' + ');

        div.innerHTML = `
            <span class="recipe-icon">${recipe.icon}</span>
            <div>
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-cost">${costStr}</div>
                <div style="font-size:10px; color:#888;">${recipe.desc}</div>
            </div>
        `;

        if (canCraft) {
            div.addEventListener('click', () => {
                // Consume ingredients
                recipe.ingredients.forEach(ing => consumeItems(ing.type, ing.count));
                // Give result
                addToInventory(recipe.result, recipe.resultCount);
                renderCraftMenu();  // Refresh
            });
        }

        container.appendChild(div);
    });
}

// Toggle crafting menu with TAB
document.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
        e.preventDefault();
        craftMenuOpen = !craftMenuOpen;
        document.getElementById('craft-menu').style.display = craftMenuOpen ? 'block' : 'none';
        if (craftMenuOpen) {
            renderCraftMenu();
            document.exitPointerLock();
        } else {
            renderer.domElement.requestPointerLock();
        }
    }
});


// ============================================================
// 8. FIRST PERSON HANDS
// ============================================================

const SKIN_COLOR = 0xD4A574;
const SKIN_DARK = 0xC49564;

const handsGroup = new THREE.Group();
camera.add(handsGroup);
scene.add(camera);

// ----- LEFT HAND -----
const leftHand = new THREE.Group();
const lArmGeo = new THREE.BoxGeometry(0.08, 0.08, 0.5);
const lArmMat = new THREE.MeshLambertMaterial({ color: SKIN_COLOR });
const lArm = new THREE.Mesh(lArmGeo, lArmMat);
lArm.position.set(0, -0.05, -0.15);
leftHand.add(lArm);

const lFistGeo = new THREE.BoxGeometry(0.1, 0.12, 0.12);
const lFistMat = new THREE.MeshLambertMaterial({ color: SKIN_COLOR });
const lFist = new THREE.Mesh(lFistGeo, lFistMat);
lFist.position.set(0, -0.02, -0.42);
leftHand.add(lFist);

for (let i = 0; i < 4; i++) {
    const fGeo = new THREE.BoxGeometry(0.02, 0.04, 0.06);
    const fMat = new THREE.MeshLambertMaterial({ color: SKIN_DARK });
    const finger = new THREE.Mesh(fGeo, fMat);
    finger.position.set(-0.03 + i * 0.02, -0.08, -0.42);
    leftHand.add(finger);
}
const lThumbGeo = new THREE.BoxGeometry(0.04, 0.04, 0.06);
const lThumb = new THREE.Mesh(lThumbGeo, new THREE.MeshLambertMaterial({ color: SKIN_COLOR }));
lThumb.position.set(0.06, -0.03, -0.4);
lThumb.rotation.z = 0.3;
leftHand.add(lThumb);

leftHand.position.set(-0.35, -0.25, -0.4);
handsGroup.add(leftHand);

// ----- RIGHT HAND -----
const rightHand = new THREE.Group();
const rArmGeo = new THREE.BoxGeometry(0.08, 0.08, 0.5);
const rArm = new THREE.Mesh(rArmGeo, new THREE.MeshLambertMaterial({ color: SKIN_COLOR }));
rArm.position.set(0, -0.05, -0.15);
rightHand.add(rArm);

const rFistGeo = new THREE.BoxGeometry(0.1, 0.12, 0.12);
const rFist = new THREE.Mesh(rFistGeo, new THREE.MeshLambertMaterial({ color: SKIN_COLOR }));
rFist.position.set(0, -0.02, -0.42);
rightHand.add(rFist);

for (let i = 0; i < 4; i++) {
    const fGeo = new THREE.BoxGeometry(0.02, 0.04, 0.06);
    const finger = new THREE.Mesh(fGeo, new THREE.MeshLambertMaterial({ color: SKIN_DARK }));
    finger.position.set(-0.03 + i * 0.02, -0.08, -0.42);
    rightHand.add(finger);
}
const rThumb = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.04, 0.06),
    new THREE.MeshLambertMaterial({ color: SKIN_COLOR })
);
rThumb.position.set(-0.06, -0.03, -0.4);
rThumb.rotation.z = -0.3;
rightHand.add(rThumb);

// Middle finger mesh (hidden by default)
const middleFinger = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.12, 0.025),
    new THREE.MeshLambertMaterial({ color: SKIN_COLOR })
);
middleFinger.position.set(0.005, 0.04, -0.42);
middleFinger.visible = false;
rightHand.add(middleFinger);

rightHand.position.set(0.35, -0.25, -0.4);
handsGroup.add(rightHand);

// ----- HAND ANIMATIONS -----
const handAnim = {
    bobTime: 0,
    punching: false, punchHand: 'left', punchProgress: 0, punchSpeed: 8,
    flipping: false, flipProgress: 0, flipDuration: 2.0, flipTimer: 0,
};

// Punch on left click
document.addEventListener('mousedown', (e) => {
    if (!mouseLocked || !player.alive || craftMenuOpen) return;
    if (e.button === 0 && !handAnim.punching && !handAnim.flipping) {
        handAnim.punching = true;
        handAnim.punchProgress = 0;
        handAnim.punchHand = handAnim.punchHand === 'left' ? 'right' : 'left';

        // Try to hit an animal
        tryHitAnimal();
    }
});

// Middle finger on X
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyX' && !handAnim.flipping && !handAnim.punching && player.alive) {
        handAnim.flipping = true;
        handAnim.flipTimer = 0;
    }
});

function updateHands(dt) {
    const isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
    const bobSpeed = isMoving ? (keys['ShiftLeft'] ? 12 : 8) : 2;
    const bobAmount = isMoving ? (keys['ShiftLeft'] ? 0.04 : 0.025) : 0.008;
    handAnim.bobTime += dt * bobSpeed;

    let lx = -0.35, ly = -0.25 + Math.sin(handAnim.bobTime) * bobAmount, lz = -0.4, lrx = 0;
    let rx = 0.35, ry = -0.25 + Math.sin(handAnim.bobTime + Math.PI) * bobAmount, rz = -0.4, rrx = 0;

    // Punch
    if (handAnim.punching) {
        handAnim.punchProgress += dt * handAnim.punchSpeed;
        const p = handAnim.punchProgress;
        let pf = 0, pu = 0;
        if (p < 0.3) { pf = (p / 0.3) * 0.1; pu = (p / 0.3) * 0.05; }
        else if (p < 0.6) { const t = (p - 0.3) / 0.3; pf = 0.1 - t * 0.5; pu = 0.05 + t * 0.1; }
        else if (p < 1.0) { const t = (p - 0.6) / 0.4; pf = -0.4 + t * 0.4; pu = 0.15 - t * 0.15; }
        else { handAnim.punching = false; }

        if (handAnim.punchHand === 'left') { lz += pf; ly += pu; lx += 0.15; lrx = pf * 2; }
        else { rz += pf; ry += pu; rx -= 0.15; rrx = pf * 2; }
    }

    // Middle finger
    if (handAnim.flipping) {
        handAnim.flipTimer += dt;
        if (handAnim.flipTimer < 0.3) {
            const t = handAnim.flipTimer / 0.3;
            rx = 0.35 - t * 0.35; ry = -0.25 + t * 0.15; rz = -0.4 - t * 0.15;
            middleFinger.visible = true;
            middleFinger.scale.y = t;
        } else if (handAnim.flipTimer < 0.3 + handAnim.flipDuration) {
            rx = 0; ry = -0.1; rz = -0.55;
            middleFinger.visible = true; middleFinger.scale.y = 1;
            rx += Math.sin(handAnim.flipTimer * 3) * 0.02;
        } else if (handAnim.flipTimer < 0.3 + handAnim.flipDuration + 0.3) {
            const t = (handAnim.flipTimer - 0.3 - handAnim.flipDuration) / 0.3;
            rx = t * 0.35; ry = -0.1 - t * 0.15; rz = -0.55 + t * 0.15;
            middleFinger.visible = true; middleFinger.scale.y = 1 - t;
        } else {
            handAnim.flipping = false; middleFinger.visible = false;
        }
    }

    const ls = 12;
    leftHand.position.x += (lx - leftHand.position.x) * ls * dt;
    leftHand.position.y += (ly - leftHand.position.y) * ls * dt;
    leftHand.position.z += (lz - leftHand.position.z) * ls * dt;
    leftHand.rotation.x += (lrx - leftHand.rotation.x) * ls * dt;
    rightHand.position.x += (rx - rightHand.position.x) * ls * dt;
    rightHand.position.y += (ry - rightHand.position.y) * ls * dt;
    rightHand.position.z += (rz - rightHand.position.z) * ls * dt;
    rightHand.rotation.x += (rrx - rightHand.rotation.x) * ls * dt;
}


// ============================================================
// 9. COMBAT - Hitting animals, loot drops
// ============================================================

function getPlayerDamage() {
    // Check if holding a weapon
    const held = inventory[selectedSlot];
    if (held) {
        const def = ITEM_DEFS[held.type];
        if (def && def.damage) return def.damage;
    }
    return 8;  // Bare hands damage
}

function tryHitAnimal() {
    // Check all animals in range and in front of the player
    const reach = 3.5;
    const lookX = -Math.sin(player.yaw);
    const lookZ = -Math.cos(player.yaw);

    let closestAnimal = null;
    let closestDist = reach;

    for (const a of animals) {
        if (a.dead || a.type === 'seagull') continue;

        const dx = a.x - player.x;
        const dz = a.z - player.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > reach + a.bodyRadius) continue;

        // Check if animal is roughly in front of player (dot product)
        const ndx = dx / dist, ndz = dz / dist;
        const dot = ndx * lookX + ndz * lookZ;
        if (dot < 0.3) continue;  // Must be somewhat in front

        if (dist < closestDist + a.bodyRadius) {
            closestDist = dist;
            closestAnimal = a;
        }
    }

    if (closestAnimal) {
        damageAnimal(closestAnimal, getPlayerDamage());
    }
}

function damageAnimal(animal, damage) {
    animal.hp -= damage;
    animal.hurtTimer = 0.4;  // Flash red for 0.4 seconds
    animal.fleeing = true;
    animal.direction = Math.atan2(animal.x - player.x, animal.z - player.z);

    if (animal.hp <= 0) {
        killAnimal(animal);
    }
}

function killAnimal(animal) {
    animal.dead = true;

    // Drop loot at animal's position
    animal.loot.forEach(lootItem => {
        for (let i = 0; i < lootItem.count; i++) {
            const offset = rand(-1, 1);
            spawnGroundItem(
                animal.x + offset,
                animal.z + rand(-1, 1),
                lootItem.type
            );
        }
    });

    // Remove animal mesh
    scene.remove(animal.mesh);
}


// ============================================================
// 10. DAY/NIGHT CYCLE (slower)
// ============================================================

const dayNight = {
    time: 0.3,           // Start at morning
    speed: 0.003,        // Much slower - about 5.5 minutes per full day
    dayColor: new THREE.Color(0x87CEEB),
    nightColor: new THREE.Color(0x0A0A2E),
    sunsetColor: new THREE.Color(0xFF6633),
};

function updateDayNight(dt) {
    dayNight.time = (dayNight.time + dt * dayNight.speed) % 1.0;
    const t = dayNight.time;
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    const sunHorizontal = Math.cos(sunAngle);

    sunSphere.position.set(sunHorizontal * 150, sunHeight * 150, 50);
    sunLight.position.set(sunHorizontal * 50, Math.max(sunHeight * 80, 1), 30);
    moonSphere.position.set(-sunHorizontal * 120, -sunHeight * 120, -30);
    moonLight.position.set(-sunHorizontal * 50, Math.max(-sunHeight * 60, 1), -30);

    sunSphere.visible = sunHeight > -0.1;
    moonSphere.visible = sunHeight < 0.1;

    let skyColor;
    if (sunHeight > 0.2) skyColor = dayNight.dayColor.clone();
    else if (sunHeight > 0) skyColor = dayNight.sunsetColor.clone().lerp(dayNight.dayColor, sunHeight / 0.2);
    else if (sunHeight > -0.2) skyColor = dayNight.nightColor.clone().lerp(dayNight.sunsetColor, (sunHeight + 0.2) / 0.2);
    else skyColor = dayNight.nightColor.clone();

    scene.background = skyColor;
    scene.fog.color = skyColor;

    sunLight.intensity = Math.max(0, sunHeight) * 1.2;
    ambientLight.intensity = 0.1 + Math.max(0, sunHeight) * 0.4;
    hemiLight.intensity = 0.05 + Math.max(0, sunHeight) * 0.3;
    moonLight.intensity = Math.max(0, -sunHeight) * 0.3;
    starsGroup.visible = sunHeight < 0;

    if (sunHeight > 0 && sunHeight < 0.3) {
        const o = 1 - sunHeight / 0.3;
        sunSphereMat.color.setRGB(1, 0.8 + o * 0.1, 0.3 + (1 - o) * 0.7);
    } else {
        sunSphereMat.color.set(0xFFDD44);
    }

    if (sunHeight > 0) {
        waterMat.color.set(0x1A6B8A);
    } else {
        const nb = Math.min(1, -sunHeight * 3);
        waterMat.color.setRGB(0.1 * (1 - nb * 0.5), 0.42 * (1 - nb * 0.5), 0.54 * (1 - nb * 0.3));
    }
}

function getTimeString() {
    const t = dayNight.time;
    const hours = Math.floor(t * 24);
    const minutes = Math.floor((t * 24 - hours) * 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    let period;
    if (t > 0.2 && t < 0.35) period = 'Dawn';
    else if (t > 0.35 && t < 0.7) period = 'Day';
    else if (t > 0.7 && t < 0.85) period = 'Dusk';
    else period = 'Night';
    return `${timeStr} ${period}`;
}


// ============================================================
// 11. PLAYER - Movement, collision, HP, hunger
// ============================================================

const player = {
    x: 0, z: 0, y: 1.65,
    yaw: 0, pitch: 0,
    speed: 8, sprintSpeed: 14,
    alive: true, inWater: false,
    hp: 100, maxHp: 100,
    hunger: 100, maxHunger: 100,
};

const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

let mouseLocked = false;

document.addEventListener('mousemove', (e) => {
    if (!mouseLocked || !player.alive) return;
    const sens = 0.002;
    player.yaw -= e.movementX * sens;
    player.pitch -= e.movementY * sens;
    player.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, player.pitch));
});

document.addEventListener('click', () => {
    const ss = document.getElementById('start-screen');
    if (ss.style.display !== 'none') {
        ss.style.display = 'none';
        renderer.domElement.requestPointerLock();
        return;
    }
    if (!player.alive) { respawnPlayer(); return; }
    if (!craftMenuOpen) renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === renderer.domElement;
});

// Pick up items with E
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE' && player.alive) tryPickup();
});

// Eat food with F
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyF' && player.alive) tryEat();
});

function tryPickup() {
    const pickupRange = 3;
    let closestItem = null;
    let closestDist = pickupRange;

    for (let i = groundItems.length - 1; i >= 0; i--) {
        const item = groundItems[i];
        const dist = distXZ(player.x, player.z, item.x, item.z);
        if (dist < closestDist) {
            closestDist = dist;
            closestItem = i;
        }
    }

    if (closestItem !== null) {
        const item = groundItems[closestItem];
        if (addToInventory(item.type)) {
            scene.remove(item.mesh);
            groundItems.splice(closestItem, 1);
        }
    }
}

function tryEat() {
    const held = inventory[selectedSlot];
    if (!held) return;
    const def = ITEM_DEFS[held.type];
    if (!def || !def.food) return;

    // Heal player
    player.hp = Math.min(player.maxHp, player.hp + def.healAmount);
    player.hunger = Math.min(player.maxHunger, player.hunger + 25);
    removeFromInventory(selectedSlot, 1);
    updateHealthBars();
}

// Collision-aware movement
function updatePlayer(dt) {
    if (!player.alive) return;

    const speed = keys['ShiftLeft'] ? player.sprintSpeed : player.speed;
    const forwardX = -Math.sin(player.yaw);
    const forwardZ = -Math.cos(player.yaw);
    const rightX = Math.cos(player.yaw);
    const rightZ = -Math.sin(player.yaw);

    let moveX = 0, moveZ = 0;
    if (keys['KeyW']) { moveX += forwardX; moveZ += forwardZ; }
    if (keys['KeyS']) { moveX -= forwardX; moveZ -= forwardZ; }
    if (keys['KeyA']) { moveX -= rightX;   moveZ -= rightZ; }
    if (keys['KeyD']) { moveX += rightX;   moveZ += rightZ; }

    const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLen > 0) {
        moveX = (moveX / moveLen) * speed * dt;
        moveZ = (moveZ / moveLen) * speed * dt;
    }

    // Apply collision detection
    let newX = player.x + moveX;
    let newZ = player.z + moveZ;
    const PLAYER_RADIUS = 0.4;

    // Check against all colliders
    for (const col of colliders) {
        const dx = newX - col.x;
        const dz = newZ - col.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = PLAYER_RADIUS + col.radius;

        if (dist < minDist && dist > 0.001) {
            // Push player out of the collision
            const pushX = (dx / dist) * (minDist - dist);
            const pushZ = (dz / dist) * (minDist - dist);
            newX += pushX;
            newZ += pushZ;
        }
    }

    player.x = newX;
    player.z = newZ;

    const distFromIsland = distFromCenter(player.x, player.z);
    player.inWater = distFromIsland > ISLAND_RADIUS;
    player.y = player.inWater ? 0.9 : 1.65;

    if (distFromIsland > ISLAND_RADIUS + 25) {
        killPlayer('You swam too far from the island...');
    }

    // Hunger drains slowly over time
    player.hunger -= dt * 0.4;  // Lose ~24 hunger per minute
    if (player.hunger <= 0) {
        player.hunger = 0;
        // Starving: lose HP
        player.hp -= dt * 5;
        if (player.hp <= 0) {
            player.hp = 0;
            killPlayer('You starved to death...');
        }
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
    player.hp = player.maxHp;
    player.hunger = player.maxHunger;
    document.getElementById('death-screen').style.display = 'none';
    renderer.domElement.requestPointerLock();
    updateHealthBars();
}

function updateHealthBars() {
    document.getElementById('health-bar').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('hunger-bar').style.width = (player.hunger / player.maxHunger * 100) + '%';
}
updateHealthBars();


// ----- HUD UPDATE -----

function updateHUD() {
    const hud = document.getElementById('hud');
    const prompt = document.getElementById('interact-prompt');

    // Check for nearby pickup
    let nearItem = false;
    for (const item of groundItems) {
        if (distXZ(player.x, player.z, item.x, item.z) < 3) {
            const def = ITEM_DEFS[item.type];
            prompt.textContent = `[E] Pick up ${def.name}`;
            prompt.style.display = 'block';
            nearItem = true;
            break;
        }
    }
    if (!nearItem) prompt.style.display = 'none';

    // Weapon info
    const held = inventory[selectedSlot];
    let heldName = 'Bare Hands';
    if (held) heldName = ITEM_DEFS[held.type].name;

    if (player.inWater) {
        hud.textContent = '!! SWIMMING - Turn back! !!';
        hud.style.color = '#FF4444';
    } else {
        hud.textContent = `Island Survival | ${heldName} | ${getTimeString()}`;
        hud.style.color = 'white';
    }

    updateHealthBars();
}

// Ground item bob animation
function updateGroundItems(dt) {
    for (const item of groundItems) {
        item.bobTime += dt * 2;
        item.mesh.position.y = 0.05 + Math.sin(item.bobTime) * 0.08;
        item.glow.material.opacity = 0.2 + Math.sin(item.bobTime * 1.5) * 0.15;
    }
}

// Damage flash
let damageFlashTimer = 0;
function flashDamage() {
    damageFlashTimer = 0.2;
    document.getElementById('damage-flash').style.background = 'rgba(255,0,0,0.3)';
}
function updateDamageFlash(dt) {
    if (damageFlashTimer > 0) {
        damageFlashTimer -= dt;
        if (damageFlashTimer <= 0) {
            document.getElementById('damage-flash').style.background = 'rgba(255,0,0,0)';
        }
    }
}


// ============================================================
// 12. GAME LOOP
// ============================================================

let lastTime = performance.now();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    waterTime += dt;

    updatePlayer(dt);
    updateHands(dt);
    updateAnimals(dt);
    updateDayNight(dt);
    updateGroundItems(dt);
    updateDamageFlash(dt);
    updateHUD();

    water.position.y = -0.3 + Math.sin(waterTime * 0.5) * 0.15;

    renderer.render(scene, camera);
}

gameLoop();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
