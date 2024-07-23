class SpriteAnimator {
    constructor(canvas, images) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.images = images;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.animationSpeed = 100; // 每帧间隔时间（毫秒）
        this.timer = null;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.animate();
        }
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.timer);
    }

    setSpeed(speed) {
        this.animationSpeed += speed;

    }

    animate() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.images[this.currentFrame], 0, 0, this.canvas.width, this.canvas.height);
        this.currentFrame = (this.currentFrame + 1) % this.images.length;
        if (this.isPlaying) {
            this.timer = setTimeout(() => this.animate(), Math.max(0, this.animationSpeed));
        }
    }
}