const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const example = { file: '15.2.example.txt' };
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

const init = (line = '') => {
  if (line === '') {
    return;
  } else if (line[0] === '#') {
    const row = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '#') {
        row.push('#');
        row.push('#');
      } else if (line[i] === 'O') {
        row.push('[');
        row.push(']');
      } else if (line[i] === '@') {
        robot.r = map.length;
        robot.c = row.length;
        row.push('@');
        row.push('.');
      } else {
        row.push('.');
        row.push('.');
      }
    }
    map.push(row);
  } else {
    moves.push(line.split(''));
  }
}

const move = (char) => {
  const dir = directions[char];
  const stack = [ [robot] ];
  while (stack.length) {
    const objs = stack.pop();
    const stackSet = new Set();
    // check if all moves are clear or if there is a wall
    let movable = true;
    for (let i = 0; i < objs.length; i++) {
      const loc = objs[i];
      const next = { r: loc.r + dir.r, c: loc.c + dir.c };
      if (map[next.r][next.c] === '#') {
        return;
      } else if (map[next.r][next.c] != '.') {
        movable = false;
      }
    }

    if (movable) {
      objs.forEach(loc => {
        const next = { r: loc.r + dir.r, c: loc.c + dir.c };
        map[next.r][next.c] = map[loc.r][loc.c];
        map[loc.r][loc.c] = '.';
        if (map[next.r][next.c] === '@') robot = next;
      });
    } else {
      const nextMoves = [];
      objs.forEach(loc => {
        const next = { r: loc.r + dir.r, c: loc.c + dir.c };
        if (!stackSet.has(`${next.r},${next.c}`) && map[next.r][next.c] !== '.') {
          stackSet.add(`${next.r},${next.c}`);
          nextMoves.push(next);
          if (dir.r != 0 && (
            map[next.r][next.c] === '[' ||
            map[next.r][next.c] === ']'
          )) {
            const offset =
              map[next.r][next.c] === '[' ?
              { r: 0, c: 1 } :
              { r: 0, c: -1 };
            const pair = { r: next.r + offset.r, c: next.c + offset.c };
            if (!stackSet.has(`${pair.r},${pair.c}`)) {
              stackSet.add(`${pair.r},${pair.c}`);
              nextMoves.push(pair);
            }
          }
        }
      });
      stack.push(objs);
      stack.push(nextMoves);
    }
  }
}

const makeAllMoves = () => {
  moves.forEach(moveList => {
    moveList.forEach(d => {
      move(d);
      // printMap();
    });
  });
}

const printMap = () => {
  map.forEach(m => console.log(m.join('')));
}

const calcTotal = () => {
  let total = 0;
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === '[') total += 100 * r + c;
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

    printMap();
    makeAllMoves();
    console.log(calcTotal());

  } catch (err) {
    console.error(err);
  }
})();
