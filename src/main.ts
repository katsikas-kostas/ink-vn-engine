import * as InkJs from "inkjs";

import { Canvas } from "./canvas";
import { Point } from "./point";
import { Preloader } from "./preloader";

import * as Layers from "./layers/layers";

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

    private background : Layers.Background;
    private characters : Layers.Characters;

    private currentScreen : Layers.GameplayLayer;
    private textScreen : Layers.TextLayer;
    private choiceScreen : Layers.ChoiceLayer;

    private transition : Layers.Transition;

    private speakingCharacterName : string = "";

    constructor(story_filename : string, container_id : string, width : number, height : number) {
        this.canvas = new Canvas(container_id, width, height);

        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            this.story = new InkJs.Story(rawStory);

            this.background = new Layers.Background();
            this.characters = new Layers.Characters();

            this.textScreen = new Layers.TextLayer(this.canvas.Size, {
                OuterMargin : new Point(50),
                InnerMargin : new Point(15),
                Height : 200
            });
            this.choiceScreen = new Layers.ChoiceLayer();

            this.canvas.OnClick.subscribe(this.click.bind(this));

            this.continue();
            this.previousTimestamp = 0;
            this.requestStep();
        });
    }

    private continue() : void {
        if (this.transition != null) { return; }

        if (this.story.canContinue) {
            this.story.Continue();

            if (this.story.currentText.replace(/\s/g, "").length <= 0) {
                this.continue();
            } else {
                this.changeState(State.TextAppearing);
                this.computeTags();
                (<Layers.TextLayer>this.currentScreen).Text = "";
                (<Layers.TextLayer>this.currentScreen).Name = this.speakingCharacterName;
            }
        } else if (this.story.currentChoices.length > 0) {
            this.changeState(State.Choices);
            this.computeTags();
            (<Layers.ChoiceLayer>this.currentScreen).Choices = this.story.currentChoices;
        } else {
        }
    }

    private step(timestamp : number) : void {
        const delta = timestamp - this.previousTimestamp;
        this.previousTimestamp = timestamp;

        this.canvas.Clear();

        if (this.transition != null) {
            this.transition.Step(delta);
        } else {
            switch (this.state) {
                case State.Waiting: {
                    break;
                }
                case State.TextAppearing: {
                    // TODO: Move this inside TextScreen and we can remove the whole state management from here.
                    this.textTime += delta;

                    if (this.textTime >= 1000.0 / this.textSpeed) {
                        const text = (<Layers.TextLayer>this.currentScreen).Text;
                        const currentText = this.story.currentText;
                        if (text.length >= currentText.length) {
                            this.changeState(State.Waiting);
                            this.step(timestamp);
                        } else {
                            let c = currentText.slice(text.length, text.length + 1);
                            (<Layers.TextLayer>this.currentScreen).Text += c
                            if (c == " " && text.length + 2 < currentText.length) {
                                let n = text.length;
                                while (currentText[n] == " " && n < currentText.length) { ++n; }
                                if (n < currentText.length) {
                                    while (currentText[n] != " " && n < currentText.length) { ++n; }
                                }
                                (<Layers.TextLayer>this.currentScreen).NextWord = currentText.slice(text.length + 1, n);
        
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
        }

        this.background.Draw(this.canvas);
        this.characters.Draw(this.canvas);
        if (this.transition != null) {
            this.transition.Draw(this.canvas);
        } else {
            this.currentScreen.Draw(this.canvas);
        }

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
                    const key : string = match[1];
                    const value : string = getFinalValue(match[2]);
                    switch (key) {
                        case "preload": {
                            value.split(",").forEach((_value) => Preloader.Preload(_value.trim()));
                            break;
                        }
                        case "background": {
                            this.background.BackgroundImage = value;
                            break;
                        }
                        case "sprite": {
                            if (value.length > 0) {
                                this.characters.Add(value, this.canvas);
                            } else {
                                this.characters.Remove();
                            }
                            break;
                        }
                        case "name": {
                            this.speakingCharacterName = value;
                            break;
                        }
                        case "transition": {
                            this.transition = new Layers.Transition(this.canvas.GetImageData());
                            this.transition.OnEnd.subscribe((sender, args) => {
                                this.transition = null;

                            });
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
        if (this.transition != null) { return; }

        switch (this.state) {
            case State.Waiting: {
                this.continue();
                break;
            }
            case State.TextAppearing: {
                (<Layers.TextLayer>this.currentScreen).Text = this.story.currentText;
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