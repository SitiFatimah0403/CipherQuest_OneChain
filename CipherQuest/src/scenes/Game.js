// src/scenes/Game.js
// Main gameplay scene that wires map, groups, HUD and uses the gameObjects classes.

import Player from '../gameObjects/Player.js';
import Enemy from '../gameObjects/Enemy.js';
import Coin from '../gameObjects/Coin.js';
import PauseMenu from './PauseMenu.js';  
import GameOver from './GameOver.js';



export default class GameScene extends Phaser.Scene {
  /*constructor() {
    super({ key: 'GameScene' });
    // --- Core state variables ---
    this.lives = 3;
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoins = 0;
    this.enemyBaseSpeed = 40;
    this.enemySpeedMultiplier = 1;
    this.overlayActive = true;
    this.mintedBadge = false;
    this.teleportZones = []; // init
  }*/

    //Reset all game state lepas kalah
    constructor() {
    super({ key: 'GameScene' });
  }

  // --- MAIN CREATE FUNCTION ---
  create() {
    this.lives = 3;
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoins = 0;
    //this.totalCoins = 20;
    this.enemyBaseSpeed = 40;
    this.enemySpeedMultiplier = 1;
    this.overlayActive = true;
    this.mintedBadge = false;
    this.teleportZones = [];

    // --- TILEMAP + TILESETS ---
    const map = this.make.tilemap({ key: 'level1' });
    const allTilesets = [];

    map.tilesets.forEach(ts => {
      try {
        const key = ts.name;
        const added = map.addTilesetImage(key, key);
        if (added) allTilesets.push(added);
        else console.warn(`⚠️ Missing tileset in preload: ${key}`);
      } catch (err) {
        console.error(`❌ Error loading tileset ${ts.name}:`, err);
      }
    });

    console.log("🧩 Map expects tilesets:", map.tilesets.map(t => t.name));
    console.log("✅ Loaded tilesets:", allTilesets.map(t => t.name));

    // --- LAYERS ---
    const groundLayer  = map.getLayer('Ground')  ? map.createLayer('Ground', allTilesets, 0, 0)  : null;
    const ground2Layer = map.getLayer('Ground2') ? map.createLayer('Ground2', allTilesets, 0, 0) : null;
    const waterLayer   = map.getLayer('Water')   ? map.createLayer('Water', allTilesets, 0, 0)   : null;
    const wallsLayer   = map.getLayer('Walls')   ? map.createLayer('Walls', allTilesets, 0, 0)   : null;
    const decoLayer    = map.getLayer('Deco')    ? map.createLayer('Deco', allTilesets, 0, 0)    : null;

    // --- COLLISIONS ---
    if (wallsLayer) wallsLayer.setCollisionByExclusion([-1]);
    if (waterLayer) waterLayer.setCollisionByExclusion([-1]);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- GROUPS ---
    this.coinsGroup   = this.add.group();
    this.potionsGroup = this.physics.add.group();
    this.puzzleGroup  = this.add.group();
    this.enemiesGroup = this.add.group();

    // --- SPAWN OBJECTS ---
    this.spawnObjects(map);

    // --- PLAYER ---
    const spawnObj = map.findObject('Player', obj => obj?.name === 'Spawn' || obj?.class === 'Player');
    const spawnX = spawnObj?.x || 100;
    const spawnY = spawnObj?.y || 100;
    this.player = new Player(this, spawnX, spawnY, 'player');
    this.playerSpawnPoint = { x: spawnX, y: spawnY };

    // --- INVISIBILITY ON SPAWN (6 seconds protection) ---
    this.player.setAlpha(0.5); // semi-transparent for visual effect
    this.player.isInvulnerable = true;
    console.log('🛡️ Player invisible for 6 seconds');
    this.time.delayedCall(6000, () => {
      if (!this.player) return;
      this.player.setAlpha(1);
      this.player.isInvulnerable = false;
      console.log('✨ Player visibility restored');
    });

    // --- COLLIDERS ---
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.enemiesGroup, wallsLayer);
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    this.physics.add.overlap(this.player, this.coinsGroup,  this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.potionsGroup, this.collectPotion, null, this);
    this.physics.add.overlap(this.player, this.puzzleGroup,  this.triggerPuzzle, null, this);
    this.enemyPlayerCollider = this.physics.add.overlap(
      this.player,
      this.enemiesGroup,
      this.onPlayerHitEnemy,
      null,
      this
    );

