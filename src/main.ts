import { sayHello } from "./greet";
import * as InkJs from "inkjs";

function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}

export class VisualNovInk {
    constructor(story_filename : string) {
        fetch(story_filename).then((response) => response.text()).then((rawStory) => {
            let story = new InkJs.Story(rawStory);
            if (story.canContinue) {
                story.Continue();
                showHello("greeting", story.currentText);
            } else {    
                showHello("greeting", ":/");
            }
        });
    }
}