const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const BOIDS_COUNT = 2000;
const DIAMETER = 5;
const GRAVITY = 0.005;
const DAMPING = 0.995;
const SEED = 123456;

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

const boids = new Float32Array(BOIDS_COUNT * 4);
const debugDiv = document.querySelector("#debug");
let counter;
const randomSeed = new SeededRandom(SEED);

//boids = [xp,yp,xd,xy];

function init() {
  for (let i = 0; i < BOIDS_COUNT; i++) {
    boids[0 + i * 4] = randomSeed.random() * CANVAS_WIDTH;
    boids[1 + i * 4] = randomSeed.random() * CANVAS_HEIGHT;
    boids[2 + i * 4] = randomSeed.random() * 2 - 1;
    boids[3 + i * 4] = randomSeed.random() * 2 - 1;
  }
}
let imgData;
function update() {
  counter = 0;
  imgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < boids.length / 4; i++) {
    //
    for (let j = 0; j < boids.length / 4; j++) {
      counter++;
      if (i == j) continue;
      let dx = boids[0 + i * 4] - boids[0 + j * 4];
      let dy = boids[1 + i * 4] - boids[1 + j * 4];
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < DIAMETER * 2) {
        let influence = 1 - d / (DIAMETER * 2);
        //
        let len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
        //
        boids[2 + i * 4] += (dx * influence) / 100;
        boids[3 + i * 4] += (dy * influence) / 100;
      }
    }
    //
  }
  for (let i = 0; i < boids.length / 4; i++) {
    //render boids position
    boids[2 + i * 4] = boids[2 + i * 4] * DAMPING;
    boids[3 + i * 4] = boids[3 + i * 4] * DAMPING + GRAVITY;

    //update boids position based on direction
    boids[0 + i * 4] = boids[0 + i * 4] + boids[2 + i * 4];
    boids[1 + i * 4] = boids[1 + i * 4] + boids[3 + i * 4];
    // Handle horizontal boundaries
    if (
      boids[0 + i * 4] < DIAMETER ||
      boids[0 + i * 4] > CANVAS_WIDTH - DIAMETER
    ) {
      boids[2 + i * 4] = -boids[2 + i * 4];
      boids[0 + i * 4] =
        boids[0 + i * 4] < DIAMETER ? DIAMETER : CANVAS_WIDTH - DIAMETER;
    }
    // Handle vertical boundaries
    if (
      boids[1 + i * 4] < DIAMETER ||
      boids[1 + i * 4] > CANVAS_HEIGHT - DIAMETER
    ) {
      boids[3 + i * 4] = -boids[3 + i * 4];
      boids[1 + i * 4] =
        boids[1 + i * 4] < DIAMETER ? DIAMETER : CANVAS_HEIGHT - DIAMETER;
    }

    let x = Math.floor(boids[0 + i * 4]);
    let y = Math.floor(boids[1 + i * 4]);
    //imgData.data[(Math.floor(x) + Math.floor(y) * CANVAS_WIDTH) * 4] = 255;
    //imgData.data[(Math.floor(x) + Math.floor(y) * CANVAS_WIDTH) * 4 + 1] = 0;
    //imgData.data[(Math.floor(x) + Math.floor(y) * CANVAS_WIDTH) * 4 + 2] = 0;
    imgData.data[(x + y * CANVAS_WIDTH) * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  debugDiv.innerHTML =
    "FPS: " + Math.round(frameRate()) + " - counter: " + counter;
  requestAnimationFrame(update);
}

init();
update();
