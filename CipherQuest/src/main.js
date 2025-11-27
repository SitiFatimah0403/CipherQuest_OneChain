import "./oneid/oneid.js";
import Start from './scenes/Start.js';
import BootScene from './scenes/Boot.js';
import Preloader from './scenes/Preloader.js';
import GameScene from './scenes/Game.js';
import CipherScene from './scenes/CipherScene.js';
import GameOver from './scenes/GameOver.js';
import PauseMenu from './scenes/PauseMenu.js';
import LeaderboardScene from "./scenes/LeaderboardScene.js";

const config = {
  type: Phaser.AUTO,
  title: 'CipherQuest',
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Start, BootScene, Preloader, GameScene, CipherScene, GameOver, PauseMenu, LeaderboardScene]
};

const game = new Phaser.Game(config);
window.game = game;


//  OneID returns token via popup
window.addEventListener("message", (event) => {
  if (!event.data?.oneid_redirect) return;

  const hash = event.data.oneid_redirect.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");

  if (token) {
    window.oneIdToken = token;
    window.oneIdAddress = "oneid_" + token.slice(0, 10);

    console.log("🎉 OneID login successful:", window.oneIdAddress);
  }
});