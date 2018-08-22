class _Config {
    private textSpeed : number
    private textSpeedRatio : number;

    constructor() {
        // Load default values
        this.TextSpeed = 30; // This is in char per second
    }

    Load() {
        // TODO Load config
    }

    get TextSpeed() : number {
        return this.textSpeed;
    }

    get TextSpeedRatio() : number {
        return this.textSpeedRatio;
    }

    set TextSpeed(value : number) {
        this.textSpeed = value;
        this.textSpeedRatio = 1000.0 / this.textSpeed;
    }
}

export let Config = new _Config();