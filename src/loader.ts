class ClassLoader {
    LoadImage(URL : string) : Promise<ImageBitmap> {
        return new Promise((resolve : Function, reject : Function) => {
            const worker : Worker = this.createWorker();

            worker.addEventListener("message", (evt : MessageEvent) => {
                if (evt.data.err) {
                    reject();
                } else {
                    resolve(evt.data);
                }
                worker.terminate();
            });

            worker.postMessage(`${document.location.href}${URL}`);
        });
    }

    private createWorker() : Worker {
        return new Worker(URL.createObjectURL(new Blob([`(function ${this.worker})()`])));
    }

    private worker() {
        const ctx : Worker = self as any;
        ctx.addEventListener("message", (evt : MessageEvent) => {
            fetch(evt.data).then(response => response.blob()).then(blobData => {
                createImageBitmap(blobData).then(image => ctx.postMessage(image));
            });
        });
    }
}

export const Loader = new ClassLoader();
