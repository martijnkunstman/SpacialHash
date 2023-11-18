const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const BOIDS_COUNT = 2000;
const DIAMETER = 10;
const GRAVITY = 0.005;
const DAMPING = 0.95;
const SEED = 123456;

const USEHASH = true;

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);

let spacialHash = new SpatialHash(CANVAS_WIDTH, CANVAS_HEIGHT, DIAMETER);

let stop = false;

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

  if (USEHASH) {
    spacialHash.clear();
    for (let i = 0; i < BOIDS_COUNT; i++) {
      spacialHash.insert(boids[0 + i * 4], boids[1 + i * 4], i * 4);
    }    
    for (a = 0; a < spacialHash.hashTable.length; a++) {
      for (let b = 0; b < spacialHash.hashTable[a].length; b++) {
        for (let c = 0; c < spacialHash.hashTable[a][b].length; c++) {
          let i = spacialHash.hashTable[a][b][c];
          let nextTo = neighbors(spacialHash.hashTable, a, b);
          nextTo = [].concat(...nextTo);
          for (cc = 0; cc < nextTo.length; cc++) {
            counter++;
            if (i == nextTo[cc]) {
              
              continue;    
            }        
            let j = nextTo[cc];
            let dx = boids[0 + i] - boids[0 + j];
            let dy = boids[1 + i] - boids[1 + j];
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < DIAMETER * 2) {
              let influence = 1 - d / (DIAMETER * 2);
              //
              let len = Math.sqrt(dx * dx + dy * dy);
              if (len<0.000001) len = 0.000001; //avoid division by zero
              dx /= len;
              dy /= len;
              //
              boids[2 + i] += (dx * influence) / 10;
              boids[3 + i] += (dy * influence) / 10;
            }
            //
          }
        }
      }
    }
  } else {
    for (let i = 0; i < BOIDS_COUNT; i++) {
      for (let j = 0; j < BOIDS_COUNT; j++) {
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
          boids[2 + i * 4] += (dx * influence) / 10;
          boids[3 + i * 4] += (dy * influence) / 10;
        }
      }
    }
  }

  for (let i = 0; i < BOIDS_COUNT; i++) {
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
  if (!stop)
  {
    requestAnimationFrame(update);
  }
}

init();
update();
