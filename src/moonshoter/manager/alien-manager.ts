import { Alien } from "../sprites/alien";
import { AssetType } from "../interface/assets";
import { AnimationType } from "../interface/factory/animation-factory";

export class AlienManager {
    aliens: Phaser.Physics.Arcade.Group;
    alienVelocity: number = 120;

    get hasAliveAliens(): boolean {
        return !!this.aliens.children.size
    }
    constructor(private _scene: Phaser.Scene) {
        this.aliens = this._scene.physics.add.group({
            classType: Alien,
            runChildUpdate: true,
        });

        this.generateEnemy()
        this.aliens.setOrigin(0, 0)
        //this._sortAliens();
        this._animate();
    }

    generateEnemy() {
        var enemy: Phaser.Physics.Arcade.Sprite;

        enemy = this.aliens.create(
            Phaser.Math.RND.integerInRange(30, window.screen.availWidth - 50),
            -30
        );
        enemy.setOrigin(0.5, 0.5);
        enemy.play(AnimationType.Fly)
        // enemy.setImmovable(false);
        //enemy.setRotation(Phaser.Math.RND.integerInRange(1, 180))
        this.aliens.add(enemy, true);
        //console.log(this.aliens.children.size);
        setTimeout(() => {
            this.generateEnemy();
        }, 750);

    }

    reset() {
        this.aliens.clear(true, true);
        this._animate();
    }

    private _sortAliens() {
        this.aliens.children.each((alien: Alien) => {
            alien.setVelocityY(-220)
        })
    }

    private _animate() {
        this.aliens.children.iterate((alien: Alien) => {
            if (alien !== undefined) {
                this._scene.tweens.add({
                    targets: alien,
                    ease: "Linear",
                    duration: 2000,
                    paused: false,
                    delay: 0,
                    yoyo: false,
                    repeat: 0,

                })

                alien.setVelocityY(this.alienVelocity);
                if (alien.y > window.screen.height - 10) {
                    alien.destroy(true);
                    alien = null;
                    //this.aliens.children.delete(alien);
                    //console.log("DESTROYED!");
                }
            }
        })

        setTimeout(() => { this._animate() }, 500)
    }

}