// src/scenes/Boot.js
// Minimal boot scene: set game scale, start Preloader

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.game.config.pixelArt = true;
    this.scene.start('Preloader');
  }
}
