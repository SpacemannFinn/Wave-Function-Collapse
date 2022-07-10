const tiles = [];
const tileImages = [];

let grid = [];

const DIM = 20;

const BLANK = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;


function preload() {
  const path = "tiles/circuit/";
  tileImages[0] = loadImage(`${path}/0.png`)
  tileImages[1] = loadImage(`${path}/1.png`)
  tileImages[2] = loadImage(`${path}/2.png`)
  tileImages[3] = loadImage(`${path}/3.png`)
  tileImages[4] = loadImage(`${path}/6.png`)
  tileImages[5] = loadImage(`${path}/7.png`)
  tileImages[6] = loadImage(`${path}/8.png`)
  tileImages[7] = loadImage(`${path}/9.png`)
  tileImages[8] = loadImage(`${path}/10.png`)
  tileImages[9] = loadImage(`${path}/11.png`)
  tileImages[10] = loadImage(`${path}12.png`)

}

function setup() {
  createCanvas(800, 800);
  randomSeed(1);

  //loaded and created tiles
  tiles[0] = new Tile(tileImages[0], [0, 0, 0, 0]);
  tiles[1] = new Tile(tileImages[1], [1, 1, 1, 1]);
  tiles[2] = new Tile(tileImages[2], [1, 2, 1, 1]);
  tiles[3] = new Tile(tileImages[3], [1, 3, 1, 3]);
  tiles[4] = new Tile(tileImages[4], [1, 2, 1, 2]);
  tiles[5] = new Tile(tileImages[5], [3, 2, 3, 2]);
  tiles[6] = new Tile(tileImages[6], [3, 1, 2, 1]);
  tiles[7] = new Tile(tileImages[7], [2, 2, 1, 2]);
  tiles[8] = new Tile(tileImages[8], [2, 2, 2, 2]);
  tiles[9] = new Tile(tileImages[9], [2, 2, 1, 1]);
  tiles[10] = new Tile(tileImages[10], [1, 2, 1, 2]);

  for(let i = 2; i<11; i++){
    for(let j = 1; j < 4; j++){
      tiles.push(tiles[i].rotate(j));
    }
  }
  //generated rules for tile placement
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyse(tiles)
  }

  //created grid and cells
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
  
  // grid[1].options = [BLANK, RIGHT]

}

function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
}

function mousePressed() {
  redraw();
}

function draw() {
  background(0);

  //draws grid and tiles
  const w = width / DIM;
  const h = height / DIM
  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      let cell = grid[i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        fill(0);
        stroke(255);
        rect(i * w, j * h, w, h);
      }
    }
  }

  //Pick Cell with the least Entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  if (gridCopy.length === 0) {
    return
  }

  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  gridCopy = gridCopy.filter((a) => a.options.length <= gridCopy[0].options.length)

  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  cell.options = [pick];

  //NextGen Tiles like star trek but funnier

  const nextGrid = [];

  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {

        let options = new Array(tiles.length).fill(0).map((x, i) => i);

        //look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        nextGrid[index] = new Cell(options)
      }
    }
  }
  grid = nextGrid

  console.count("rounds")
  //noLoop();
}