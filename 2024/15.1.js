const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const example = { file: '15.example.txt' };
const test = { file: '15.test.txt' };
const goal = { file: '15.txt' };
const game = goal;

const map = [];
let robot = { r: -1, c: -1 };
const moves = [];

const directions = {
  '^': { r: -1, c: 0 },
  '>': { r: 0, c: 1 },
  'v': { r: 1, c: 0 },
  '<': { r: 0, c: -1 },
};

let mapComplete = false;
const init = (line = '') => {
  if (line === '') {
    mapComplete = true;
  } else if (line[0] === '#') {
    const row = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '@') {
        robot.r = map.length;
        robot.c = i;
      }
      row.push(line[i]);
    }
    map.push(row);
  } else {
    moves.push(line.split(''));
  }
}

const move = (char) => {
  const dir = directions[char];
  const stack = [ robot ];
  let hitWall = false;
  while (stack.length && !hitWall) {
    const loc = stack.pop();
    const next = { r: loc.r + dir.r, c: loc.c + dir.c };
    if (map[next.r][next.c] === '.') {
      map[next.r][next.c] = map[loc.r][loc.c];
      map[loc.r][loc.c] = '.';
      if (map[next.r][next.c] === '@') robot = next;
    } else if (map[next.r][next.c] === 'O') {
      stack.push(loc);
      stack.push(next);
    } else {
      hitWall = true;
    }
  }
}

const makeAllMoves = () => {
  moves.forEach(moveList => {
    moveList.forEach(d => move(d));
  });
}

const printMap = () => {
  map.forEach(m => console.log(m.join('')));
}

const calcTotal = () => {
  let total = 0;
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 'O') total += 100 * r + c;
    }
  }
  return total;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream(game.file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    makeAllMoves();
    printMap();
    console.log(calcTotal());

  } catch (err) {
    console.error(err);
  }
})();
