// src/scenes/PauseMenu.js
export default class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenu' });
  }

  init(data) {
    this.gameScene = data.gameScene; // reference to the main game
  }

  create() {
    const { width, height } = this.scale;

    // Dark background overlay
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.45)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1005);

    // Title
    const title = this.add.text(width / 2, height / 2 - 80, '⏸ GAME PAUSED', {
      font: '22px monospace',
      fill: '#00bfff'
    }).setOrigin(0.5);

    // Menu buttons
    const buttons = [
      { label: '[ RESUME ]', action: 'resume' },
      { label: '[ RESTART ]', action: 'restart' },
      { label: '[ EXIT ]', action: 'exit' },
    ];

    buttons.forEach((btn, i) => {
      const text = this.add.text(width / 2, height / 2 + i * 40, btn.label, {
        font: '18px monospace',
        fill: '#ffffff'
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => text.setStyle({ fill: '#00ffcc' }))
        .on('pointerout', () => text.setStyle({ fill: '#ffffff' }))
        .on('pointerdown', () => this.handleAction(btn.action));
    });

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  handleAction(action) {
    const game = this.gameScene;
    this.scene.stop(); // close pause menu overlay

    if (action === 'resume') {
      this.scene.resume('GameScene');
      game.physics.world.resume();
    }
    else if (action === 'restart') {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    }
    else if (action === 'exit') {
      this.scene.stop('GameScene');
      this.scene.start('Start'); // Go back to main menu
    }
  }
}
