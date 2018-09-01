export class LiteEvent<T1, T2> {
    private handlers : Array<(sender : T1, arg? : T2) => void> = [];

    Expose() : LiteEvent<T1, T2> {
        return this;
    }

    Off(handler : (sender : T1, arg? : T2) => void) : void {
        this.handlers = this.handlers.filter(_handler => _handler !== handler);
    }

    On(handler : (sender : T1, arg? : T2) => void) : void {
        this.handlers.push(handler);
    }

    Trigger(sender : T1, args? : T2) : void {
        this.handlers.forEach(handler => handler(sender, args));
    }
}
