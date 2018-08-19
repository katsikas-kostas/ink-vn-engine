import * as InkJs from "inkjs";
import { Canvas } from "./canvas";

enum State {
    Waiting,
    TextAppearing
}

export class VisualNovInk {
    story : InkJs.Story;
    canvas : Canvas;

    private state : State;

    private currentText : string;
    private textSpeed : number = 20; // In char per second
    private currentAnimationRequest : number;
    private currentTimeout : number;

    constructor(story_filename : string, container_id : string, width : number, height : number) {
        this.canvas = new Canvas(container_id, width, height);

        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            this.story = new InkJs.Story(rawStory);
            this.continue();
        });
    }

    private continue() : void {
        if (this.story.canContinue) {
            this.story.Continue();
            this.state = State.TextAppearing;
            this.currentText = "";
            this.requestStep();
            this.canvas.element.onclick = this.click.bind(this);
        } else {
        }
    }

    private step(timestamp : number) : void {
        this.currentAnimationRequest = null;
        this.currentTimeout = null;

        this.canvas.Clear();

        switch (this.state) {
            case State.TextAppearing: {
                if (this.currentText.length >= this.story.currentText.length) {
                    this.state = State.Waiting;
                } else {
                    this.currentText += this.story.currentText.slice(this.currentText.length, this.currentText.length + 1);
                    this.canvas.DrawText(this.currentText);
                    this.currentTimeout = setTimeout(() => this.requestStep(), 1000 / this.textSpeed);
                }
                break;
            }
            case State.Waiting: {
                this.canvas.DrawText(this.currentText);
                break;
            }
        }
    }

    click() : void {
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
                this.state = State.Waiting;
                this.currentText = this.story.currentText;
                this.requestStep();
                break;
            }
            case State.Waiting: {
                this.continue();
                break;
            }
        }
    }

    private requestStep() : void {
        this.currentAnimationRequest = window.requestAnimationFrame(this.step.bind(this));
    }
}