import { GameplayLayer } from "./layers";
import { Canvas } from "../canvas";
import { Point } from "../point";
import { BoxBackground, BoxBackgroundTypes, BoxBackgroundFactory } from "./boxbackgrounds";

import { Config } from "../config";

interface BoxConfiguration {
    FontSize : number
    FontColor : string,
    BackgroundType : BoxBackgroundTypes,
    Background : string
}

export interface SpeechBoxConfiguration extends BoxConfiguration {
    OuterMargin : Point
    InnerMargin : Point
    Height : number
}

interface NameBoxConfiguration extends BoxConfiguration {
    Width : number
    Height : number
}

const REWRAP_THIS_LINE = "<[{REWRAP_THIS_LINE}]>"

class SpeechBox {
    private position : Point;
    private size : Point;
    private innerMargin : Point;
    private innerSize : Point;

    private boxBackground : BoxBackground;

    private fontSize : number;
    private fontColor : string;

    private textLines : [string] = [""];
    private nextWord : string;

    constructor(position : Point, size : Point, configuration : SpeechBoxConfiguration) {
        this.position = position.Clone();
        this.size = size.Clone();
        this.innerMargin = configuration.InnerMargin;
        this.innerSize = this.size.Sub(this.innerMargin.Mult(new Point(2)));

        this.boxBackground = BoxBackgroundFactory.Create(
            configuration.BackgroundType, configuration.Background,
            this.size.Clone()
        );

        this.fontSize = configuration.FontSize;
        this.fontColor = configuration.FontColor;
    }

    get Text() : string {
        return this.textLines.join(" ");
    }

    set Text(text : string) {
        let _text = this.Text;
        if (text.indexOf(_text) == 0) {
            let slice = text.slice(_text.length);
            this.textLines[this.textLines.length - 1] += slice;
            if (slice.length > 1) {
                this.nextWord = REWRAP_THIS_LINE;
            }
        } else {
            this.textLines = [text];
        }
    }

    set NextWord(nextWord : string) {
        this.nextWord = nextWord;
    }

    private doTheWrap(canvas : Canvas) : void {
        canvas.DrawText0("", "transparent", this.fontSize);
        const comp = (line : string) => canvas.MeasureTextWidth(line) > this.innerSize.X;

        let lastLine = this.textLines[this.textLines.length - 1];

        if (this.nextWord == REWRAP_THIS_LINE) {
            // Need to wrap the fuck out of this line
            while (comp(lastLine)) {
                // Get to the char where we're outside the boudaries
                let n = 0;
                while (!comp(lastLine.slice(0, n))) { ++n; }
                // Get the previous space
                while (lastLine[n] != " " && n >= 0) { --n; }
                if (n == 0) { break; } // We can't wrap more
                // Append, update last line, and back in the loop
                this.textLines.push(lastLine.slice(n + 1)); // +1 because we don't want the space
                this.textLines[this.textLines.length - 2] = lastLine.slice(0, n);
                lastLine = this.textLines[this.textLines.length - 1];
            }
        } else {
            if (comp(lastLine + this.nextWord)) {
                this.textLines[this.textLines.length - 1] = lastLine.slice(0, lastLine.length - 1);
                this.textLines.push("");
            }
        }
    }

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.position);

        this.boxBackground.Draw(canvas);

        canvas.Translate(this.position.Add(this.innerMargin));

        if (this.nextWord != null) {
            this.doTheWrap(canvas);
            this.nextWord = null;
        }

        for (let i = 0; i < this.textLines.length; ++i) {
            canvas.DrawText(
                this.textLines[i],
                new Point(0, i * (this.fontSize * 1.42857)), // This is the golden ratio, on line-height and font-size
                this.fontColor,
                this.fontSize,
                this.innerSize.X
            );
        }

        canvas.Restore();
    }
}

class NameBox {
    private name : string;

    private position : Point;
    private size : Point;
    private innerMargin : Point;

    private fontSize : number;
    private fontColor : string;

    private backgroundURL : string = "images/9patch-small.png";
    private boxBackground : BoxBackground;

    constructor(position : Point, configuration : NameBoxConfiguration);
    constructor(position : Point, configuration : NameBoxConfiguration, name? : string) {
        this.size = new Point(configuration.Width, configuration.Height);
        this.position = position.Clone();
        this.position.Y -= this.size.Y;

        this.innerMargin = this.size.Div(new Point(10, 10));

        this.fontSize = configuration.FontSize;
        this.fontColor = configuration.FontColor;

        this.boxBackground = BoxBackgroundFactory.Create(
            configuration.BackgroundType, configuration.Background, 
            this.size.Clone()
        );
    }

    set Name(name : string) {
        if (name != this.name) {
            this.name = name;
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.name.length > 0) {
            canvas.Translate(this.position);
            this.boxBackground.Draw(canvas);
            canvas.DrawText(this.name, this.innerMargin, this.fontColor, this.fontSize, this.size.X);
            canvas.Restore();
        }
    }
}

export class SpeechLayer extends GameplayLayer {
    private textBox : SpeechBox;
    private nameBox : NameBox;

    private fullText : string;
    private textTime : number = 0;
    private textAppeared : boolean = false;

    constructor(screenSize : Point, speechBoxConfiguration : SpeechBoxConfiguration) {
        super()

        let textBoxSize = new Point(
            screenSize.X - (speechBoxConfiguration.OuterMargin.X * 2),
            speechBoxConfiguration.Height
        );
        let textBoxPosition = new Point(
            speechBoxConfiguration.OuterMargin.X,
            screenSize.Y - speechBoxConfiguration.OuterMargin.Y - speechBoxConfiguration.Height
        );
        this.textBox = new SpeechBox(textBoxPosition, textBoxSize, speechBoxConfiguration);
    
        this.nameBox = new NameBox(
            textBoxPosition.Add(new Point(70, 0)),
            {
                Width : 100,
                Height : 40,
                FontSize : 24,
                FontColor : "black",
                BackgroundType : speechBoxConfiguration.BackgroundType,
                Background : speechBoxConfiguration.Background
            }
        );
    }

    Say(text : string, name : string) : void {
        this.textBox.Text = "";
        this.fullText = text;
        this.textAppeared = false;

        this.nameBox.Name = name;
    }

    Step(delta : number) : void {
        this.textTime += delta;

        if (this.textTime >= Config.TextSpeedRatio) {
            if (this.textBox.Text.length < this.fullText.length) {
                let c = this.fullText.slice(this.textBox.Text.length, this.textBox.Text.length + 1);
                this.textBox.Text += c
                if (c == " " && this.textBox.Text.length + 2 < this.fullText.length) {
                    let n = this.textBox.Text.length;
                    while (this.fullText[n] == " " && n < this.fullText.length) { ++n; }
                    if (n < this.fullText.length) {
                        while (this.fullText[n] != " " && n < this.fullText.length) { ++n; }
                    }
                    this.textBox.NextWord = this.fullText.slice(this.textBox.Text.length + 1, n);
                }
            } else {
                this.textAppeared = true;
            }

            this.textTime = this.textTime - Config.TextSpeedRatio;
        }
    }

    Draw(canvas : Canvas) : void {
        this.textBox.Draw(canvas);
        this.nameBox.Draw(canvas);
    }

    Click(clickPosition : Point, action : Function) : void {
        if (this.textAppeared) {
            action();
        } else {
            this.textBox.Text = this.fullText;
            this.textAppeared = true;
        }
    }
}