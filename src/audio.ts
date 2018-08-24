import { Howl, Howler } from "howler";

export class Audio {
    private bgm : Howl
    private bgmURL : string;

    constructor() {
    }

    PlayBGM(bgmURL : string) : void {
        if (bgmURL != this.bgmURL) {
            this.bgmURL = bgmURL;

            const bgm = new Howl({ src : [bgmURL] });
            bgm.loop(true);
            bgm.once("load", () => {
                if (this.bgm != null) {
                    this.bgm.stop();
                    this.bgm.unload();
                }
                bgm.play();
                this.bgm = bgm;
            });
        }
    }

    StopBGM() : void {
        if (this.bgm != null) {
            this.bgm.stop();
            this.bgm.unload();
            this.bgmURL = null;
            this.bgm = null;
        }
    }
}