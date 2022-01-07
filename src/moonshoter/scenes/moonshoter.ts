import { AssetType, SoundType } from "../interface/assets";
import { Bullet } from "../sprites/bullet";
import { AssetManager } from "../manager/asset-manager";
import { AlienManager } from "../manager/alien-manager";
import { Ship } from "../sprites/ship";
import {
    AnimationFactory,
    AnimationType,
} from "../interface/factory/animation-factory";
import { Alien } from "../sprites/alien";
import { Kaboom } from "../sprites/kaboom";
import { ScoreManager } from "../manager/score-manager";
import { GameState } from "../interface/game-state";
import { EnemyBullet } from "../sprites/enemy-bullet";

export class MoonshoterScene extends Phaser.Scene {
    state: GameState;
    assetManager: AssetManager;
    animationFactory: AnimationFactory;
    scoreManager: ScoreManager;
    bulletTime = 0;
    firingTimer = 0;
    enemyMoveTimer = 0;
    starfield: Phaser.GameObjects.TileSprite;
    player: Phaser.Physics.Arcade.Sprite;
    alienManager: AlienManager;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    fireKey: Phaser.Input.Keyboard.Key;
    isEnemyAvailableToFire: boolean = false;
    isEnemyAvailableToMove: boolean = true;

    constructor() {
        super({
            key: "MoonshoterScene",
        });
    }

