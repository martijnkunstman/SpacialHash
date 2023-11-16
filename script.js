class SpatialHash {
  constructor(w,h, gridSize) {
    this.gridSize = gridSize;   
    this.horizontal = Math.ceil(w / gridSize);
    this.vertical = Math.ceil(h / gridSize);
    this.hashTable = Array.from({ length: this.vertical }, () =>
      Array.from({ length: this.horizontal }, () => [])
    );
    this.occupiedCells = [];
  }
  clear() {
    for (const [yIndex, xIndex] of this.occupiedCells) {
      this.hashTable[yIndex][xIndex].length = 0; // Clear the cell directly
    }
    this.occupiedCells.length = 0; // Clear the occupiedCells array
  }
  insert(object) {
    let xIndex = Math.floor(object.x / this.gridSize);
    let yIndex = Math.floor(object.y / this.gridSize);
    this.hashTable[yIndex][xIndex].push(object);
    this.occupiedCells.push([yIndex, xIndex]);
  }
}
class Boid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    this.w = CANVAS_WIDTH;
    this.h = CANVAS_HEIGHT;
  }
  checkOverlay(parents) {
    parents = [].concat(...parents);
    for (let a = 0; a < parents.length; a++) {
      counter++;
      let disx = parents[a].x - this.x;
      let disy = parents[a].y - this.y;
      fill(100,100,100);
      if (disx != 0 && disy != 0) {
        if (Math.hypot(disx, disy) < config.diameter) {
          fill(255, 0, 0);
          if (config.useBreak) {
            break;
          }
        }
      }
    }
  }
  update() {
    // Cache properties for quicker access
    let dx = this.direction.x;
    let dy = this.direction.y;
    let w = this.w;
    let h = this.h;
    // Update positions
    this.x += dx;
    this.y += dy;
    // Handle horizontal boundaries
    if (this.x < config.diameter || this.x > w - config.diameter) {
      this.direction.x = -dx;
      this.x = this.x < config.diameter ? config.diameter : w - config.diameter;
    }
    // Handle vertical boundaries
    if (this.y < config.diameter || this.y > h - config.diameter) {
      this.direction.y = -dy;
      this.y = this.y < config.diameter ? config.diameter : h - config.diameter;
    }
  }
}

// Constants for canvas dimensions
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const MAX_BOIDS = 2000;
const MIN_DIAMETER = 5;
const MAX_DIAMETER = 50;

// Simulation setup
let boids = [];
let spacialHash;
let grid;

// GUI Configuration
const config = {
  useSpacialHash: true,
  boidsCount: 1000,
  diameter: 10,
  useBreak: true,
};

// GUI setup
const gui = new dat.GUI();
gui.add(config, "useSpacialHash").onChange(reinitialize);
gui.add(config, "useBreak").onChange(reinitialize);
gui.add(config, "boidsCount", 10, MAX_BOIDS).step(1).onChange(reinitialize);
gui.add(config, "diameter", MIN_DIAMETER, MAX_DIAMETER).step(1).onChange(reinitialize);

// Create and insert the canvas element
const canvas = document.createElement('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);

// Get the canvas context for drawing
const ctx = canvas.getContext('2d');

// Replace p5's 'random' function
function random(min, max) {
  if (typeof max === 'undefined') {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

// Replace drawing functions with canvas context methods
function fill(r, g, b) {
  const color = g === undefined ? `rgb(${r}, ${r}, ${r})` : `rgb(${r}, ${g}, ${b})`;
  ctx.fillStyle = color;
}

function circle(x, y, diameter) {
  ctx.beginPath();
  ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI);
  ctx.fill();
}

function textSize(size) {
  ctx.font = `${size}px sans-serif`;
}

function text(str, x, y) {
  ctx.fillText(str, x, y);
}

// Replace 'frameRate()' with custom calculation
let lastFrameTime = Date.now();
function frameRate() {
  const currentFrameTime = Date.now();
  const fps = 1000 / (currentFrameTime - lastFrameTime);
  lastFrameTime = currentFrameTime;
  return fps;
}

// Mouse position tracking
let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', (event) => {
  mouseX = event.offsetX;
  mouseY = event.offsetY;
});

// Start the simulation
reinitialize();
draw();

function reinitialize() {
  boids = [];
  spacialHash = new SpatialHash(CANVAS_WIDTH, CANVAS_HEIGHT, config.diameter);
  for (let i = 0; i < config.boidsCount; i++) {
    const boid = new Boid(random(CANVAS_WIDTH), random(CANVAS_HEIGHT), config.diameter);
    boids.push(boid);
    spacialHash.insert(boid);
  }
  grid = config.diameter;
}

function neighbors(arr, m, n) {
  // define what a neighbor is
  let v = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  // filter edges & map
  return v
    .filter(
      ([h, j]) =>
        h + m >= 0 && h + m < arr.length && j + n >= 0 && j + n < arr[0].length
    )
    .map(([h, j]) => arr[h + m][j + n]);
}

function draw() {
  counter = 0;
  spacialHash.clear();
  for (let a = 0; a < boids.length; a++) {
    boids[a].update();
    spacialHash.insert(boids[a]);
  }
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  let xx = Math.floor(mouseX / grid);
  let yy = Math.floor(mouseY / grid);
  fill(255);
  ctx.fillRect(xx * grid, yy * grid, grid, grid);
  //get all 8 border cells in grid...
  fill(200);
  ctx.fillRect((xx - 1) * grid, (yy - 1) * grid, grid, grid);
  ctx.fillRect((xx - 1) * grid, yy * grid, grid, grid);
  ctx.fillRect((xx - 1) * grid, (yy + 1) * grid, grid, grid);
  ctx.fillRect((xx + 1) * grid, (yy - 1) * grid, grid, grid);
  ctx.fillRect((xx + 1) * grid, yy * grid, grid, grid);
  ctx.fillRect((xx + 1) * grid, (yy + 1) * grid, grid, grid);
  ctx.fillRect(xx * grid, (yy - 1) * grid, grid, grid);
  ctx.fillRect(xx * grid, (yy + 1) * grid, grid, grid);

  for (a = 0; a < spacialHash.hashTable.length; a++) {
    for (let b = 0; b < spacialHash.hashTable[a].length; b++) {
      for (let c = 0; c < spacialHash.hashTable[a][b].length; c++) {
        fill(200);
        //check overlay

        if (config.useSpacialHash) {
          spacialHash.hashTable[a][b][c].checkOverlay(
            neighbors(spacialHash.hashTable, a, b)
          );
        } else {
          spacialHash.hashTable[a][b][c].checkOverlay(boids);
        }

        //
        if (a >= yy - 1 && a <= yy + 1 && b >= xx - 1 && b <= xx + 1) {
          fill(51);
        }
        circle(
          spacialHash.hashTable[a][b][c].x,
          spacialHash.hashTable[a][b][c].y,
          config.diameter
        );
      }
    }``
  }
  fill(200);
  ctx.fillRect(0, 0, 180, 30);
  fill(0, 0, 0);
  textSize(16);
  text("fps:"+Math.round(frameRate()) + "- calc:" + counter, 10, 20);
  requestAnimationFrame(draw);
}