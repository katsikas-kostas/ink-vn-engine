import { Point } from "./point";



class _Config {
    DefaultTextSpeed : number = 30;
    private textSpeed : number
    private textSpeedRatio : number;

    ScreenSize : Point = new Point(800, 600);

    constructor() {
        this.TextSpeed = this.DefaultTextSpeed; // This is in char per second
    }

    Load(tags : string[]) : void {
        function error(tag : string) {
            console.error(`Error reading tag: "${tag}"`);
        }

        for (let i = 0; i < tags.length; ++i) {
            let key, value;
            try {
                key = tags[i].split(":")[0].trim();
                value = tags[i].split(":")[1].trim();
            } catch (e) {
                if (e instanceof TypeError) {
                    error(tags[i]);
                    break;
                }
            }

            try {
                switch (key) {
                    case "screen_size":
                    case "screensize": {
                        const size = value.split(/\D+/).map((x) => parseInt(x));
                        if (size.length == 2 && !isNaN(size[0]) && !isNaN(size[1])) {
                            this.ScreenSize = new Point(size[0], size[1]);
                        } else {
                            throw new TypeError();
                        }
                        break;
                    }
                    case "text_speed":
                    case "textspeed": {
                        const speed = parseInt(value);
                        if (!isNaN(speed)) {
                            this.DefaultTextSpeed = this.TextSpeed = speed;
                            console.log(this.textSpeed);
                        } else {
                            throw new TypeError();
                        }
                        break;
                    }
                }
            } catch (e) {
                if (e instanceof TypeError) {
                    error(tags[i]);
                }
            }
        }
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