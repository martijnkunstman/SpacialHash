const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const BOIDS_COUNT = 1000;
const DIAMETER = 18;
const GRAVITY = 0.004;
const DAMPING = 0.995;
const SEED = 123457;

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
const boids = [];
let counter = 0;
const debugDiv = document.querySelector("#debug");

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

// Usage
const randomSeed = new SeededRandom(SEED);

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  normalize() {
    let len = Math.sqrt(this.x * this.x + this.y * this.y);
    if (len < 0.00000000001) {
      len = 0.00000000001;
    }
    this.x /= len;
    this.y /= len;
  }
}

class Boid {
  constructor(
    x = randomSeed.random() * CANVAS_WIDTH,
    y = randomSeed.random() * CANVAS_HEIGHT
  ) {
    this.x = x;
    this.y = y;
    this.direction = {
      x: randomSeed.random() * 2 - 1,
      y: randomSeed.random() * 2 - 1,
    };
    this.dirxtemp;
    this.dirytemp;
    this.influence = 0;
  }
  update() {
    // External influence
    this.influence = 0;
    this.dirxtemp = this.direction.x;
    this.dirytemp = this.direction.y;
    ctx.fillStyle = "black";
    for (let i = 0; i < boids.length; i++) {
      if (boids[i] === this) continue;
      let dx = boids[i].x - this.x;
      let dy = boids[i].y - this.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < DIAMETER * 2) {
        let influencetemp = 255 - (d / (DIAMETER * 2)) * 255;
        let vector = new Vector(dx, dy);
        vector.normalize();
        this.dirxtemp -= (vector.x * influencetemp) / 2550;
        this.dirytemp -= (vector.y * influencetemp) / 2550;
        if (this.influence < influencetemp) {
          this.influence = influencetemp;
        }
      }
    }
  }
  render() {
    // Cache properties for quicker access

    this.direction.x = this.dirxtemp * DAMPING;
    this.direction.y = this.dirytemp * DAMPING;
    this.direction.y = this.direction.y + GRAVITY;

    let dx = this.direction.x;
    let dy = this.direction.y;
    let w = CANVAS_WIDTH;
    let h = CANVAS_HEIGHT;
    // Update positions
    this.x += dx;
    this.y += dy;
    // Handle horizontal boundaries
    if (this.x < DIAMETER || this.x > w - DIAMETER) {
      this.direction.x = -dx;
      this.x = this.x < DIAMETER ? DIAMETER : w - DIAMETER;
    }
    // Handle vertical boundaries
    if (this.y < DIAMETER || this.y > h - DIAMETER) {
      this.direction.y = -dy;
      this.y = this.y < DIAMETER ? DIAMETER : h - DIAMETER;
    }
    // Handle floor
    if (this.y > CANVAS_HEIGHT - DIAMETER * 10) {
      let lift = (CANVAS_HEIGHT - this.y) / CANVAS_HEIGHT;
      this.direction.y -= (lift + 0.01) * 0.01; // Adjust the 0.05 value to control the strength of the lift
    }
    
    let gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      DIAMETER
    );

    gradient.addColorStop(0, "rgba(" + this.influence + ", 0, 0, 1)"); // Opaque center
    gradient.addColorStop(1, "rgba(" + this.influence + ", 0, 0, 0)"); // Transparent edges

    //ctx.fillStyle = "rgb(" + this.influence + ", 0, 0)";
    // Apply the gradient to the circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, DIAMETER, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function init() {
  for (let i = 0; i < BOIDS_COUNT; i++) {
    boids.push(new Boid());
  }
}

function update() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < boids.length; i++) {
    boids[i].update();
  }
  for (let i = 0; i < boids.length; i++) {
    boids[i].render();
  }
  debugDiv.innerHTML = "FPS: " + Math.round(frameRate());
  requestAnimationFrame(update);
}

canvas.addEventListener("click", function (event) {
  console.log("click");
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  boids.push(new Boid(x, y));
});

init();
update();
