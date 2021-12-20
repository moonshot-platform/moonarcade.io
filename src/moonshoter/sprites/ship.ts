import { AssetType } from "../interface/assets";

export class Ship {
    static create(scene: Phaser.Scene): Phaser.Physics.Arcade.Sprite {
        let ship = scene.physics.add.sprite(window.innerWidth / 2, window.screen.availHeight - 100, AssetType.Ship);
        ship.setCollideWorldBounds(true);
        return ship;
    }
}