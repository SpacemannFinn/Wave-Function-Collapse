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
  const path = "tiles";
  tileImages[0] = loadImage(`${path}/blank.png`)
  tileImages[1] = loadImage(`${path}/up.png`)

}

function setup() {
  createCanvas(800, 800);

  //loaded and created tiles
  tiles[0] = new Tile(tileImages[0], [0, 0, 0, 0]);
  tiles[1] = new Tile(tileImages[1], [1, 1, 0, 1]);
  tiles[2] = tiles[1].rotate(1);
  tiles[3] = tiles[1].rotate(2);
  tiles[4] = tiles[1].rotate(3);

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
  for (let i = 0; i < arr.length; i++) {
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


  console.log(grid);

  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  cell.options = [pick];

  //NextGen Tiles like star trek but funnier

  const nextGrid = [];
  console.log(grid);

  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
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
            console.log("right options", tiles[option])
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