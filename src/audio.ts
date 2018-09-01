import * as Pizzicato from "pizzicato";

export class AudioFactory {
    static Create() : Audio {
        if (Pizzicato != null) {
            return new PizzicatoAudio();
        } else {
            return new DummyAudio();
        }
    }
}

export abstract class Audio {
    abstract PlayBGM(bgmURL : string) : void;
    abstract PlaySFX(sfxURL : string) : void;
    abstract StopBGM() : void;
}

class PizzicatoAudio extends Audio {
    private bgm : Pizzicato.Sound;
    private bgmURL : string;

    PlayBGM(bgmURL : string) : void {
        if (bgmURL !== this.bgmURL) {
            this.bgmURL = bgmURL;

            const bgm = new Pizzicato.Sound({
                options : {
                    loop : true,
                    path : bgmURL
                },
                source : "file"
            }, () => {
                if (this.bgm != null) {
                    this.bgm.stop();
                    this.bgm.disconnect();
                }
                bgm.play();
                this.bgm = bgm;
            });
        }
    }

    PlaySFX(sfxURL : string) : void {
        const sfx = new Pizzicato.Sound({
            options : { path : sfxURL },
            source : "file"
        }, () => sfx.play());
    }

    StopBGM() : void {
        if (this.bgm != null) {
            this.bgm.stop();
            this.bgm.disconnect();
            this.bgmURL = null;
            this.bgm = null;
        }
    }
}

class DummyAudio extends Audio {
    PlayBGM(bgmURL : string) : void { }
    PlaySFX(sfxURL : string) : void { }
    StopBGM() : void { }
}
