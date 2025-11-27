// src/scenes/LeaderboardScene.js
import { getLeaderboard } from "../oneid/leaderboard.js";

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: "LeaderboardScene" });
  }

  async create() {
    const { width, height } = this.scale;

    // Background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // Title
    const title = this.add.text(width / 2, 80, "🏆 LEADERBOARD", {
      font: "48px monospace",
      fill: "#00eaff",
      stroke: "#005f66",
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.6 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    // Panel
    const panelW = 700;
    const panelH = 500;
    const panelX = width / 2;
    const panelY = height / 2 + 20;

    this.add.rectangle(panelX, panelY, panelW, panelH, 0x111111, 0.9)
      .setStrokeStyle(4, 0x00eaff)
      .setOrigin(0.5);

    // --- INTERACTIVE SCROLL ZONE (fix wheel event not firing) ---
    const scrollZone = this.add.zone(panelX, panelY, panelW, panelH)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(9999); // ensure it receives wheel events


    // Fetch leaderboard data
    const data = await getLeaderboard();
    data.sort((a, b) => b.score - a.score);

    // ---- SCROLLABLE CONTAINER ----
    const viewWidth = panelW - 40;
    const viewHeight = panelH - 40;

    const containerX = panelX - panelW / 2 + 20;
    const containerY = panelY - panelH / 2 + 20;

    const container = this.add.container(containerX, containerY);

    let yOffset = 0;

    // Header
    container.add(
      this.add.text(0, yOffset, "RANK    PLAYER (OneID)         SCORE", {
        font: "22px monospace",
        fill: "#00ffcc"
      })
    );
    yOffset += 40;

    // Entries
    data.forEach((entry, index) => {
      const rank = index + 1;
      const shortID = entry.oneId.slice(0, 8) + "..." + entry.oneId.slice(-4);

      const line = this.add.text(
        0,
        yOffset,
        `${rank.toString().padEnd(5)} ${shortID.padEnd(28)} ${entry.score}`,
        { font: "20px monospace", fill: "#ffffff" }
      );

      if (rank === 1) {
        line.setStyle({ fill: "#ffe600" });
        this.tweens.add({
          targets: line,
          alpha: { from: 1, to: 0.4 },
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }

      container.add(line);
      yOffset += 32;
    });

    // ---- MASK (aligned properly!) ----
    const maskG = this.make.graphics({});
    maskG.fillStyle(0xffffff);
    maskG.fillRect(0, 0, viewWidth, viewHeight);
    maskG.x = containerX;
    maskG.y = containerY;

    const mask = maskG.createGeometryMask();
    container.setMask(mask);


    // ---- SCROLL LIMITS ----
    const startY = containerY;
    const endY = containerY - (yOffset - viewHeight);

    // Scroll wheel
    scrollZone.on("wheel", (pointer, dx, dy) => {
    container.y -= dy * 0.4;

    if (container.y > startY) container.y = startY;
    if (container.y < endY) container.y = endY;
  });


    // Back button
    const backBtn = this.add.text(width / 2, height - 60, "[ BACK ]", {
      font: "28px monospace",
      fill: "#00ffcc"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#33ffff" }));
    backBtn.on("pointerout", () => backBtn.setStyle({ fill: "#00ffcc" }));

    backBtn.on("pointerdown", () => {
      this.scene.stop("LeaderboardScene");
      this.scene.start("Start");
    });
  }
}
