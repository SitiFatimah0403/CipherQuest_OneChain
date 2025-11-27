// src/gameObjects/Player.js
// Player wrapper class: creates sprite, directional animations, movement, respawn & invulnerability

export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * scene - Phaser scene
   * x,y - start position
   * key - spritesheet key
   *
   * If directional animations look wrong, change SPRITE_DIR_ORDER below
   * to match your sheet order (examples given in comments).
   */
  constructor(scene, x, y, key = 'player') {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // state
    this.isInvulnerable = false;
    this.speedBoost = false;

    // direction state for animation
    this.lastDirection = 'down'; // initial facing

    // movement & physics sizing
    if (this.body) {
      this.body.setSize(14, 16);
      this.body.setOffset(1, 1);
    }

    // --- CONFIG: if your sprite sheet rows/ordering differ, change this array ---
    // Common orders to try if default is wrong:
    // ['down','left','right','up']   (default used before)
    // ['down','right','left','up']   (if left/right swapped)
    // ['right','left','down','up']   (some sheets start with right)
    // ['down','up','left','right']   (rare)
    // Find the ordering that matches your sheet and set SPRITE_DIR_ORDER to it.
    this.SPRITE_DIR_ORDER = ['down','right','up','left'] ;

    // create directional animations smartly
    this.createAnims();
  }

  createAnims() {
    const key = 'player';
    // if texture missing, create fallback generic anims
    const tex = this.scene.textures.get(key);
    if (!tex || !tex.key || tex.key === '__MISSING') {
      if (!this.scene.anims.exists('player_walk')) {
        this.scene.anims.create({
          key: 'player_walk',
          frames: this.scene.anims.generateFrameNumbers(key),
          frameRate: 10,
          repeat: -1
        });
      }
      if (!this.scene.anims.exists('player_idle')) {
        this.scene.anims.create({
          key: 'player_idle',
          frames: [{ key, frame: 0 }],
          frameRate: 1
        });
      }
      return;
    }

    // get frames array and determine frames per direction
    const frames = this.scene.anims.generateFrameNumbers(key);
    const totalFrames = frames.length;
    const framesPerDir = Math.floor(totalFrames / 4);

    // If we can split into 4 equal groups, map them using SPRITE_DIR_ORDER
    if (framesPerDir >= 1) {
      const order = this.SPRITE_DIR_ORDER;
      for (let i = 0; i < 4; i++) {
        const dir = order[i] || ['down','left','right','up'][i]; // safe fallback
        const start = i * framesPerDir;
        const end = start + framesPerDir - 1;

        const walkKey = `player_walk_${dir}`;
        if (!this.scene.anims.exists(walkKey)) {
          this.scene.anims.create({
            key: walkKey,
            frames: this.scene.anims.generateFrameNumbers(key, { start, end }),
            frameRate: 10,
            repeat: -1
          });
        }

        // Idle = first frame of that direction
        const idleKey = `player_idle_${dir}`;
        if (!this.scene.anims.exists(idleKey)) {
          this.scene.anims.create({
            key: idleKey,
            frames: [{ key, frame: start }],
            frameRate: 1
          });
        }
      }
    } else {
      // fallback to generic
      if (!this.scene.anims.exists('player_walk')) {
        this.scene.anims.create({
          key: 'player_walk',
          frames: frames,
          frameRate: 10,
          repeat: -1
        });
      }
      if (!this.scene.anims.exists('player_idle')) {
        this.scene.anims.create({
          key: 'player_idle',
          frames: [{ key, frame: 0 }],
          frameRate: 1
        });
      }
    }
  }

  update(cursors, wasd) {
    // Block movement if overlay active
    if (this.scene.overlayActive) {
      this.setVelocity(0, 0);
      this.playIdle();
      return;
    }

    const baseSpeed = 100;
    const speed = this.speedBoost ? 140 : baseSpeed;
    let vx = 0, vy = 0;
    if (cursors.left.isDown || wasd.A.isDown) vx = -speed;
    else if (cursors.right.isDown || wasd.D.isDown) vx = speed;
    if (cursors.up.isDown || wasd.W.isDown) vy = -speed;
    else if (cursors.down.isDown || wasd.S.isDown) vy = speed;

    // set velocity
    this.body.setVelocity(vx, vy);

    // choose facing based on dominant axis (avoids quick overrides on diagonal)
    if (vx === 0 && vy === 0) {
      // no movement
      this.playIdle();
    } else {
      // dominant axis decides facing
      if (Math.abs(vx) >= Math.abs(vy)) {
        // horizontal dominates
        if (vx > 0) this.lastDirection = 'right';
        else if (vx < 0) this.lastDirection = 'left';
      } else {
        // vertical dominates
        if (vy > 0) this.lastDirection = 'down';
        else if (vy < 0) this.lastDirection = 'up';
      }
      this.playWalk(this.lastDirection);
    }

    // simple world wrap (pac-man)
    const mw = this.scene.physics.world.bounds.width;
    const mh = this.scene.physics.world.bounds.height;
    if (this.x < 0) this.x = mw - 2;
    else if (this.x > mw) this.x = 2;
    if (this.y < 0) this.y = mh - 2;
    else if (this.y > mh) this.y = 2;
  }

  // Play directional walk animation if exists; else fallback to generic
  playWalk(direction) {
    const dirKey = `player_walk_${direction}`;
    if (this.scene.anims.exists(dirKey)) {
      if (this.anims.currentAnim?.key !== dirKey) this.anims.play(dirKey, true);
    } else if (this.scene.anims.exists('player_walk')) {
      if (this.anims.currentAnim?.key !== 'player_walk') this.anims.play('player_walk', true);
    }
  }

  // Play directional idle frame if exists; else fallback
  playIdle() {
    const idleKey = `player_idle_${this.lastDirection}`;
    if (this.scene.anims.exists(idleKey)) {
      if (this.anims.currentAnim?.key !== idleKey) this.anims.play(idleKey, true);
    } else if (this.scene.anims.exists('player_idle')) {
      if (this.anims.currentAnim?.key !== 'player_idle') this.anims.play('player_idle', true);
    } else {
      this.anims.stop();
    }
  }

  makeInvulnerable(duration = 1500) {
    this.isInvulnerable = true;
    this.setAlpha(0.5);
    this.scene.time.delayedCall(duration, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });
  }

  respawnAt(x, y) {
    this.setPosition(x, y);
    this.makeInvulnerable();
  }
}
