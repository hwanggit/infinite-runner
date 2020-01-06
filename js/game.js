
// global game options
let gameOptions = {
   platformStartSpeed: 300,
   cloudSpeed: 2,
   spawnRange: [100, 350],
   platformSizeRange: [50, 200],
   playerGravity: 1800,
   jumpForce: 400,
   playerStartPosition: 200,
   jumps: 2
}

window.onload = function() {

   // object containing configuration options
   let config = {
       type: Phaser.AUTO,
       width: 800,
       height: 600,
       scene: playGame,
       backgroundColor: 0x444444,

       // physics settings
       physics: {
           default: "arcade"
       }
   }
   game = new Phaser.Game(config);
   // window.focus();
   // resize();
   // window.addEventListener("resize", resize, false);
}

// playGame scene
class playGame extends Phaser.Scene{
   constructor(){
       super("PlayGame");
   }
   preload(){
       this.load.setBaseURL('../assets/');
       this.load.image('sky', 'bg1.png');
       this.load.image('platform', 'platform.png');
       this.load.image('player', 'player.png');
       this.load.image('clouds', 'clouds.png');
   }
   create(){
      this.add.image(400,300,'sky');
      this.add.image(400, 530, 'clouds');

       // group with all active platforms.
       this.activePlatforms = this.add.group({

           // once a platform is removed, it's added to the pool
           removeCallback: function(platform){
               platform.scene.platformPool.add(platform)
           }
       });

       // pool
       this.platformPool = this.add.group();

       // number of consecutive jumps made by the player
       this.playerJumps = 0;

       // adding a platform to the game, the arguments are platform width and x position
       this.addPlatform(game.config.width, game.config.width / 2);

       // adding the player;
       this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player").setScale(0.7);
       this.player.setGravityY(gameOptions.playerGravity);

       this.cursors = this.input.keyboard.createCursorKeys();


       // setting collisions between the player and the platform group
       this.physics.add.collider(this.player, this.activePlatforms);

       // checking for input
       this.input.on("pointerdown", this.jump, this);
   }

   addPlatform (platformWidth, posX) {
     let platform;
     if (this.platformPool.getLength()) {
       platform = this.platformPool.getFirst();
       platform.x = posX;
       platform.active = true;
       platform.visible = true;
       this.platformPool.remove(platform);
       platform.scene.activePlatforms.add(platform);
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
       if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)){
           if(this.player.body.touching.down){
               this.playerJumps = 0;
           }
           this.player.setVelocityY(gameOptions.jumpForce * -2);
           this.playerJumps ++;
       }
   }
   update(){

       // game over
       if(this.player.y > game.config.height){
           this.scene.start("PlayGame");
       }
       this.player.x = gameOptions.playerStartPosition;

       // if (this.cursors.up.isDown) {
       //   this.jump();
       // }

       // recycling platforms
       let minDistance = game.config.width;
       this.activePlatforms.getChildren().forEach(function(platform){
           let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
           minDistance = Math.min(minDistance, platformDistance);
           if(platform.x < - platform.displayWidth / 2){
               this.activePlatforms.killAndHide(platform);
               this.activePlatforms.remove(platform);
           }
       }, this);

       // adding new platforms
       if(minDistance > this.nextPlatformDistance){
           var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
           this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2);
       }
   }
};
