declare module 'inkjs' {
    export class Story {
        constructor(jsonString : string)
        constructor(jsonString : string, lists : [])
    
        canContinue : boolean
        currentText : string
        currentChoices : [Choice]
        currentTags : [string]

        Continue() : void
        ContinueMaximally() : void
        ChooseChoiceIndex(choiceIdx : number) : void
    }

    export class Choice {
        constructor()

        text : string
        index : number;
    }
}
