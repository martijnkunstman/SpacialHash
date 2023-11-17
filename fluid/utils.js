class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  random() {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

let lastFrameTime = Date.now();
function frameRate() {
  const currentFrameTime = Date.now();
  const fps = 1000 / (currentFrameTime - lastFrameTime);
  lastFrameTime = currentFrameTime;
  return fps;
}
