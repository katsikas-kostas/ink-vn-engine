class ClassPreloader {
    Preload(url : string) : void {
        fetch(url);
    }
}

export const Preloader = new ClassPreloader();
