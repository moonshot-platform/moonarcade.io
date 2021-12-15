import { Bullet } from "../sprites/bullet";
import { Kaboom } from "../sprites/kaboom";

export class AssetManager {
    bullets: Phaser.Physics.Arcade.Group;
    enemyBullets: Phaser.Physics.Arcade.Group;
    explosions: Phaser.Physics.Arcade.Group;

    constructor(private _scene: Phaser.Scene) {
        this.bullets = this._createBullets();
        this.explosions = this._createExplosions();
    }

    gameOver() {
        this.enemyBullets.clear(true, true)
        this.bullets.clear(true, true)
    }

    reset() {
        this._createBullets();
    }



    private _createBullets(): Phaser.Physics.Arcade.Group {
        let bullets = this._scene.physics.add.group({
            max: 0,
            classType: Bullet,
            runChildUpdate: true
        });
        bullets.setOrigin(0.5, 1);
        return bullets;
    }

    private _createExplosions(): Phaser.Physics.Arcade.Group {
        let explosions = this._scene.physics.add.group({
            max: 0,
            classType: Kaboom,
            runChildUpdate: true
        });

        return explosions;
    }

}