    // --- CAMERA ---
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.setZoom(2);
    cam.fadeIn(500);

    // --- INPUT ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD = this.input.keyboard.addKeys('W,A,S,D');

    // --- HUD ---
    this.initHUD();

    // --- CONNECT OVERLAY ---
    this.createConnectOverlay();

    // --- ENEMY SPEED SCALING ---
    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => {
        this.enemySpeedMultiplier += 0.15;
        this.enemiesGroup.getChildren().forEach(e => e.scaleSpeed?.(this.enemySpeedMultiplier));
      }
    });

    // --- 🌀 TELEPORT SYSTEM (paired left <-> right) ---
    this.teleportZones = [];
    const tLayer = map.getObjectLayer('TeleportZone');
    if (tLayer && tLayer.objects && tLayer.objects.length) {
      // Create teleport zones from Tiled objects
      tLayer.objects.forEach(obj => {
        const width = obj.width || 32;
        const height = obj.height || 32;
        const centerX = (obj.x || 0) + width / 2;
        const centerY = (obj.y || 0) + height / 2;

        const zone = this.add.zone(centerX, centerY, width, height);
        this.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        zone.body.moves = false;
        zone.name = obj.name || obj.type || 'teleport';
        this.teleportZones.push(zone);
      });

      // Debug visual
      this.teleportZones.forEach(zone => {
        const dbg = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x00ff00, 0.25);
        dbg.setDepth(10000);
        dbg.setScrollFactor(1);
        console.log(`✅ Teleport zone "${zone.name}" at (${zone.x.toFixed(1)}, ${zone.y.toFixed(1)})`);
      });

      // Helper for teleport pairing
      const findPair = (name) => {
        if (name === 'left') return this.teleportZones.find(z => z.name === 'right');
        if (name === 'right') return this.teleportZones.find(z => z.name === 'left');
        return this.teleportZones.find(z => z.name !== name);
      };

      // Teleport logic with cooldown
      this.teleportCooldown = 0;
      this.physics.add.overlap(this.player, this.teleportZones, (player, zone) => {
        if (!player.body || !player.body.enable) return;
        if (this.teleportCooldown > 0) return;

        console.log('🌀 Teleport triggered:', zone.name);
        const pair = findPair(zone.name);
        if (!pair) return console.warn('⚠️ No counterpart found for', zone.name);

        player.setPosition(pair.x, pair.y);
        if (pair.name === 'left') player.x += 32;
        else if (pair.name === 'right') player.x -= 32;

        this.cameras.main.flash(100, 255, 255, 255);
        this.teleportCooldown = 1;
        this.time.delayedCall(600, () => (this.teleportCooldown = 0));
      });
    } else {
      console.warn('⚠️ No TeleportZone layer found or empty');
    }

    // --- ENSURE BADGE TEXTURES ARE READY BEFORE USE ---
    this.texturesReady = false;
    this.textures.once("ready", () => {
        console.log("✅ Badge textures ready for use");
        this.texturesReady = true;
    });

  } // --- END CREATE ---

  // --- ONEPLAY BADGE ---
    async unlockOnePlayBadge(badgeId) {
      const oneId = localStorage.getItem("oneId");
      const wallet = window.connectedWallet || null;

      if (this.isUnlockingBadge) return;  // prevent double calls
      this.isUnlockingBadge = true;


      if (!oneId) {
        console.warn("❌ No OneID found — cannot unlock badge.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/oneplay/badge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oneId, badgeId, wallet })
        });

        // -----------------------------------------
        // ⭐ CRASH-PROTECTION: safe JSON parsing
        // -----------------------------------------
        let json;
        try {
          json = await res.json();  
        } catch (e) {
          console.error("❌ Invalid JSON from backend (badge unlock)!", e);
          return;   // <--- prevents Phaser from resetting to Start.js
        }

        console.log("🎉 Badge unlocked:", json);

        // Unblock overlay if badge is triggered inside gameplay
        //this.overlayActive = false;


        // -----------------------------------------
        // SHOW POPUP (ONLY if game is still alive)
        // -----------------------------------------
        // SAFETY: ensure GameScene is active before displaying popup
        if (this.scene.isPaused("GameScene")) {
            console.log("⏳ GameScene paused — resuming before popup");
            this.scene.resume("GameScene");
        }

        if (!this.scene.isActive("GameScene")) {
            console.warn("⚠️ GameScene is NOT active — popup cancelled");
            return;
        }

        if (this.scene.key !== "GameScene") {
        console.warn("GameScene not active when badge unlock returned → cancel popup.");
        return;
    }

        // SAFE TO SHOW THE BADGE POPUP NOW
        this.showBadgeNotification(badgeId);


      } catch (err) {
        console.error("❌ Error unlocking badge:", err);
      }

      this.time.delayedCall(300, () => {
      this.isUnlockingBadge = false;
  });

    }

 


    // =============================
    // ONEPLAY BADGE POPUP NOTIFICATION
    // =============================

    showBadgeNotification(badgeId) {

      if (!this.titleText) {
      console.warn("⚠️ HUD not ready, delaying badge popup");
      this.time.delayedCall(100, () => this.showBadgeNotification(badgeId));
      return;
    }


  // Map backend → real texture keys
  const textureMap = {
    "badge100_popup": "badge_100_coins",
    "badgepuzzle_popup": "badge_puzzle_solver",
    "badge_100_coins": "badge_100_coins",
    "badge_puzzle_solver": "badge_puzzle_solver"
  };

  const texKey = textureMap[badgeId] || "badge_locked";


  // 🔥 SAFETY FIX #1 — Don't crash if texture not loaded yet
  if (!this.textures.exists(texKey)) {
    console.warn("⚠️ Texture not loaded yet, retrying:", texKey);

    this.time.delayedCall(150, () => this.showBadgeNotification(badgeId));
    return;
  }


  // 🔥 SAFETY FIX #2 — Get source image safely
  const texture = this.textures.get(texKey);
  const src = texture && texture.getSourceImage ? texture.getSourceImage() : null;
  if (!src) {
    console.warn("⚠️ Source image missing, retrying:", texKey);
    this.time.delayedCall(150, () => this.showBadgeNotification(badgeId));
    return;
  }


  // Badge display names
  const badgeNames = {
    "badge_100_coins": "100 Coins Badge!",
    "badge_puzzle_solver": "Puzzle Solver Badge!"
  };

  const label = badgeNames[texKey] || badgeId;

  // Popup position relative to title
  const popupX = this.titleText.x;
  const popupStartY = this.titleText.y - 60;
  const popupTargetY = this.titleText.y + 50;

  // Create popup container
  const popup = this.add.container(popupX, popupStartY).setDepth(20000);
  this.hudContainer.add(popup);

  // Background
  const bg = this.add.rectangle(0, 0, 360, 70, 0x000000, 0.75)
    .setOrigin(0.5)
    .setStrokeStyle(2, 0xffd700);

  // Icon
  const icon = this.add.image(-140, 0, texKey).setOrigin(0.5);

  // ⭐ PERFECT SCALING (no crash because src is always valid now)
  const maxSize = 48;
  const scale = Math.min(maxSize / src.width, maxSize / src.height);
  icon.setScale(scale);

  // Text
  const txt = this.add.text(-90, 0, label, {
    font: "22px monospace",
    fill: "#ffea00"
  }).setOrigin(0, 0.5);

  // Add elements to popup
  popup.add([bg, icon, txt]);

  // Slide in
  this.tweens.add({
    targets: popup,
    y: popupTargetY,
    duration: 450,
    ease: "Cubic.easeOut",
  });

  // Slide out
  this.time.delayedCall(2200, () => {
    this.tweens.add({
      targets: popup,
      y: popupStartY,
      alpha: 0,
      duration: 600,
      ease: "Cubic.easeIn",
      onComplete: () => popup.destroy(),
    });
  });
}




  // --- SPAWN OBJECTS ---
  spawnObjects(map) {
    const coinLayer = map.getLayer('Coins')?.tilemapLayer || map.createLayer('Coins', map.tilesets, 0, 0);
    if (coinLayer) {
      coinLayer.forEachTile(tile => {
        if (tile.index > 0) {
          const coin = new Coin(this, tile.getCenterX(), tile.getCenterY(), 'coin');
          this.coinsGroup.add(coin);
        }
      });
      coinLayer.setVisible(false);
    }

    const potionLayer = map.getLayer('Potion')?.tilemapLayer || map.createLayer('Potion', map.tilesets, 0, 0);
    if (potionLayer) {
      potionLayer.forEachTile(tile => {
        if (tile.index > 0) {
          const type = tile.index % 2 === 0 ? 'gray' : 'red';
          const potion = this.potionsGroup.create(tile.getCenterX(), tile.getCenterY(), 'potions', type === 'red' ? 0 : 1);
          potion.potionType = type;
          potion.setImmovable(true);
        }
      });
      potionLayer.setVisible(false);
    }

    const puzzleLayer = map.getLayer('Puzzle')?.tilemapLayer || map.createLayer('Puzzle', map.tilesets, 0, 0);
    if (puzzleLayer) {
      puzzleLayer.forEachTile(tile => {
        if (tile.index > 0) {
          const frameIndex = tile.index - 1;
          const icon = this.physics.add.sprite(tile.getCenterX(), tile.getCenterY(), 'Random Icons', frameIndex)
            .setOrigin(0.5)
            .setImmovable(true)
            .setScale(1.1);
          this.puzzleGroup.add(icon);
        }
      });
      puzzleLayer.setVisible(false);
    }

    const enemyLayer = map.getLayer('Enemy')?.tilemapLayer || map.createLayer('Enemy', map.tilesets, 0, 0);
    if (enemyLayer) {
      enemyLayer.forEachTile(tile => {
        if (tile.index > 0) {
          const enemy = new Enemy(this, tile.getCenterX(), tile.getCenterY(), 'dungeonEnemies', this.enemyBaseSpeed);
          this.enemiesGroup.add(enemy);
        }
      });
      enemyLayer.setVisible(false);
    }

    console.log(`🪙 Coins: ${this.coinsGroup.getLength()}`);
    console.log(`🧪 Potions: ${this.potionsGroup.getLength()}`);
    console.log(`👾 Enemies: ${this.enemiesGroup.getLength()}`);
    console.log(`🧩 Puzzles: ${this.puzzleGroup.getLength()}`);
  }

  // --- HUD SETUP ---
  initHUD() {
    const cam = this.cameras.main;
    const { width: w, height: h } = this.scale;

    this.hudContainer = this.add.container(0, 0).setDepth(9999);
    const hudBg = this.add.rectangle(0, 0, w, 36, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x00bfff);
    this.hudContainer.add(hudBg);

    // --- HUD Elements ---
    this.scoreText = this.add.text(16, 8, 'Score: 0', { font: '16px monospace', fill: '#ffffff' });
    this.coinsText = this.add.text(w - 16, 8, 'Coins: 0/0', { font: '16px monospace', fill: '#ffffff' }).setOrigin(1, 0);
    this.titleText = this.add.text(w / 2, 8, 'CIPHERQUEST', { font: '22px monospace', fill: '#FFAA33' }).setOrigin(0.5, 0);

    // --- MENU BUTTON ---
    this.menuButton = this.add.text(w / 2 - 180, 8, '[ MENU ]', { font: '14px monospace', fill: '#00bfff' })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true }) // ✅ must come before `.on()`
      .on('pointerdown', () => {
        console.log('📜 Menu clicked');
        this.scene.launch('PauseMenu', { gameScene: this });
        this.scene.pause(); // pause gameplay safely
      });


    // --- HELP BUTTON ---
    this.helpButton = this.add.text(w / 2 + 180, 8, '[ HELP ]', { font: '14px monospace', fill: '#00ff99' })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { console.log('💡 Help clicked'); this.createHelpOverlay(); });

    this.hudContainer.add([this.scoreText, this.coinsText, this.titleText, this.menuButton, this.helpButton]);

    // --- HEART ICONS ---
    this.heartsIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.text(16 + i * 24, h - 24, '❤', { fontSize: '18px', fill: '#FF5555' });
      this.hudContainer.add(heart);
      this.heartsIcons.push(heart);
    }

    // --- Update HUD once ---
    this.totalCoins = this.coinsGroup.getLength(); //utk samakan dgn total coins tu
    this.updateHUD();

    // Keep HUD fixed relative to camera
    this.events.on('update', () => {
      this.hudContainer.setPosition(cam.worldView.x, cam.worldView.y);
      this.hudContainer.setScale(1 / cam.zoom);
    });
  }

  updateHUD() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.coinsText.setText(`Coins: ${this.coinsCollected}/${this.totalCoins}`);
    this.heartsIcons.forEach((h, i) => h.setVisible(i < this.lives));
  }

  // --- GAME LOOP UPDATE ---
  update() {
    if (this.player) this.player.update(this.cursors, this.WASD);
    // Fallback wrap (if no TeleportZone exists)
    if (!this.teleportZones || this.teleportZones.length === 0) {
      const mapWidth = this.physics.world.bounds.width;
      if (this.player.x < -16) this.player.x = mapWidth + 16;
      else if (this.player.x > mapWidth + 16) this.player.x = -16;
    }
  }

  // --- COIN COLLECTION HANDLER ---
  collectCoin = (player, coin) => {
    if (!coin) return;
    coin.destroy();
    this.coinsCollected++;
    // Unlock badge when coins reach 100
    if (this.coinsCollected === 100) {
      this.game.events.once("poststep", () => {
      this.unlockOnePlayBadge("badge_100_coins");
  });

      return;
    }
    const multiplier = this.coinMultiplier || 1;
    this.score += 10 * multiplier;
    this.updateHUD();

    if (this.score >= 100 && !this.mintedBadge) {
      this.mintedBadge = true;
      this.mockMintNFTBadge();
    }
     //if (this.coinsCollected >= 20) this.showWin(); 
    if (this.coinsCollected >= this.totalCoins) this.showWin(); //bila dh collect semua coins
  };

  // --- POTION HANDLER ---
  collectPotion = (player, potion) => {
    if (!potion) return;
    const type = potion.potionType || 'red';
    potion.destroy();

    if (type === 'red') {
      // Speed boost potion
      this.player.speedBoost = true;
      this.time.delayedCall(10000, () => (this.player.speedBoost = false));
    } else {
      // Freeze potion — freeze enemies & disable collisions
      this.enemiesGroup.getChildren().forEach(e => {
        e.freeze?.();
        e.setAlpha(0.4);
      });
      this.physics.world.removeCollider(this.enemyPlayerCollider);

      // Restore after 10 seconds
      this.time.delayedCall(10000, () => {
        this.enemiesGroup.getChildren().forEach(e => {
          e.unfreeze?.();
          e.setAlpha(1);
        });
        this.enemyPlayerCollider = this.physics.add.overlap(this.player, this.enemiesGroup, this.onPlayerHitEnemy, null, this);
        console.log('😈 Enemies woke up again!');
      });
    }
  };

  // --- PUZZLE HANDLER ---
    triggerPuzzle = (player, puzzle) => {
    this.scene.launch('CipherScene', {
      callback: result => {

        // 🔥 MUST RESUME FIRST before removing last puzzle
        if (this.scene.isPaused("GameScene")) {
          this.scene.resume("GameScene");
        }

        // Now safe to destroy puzzle
        puzzle.destroy();

        if (result) this.activateBoosts();
        else console.log("Puzzle failed");

      },
      iconRef: puzzle
    });

    this.scene.pause();
  };


  // --- BOOST ON PUZZLE SUCCESS ---
  activateBoosts() {
    console.log('⚡ Cipher Puzzle Solved — Activating Boosts!');

    //  Check if all puzzles are completed then dpt badge oneplay
    if (this.puzzleGroup.getChildren().length === 0) {

      // FIX 1: Resume GameScene if still paused
      if (this.scene.isPaused("GameScene")) {
          console.log("Resuming GameScene before awarding puzzle badge");
          this.scene.resume("GameScene");
      }

      // FIX 2: Delay the badge call a bit to avoid Phaser timing bug
      this.time.delayedCall(50, () => {
          this.game.events.once("poststep", () => {
          this.unlockOnePlayBadge("badge_puzzle_solver");
      });
      });

      return;
    }



    // Freeze enemies (transparent + harmless)
    this.enemiesGroup.getChildren().forEach(e => {
      if (e.body) e.body.enable = false;
      e.freeze?.();
      e.setAlpha(0.5);
    });

    // Double coins & faster player
    this.coinMultiplier = 2;
    const baseSpeed = this.player.speed;
    this.player.speed *= 1.5;

    // Floating text
    const fx = this.add.text(this.player.x, this.player.y - 24, '✨ BOOST ACTIVE ✨', {
      fontSize: '14px',
      fill: '#00ffcc'
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({ targets: fx, alpha: { from: 1, to: 0 }, duration: 600, yoyo: true, repeat: -1 });

    // Reset after 10 seconds
    this.time.delayedCall(10000, () => {
      this.enemiesGroup.getChildren().forEach(e => {
        if (e.body) e.body.enable = true;
        e.unfreeze?.();
        e.setAlpha(1);
      });
      this.coinMultiplier = 1;
      this.player.speed = baseSpeed;
      fx.destroy();
      console.log('⏳ Boost expired, game state restored.');
    });
  }

  // --- ENEMY HIT HANDLER ---

onPlayerHitEnemy = () => {
  if (this.player.isInvulnerable || this.overlayActive) return;

  this.lives--;
  this.updateHUD();

  if (this.lives <= 0) {

    this.physics.pause();                  
    this.scene.launch('GameOver', {        
      playerWon: false,
      score: this.score,
      playerAddress: window.connectedWallet || null
    });

    this.scene.pause();                    
    return;
  }

  this.player.respawnAt(this.playerSpawnPoint.x, this.playerSpawnPoint.y);
};

  /*onPlayerHitEnemy = () => {
    if (this.player.isInvulnerable || this.overlayActive) return;
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.scene.launch('GameOver');
      this.scene.pause();
      return;
    }
    this.player.respawnAt(this.playerSpawnPoint.x, this.playerSpawnPoint.y);
  };*/

  // --- WIN CONDITION ---

showWin() {

  this.physics.pause();                    

  this.scene.launch('GameOver', {          
    playerWon: true,
    score: this.score,
    playerAddress: window.connectedWallet || null
  });

  this.scene.pause();                      
}

  /*showWin() {
    const cam = this.cameras.main;
    const x = cam.worldView.x + cam.width / 2;
    const y = cam.worldView.y + cam.height / 2;
    const txt = this.add.text(x, y, 'YOU WIN!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);
    txt.setScrollFactor(0);
    this.physics.pause();
    this.input.once('pointerdown', () => this.scene.restart());
  }*/


  // --- CONNECT OVERLAY ---
  createConnectOverlay() {
    this.overlayActive = true;

    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;

    const overlay = this.add.rectangle(0, 0, w, h, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);

    const box = this.add.rectangle(w / 2, h / 2, 460, 180, 0x222222, 0.95)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x00bfff)
      .setDepth(1001);

    const text = this.add.text(w / 2, h / 2 - 28, 'Connect to OneChain', {
      font: '16px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    const btn = this.add.text(w / 2, h / 2 + 16, '[ Connect to OneChain ]', {
      font: '14px monospace',
      fill: '#00bfff'
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1002);

    if (this.player) this.player.setDepth(10);

    btn.on('pointerdown', async () => {
    try {
      const wallet = window.connectedWallet || await window.connectOneWallet();
      if (wallet) {
        const short = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        text.setText(`Wallet connected: ${short}`);
        btn.setVisible(false);

        // Save globally
        window.connectedWallet = wallet;

        this.time.delayedCall(1000, () => {
          overlay.destroy();
          box.destroy();
          text.destroy();
          btn.destroy();
          this.overlayActive = false;
          if (this.player) this.player.setDepth(0);
          this.children.bringToTop(this.hudContainer);
        });
      } else {
        text.setText("Connection failed. Try again.");
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
      text.setText("Connection failed. Try again.");
    }
  });



  }

  // --- PAUSE / MENU OVERLAY ---
/*createPauseMenu() {
  // Pause the physics + scene
  this.scene.pause();
  this.physics.world.pause();

  const { width, height } = this.cameras.main;

  // Dark overlay background
  const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(1005);

  // Title text
  const title = this.add.text(width / 2, height / 2 - 80, '⏸ GAME PAUSED', {
    font: '22px monospace',
    fill: '#00bfff'
  }).setOrigin(0.5).setDepth(1006);

  // Buttons: Resume, Restart, Exit
  const buttons = [
    { label: '[ RESUME ]', action: 'resume' },
    { label: '[ RESTART ]', action: 'restart' },
    { label: '[ EXIT ]', action: 'exit' },
  ];

  const elements = [bg, title];

  buttons.forEach((btn, i) => {
    const text = this.add.text(width / 2, height / 2 + i * 40, btn.label, {
      font: '18px monospace',
      fill: '#ffffff'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => text.setStyle({ fill: '#00ffcc' })) // hover color
      .on('pointerout', () => text.setStyle({ fill: '#ffffff' }))
      .on('pointerdown', () => {
        if (btn.action === 'resume') {
          // Remove overlay + resume game
          elements.forEach(e => e.destroy());
          this.physics.world.resume();
          this.scene.resume();
        }
        else if (btn.action === 'restart') {
          this.scene.restart(); // reloads everything
        }
        else if (btn.action === 'exit') {
          this.scene.stop('GameScene');
          this.scene.start('Start');  
        }
      })
      .setDepth(1006)
      .setScrollFactor(0);

    elements.push(text);
  });

  this.pauseMenuElements = elements; // so we can clear later if needed
}*/

  // --- HELP OVERLAY ---
  createHelpOverlay() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1005);

    const box = this.add.rectangle(width / 2, height / 2, 580, 320, 0x111111, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x00ffcc)
      .setDepth(1006);

    const title = this.add.text(width / 2, height / 2 - 110, '💡 HOW TO PLAY', {
      font: '20px monospace',
      fill: '#00ffcc'
    }).setOrigin(0.5).setDepth(1007);

const info = this.add.text(width / 2, height / 2, 
`🕹 MOVE: Arrow Keys or W/A/S/D
💰 COLLECT: Coins to gain score
🧪 POTIONS: Temporary boosts
👾 ENEMIES: Avoid or freeze them
🧩 PUZZLES: Decode secret words by shifting letters 
   (e.g., "KHOOR" → "HELLO"). Solve all to gain boosts!
🚪 TELEPORT: Walk into tunnel edges
💖 HEALTH: 3 lives only — be careful!`, {
  font: '16px monospace',
  fill: '#ffffff',
  align: 'center',
  wordWrap: { width: 550 } 
}).setOrigin(0.5).setDepth(1007);

   const close = this.add.text(width / 2, height / 2 + 140, '[ CLOSE ]', {
  font: '18px monospace',
  fill: '#00bfff'
})

      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => close.setStyle({ fill: '#00ffff' }))
      .on('pointerout', () => close.setStyle({ fill: '#00bfff' }))
      .on('pointerdown', () => {
        [bg, box, title, info, close].forEach(e => e.destroy());
      })
      .setDepth(1007);

    console.log('📖 Help overlay opened');
  }

  // --- MOCK MINT BADGE ---
  mockMintNFTBadge() {
    const toast = this.add.text(this.cameras.main.width / 2, 48, 'NFT Minted on OneChain!', {
      fontSize: '16px',
      fill: '#fff'
    }).setOrigin(0.5).setScrollFactor(0);
    console.log('Mock TX: 0xFAKEHASH' + Phaser.Math.Between(1000, 9999));
    this.time.delayedCall(3000, () => toast.destroy());
  }
}
