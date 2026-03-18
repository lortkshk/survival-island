# Island Survival

A 3D survival game built with Three.js. Explore an island, hunt animals, craft tools, and fish to survive.

## How to Play

**You need a local web server to run this game** (opening `index.html` directly won't work because the browser blocks loading 3D model files from `file://`).

### Quick Start

1. Open a terminal in the project folder
2. Run:
   ```
   python3 -m http.server 8000
   ```
3. Open your browser and go to **http://localhost:8000**

### Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look around |
| Shift | Sprint |
| Space | Jump |
| Left Click | Attack / Fish |
| E | Pick up items |
| F | Eat food |
| TAB | Crafting menu |
| ESC | Settings menu |
| 1-8 | Select hotbar slot |

### Features

- Procedural island with trees, rocks, bushes, and flowers
- Day/night cycle with dynamic lighting
- Animals: deer (3D model), boars, rabbits, spiders, seagulls
- Crafting system: axe, spear, bow, arrows, fishing rod, campfire
- Fishing mechanic: equip rod, go to water, click to cast, click to reel in
- Bow with draw-and-release mechanic
- Settings menu with mouse sensitivity, time control, and FPS counter
- Post-processing: bloom and tone mapping

### Credits

- Stag model: [Quaternius](https://quaternius.com/) (CC0 Public Domain)
