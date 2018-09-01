declare module 'pizzicato' {
    export class Sound {
        constructor(options : object, onload : Function);

        clone() : void;
        disconnect() : void;
        play() : void;
        pause() : void;
        stop() : void;
    }
}