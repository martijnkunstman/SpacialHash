let canvasWidth = 600;
let canvasHeight = 500;
let spacialHash;
let boids = [];
let diameter = 20;
let boidsCount = 50;
let useSpacialHash = true;
let grid;
let counter = 0;
let log = true;

let config = {
  useSpacialHash: true,
  boidsCount: 50,
  diameter: 20,
}

const gui = new dat.GUI();
gui.add(config, 'useSpacialHash').onChange((value) => {
  useSpacialHash = value;
  createSpacialHash();
});
gui.add(config, 'boidsCount', 10, 1000).step(1).onChange((value) => {
  boidsCount = value;
  createSpacialHash();
});
gui.add(config, 'diameter', 10, 100).step(1).onChange((value) => {   
  diameter = value;
  createSpacialHash();
});

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

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  createSpacialHash();
}


function createSpacialHash() {
  boids = [];
  spacialHash = [];
  grid = diameter;
  spacialHash = new SpatialHash({ w: canvasWidth, h: canvasHeight }, grid);
  for (let a = 0; a < boidsCount; a++) {
    let boid = new Boid(random(0, canvasWidth), random(0, canvasHeight));
    boids.push(boid);
    spacialHash.insert(boid);
  }
 
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

        if (useSpacialHash) {
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
          diameter
        );
      }
    }
  }
  fill(200);
  rect(0, 0, 200, 40);
  fill(0, 0, 0);
  textSize(32);
  text(Math.round(frameRate()) + "-" + counter, 10, 30);
}

class Boid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    this.w = canvasWidth;
    this.h = canvasHeight;
  }
  checkOverlay(parents) {
    parents = [].concat(...parents);
    for (let a = 0; a < parents.length; a++) {
      counter++;
      let disx = parents[a].x - this.x;
      let disy = parents[a].y - this.y;
      if (disx != 0 && disy != 0) {
        if (Math.hypot(disx, disy) < diameter) {
          fill(255, 0, 0);
          break;
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
    if (this.x < diameter || this.x > w - diameter) {
      this.direction.x = -dx;
      this.x = this.x < diameter ? diameter : w - diameter;
    }
    // Handle vertical boundaries
    if (this.y < diameter || this.y > h - diameter) {
      this.direction.y = -dy;
      this.y = this.y < diameter ? diameter : h - diameter;
    }
  }
}

class SpatialHash {
  constructor(bounds, gridSize) {
    this.gridSize = gridSize;
    this.hashTable = [];
    this.horizontal = Math.ceil(bounds.w / gridSize);
    this.vertical = Math.ceil(bounds.h / gridSize);
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
