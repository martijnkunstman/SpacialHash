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

let lastFrameTime = Date.now();
function frameRate() {
  const currentFrameTime = Date.now();
  const fps = 1000 / (currentFrameTime - lastFrameTime);
  lastFrameTime = currentFrameTime;
  return fps;
}

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
    insert(x, y, i) {      
      let xIndex = Math.floor(x / this.gridSize);
      let yIndex = Math.floor(y / this.gridSize);
      this.hashTable[yIndex][xIndex].push(i);
      this.occupiedCells.push([yIndex, xIndex]);
    }
  }
