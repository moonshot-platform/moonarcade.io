import 'phaser';
import { MoonshoterScene } from './moonshoter/scenes/moonshoter';

const config = {
    title: "Moonshoter",
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scene: MoonshoterScene,
    physics: {
        default: "arcade"
    },
    scale: {
        mode: Phaser.Scale.FIT,
        width: window.innerWidth,
        height: window.innerHeight
    },
    parent: "Moonshoters"
};

const game = new Phaser.Game(config);
