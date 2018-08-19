export class Point {
    private x : number;
    private y : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    get X() : number {
        return this.x;
    }

    set X(x : number) {
        this.x = x;
    }

    get Y() : number {
        return this.y;
    }

    set Y(y : number) {
        this.y = y;
    }
}