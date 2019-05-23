// Create canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const hold_canvas = document.getElementById("hold");
const hold_context = hold_canvas.getContext("2d");

context.scale(20, 20);
hold_context.scale(40, 40);

// Globals
// TODO add starting levels and adjust speed math
const speeds = [800, 717, 633, 550, 467, 383, 300, 217, 133, 100, 83, 83, 83, 67, 67, 67, 50, 50, 50, 33, 33, 33, 33, 33, 33, 33, 33, 33, 17]; // NES Tetris
const arena = createMatrix(10, 20);
var level = 0;
var linesCleared = 0;
const pieces = 'ILJOTSZ';
var hold = [];

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
    linesCleared++;
    updateLevel();
    ++y;

    // Get total number of rows cleared
    rowCount++;
  }

  if (rowCount > 0) {
    // Keep track of score
    console.log(rowCount);
    switch(rowCount) {
      case 1:
        player.score += (40 * (level + 1));   // Single
        break;
      case 2:
        player.score += (100 * (level + 1));  // Double
        break;
      case 3:
        player.score += (300 * (level + 1));  // Triple
        break;
      default:
        player.score += (1200 * (level + 1)); // Tetris
        break;
    }
    rowCount = 0;
  }
}

function changeLevel(newLevel) {
  document.querySelector('#level').innerText = newLevel;
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
  drawCanvas();

  // Draw hold
  hold_context.fillStyle = '#323C4D';
  hold_context.fillRect(0, 0, hold_canvas.width, hold_canvas.height);

  // Draw arena
  drawMatrix(arena, {x: 0, y: 0});

  // Draw piece
  drawMatrix(player.matrix, player.pos);
  drawHold(hold, {x: 0, y: 0});
}

function drawCanvas() {
  context.fillStyle = '#323C4D';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasBlank() {
  context.fillStyle = '#202028';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      // 0 = nothing, 1 = block
      if (val !== 0) {
        // Color pieces
        context.fillStyle = colors[val];
        context.fillRect(x + offset.x,
                         y + offset.y, 
                         1, 1);

        // Draw lines on pieces
        context.strokeStyle = '#000';
        context.lineWidth = 0.04;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      } else {
        // Draw lines on arena
        if (matrix === arena) {
          context.strokeStyle = '#000';
          context.lineWidth = 0.03
          context.strokeRect(x, y, 1, 1);
        }
      }
    });
  });
}

function drawHold(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      // 0 = nothing, 1 = block
      if (val !== 0) {
        // Color pieces
        hold_context.fillStyle = colors[val];
        hold_context.fillRect(x + offset.x,
                         y + offset.y, 
                         1, 1);

        // Draw lines on pieces
        hold_context.strokeStyle = '#000';
        hold_context.lineWidth = 0.04;
        hold_context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      } else {
        // Draw lines on arena
        if (matrix === arena) {
          hold_context.strokeStyle = '#000';
          hold_context.lineWidth = 0.03
          hold_context.strokeRect(x, y, 1, 1);
        }
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
      updateSpeed(level);
    }
  }

  // Reset counter
  dropCounter = 0;
}

