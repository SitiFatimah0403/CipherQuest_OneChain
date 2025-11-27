// src/scenes/Preloader.js
import { loadAllAssets } from '../assets.js';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
    const w = this.cameras.main.width, h = this.cameras.main.height;
    const text = this.add.text(w / 2, h / 2 - 20, 'Loading...', {
      font: '18px monospace',
      fill: '#00bfff'
    }).setOrigin(0.5);

    // load everything
    loadAllAssets(this);

    this.load.on('progress', v => text.setText(`Loading... ${Math.round(v * 100)}%`));
  }

  create() {
    this.scene.start('GameScene');
  }
}