    preload() {
        this.load.setBaseURL("/assets");
        this.load.image(AssetType.Starfield, "/images/starfield.png");
        this.load.image(AssetType.Bullet, "/images/bullet.png");
        this.load.image(AssetType.EnemyBullet, "/images/enemy-bullet.png");
        this.load.spritesheet(AssetType.Alien, "/images/invader.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.image(AssetType.Ship, "/images/player.png");
        this.load.spritesheet(AssetType.Kaboom, "/images/explode.png", {
            frameWidth: 128,
            frameHeight: 128,
        });

        this.sound.volume = 0.5;
        this.load.audio(SoundType.Shoot, "/audio/shoot.wav");
        this.load.audio(SoundType.Kaboom, "/audio/explosion.wav");
        this.load.audio(SoundType.InvaderKilled, "/audio/invaderkilled.wav");
    }

    create() {
        this.state = GameState.Playing;
        this.starfield = this.add
            .tileSprite(0, 0, window.innerWidth, window.innerHeight, AssetType.Starfield)
            .setOrigin(0, 0);
        this.assetManager = new AssetManager(this);
        this.animationFactory = new AnimationFactory(this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.player = Ship.create(this);
        this.alienManager = new AlienManager(this);
        this.scoreManager = new ScoreManager(this);

        this.fireKey.on("down", () => {
            switch (this.state) {
                case GameState.Win:
                case GameState.GameOver:
                    this.restart();
                    break;
            }
        })

        if (window.DeviceMotionEvent) {
            window.addEventListener('deviceorientation', this.handleOrientation, true);
            window.addEventListener('devicemotion', this.handleOrientation, true);
        } else {
            alert("devicemotion not supported on your device or browser.");
        }

    }

    update() {

        this.starfield.tilePositionY -= 1;

        this._shipKeyboardHandler();

        if (this.time.now > this.firingTimer && this.isEnemyAvailableToFire) {
            this._enemyFires();
        }

        if (this.time.now > this.enemyMoveTimer && this.isEnemyAvailableToMove) {
            this._moveRandomEnemy();
        }

        this.physics.overlap(
            this.assetManager.bullets,
            this.alienManager.aliens,
            this._bulletHitAliens,
            null,
            this
        );
        this.physics.overlap(
            this.alienManager.aliens,
            this.player,
            this._enemyHitPlayer,
            null,
            this
        );

        this.physics.overlap(
            this.assetManager.enemyBullets,
            this.player,
            this._enemyBulletHitPlayer,
            null,
            this
        );
    }

    handleOrientation(e: any) {
        // let playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        console.log(e.acceleration.x);
    }

    private _shipKeyboardHandler() {
        let playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setVelocity(0, 0);
        if (this.cursors.left.isDown) {
            playerBody.setVelocityX(-500);
        } else if (this.cursors.right.isDown) {
            playerBody.setVelocityX(500);
        }

        if (this.fireKey.isDown) {
            this._fireBullet();
        }
    }

    private _bulletHitAliens(bullet: Bullet, alien: Alien) {
        let explosion: Kaboom = this.assetManager.explosions.get();
        bullet.kill();
        alien.kill(explosion);
        this.scoreManager.increaseScore();
        if (!this.alienManager.hasAliveAliens) {
            this.scoreManager.increaseScore(1000);
            // this.scoreManager.setWinText();
            // this.state = GameState.Win;
        }
        if (this.scoreManager.score > 1500) {

            this.alienManager.alienVelocity = 500;

        } else if (this.scoreManager.score > 1000) {

            if (!this.isEnemyAvailableToFire)
                this.isEnemyAvailableToFire = true;

            this.alienManager.alienVelocity = 400;

        } else if (this.scoreManager.score > 500) {

            if (!this.isEnemyAvailableToMove)
                this.isEnemyAvailableToMove = true;

            this.alienManager.alienVelocity = 300;

        } else if (this.scoreManager.score > 300) {

            this.alienManager.alienVelocity = 200;

        }
    }

    private _enemyHitPlayer(ship: Ship, enemy: Alien) {
        let explosion: Kaboom = this.assetManager.explosions.get();
        enemy.kill(explosion);
        let live: Phaser.GameObjects.Sprite = this.scoreManager.lives.getFirstAlive();
        if (live) {
            live.setActive(false).setVisible(false);
        }

        explosion.setPosition(this.player.x, this.player.y);
        explosion.play(AnimationType.Kaboom);
        this.sound.play(SoundType.Kaboom)
        if (this.scoreManager.noMoreLives) {
            this.scoreManager.setGameOverText();
            this.assetManager.gameOver();
            this.state = GameState.GameOver;
            this.player.disableBody(true, true);
        }
    }



    private _enemyFires() {
        if (!this.player.active) {
            return;
        }

        let enemyBullet: EnemyBullet = this.assetManager.enemyBullets.get();
        let randomEnemy = this.alienManager.getRandomAliveEnemy();

        if (enemyBullet && randomEnemy) {
            if (randomEnemy.y > window.screen.availHeight - 500) {
                return;
            } else {
                enemyBullet.setPosition(randomEnemy.x, randomEnemy.y);
                this.physics.moveToObject(enemyBullet, this.player, 100);
                this.firingTimer = this.time.now + 1500;
            }
        }
    }

    private _enemyBulletHitPlayer(ship, enemyBullet: EnemyBullet) {
        let explosion: Kaboom = this.assetManager.explosions.get();
        enemyBullet.kill();
        let live: Phaser.GameObjects.Sprite = this.scoreManager.lives.getFirstAlive();
        if (live) {
            live.setActive(false).setVisible(false);
        }

        explosion.setPosition(this.player.x, this.player.y);
        explosion.play(AnimationType.Kaboom);
        this.sound.play(SoundType.Kaboom)
        if (this.scoreManager.noMoreLives) {
            this.scoreManager.setGameOverText();
            this.assetManager.gameOver();
            this.state = GameState.GameOver;
            this.player.disableBody(true, true);
        }
    }


    private _fireBullet() {
        if (!this.player.active) {
            return;
        }

        if (this.time.now > this.bulletTime) {
            let bullet: Bullet = this.assetManager.bullets.get();
            if (bullet) {
                bullet.shoot(this.player.x, this.player.y - 18);
                this.bulletTime = this.time.now + 200;
            }
        }
    }

    restart() {
        this.state = GameState.Playing;
        this.player.enableBody(true, this.player.x, this.player.y, true, true);
        this.scoreManager.resetLives();
        this.scoreManager.hideText();
        this.alienManager.reset();
        this.assetManager.reset();
    }
}
