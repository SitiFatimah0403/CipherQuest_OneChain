// src/gameObjects/Enemy.js
// Generic enemy class that handles basic wandering movement and freeze/unfreeze behavior.
// Exposes simple API: freeze(duration), unfreeze(), scaleSpeed(multiplier)

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key = 'dungeonEnemies', baseSpeed = 40) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.baseSpeed = baseSpeed;
    this.speedMultiplier = 1;
    this.isFrozen = false;

    // physics
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(1, 1);

    // Use shared dungeon enemies sheet for all enemy types
    if (!this.scene.anims.exists('dungeonEnemies_walk')) {
      this.scene.anims.create({
        key: 'dungeonEnemies_walk',
        frames: this.scene.anims.generateFrameNumbers('dungeonEnemies', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }

    this.anims.play('dungeonEnemies_walk', true);
    this.setRandomVelocity();
  }

  setRandomVelocity() {
    if (this.isFrozen) return;
    const angle = Phaser.Math.Between(0, 359);
    const speed = this.baseSpeed * this.speedMultiplier * Phaser.Math.FloatBetween(0.8, 1.2);
    this.scene.physics.velocityFromAngle(angle, speed, this.body.velocity);
  }

  scaleSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    if (!this.isFrozen) {
      // update current velocity vector magnitude
      const vx = this.body.velocity.x;
      const vy = this.body.velocity.y;
      const angle = Math.atan2(vy, vx);
      const newSpeed = this.baseSpeed * this.speedMultiplier;
      this.body.setVelocity(Math.cos(angle) * newSpeed, Math.sin(angle) * newSpeed);
    }
  }

  freeze() {
    if (this.isFrozen) return;
    this.isFrozen = true;
    this.savedVelocity = { x: this.body.velocity.x, y: this.body.velocity.y };
    this.body.setVelocity(0, 0);
    this.body.moves = false;
    this.anims.pause();
  }

  unfreeze() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    this.body.moves = true;
    if (this.savedVelocity) this.body.setVelocity(this.savedVelocity.x, this.savedVelocity.y);
    this.savedVelocity = null;
    this.anims.resume();
  }
}
