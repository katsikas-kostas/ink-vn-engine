import * as Pizzicato from "pizzicato";

export class Audio {
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
