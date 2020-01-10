
// global game options
let gameOptions = {
   platformStartSpeed: 300,
   cloudSpeed: 2,
   spawnRange: [100, 200],
   platformSizeRange: [50, 200],
   playerGravity: 4000,
   jumpForce: 400,
   playerStartPosition: 200,
   jumps: 2,
   jumpKey: "SPACE"
}

window.onload = function() {

   // object containing configuration options
   let config = {
       type: Phaser.AUTO,
       width: 800,
       height: 600,
       scene: [titleScene, playGame],
       backgroundColor: 0x444444,

       // physics settings
       physics: {
           default: "arcade"
       }
   }
   game = new Phaser.Game(config);
}

var bestScore = 0;

//title scene
class titleScene extends Phaser.Scene {
  constructor() {
    super({key: "TitleScene"});
  }

  preload() {
    this.load.setBaseURL('../assets/');
    this.load.image('title', 'titleText.png');
    this.load.image('bg', 'bg1.png');
    this.load.image('city', 'city.png');

  }

  playGameScene() {
    this.scene.start("PlayGame");
  }

  create() {
    this.add.image(400,300,'bg');
    this.add.image(400,450, 'city');
    this.add.image(400, 250, 'title').setScale(.5);
    this.scoreText = this.add.text(350, 350, "Best Score: " + bestScore, { fontSize: '20px arial',  fill: '#000' });
    this.input.keyboard.on("keydown-" + "SPACE", this.playGameScene, this);

  }
}

// playGame scene
class playGame extends Phaser.Scene{
   constructor(){
       super({key: "PlayGame"});
   }
   preload(){
       this.load.setBaseURL('../assets/');
       this.load.image('sky', 'bg2.png');
       this.load.image('platform', 'platform.png');
       this.load.image('player', 'player.png');
       this.load.image('clouds', 'clouds.png');
       this.load.audio('coin1', 'coin1.mp3');
       this.load.audio('coin2', 'coin2.mp3');
       this.load.audio('coin3', 'coin3.mp3');
       this.load.audio('coin4', 'coin4.mp3');
   }


   create(){
      this.add.image(400,300,'sky');
      this.add.image(400, 530, 'clouds');
      this.jumpSound = this.sound.add('coin3');

       // group with all active platforms.
       this.activePlatforms = this.add.group();

       // pool
       this.platformPool = this.add.group();

       // number of consecutive jumps made by the player
       this.playerJumps = 0;

       //number of total jumps made
       this.playerScore = 0;

       // adding a platform to the game, the arguments are platform width and x position
       this.addPlatform(game.config.width, game.config.width / 2);

       // adding the player;
       this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player").setScale(0.7);
       this.player.setGravityY(gameOptions.playerGravity);


       // setting collisions between the player and the platform group
       this.physics.add.collider(this.player, this.activePlatforms);

       // checking for input
       this.input.on("pointerdown", this.jump, this);
       this.input.keyboard.on("keydown-" + gameOptions.jumpKey, this.jump, this);
   }

   addPlatform (platformWidth, posX) {
     let platform;
     if (this.platformPool.getLength()) {
       platform = this.platformPool.getFirst();
       platform.x = posX;
       platform.active = true;
       platform.visible = true;
       this.platformPool.remove(platform);
       this.activePlatforms.add(platform);
     } else {
       platform = this.physics.add.sprite(posX, game.config.height * 0.9, 'platform').setScale(0.7);
       platform.setImmovable(true);
       platform.setVelocityX(gameOptions.platformStartSpeed * -1);
       this.activePlatforms.add(platform);
     }
     platform.displayWidth = platformWidth;
     this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
   }

   // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
   jump(){
      var hasJumpsLeftAboveZero = this.playerJumps > 0 && this.playerJumps < gameOptions.jumps;
       if(this.player.body.touching.down || hasJumpsLeftAboveZero){
           if(this.player.body.touching.down){
               this.playerJumps = 0;
           }
           this.player.setVelocityY(gameOptions.jumpForce * -2);
           this.jumpSound.play();
           this.playerJumps ++;
           this.playerScore ++;

       }
   }

   gameOver() {
     if (this.playerScore > bestScore) {
       bestScore = this.playerScore;
     }
     this.scene.start("TitleScene");
   }

   update(){
       // game over
       if(this.player.y > game.config.height){
            this.gameOver();
       }
       this.player.x = gameOptions.playerStartPosition;
       // recycling platforms
       let minDistance = game.config.width;
       this.activePlatforms.getChildren().forEach(function(platform){
           let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
           minDistance = Math.min(minDistance, platformDistance);
           if(platform.x < - platform.displayWidth / 2){
               this.activePlatforms.killAndHide(platform);
               this.activePlatforms.remove(platform);
               this.platformPool.add(platform);
           }
       }, this);

       // adding new platforms
       if(minDistance > this.nextPlatformDistance){
           var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
           this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2);
       }
   }
};
