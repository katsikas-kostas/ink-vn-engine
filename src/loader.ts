class _Loader {
    LoadImage(URL : string) : Promise<ImageBitmap> {
        return new Promise((resolve : Function, reject : Function) => {
            let worker : Worker = this.createWorker();

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

    private worker() {
        const ctx : Worker = self as any;
        ctx.addEventListener("message", (evt : MessageEvent) => {
            fetch(evt.data).then(response => response.blob()).then(blobData => {
                createImageBitmap(blobData).then(image => ctx.postMessage(image));
            });
        });
    }

    private createWorker() : Worker {
        return new Worker(URL.createObjectURL(new Blob([`(function ${this.worker})()`])));
    }
}

export const Loader = new _Loader();