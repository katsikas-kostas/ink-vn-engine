import * as InkJs from "inkjs";

import { Preloader } from "./preloader";
import { Config } from "./config";

import { Point } from "./point";

import { Audio } from "./audio";
import { Canvas } from "./canvas";
import * as Layers from "./layers/layers";
import { BoxBackgroundTypes } from "./layers/boxbackgrounds";

export class VN {
    Story : InkJs.Story
    Canvas : Canvas
    Audio : Audio

    private previousTimestamp : number

    private background : Layers.Background
    private characters : Layers.Characters

    private currentScreen : Layers.GameplayLayer
    private speechScreen : Layers.SpeechLayer
    private choiceScreen : Layers.ChoiceLayer

    private transition : Layers.Transition

    private speakingCharacterName : string = ""

    constructor(story_filename : string, container_id : string) {
        this.Audio = new Audio();

        this.Canvas = new Canvas(container_id, Config.ScreenSize);

        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            this.Story = new InkJs.Story(rawStory);
            Config.Load(this.Story.globalTags);
            this.Canvas.Size = Config.ScreenSize;

            this.background = new Layers.Background();
            this.characters = new Layers.Characters();

            this.speechScreen = new Layers.SpeechLayer(this.Canvas.Size, {
                OuterMargin : new Point(50),
                InnerMargin : new Point(35),
                Height : 200,
                FontSize : 24,
                FontColor : "white",
                BackgroundType : BoxBackgroundTypes.COLOR,
                Background : "rgba(0.0, 0.0, 0.0, 0.75)"
            });
            this.choiceScreen = new Layers.ChoiceLayer();

            this.Canvas.OnClick.subscribe(this.click.bind(this));

            this.continue();
            this.previousTimestamp = 0;
            this.requestStep();
        });
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
                            value.split(",").forEach((_value) => Preloader.Preload(_value.trim()));
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
                            break
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

    private validateChoice(choiceIndex : number) : void {
        this.Story.ChooseChoiceIndex(choiceIndex);
        this.continue();
    }

    private requestStep() : void {
        window.requestAnimationFrame(this.step.bind(this));
    }
}