export interface IRect {
    Position : Point;
    Size : Point;
}

export class Point {
    private x : number;
    private y : number;

    constructor();
    constructor(x : number);
    constructor(x : number, y : number);
    constructor(x? : number, y? : number) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : x != null ? x : 0;
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

    Clone() : Point {
        return new Point(this.X, this.Y);
    }

    Div(point : Point) : Point {
        return new Point(this.X / point.X, this.Y / point.Y);
    }

    IsInRect(rect : IRect) {
        return this.X >= rect.Position.X && this.X <= rect.Position.Add(rect.Size).X
            && this.Y >= rect.Position.Y && this.Y <= rect.Position.Add(rect.Size).Y;
    }

    Mult(point : Point) : Point {
        return new Point(this.X * point.X, this.Y * point.Y);
    }

    Sub(point : Point) : Point {
        return this.Add(new Point(-point.X, -point.Y));
    }
}
