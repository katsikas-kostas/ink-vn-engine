import * as InkJs from "inkjs";
import { Canvas } from "./canvas";
import { Point } from "./point";
import { ClickableScreen } from "./screens/screen";
import { TextScreen } from "./screens/textscreen";
import { ChoiceScreen } from "./screens/choicescreen";
import { Background } from "./screens/background";

enum State {
    Waiting,
    TextAppearing,
    Choices
}

export class VisualNovInk {
    story : InkJs.Story;
    canvas : Canvas;

    private state : State;

    private previousTimestamp : number;

    private textSpeed : number = 30; // In char per second
    private textTime : number;

    private background : Background;
    private currentScreen : ClickableScreen;
    private textScreen : TextScreen;
    private choiceScreen : ChoiceScreen;

    private speakingCharacterName : string = "";

    constructor(story_filename : string, container_id : string, width : number, height : number) {
        this.canvas = new Canvas(container_id, width, height);

        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            this.story = new InkJs.Story(rawStory);

            this.background = new Background();
            
            this.textScreen = new TextScreen(this.canvas.Size, {
                OuterMargin : new Point(50),
                InnerMargin : new Point(15),
                Height : 200
            });
            this.choiceScreen = new ChoiceScreen();

            this.canvas.OnClick.subscribe(this.click.bind(this));

            this.continue();
            this.previousTimestamp = 0;
            this.requestStep();
        });
    }

    private continue() : void {
        if (this.story.canContinue) {
            this.story.Continue();

            if (this.story.currentText.replace(/\s/g, "").length <= 0) {
                this.continue();
            } else {
                this.changeState(State.TextAppearing);
                this.computeTags();
                (<TextScreen>this.currentScreen).Text = "";
                (<TextScreen>this.currentScreen).Name = this.speakingCharacterName;
            }
        } else if (this.story.currentChoices.length > 0) {
            this.changeState(State.Choices);
            this.computeTags();
            (<ChoiceScreen>this.currentScreen).Choices = this.story.currentChoices;
        } else {
        }
    }

    private step(timestamp : number) : void {
        const delta = timestamp - this.previousTimestamp;
        this.previousTimestamp = timestamp;

        this.canvas.Clear();

        switch (this.state) {
            case State.Waiting: {
                break;
            }
            case State.TextAppearing: {
                this.textTime += delta;

                if (this.textTime >= 1000.0 / this.textSpeed) {
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
                    }

                    this.textTime = this.textTime - (1000.0 / this.textSpeed);
                }

                break;
            }
            case State.Choices: {
                break;
            }
        }

        this.background.Draw(this.canvas);
        this.currentScreen.Draw(this.canvas);

        this.requestStep();
    }

    private computeTags() : void {
        const getFinalValue = (value : string) => {
            const valueMatch = value.match(/^\{(\w+)\}$/);
            if (valueMatch != null) {
                return this.story.variablesState.$(valueMatch[1]);
            }
            return value;
        };

        const tags = this.story.currentTags;
        if (tags.length > 0) {
            for (let i = 0; i < tags.length; ++i) {
                const match = tags[i].match(/^(\w+)\s*:\s*(.*)$/);
                if (match != null) {
                    // We need to know what tag it is
                    const key = match[1];
                    const value = getFinalValue(match[2]);
                    switch (key) {
                        case "background": {
                            this.background.BackgroundImage = value;
                            break;
                        }
                        case "sprite": {
                            console.log(value);
                            break;
                        }
                        case "name": {
                            this.speakingCharacterName = value;
                            break;
                        }
                    }
                } else {
                    // Unknown tags are treated as names
                    this.speakingCharacterName = getFinalValue(tags[i]);
                }
            }
        }
    }

    private click(sender : Canvas, clickPosition : Point) : void {
        switch (this.state) {
            case State.Waiting: {
                this.continue();
                break;
            }
            case State.TextAppearing: {
                (<TextScreen>this.currentScreen).Text = this.story.currentText;
                this.changeState(State.Waiting);
                break;
            }
            case State.Choices: {
                this.currentScreen.Click(clickPosition, this.validateChoice.bind(this));
                break;
            }
        }
    }

    private validateChoice(choiceIndex : number) : void {
        this.story.ChooseChoiceIndex(choiceIndex);
        this.continue();
    }

    private changeState(newState : State) : void {
        this.state = newState;
        switch (this.state) {
            case State.TextAppearing: {
                this.currentScreen = this.textScreen;
                this.textTime = 0;
                break;
            }
            case State.Choices: {
                this.currentScreen = this.choiceScreen;
                break;
            }
        }
    }

    private requestStep() : void {
        window.requestAnimationFrame(this.step.bind(this));
    }
}