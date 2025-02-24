import ByteReader from './ByteReader';
import Util from './Util'

export default interface GameSettings {
    chordSupport: boolean;
    fcAPIndicator: boolean;
    enableHitSound: boolean;
    lowResolutionMode: boolean;
    deviceName: string;
    bright: number;
    musicVolume: number;
    effectVolume: number;
    hitSoundVolume: number;
    soundOffset: number;
    noteScale: number;
}

export default class GameSettings {
    constructor(data: string) {
        let Reader = new ByteReader(data)
        let tem = Reader.getByte()
        this.chordSupport = Util.getBit(tem, 0);
        this.fcAPIndicator = Util.getBit(tem, 1);
        this.enableHitSound = Util.getBit(tem, 2);
        this.lowResolutionMode = Util.getBit(tem, 3);
        this.deviceName = Reader.getString();
        this.bright = Reader.getFloat();
        this.musicVolume = Reader.getFloat();
        this.effectVolume = Reader.getFloat();
        this.hitSoundVolume = Reader.getFloat();
        this.soundOffset = Reader.getFloat();
        this.noteScale = Reader.getFloat();
    }
}
