class ImageLoader {
    constructor(images, subscribeProgress) {
        this.images = images; // 图片数组的 URL
        this.loadedImages = []; // 存储加载完成的图片元素
        this.progress = 0; // 加载进度
        this.individualProgresses = new Array(images.length).fill(0); // 单张图片的加载进度
        this.subscribeProgress = subscribeProgress
    }

    load() {
        return Promise.all(this.images.map((url, index) => this.loadImage(url, index))).catch((err) => {

            let failIndex = []
            this.loadedImages.map((item, index) => {
                if (!item) failIndex.push(index + 1)
            })
            const completeProgress = (this.images.length - failIndex.length) / this.images.length
            this.subscribeProgress(`${completeProgress.toFixed(2) * 100}%，第${failIndex.toString()}张加载失败`)
        })
            ;
    }
    loadImage(url, index) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const contentLength = Number(response.headers.get('content-length') || 0);
                    let receivedLength = 0; // 已接收的字节数
                    const reader = response.body.getReader();
                    const chunks = []; // 接收到的二进制块

                    const read = () => {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                const blob = new Blob(chunks);
                                const img = new Image();
                                img.onload = () => {
                                    this.loadedImages[index] = img;
                                    resolve(img);
                                };
                                img.src = URL.createObjectURL(blob);
                                return;
                            }
                            chunks.push(value);
                            receivedLength += value.length;
                            this.individualProgresses[index] = receivedLength / contentLength;

                            // 加载完成的进度。 加载完成张数/总数
                            const completeProgress = this.loadedImages.filter(Boolean).length / this.images.length;


                            if (contentLength === receivedLength) {
                                this.loadedImages[index] = url;
                            }


                            this.progress = completeProgress * 100 + this.individualProgresses[index] * 20
                            // 当前加载图片的进度 * 20% 转换为总进度
                            subscribeProgress(`${this.progress}%`)
                            console.log(`Loading progress for image : ${this.progress}%`);
                            read();
                        }).catch(error => {
                            reject(error);
                        });
                    };

                    read(() => {


                    });
                })
                .catch(error => {
                    this.loadedImages[index] = false;
                    reject(error);
                });
        });


        // return new Promise((resolve, reject) => {
        //     const total = this.images.length;
        //     this.images.forEach((url, index) => {
        //         const img = new Image();
        //         img.onload = () => {
        //             this.loadedImages[index] = img;
        //             this.progress = this.loadedImages.filter(Boolean).length / total;
        //             console.log(`Loading progress: ${this.progress * 100}%`);
        //             if (this.loadedImages.length === total && this.loadedImages.every(Boolean)) {
        //                 resolve(this.loadedImages);
        //             }
        //         };
        //         img.onerror = reject;
        //         img.src = url;
        //     });
        // });
    }
}