// src/scenes/CipherScene.js
export default class CipherScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CipherScene' });
  }

  init(data) {
    this.callback = data.callback; // from GameScene
    this.iconRef = data.iconRef; // puzzle icon reference
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    this.box = this.add.rectangle(width / 2, height / 2, 460, 300, 0x111111)
    .setOrigin(0.5)
    .setStrokeStyle(2, 0x00ffff);


    this.title = this.add.text(width / 2, height / 2 - 100, '🧩 Cipher Puzzle', {
      font: '22px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.feedback = this.add.text(width / 2, height / 2 + 130, '', {
      font: '18px monospace',
      fill: '#00ff00'
    }).setOrigin(0.5);

    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;

    // Large cipher question pool (ROT-shift puzzles)
  this.puzzlePool = Phaser.Utils.Array.Shuffle([
    { code: 'UYTQF', answer: 'SWORD', shift: 2 },
    { code: 'YJCV', answer: 'WHAT', shift: 2 },
    { code: 'KHOOR', answer: 'HELLO', shift: 3 },
    { code: 'URYYB', answer: 'HELLO', shift: 13 },
    { code: 'EBG13', answer: 'ROT13', shift: 13 },
    { code: 'MTPU', answer: 'KSRN', shift: 2 },
    { code: 'ZPV', answer: 'YOU', shift: 1 },
    { code: 'CFTU', answer: 'BEST', shift: 1 },
    { code: 'RWBBN', answer: 'PUZZL', shift: 2 },
    { code: 'JCRRA', answer: 'HAPPY', shift: 2 },
    { code: 'KHOORZRUOG', answer: 'HELLOWORLD', shift: 3 },
    { code: 'GUVF', answer: 'THIS', shift: 13 },
    { code: 'YBIR', answer: 'LOVE', shift: 13 },
    { code: 'TBCC', answer: 'SABB', shift: 1 },
    { code: 'JGNNQ', answer: 'HELLO', shift: 2 },
    { code: 'FUBBG', answer: 'SHOOT', shift: 13 },
    { code: 'EQTTG', answer: 'CORRE', shift: 2 },
    { code: 'ZRYBA', answer: 'MELON', shift: 13 },
    { code: 'PGRV', answer: 'NEPT', shift: 2 },
    { code: 'URYYBZLFRJBEQ', answer: 'HELLOMYFRIEND', shift: 13 },
  ]);


    // Pick 3 unique questions for this one puzzle icon
    this.questions = this.puzzlePool.splice(0, 3);
    this.displayQuestion();
  }

  displayQuestion() {
    const { width, height } = this.cameras.main;

    // If all questions answered → success
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endPuzzle(true);
      return;
    }

    const q = this.questions[this.currentQuestionIndex];
    this.clearOldButtons();

    // Show progress like “Question 1 of 3”
    this.progressText = this.add.text(width / 2, height / 2 - 70,
      `Question ${this.currentQuestionIndex + 1} / 3`, {
        font: '16px monospace',
        fill: '#cccccc'
      }).setOrigin(0.5);

    // Cipher question
    this.questionText = this.add.text(width / 2, height / 2 - 20,
      `Hint: Shift -${q.shift} letters\nDecode: ${q.code}`, {
        font: '18px monospace',
        fill: '#00ffff',
        align: 'center'
      }).setOrigin(0.5);

    // Randomized multiple-choice options
    const options = Phaser.Utils.Array.Shuffle([
      q.answer,
      this.randomFakeWord(q.answer),
      this.randomFakeWord(q.answer)
    ]);

    const startY = height / 2 + 20;
    this.optionButtons = [];

    options.forEach((opt, i) => {
      const btn = this.add.text(width / 2, startY + i * 40, `[ ${opt} ]`, {
        font: '18px monospace',
        fill: '#00ff88'
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => btn.setStyle({ fill: '#ffff00' }))
        .on('pointerout', () => btn.setStyle({ fill: '#00ff88' }))
        .on('pointerdown', () => this.checkAnswer(opt, q.answer));

      this.optionButtons.push(btn);
    });
  }

  randomFakeWord(word) {
    // generates a fake answer by scrambling
    const letters = word.split('');
    Phaser.Utils.Array.Shuffle(letters);
    return letters.join('').toUpperCase();
  }

  clearOldButtons() {
    if (this.optionButtons) this.optionButtons.forEach(b => b.destroy());
    if (this.questionText) this.questionText.destroy();
    if (this.progressText) this.progressText.destroy();
  }

  checkAnswer(selected, correct) {
    const correctAns = selected === correct;
    if (correctAns) {
  this.feedback.setText('✅ Correct!');
  this.feedback.alpha = 1;

  this.tweens.add({
    targets: this.feedback,
    alpha: 0,
    duration: 700,
    delay: 500
  });

  this.correctAnswers++;
  this.time.delayedCall(1000, () => {
    this.currentQuestionIndex++;
    this.feedback.setText('');
    this.feedback.alpha = 1; // reset before next question
    this.displayQuestion();
  });
}
else {
      this.feedback.setText('❌ Wrong! Puzzle failed.');
      this.time.delayedCall(1000, () => this.endPuzzle(false));
    }
  }

  endPuzzle(success) {
    // Remove the puzzle icon from map
    if (this.iconRef && this.iconRef.destroy) {
      this.iconRef.destroy();
    }

    // End scene and report result
    this.scene.stop('CipherScene');
    if (this.callback) this.callback(success && this.correctAnswers === 3);
  }
}
