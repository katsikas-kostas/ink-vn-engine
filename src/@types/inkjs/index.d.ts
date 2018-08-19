declare module 'inkjs' {
    export class Story {
        constructor(jsonString : string)
        constructor(jsonString : string, lists : [])
    
        canContinue : boolean;
        currentText : string;
    
        Continue() : void;
        ContinueMaximally() : void;
    }
}
