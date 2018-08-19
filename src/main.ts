import { sayHello } from "./greet";
import * as InkJs from "inkjs";

function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}

fetch("story.json").then((response) => response.text()).then((rawStory) => {
    console.log(rawStory);
    let story = new InkJs.Story(rawStory);
    console.log(story);
    if (story.canContinue) {
        story.Continue();
        showHello("greeting", story.currentText);
    } else {    
        showHello("greeting", ":/");
    }
});