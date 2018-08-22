class _Preloader {
    Preload(url : string) : void {
        fetch(url);
    }
}

export const Preloader = new _Preloader();