// Constants for canvas dimensions
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const MAX_BOIDS = 2000;
const MIN_DIAMETER = 5;
const MAX_DIAMETER = 50;

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

// Simulation setup
let boids = [];
let spacialHash;
let grid;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  reinitialize();
}

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
  background(120, 120, 120);

  let xx = Math.floor(mouseX / grid);
  let yy = Math.floor(mouseY / grid);
  fill(255);
  rect(xx * grid, yy * grid, grid, grid);
  //get all 8 border cells in grid...
  fill(200);
  rect((xx - 1) * grid, (yy - 1) * grid, grid, grid);
  rect((xx - 1) * grid, yy * grid, grid, grid);
  rect((xx - 1) * grid, (yy + 1) * grid, grid, grid);
  rect((xx + 1) * grid, (yy - 1) * grid, grid, grid);
  rect((xx + 1) * grid, yy * grid, grid, grid);
  rect((xx + 1) * grid, (yy + 1) * grid, grid, grid);
  rect(xx * grid, (yy - 1) * grid, grid, grid);
  rect(xx * grid, (yy + 1) * grid, grid, grid);

  for (a = 0; a < spacialHash.hashTable.length; a++) {
    for (let b = 0; b < spacialHash.hashTable[a].length; b++) {
      for (let c = 0; c < spacialHash.hashTable[a][b].length; c++) {
        fill(255);
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
    }
  }
  fill(200);
  rect(0, 0, 180, 30);
  fill(0, 0, 0);
  textSize(16);
  text("fps:"+Math.round(frameRate()) + "- calc:" + counter, 10, 20);
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

class SpatialHash {
  constructor(w,h, gridSize) {
    this.gridSize = gridSize;
    this.hashTable = [];
    this.horizontal = Math.ceil(w / gridSize);
    this.vertical = Math.ceil(h / gridSize);
    this.hashTable = Array.from({ length: this.vertical }, () =>
      Array.from({ length: this.horizontal }, () => [])
    );
    this.occupiedCells = new Set();
  }
  clear() {
    this.occupiedCells.forEach((cell) => {
      let [a, b] = cell.split(",").map(Number);
      this.hashTable[a][b] = [];
    });
    this.occupiedCells.clear();
  }
  insert(object) {
    let xIndex = Math.floor(object.x / this.gridSize);
    let yIndex = Math.floor(object.y / this.gridSize);
    this.hashTable[yIndex][xIndex].push(object);
    this.occupiedCells.add(`${yIndex},${xIndex}`);
  }
}
