import 'phaser';

export default class Demo extends Phaser.Scene {
    constructor() {
        super('demo');

    }

    preload() {
        this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', 'assets/starfields.glsl.js');
    }

    create() {
        this.add.shader('RGB Shift Field', 0, 0, window.innerWidth, window.innerHeight).setOrigin(0);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scene: Demo,
    width: window.screen.availWidth,
    height: window.screen.availHeight
};

const game = new Phaser.Game(config);
