export class Point {
    private x : number;
    private y : number;

    constructor();
    constructor(x : number)
    constructor(x : number, y : number);
    constructor(x? : number, y? : number){
        this.x = x || 0;
        this.y = y || x || 0;
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

    Add(point : Point) : Point {
        return new Point(this.X + point.X, this.Y + point.Y);
    }

    Sub(point : Point) : Point {
        return this.Add(new Point(-point.X, -point.Y));
    }

    Mult(point : Point) : Point {
        return new Point(this.X * point.X, this.Y * point.Y);
    }
}