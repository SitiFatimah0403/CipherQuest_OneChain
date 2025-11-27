// src/gameObjects/Coin.js
// Simple coin wrapper for future extension (score value, animations)

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key = 'coin') {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setOrigin(0.5);
    if (!scene.anims.exists('coin_spin')) {
      scene.anims.create({
        key: 'coin_spin',
        frames: scene.anims.generateFrameNumbers('coin'),
        frameRate: 12,
        repeat: -1
      });
    }
    this.play('coin_spin');
    this.value = 10;
  }
}
