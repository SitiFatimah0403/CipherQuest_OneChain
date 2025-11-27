// src/assets.js
// 🔐 CipherQuest asset loader — supports embedded & external tilesets safely

export function loadAllAssets(scene) {


  // UI badge icons (small ones used inside the Start.js profile slots)
  scene.load.image("badge_100_coins", "assets/ui/badge_100_coins.png");
  scene.load.image("badge_puzzle_solver", "assets/ui/badge_puzzle_solver.png");

  // Locked badge
  scene.load.image("badge_locked", "assets/ui/badge_locked.png");


  // --- 🗺️ Load Map JSON (contains embedded tilesets) ---
  scene.load.tilemapTiledJSON('level1', 'assets/Map 1.json');

  // --- 🧍 PLAYER SPRITESHEET ---
  scene.load.spritesheet('player', 'assets/Blue Knight run Sprite-sheet 16x17.png', {
    frameWidth: 16,
    frameHeight: 17
  });

  // --- 🪙 COINS ---
  scene.load.spritesheet('coin', 'assets/BlueCoin Sheet.png', {
    frameWidth: 16,
    frameHeight: 16
  });

  // --- 🧪 POTIONS ---
  scene.load.spritesheet('potions', 'assets/Potions.png', {
    frameWidth: 16,
    frameHeight: 16
  });

  // --- 👾 ENEMIES ---
  scene.load.spritesheet('dungeonEnemies', 'assets/0x72_DungeonTilesetII_v1.7.png', {
    frameWidth: 16,
    frameHeight: 16
  });

  // --- 💖 HUD / UI ---
  scene.load.image('heart', 'assets/Hearts Blue.png');
  scene.load.image('button', 'assets/Basic Buttons 3 Fv.png');


  // --- 💖 Puzzle ---
  scene.load.spritesheet('Random Icons', 'assets/Random Icons.png', {
  frameWidth: 16,  
  frameHeight: 16
});




  // --- 🧱 PRELOAD COMMON TILESET IMAGES (manual fallback) ---
  const coreTilesets = [
    'atlas_walls_low-16x16',
    'atlas_walls_high-16x32',
    'atlas_floor-16x16',
    'Barrier',
    'Maple Tree',
    'Walls',
    'Water',
    'floor',
    'Full Set',
    'Waterfall',
    'Random Icons',
    'Potions',
    'BlueCoin Sheet',
    '0x72_DungeonTilesetII_v1.7',
    'Road copiar',
    'Torch L',
    'Torch R',
    'Basic Buttons 3 Fv',
    'decorative',
    'Hearts Blue'
  ];

  coreTilesets.forEach(name => {
    const path = `assets/${name}.png`;
    scene.load.image(name, path);
  });

  // --- 🧠 SMART AUTO-LOADER FOR TILED TILESETS ---
  scene.load.once('complete', () => {
    const mapData = scene.cache.tilemap.get('level1')?.data;

    if (mapData?.tilesets?.length) {
      console.group('🧩 Auto-loading map tilesets from JSON');
      mapData.tilesets.forEach(ts => {
        if (ts.image && ts.name) {
          const path = `assets/${ts.image}`;
          if (!scene.textures.exists(ts.name)) {
            console.log(`📦 Auto-loading: ${ts.name} → ${path}`);
            scene.load.image(ts.name, path);
          }
        }
      });
      console.groupEnd();
      // Restart the loader if new images were queued
      scene.load.start();
    }
  });

  // --- 🧩 DEBUG LOGGING ---
  scene.load.on('complete', () => {
    console.group('🧩 CipherQuest Asset Debugger');
    console.log('🟨 Loaded Texture Keys:', Object.keys(scene.textures.list));

    const mapData = scene.cache.tilemap.get('level1');
    if (mapData?.data?.tilesets) {
      const names = mapData.data.tilesets.map(t => t.name);
      const images = mapData.data.tilesets.map(t => t.image);
      console.log('🟦 Tilesets Found in JSON:', names);
      console.log('🟩 Tileset Images in JSON:', images);

      const missing = names.filter(n => !scene.textures.exists(n));
      if (missing.length) {
        console.warn('⚠️ Missing textures (not loaded yet):', missing);
      } else {
        console.log('✅ All map tileset textures loaded correctly!');
      }
    } else {
      console.warn('⚠️ Could not inspect map — JSON may not be parsed yet.');
    }

    console.groupEnd();
  });

  // --- 📦 FILE LOAD TRACKER ---
  scene.load.on('filecomplete', (key) => {
    console.log(`📥 Loaded asset: ${key}`);
  });



}


