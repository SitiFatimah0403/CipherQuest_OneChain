// src/scenes/Start.js
// CipherQuest Start Menu Scene
// First screen before BootScene → Preloader → GameScene

export default class Start extends Phaser.Scene {
  constructor() {
    super({ key: 'Start' });
  }


  preload() {
    // Load OnePlay badge icons early
    this.load.image("badge_100_coins", "assets/ui/badge_100_coins.png");
    this.load.image("badge_puzzle_solver", "assets/ui/badge_puzzle_solver.png");
    this.load.image("badge_locked", "assets/ui/badge_locked.png");
}

  create() {
    const { width, height } = this.scale;

    // Optional music setup
    // this.music = this.sound.add('menuMusic', { loop: true, volume: 0.4 });
    // this.music.play();

    // Title text
    this.titleText = this.add.text(width / 2, height / 2 - 150, 'CIPHERQUEST', {
      font: '64px monospace',
      fill: '#FFD54F',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.subtitle = this.add.text(width / 2, height / 2 - 80, 'Guardians of the Chain', {
      font: '24px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(width / 2, height / 2 + 10, '[ PLAY GAME ]', {
      font: '28px monospace',
      fill: '#00ffcc'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setStyle({ fill: '#33ffff' }));
    playButton.on('pointerout', () => playButton.setStyle({ fill: '#00ffcc' }));
    playButton.on('pointerdown', () => {
      // Optional: fade-out animation
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        // Stop music if playing
        // if (this.music) this.music.stop();
        this.scene.start('BootScene');
      });
    });

    // OneChain connect button
    /*const connectButton = this.add.text(width / 2, height / 2 + 70, '[ Connect to OneWallet ]', {
      font: '20px monospace',
      fill: '#00bfff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    connectButton.on('pointerover', () => connectButton.setStyle({ fill: '#33ccff' }));
    connectButton.on('pointerout', () => connectButton.setStyle({ fill: '#00bfff' }));
    connectButton.on('pointerdown', () => {
      if (window.connectOneWallet) {
        window.connectOneWallet();
      } else {
        console.warn('OneWallet not loaded yet');
      }
    });*/


    // Credit footer
    this.add.text(width / 2, height - 30, '© 2025 CipherQuest Team — OneChain Hackathon', {
      font: '14px monospace',
      fill: '#888888'
    }).setOrigin(0.5);

    // Fade in animation
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // --- VIEW LEADERBOARD BUTTON ---
      const leaderboardBtn = this.add.text(width / 2, height / 2 + 90, '[ VIEW LEADERBOARD ]', {
          font: '20px monospace',
          fill: '#00eaff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      leaderboardBtn.on('pointerover', () => leaderboardBtn.setStyle({ fill: '#33ffff' }));
      leaderboardBtn.on('pointerout', () => leaderboardBtn.setStyle({ fill: '#00eaff' }));

      leaderboardBtn.on('pointerdown', () => {
          this.scene.start('LeaderboardScene');
      });

    // =============================
    // ONEPLAY PROFILE BUTTON (ADDED)
    // =============================
    // Load OneID if previously saved
    this.oneId = localStorage.getItem("oneId") || null;
    this.oneIdToken = localStorage.getItem("oneIdToken") || null;
    this.wallet = localStorage.getItem("wallet") || null;

    const onePlayBtn = this.add.text(width - 20, 20, "OnePlay 🎮", {
      font: "20px monospace",
      fill: "#ffffff"
    })
    .setOrigin(1, 0)
    .setInteractive({ useHandCursor: true });

    onePlayBtn.on("pointerdown", () => {
      this.showOnePlayProfile();
    });

    // =============================
    //  ONEPLAY PROFILE CONTAINER
    // =============================
    this.oneplayContainer = this.add.container(width / 2, height / 2);
    // Fullscreen input blocker (transparent)
    this.oneplayBlocker = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0   // fully transparent; change to 0.4 if you want dark fade
    )
    .setDepth(9998)
    .setScrollFactor(0)
    .setVisible(false)
    .setInteractive(); // THIS blocks clicks

    this.oneplayContainer.setVisible(false);

    // fix layering
    this.oneplayContainer.setDepth(99999);

    const bg = this.add.rectangle(0, 0, 500, 350, 0x000000, 0.85)
      .setOrigin(0.5);
    this.oneplayContainer.add(bg);

    const title = this.add.text(0, -150, "ONEPLAY PROFILE", {
      font: "28px monospace",
      fill: "#ffffff"
    }).setOrigin(0.5);
    this.oneplayContainer.add(title);

    // Badge slots (2 badges)
    this.badgeSlots = [];

    const badges = [
      { id: "badge_100_coins", label: "100 Coins" },
      { id: "badge_puzzle_solver", label: "Puzzle Solver" }
    ];

    badges.forEach((b, i) => {
      const x = -120 + i * 240;

      const icon = this.add.image(x, -20, "badge_locked").setDisplaySize(120, 120);
      const text = this.add.text(x, 70, b.label, {
        font: "18px monospace",
        fill: "#ffffff"
      }).setOrigin(0.5);

      this.oneplayContainer.add(icon);
      this.oneplayContainer.add(text);

      this.badgeSlots.push({ id: b.id, icon });
    });

    // Close button
      const closeBtn = this.add.text(230, -160, "X", {
        font: "26px monospace",
        fill: "#ffffff"
      })
        .setOrigin(1, 0)
        .setInteractive();

      closeBtn.on("pointerdown", () => {
        this.oneplayContainer.setVisible(false);
        this.oneplayBlocker.setVisible(false); // Unlock main menu buttons
      });

      this.oneplayContainer.add(closeBtn);


    // =============================
    //  UPDATE BADGE UI HELPER
    // =============================
    this.updateBadgeUI = (unlocked) => {
    this.badgeSlots.forEach(slot => {
      const isUnlocked = unlocked.includes(slot.id);

      const key = isUnlocked
        ? (slot.id === "badge_100_coins"
            ? "badge_100_coins"
            : "badge_puzzle_solver")
        : "badge_locked";

      slot.icon.setTexture(key);

      // 🔥 Fix: force icon to fit cleanly
      slot.icon.setDisplaySize(120, 120);
      slot.icon.setOrigin(0.5);

      // Remove old tween
      if (slot.glowTween) slot.glowTween.stop();

      if (isUnlocked) {
        slot.icon.clearTint();

        slot.glowTween = this.tweens.add({
          targets: slot.icon,
          alpha: { from: 1, to: 0.4 },
          scale: { from: 1, to: 1.08 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });

      } else {
        slot.icon.setTint(0x555555);
        slot.icon.setAlpha(1);
        slot.icon.setScale(1);
      }
    });
  };



    // =============================
    //  SHOW PROFILE FUNCTION
    // =============================
    this.showOnePlayProfile = async () => {
    this.oneplayBlocker.setVisible(true);
    this.oneplayContainer.setVisible(true);

    try {
      const oneId = window.oneIdAddress || localStorage.getItem("oneId");
      if (!oneId) {
        console.warn("No OneID found in localStorage");
        this.updateBadgeUI([]);
        return;
      }

      const res = await fetch(`http://localhost:5000/api/oneplay/badges/${oneId}`);
      if (!res.ok) {
        console.error("Badges fetch failed:", res.status, res.statusText);
        this.updateBadgeUI([]);
        return;
      }

      let json;
      try {
          json = await res.json();
      } catch (e) {
          console.error("❌ Invalid JSON from backend (profile)!", e);
          return; // Prevent crash → prevent Start scene reload
      }

      const unlocked = Array.isArray(json.badges) ? json.badges : [];

      // 🔥 Map backend badge IDs → Phaser texture keys
      const badgeKeyMap = {
        "badge100_popup": "badge_100_coins",
        "badgepuzzle_popup": "badge_puzzle_solver"
      };

      const unlockedNormalized = unlocked.map(id => badgeKeyMap[id] || id);

      this.updateBadgeUI(unlockedNormalized);

    } catch (err) {
      console.error("Failed to load OnePlay badges:", err);
      this.updateBadgeUI([]);
    }
  };




    // =============================
    // ADD ONEID LOGIN BUTTON (REQUIRED)
    // =============================
    const oneIdLoginBtn = this.add.text(width / 2, height / 2 + 50, '[ LOGIN WITH ONEID ]', {
      font: '22px monospace',
      fill: '#ffaa00'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    oneIdLoginBtn.on('pointerover', () => oneIdLoginBtn.setStyle({ fill: '#ffcc33' }));
    oneIdLoginBtn.on('pointerout', () => oneIdLoginBtn.setStyle({ fill: '#ffaa00' }));

    oneIdLoginBtn.on('pointerdown', async () => {
      try {
        const { oneId, idToken } = await window.loginWithOneID();

        // Save to localStorage (Game.js uses this)
        localStorage.setItem("oneId", oneId);

        this.oneId = oneId;

        console.log("🎉 OneID logged in:", oneId);

        // UI confirmation
        const popup = this.add.text(width / 2, height / 2 + 120, `OneID connected: ${oneId}`, {
          font: '16px monospace',
          fill: '#00ff99'
        }).setOrigin(0.5);

        this.time.delayedCall(2500, () => popup.destroy());

      } catch (err) {
        console.error("OneID login failed:", err);
      }
    });
  }



  //UNTUK REAL WALLET ADDRRESS
  updateWalletDisplay(wallet) {
    const { width, height } = this.scale;
    const popup = this.add.rectangle(width / 2, height / 2 + 140, 380, 60, 0x222222, 0.9).setOrigin(0.5);
    const popupText = this.add.text(width / 2, height / 2 + 140, `Wallet Connected: ${wallet}`, {
      font: '16px monospace',
      fill: '#00ff99'
    }).setOrigin(0.5);

    this.time.delayedCall(2500, () => {
      popup.destroy();
      popupText.destroy();
    });
  }


  /*WalletConnectedMock() {
    // Show mock wallet connection popup
    const { width, height } = this.scale;
    const popup = this.add.rectangle(width / 2, height / 2 + 140, 380, 60, 0x222222, 0.9).setOrigin(0.5);
    const popupText = this.add.text(width / 2, height / 2 + 140, 'Wallet Connected: 0xAB...1234 (mock)', {
      font: '16px monospace',
      fill: '#00ff99'
    }).setOrigin(0.5);

    this.time.delayedCall(2500, () => {
      popup.destroy();
      popupText.destroy();
    });
  }*/
}

//benda ni utuk apa? - phaser run dalam JS sandbox, so dia tak directly connected to <script> code dalam index.html kita..so bila OneWallet script in index.html dapat wallet address, phaser (game kita) tak automatically know, dia akan pass kat sini
window.updateWalletStatus = (wallet) => {
  const scene = window.game.scene.keys['Start'];
  if (scene && scene.updateWalletDisplay) {
    scene.updateWalletDisplay(wallet);
  }


};
