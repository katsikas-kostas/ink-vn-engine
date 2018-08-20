import * as InkJs from "inkjs";
import { Canvas } from "./canvas";
import { Point } from "./point";
import { Screen } from "./screens/screen";
import { TextScreen } from "./screens/textscreen";
import { Background } from "./screens/background";

enum State {
    Waiting,
    TextAppearing
}

export class VisualNovInk {
    story : InkJs.Story;
    canvas : Canvas;

    private state : State;

    private textSpeed : number = 20; // In char per second
    private currentAnimationRequest : number;
    private currentTimeout : number;

    private background : Background;
    private currentScreen : Screen;

    constructor(story_filename : string, container_id : string, width : number, height : number) {
        this.canvas = new Canvas(container_id, width, height);

        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            this.story = new InkJs.Story(rawStory);

            this.currentScreen = new TextScreen(this.canvas.Size, {
            this.background = new Background("images/backgrounds/club.png");
            
                OuterMargin : new Point(50),
                InnerMargin : new Point(15),
                Height : 200
            });

            this.canvas.OnClick.subscribe(this.click.bind(this));

            this.continue();
        });
    }

    private continue() : void {
        if (this.story.canContinue) {
            this.story.Continue();
            this.changeState(State.TextAppearing);
        } else {
        }
    }

    private step(timestamp : number) : void {
        this.currentAnimationRequest = null;
        this.currentTimeout = null;

        this.canvas.Clear();

        switch (this.state) {
            case State.TextAppearing: {
                const text = (<TextScreen>this.currentScreen).Text;
                const currentText = this.story.currentText;
                if (text.length >= currentText.length) {
                    this.changeState(State.Waiting);
                    this.step(timestamp);
                } else {
                    let c = currentText.slice(text.length, text.length + 1);
                    (<TextScreen>this.currentScreen).Text += c
                    if (c == " " && text.length + 2 < currentText.length) {
                        let n = text.length;
                        while (currentText[n] == " " && n < currentText.length) { ++n; }
                        if (n < currentText.length) {
                            while (currentText[n] != " " && n < currentText.length) { ++n; }
                        }
                        (<TextScreen>this.currentScreen).NextWord = currentText.slice(text.length + 1, n);

                    }
                    this.currentTimeout = setTimeout(() => this.requestStep(), 1000 / this.textSpeed);
                }
                break;
            }
            case State.Waiting: {
                break;
            }
        }

        this.background.Draw(this.canvas);
        this.currentScreen.Draw(this.canvas);
    }

    private click(sender : Canvas, clickPosition : Point) : void {
        switch (this.state) {
            case State.TextAppearing: {
                // Skip apparition
                if (this.currentAnimationRequest != null) {
                    window.cancelAnimationFrame(this.currentAnimationRequest);
                }
                if (this.currentTimeout != null) {
                    window.clearTimeout(this.currentTimeout);
                    this.currentTimeout = null;
                }
                (<TextScreen>this.currentScreen).Text = this.story.currentText;
                this.changeState(State.Waiting);
                break;
            }
            case State.Waiting: {
                this.continue();
                break;
            }
        }
    }

    private changeState(newState : State) : void {
        this.state = newState;
        switch (this.state) {
            case State.TextAppearing: {
                (<TextScreen>this.currentScreen).Text = "";
                break;
            }
        }
        this.requestStep();
    }

    private requestStep() : void {
        this.currentAnimationRequest = window.requestAnimationFrame(this.step.bind(this));
    }
}