function playerReset() {
  // Create a random new piece
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

  // Game over, filled arena
  if (collide(arena, player)) {
    restartGame();
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

function menu() {
  // Start menu with option 1 focused
  document.getElementById('option-1').focus();

  // Navigate list
  document.addEventListener('keydown', event => {
    let active = document.activeElement.tabIndex;
    if (event.keyCode === 40) {
      // Down arrow
      switch(active) {
        case 1:
          document.activeElement.blur();
          document.getElementById('option-2').focus();
          break;
        case 2:
          document.activeElement.blur();
          document.getElementById('option-3').focus();
          break;
        case 3:
          document.activeElement.blur();
          document.getElementById('option-4').focus();
          break;
        case 4:
          document.activeElement.blur();
          document.getElementById('option-1').focus();
        default:
          break;
      }
    } else if (event.keyCode === 38) {
      // Up arrow
      switch(active) {
        case 1:
          document.activeElement.blur();
          document.getElementById('option-4').focus();
          break;
        case 2:
          document.activeElement.blur();
          document.getElementById('option-1').focus();
          break;
        case 3:
          document.activeElement.blur();
          document.getElementById('option-2').focus();
          break;
        case 4:
          document.activeElement.blur();
          document.getElementById('option-3').focus();
        default:
          break;
      }
    } else if (event.keyCode === 39) {
      // Right arrow
      if (active === 1) {
        let s = parseInt(document.querySelector('#start-level').innerHTML);
        if (s < 29) {
          s++;
          level = s;
          document.querySelector('#start-level').innerHTML = s;
        }
      }
    } else if (event.keyCode === 37) {
      // Left arrow
      if (active === 1) {
        let s = parseInt(document.querySelector('#start-level').innerHTML);
        if (s > 0) {
          s--;
          level = s;
          document.querySelector('#start-level').innerHTML = s;
        }
      }

    } else if (event.keyCode === 13) {
      // Enter key
      switch(active) {
        case 1:
          break;
        case 2:
          // Reset field
          isPaused = false;
          drawCanvas();
          document.querySelector('#menu').classList.add('hidden');

          // Reset stats
          level = parseInt(document.querySelector('#start-level').innerHTML);
          changeLevel(level);
          updateSpeed(level);

          // Start game
          update();
          break;
        case 3:
          break;
        case 4:
          // Show controls
          document.querySelector('#menu-options').classList.add('hidden');
          document.querySelector('#control-options').classList.remove('hidden');
          document.querySelector('#controls-back').focus();
          break;
        case 5:
          // Return to Menu
          document.querySelector('#menu-options').classList.remove('hidden');
          document.querySelector('#control-options').classList.add('hidden');
          document.querySelector('#controls-back').blur();
          document.querySelector('#option-4').focus();
          break;
      }
    }
  });
}

function restartGame() {
  // Stop flow of game
  isPaused = true;

  // Reset canvas
  drawCanvasBlank();
  arena.forEach(row => row.fill(0));
  hold = [];

  // Show menu + reset
  document.querySelector('#menu').classList.remove('hidden');
  document.querySelector('#option-2').focus();

  // Draw hold
  hold_context.fillStyle = '#323C4D';
  hold_context.fillRect(0, 0, hold_canvas.width, hold_canvas.height);

  // Reset stats
  linesCleared = 0;
  player.score = 0;
  level = 0;
  updateScore();
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
  document.querySelector('#level').innerText = 0;
  document.querySelector('#control-options').classList.add('hidden');
}

// Handle piece dropping
let dropCounter = 0;
let dropInterval = 1000;
let updateID = null;

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
  if (!isPaused) {
    draw();
    updateID = requestAnimationFrame(update);
  } else {
    cancelAnimationFrame(updateID);
  }
}

let isPaused = true;
function pause() {
  isPaused = true;
  document.getElementById('press-to-play').innerText = 'Paused!\nPress any key to continue...';
  document.onkeypress = () => {
    isPaused = false;
    document.getElementById('press-to-play').innerText = '';
    update();
  }
}

function updateLevel() {
  let l = Math.floor(linesCleared / 10);
  if (l > level) {
    // Level up!
    level++;
    changeLevel(level);
    updateSpeed(level);
  }
}

function updateScore() {
  document.getElementById('lines').innerText = linesCleared;
  document.getElementById('score').innerText = player.score;
}

function updateSpeed(newLevel) {
  dropInterval = speeds[newLevel];
}

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

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

// Key presses
document.addEventListener('keydown', event => {
  // Check if paused
  if (isPaused) return;

  // Left
  if (event.keyCode === 37) {
    playerMove(-1);
  }

  // Right
  else if (event.keyCode === 39) {
    playerMove(1);
  }

  // Down for soft drop
  else if (event.keyCode === 40) {
    playerDrop();
  }

  // Space for hard drop
  else if (event.keyCode === 32) {
    while (!collide(arena, player)) {
      ++player.pos.y
    }
    --player.pos.y
    playerDrop();
  }

  // Z for CCW
  else if (event.keyCode === 90) {
    playerRotate(-1);
  }

  // X or Up for CW
  else if (event.keyCode === 88 || event.keyCode === 38) {
    playerRotate(1);
  }

  else if (event.keyCode === 67) {
    // Reset player position to top
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // Check for first hold
    if (hold.length === 0) {
      hold = player.matrix;
      player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
      draw();
    } else {
      // Regular hold
      [player.matrix, hold] = [hold, player.matrix];
      if (collide(arena, player)) {
        // ! DO I NEED THIS?
        [player.matrix, hold] = [hold, player.matrix];
      }
    }
  }

  // Esc or P for pause
  else if (event.keyCode === 27) {
    pause();
  }
});

// Start Tetris
playerReset();
updateScore();
menu();
startGame();