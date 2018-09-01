import * as InkJs from "inkjs";
import { Audio } from "./audio";
import { Canvas } from "./canvas";
import { Config } from "./config";
import { BoxBackgroundTypes } from "./layers/boxbackgrounds";
import * as Layers from "./layers/layers";
import { Point } from "./point";
import { Preloader } from "./preloader";

export class VN {
    Audio : Audio;
    Canvas : Canvas;
    Story : InkJs.Story;

    private background : Layers.Background;
    private characters : Layers.Characters;
    private choiceScreen : Layers.ChoiceLayer;
    private currentScreen : Layers.GameplayLayer;
    private previousTimestamp : number;
    private speakingCharacterName : string = "";
    private speechScreen : Layers.SpeechLayer;
    private transition : Layers.Transition;

    constructor(storyFilename : string, containerID : string) {
        this.Audio = new Audio();

        this.Canvas = new Canvas(containerID, Config.ScreenSize);

        fetch(storyFilename).then(response => response.text()).then(rawStory => {
            this.Story = new InkJs.Story(rawStory);
            Config.Load(this.Story.globalTags);
            this.Canvas.Size = Config.ScreenSize;

            this.background = new Layers.Background();
            this.characters = new Layers.Characters();

            this.speechScreen = new Layers.SpeechLayer(this.Canvas.Size, {
                Background : "rgba(0.0, 0.0, 0.0, 0.75)",
                BackgroundType : BoxBackgroundTypes.COLOR,
                FontColor : "white",
                FontSize : 24,
                Height : 200,
                InnerMargin : new Point(35),
                OuterMargin : new Point(50)
            });
            this.choiceScreen = new Layers.ChoiceLayer(this.Canvas.Size);

            this.Canvas.OnClick.subscribe(this.click.bind(this));

            this.continue();
            this.previousTimestamp = 0;
            this.requestStep();
        });
    }

    private click(sender : Canvas, clickPosition : Point) : void {
        if (this.transition != null) {
            return;
        }

        if (this.currentScreen instanceof Layers.ChoiceLayer) {
            this.currentScreen.Click(clickPosition, this.validateChoice.bind(this));
        } else {
            this.currentScreen.Click(clickPosition, () => this.continue());
        }
    }

    private computeTags() : void {
        const getFinalValue = (value : string) => {
            const valueMatch = value.match(/^\{(\w+)\}$/);
            if (valueMatch != null) {
                return this.Story.variablesState.$(valueMatch[1]);
            }
            return value;
        };

        const tags = this.Story.currentTags;
        if (tags.length > 0) {
            for (let i = 0; i < tags.length; ++i) {
                const match = tags[i].match(/^(\w+)\s*:\s*(.*)$/);
                if (match != null) {
                    // We need to know what tag it is
                    const key : string = match[1];
                    const value : string = getFinalValue(match[2]);
                    switch (key) {
                        case "preload": {
                            value.split(",").forEach(_value => Preloader.Preload(_value.trim()));
                            break;
                        }
                        case "background": {
                            this.background.BackgroundImage = value;
                            break;
                        }
                        case "sprite": {
                            if (value.length > 0) {
                                this.characters.Add(value, this.Canvas);
                            } else {
                                this.characters.Remove();
                            }
                            break;
                        }
                        case "name": {
                            this.speakingCharacterName = value;
                            break;
                        }
                        case "bgm": {
                            if (value.length > 0) {
                                this.Audio.PlayBGM(value);
                            } else {
                                this.Audio.StopBGM();
                            }
                            break;
                        }
                        case "sfx": {
                            this.Audio.PlaySFX(value);
                            break;
                        }
                        case "transition": {
                            this.transition = new Layers.Transition(this.Canvas.GetImageData());
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

    private continue() : void {
        if (this.transition != null) { return; }

        if (this.Story.canContinue) {
            this.Story.Continue();

            if (this.Story.currentText.replace(/\s/g, "").length <= 0) {
                this.continue();
            } else {
                this.computeTags();
                this.speechScreen.Say(this.Story.currentText, this.speakingCharacterName);
                this.currentScreen = this.speechScreen;
            }
        } else if (this.Story.currentChoices.length > 0) {
            this.computeTags();
            this.choiceScreen.Choices = this.Story.currentChoices;
            this.currentScreen = this.choiceScreen;
        } else {
            // TODO It's the end
        }
    }

    private requestStep() : void {
        window.requestAnimationFrame(this.step.bind(this));
    }

    private step(timestamp : number) : void {
        const delta = timestamp - this.previousTimestamp;
        this.previousTimestamp = timestamp;

        this.Canvas.Clear();

        if (this.transition != null) {
            this.transition.Step(delta);
        } else {
            this.currentScreen.Step(delta);
        }

        this.background.Draw(this.Canvas);
        this.characters.Draw(this.Canvas);
        if (this.transition != null) {
            this.transition.Draw(this.Canvas);
        } else {
            this.currentScreen.Draw(this.Canvas);
        }

        this.requestStep();
    }

    private validateChoice(choiceIndex : number) : void {
        this.Story.ChooseChoiceIndex(choiceIndex);
        this.continue();
    }
}
