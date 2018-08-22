declare module 'inkjs' {
    export class Choice {
        constructor()

        index : number;
        text : string
    }

    export class Story {
        constructor(jsonString : string)
        constructor(jsonString : string, lists : [])
    
        canContinue : boolean
        currentChoices : Choice[]
        currentTags : string[]
        currentText : string
        globalTags : string[]

        ChooseChoiceIndex(choiceIdx : number) : void
        Continue() : void
        ContinueMaximally() : void
    }

    export class Tag {
        constructor(tagText : string)

        text : string
    }
}
