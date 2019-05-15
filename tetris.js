// Create canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

// Line clears + score
function arenaSweep() {
  let rowCount = 0;

  // Check for full rows
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        // Not a full row
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0); // Remove row
    arena.unshift(row); // Add empty row on top of arena
    ++y;

    // Get total number of rows cleared
    rowCount++;
  }

  if (rowCount > 0) {
    // Keep track of score
    console.log(rowCount);
    switch(rowCount) {
      case 1:
        player.score += 40;   // Single
        break;
      case 2:
        player.score += 100;  // Double
        break;
      case 3:
        player.score += 300;  // Triple
        break;
      default:
        player.score += 1200; // Tetris
        break;
    }
    rowCount = 0;
  }
}

// Checks for piece collision
function collide(arena, player) {
  // m = Matrix, o = Offset
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && 
          (arena[y + o.y] && 
          arena[y + o.y][x + o.x]) !== 0) 
      {
        return true;
      }
    }
  }
  return false;
}

// Fills new matrix with 0's (empty)
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }

  return matrix;
}

// Piece matrices
function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ]
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ]
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ]
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ]
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ]
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ]
  }
}

function draw() {
  // Draw canvas
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw arena
  drawMatrix(arena, {x: 0, y: 0});

  // Draw piece
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      // 0 = nothing, 1 = block
      if (val !== 0) {
        context.fillStyle = colors[val];
        context.fillRect(x + offset.x,
                         y + offset.y, 
                         1, 1);
      }
    });
  });
}

function hardDrop() {
  dropInterval = 1;
}

// Copies player pieces into arena array structures
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = val;
      }
    });
  });
}

function playerDrop() {
  // Move piece down
  player.pos.y++;

  // Hit ground or other piece
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();

    // Check if it was a hard drop
    if (dropInterval === 1) {
      dropInterval = 1000;
    }
  }

  // Reset counter
  dropCounter = 0;
}

function playerReset() {
  // Create a random new piece
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

  // Game over, filled arena
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerMove(dir) {
  player.pos.x += dir;

  // Check for collisions
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;

  // Rotate
  rotate(player.matrix, dir);

  // Check collision
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function startGame() {
  document.getElementById('press-to-play').innerText = 'Press any key to continue...';
  document.onkeypress = () => {
    document.getElementById('press-to-play').innerText = '';
    update();
  }
}

// Handle piece dropping
let dropCounter = 0;
let dropInterval = 1000;

// Handle game timing
let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  
  // Make pieces drop every 1 second
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function pause() {
  document.getElementById('press-to-play').innerText = 'Press any key to continue...';
  // document.onkeypress = () => {
  //   document.getElementById('press-to-play').innerText = '';
  //   update();
  // }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

// TODO: Change colors to better hex colors
const colors = [
  null,       // 0
  '#A000F0',  // 1
  '#F0F000',  // 2
  '#F0A000',  // 3
  '#0000F0',  // 4
  '#00F0F0',  // 5
  '#00F000',  // 6
  '#F00000'   // 7
]

const arena = createMatrix(12, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

// Key presses
document.addEventListener('keydown', event => {
  // Left
  if (event.keyCode === 37) {
    playerMove(-1);
  }

  // Right
  else if (event.keyCode === 39) {
    playerMove(1);
  }

  // Down
  else if (event.keyCode === 40) {
    playerDrop();
  }

  // Space for hard drop
  else if (event.keyCode === 32) {
    hardDrop();
  }

  // Q
  else if (event.keyCode === 81) {
    playerRotate(-1);
  }

  // W
  else if (event.keyCode === 87) {
    playerRotate(1);
  }

  // P for pause?
  else if (event.keyCode === 80) {
    console.log('pause');
    pause();
  }
});

// Start Tetris
playerReset();
updateScore();
startGame();