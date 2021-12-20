import 'phaser';
import { MoonshoterScene } from './moonshoter/scenes/moonshoter';

const config = {
    title: "Moonshoter",
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scene: MoonshoterScene,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: "arcade"
    },
    parent: "Moonshoters"
};

const game = new Phaser.Game(config);
