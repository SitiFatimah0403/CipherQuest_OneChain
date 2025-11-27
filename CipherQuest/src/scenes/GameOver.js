// src/scenes/GameOver.js

import { mintTrophy } from "../mint/mintTrophy.js";
import { submitScore } from "../oneid/leaderboard.js";   

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.playerWon = data.playerWon || false;
    this.score = data.score || 0;
    this.playerAddress = data.playerAddress || null;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w/2, h/2, 600, 300, 0x000000, 0.8).setOrigin(0.5);

    if (this.playerWon) {
      this.add.text(w/2, h/2 - 30, '🎉 YOU WIN! 🎉', {
        fontSize: '40px',
        fill: '#00ff00'
      }).setOrigin(0.5);

      this.add.text(w/2, h/2 + 10, 'Minting your Trophy NFT...', {
        fontSize: '16px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      if (this.playerAddress) {
        mintTrophy(this.playerAddress, this.score)
          .then(() => {
            this.add.text(w/2, h/2 + 50, '🏆 NFT Trophy Minted!', {
              fontSize: '18px',
              fill: '#ffd700'
            }).setOrigin(0.5);

            this.showLeaderboardButtons();  //Leaderboard buttons 
          })
          .catch(err => {
            console.error(err);
            this.add.text(w/2, h/2 + 50, 'Mint failed 😢', {
              fontSize: '18px',
              fill: '#ff4444'
            }).setOrigin(0.5);

            this.showLeaderboardButtons();   
          });
      }

    } else {
      this.add.text(w/2, h/2 - 20, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff3333'
      }).setOrigin(0.5);

      this.showLeaderboardButtons();
    }
    
  }

// Leaderboard Buttons
showLeaderboardButtons() {
  const w = this.cameras.main.width;
  const h = this.cameras.main.height;

  const centerX = w / 2;
  const baseY = h / 2 + 80; // Start slightly below the mint message

  // Submit Score Button
  const submitBtn = this.add.text(centerX, baseY, '[ Submit Score to Leaderboard ]', {
    fontSize: '20px',
    fill: '#00eaff'
  })
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true });

  submitBtn.on('pointerdown', () => this.handleSubmitScore());

  // Skip Button (ABOVE restart)
  const skipBtn = this.add.text(centerX, baseY + 25, '[ Skip ]', {
    fontSize: '18px',
    fill: '#e21c1c'   // cleaned up color
  })
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true });

  skipBtn.on('pointerdown', () => {
    this.scene.stop();
    this.scene.start('GameScene');
  });

  // Restart text (BELOW skip)
  this.add.text(centerX, baseY + 45, 'Click to Restart', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}




  // Handle Leaderboard Submit
  async handleSubmitScore() {
    const w = this.cameras.main.width;

      console.log("📤 Submitting score with data:", {
      score: this.score,
      wallet: this.playerAddress,
      oneId: window.oneIdAddress
    });

    const loading = this.add.text(w/2, this.cameras.main.height / 2 + 160, "Submitting...", {
      fontSize: "16px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    try {
      await submitScore(this.score, this.playerAddress);

      loading.setText("Score Submitted! 🎉");

      this.time.delayedCall(1500, () => {
        this.scene.stop();
        this.scene.start("LeaderboardScene");
      });

    } catch (err) {
      console.error(err);
      loading.setText("Submit Failed 😢");
    }

  }
}

// src/scenes/GameOver.js
// Very small GameOver scene - shows overlay and restarts on click

/*export default class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  create() {
    const w = this.cameras.main.width, h = this.cameras.main.height;
    this.add.rectangle(w/2, h/2, 480, 220, 0x000000, 0.8).setOrigin(0.5);
    this.add.text(w/2, h/2 - 20, 'GAME OVER', { fontSize: '48px', fill: '#ff3333' }).setOrigin(0.5);
    this.add.text(w/2, h/2 + 40, 'Click to Restart', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.stop();
      this.scene.start('GameScene');
    });
  }
}*/
