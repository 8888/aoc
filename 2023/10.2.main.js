const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];
let start;
let steps = 1;
let detailedMap = [];
let seen = [];

const rules = {
  // main key direction is where you enter from
  // nested d key is where you are entering the next tile from
  '|': {n: {r: 1, c: 0, d: 'n'}, s: {r: -1, c: 0, d: 's'}},
  '-': {w: {r: 0, c: 1, d: 'w'}, e: {r: 0, c: -1, d: 'e'}},
  'L': {n: {r: 0, c: 1, d: 'w'}, e: {r: -1, c: 0, d: 's'}},
  'J': {n: {r: 0, c: -1, d: 'e'}, w: {r: -1, c: 0, d: 's'}},
  '7': {s: {r: 0, c: -1, d: 'e'}, w: {r: 1, c: 0, d: 'n'}},
  'F': {s: {r: 0, c: 1, d: 'w'}, e: {r: 1, c: 0, d: 'n'}},
};

const tiles = {
  '|': [
    ['.', '|', '.'],
    ['.', '|', '.'],
    ['.', '|', '.']
  ],
  '-': [
    ['.', '.', '.'],
    ['-', '-', '-'],
    ['.', '.', '.']
  ],
  'L': [
    ['.', '|', '.'],
    ['.', 'L', '-'],
    ['.', '.', '.']
  ],
  'J': [
    ['.', '|', '.'],
    ['-', 'J', '.'],
    ['.', '.', '.']
  ],
  '7': [
    ['.', '.', '.'],
    ['-', '7', '.'],
    ['.', '|', '.']
  ],
  'F': [
    ['.', '.', '.'],
    ['.', 'F', '-'],
    ['.', '|', '.']
  ],
  'S': [ // hardcode start tile for example, must change
    ['.', '|', '.'],
    ['.', 'L', '-'],
    ['.', '.', '.']
  ],
};

const parse = (line) => {
  console.log(line)
  const row = line.split('');
  map.push(row);
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 'S') start = {r: map.length - 1, c: i};
  }
  const detailedRow = Array(row.length);
  for (let i = 0; i < detailedRow.length; i++) {
    detailedRow[i] = [['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']];
  }
  detailedMap.push(detailedRow);
  seen.push(Array(row.length).fill(false));
};

const followPath = () => {
  const paths = [];
  // check adjacent for path starts
  const n = start.r > 0 && map[start.r - 1][start.c];
  const s = start.r < map.length - 1 && map[start.r + 1][start.c];
  const w = start.c > 0 && map[start.r][start.c - 1];
  const e = start.c < map[0].length - 1 && map[start.r][start.c + 1];

  let startDirection = 0b0000;
  if (n === '|' || n === '7' || n === 'F'){
    paths.push({d: 's', r: start.r - 1, c: start.c});
    startDirection |= 0b1000;
  }
  if (s === '|' || s === 'L' || s === 'J'){
    paths.push({d: 'n', r: start.r + 1, c: start.c});
    startDirection |= 0b0100;
  }
  if (w === '-' || w === 'L' || w === 'F'){
    paths.push({d: 'e', r: start.r, c: start.c - 1});
    startDirection |= 0b0010;
  }
  if (e === '-' || e === 'J' || e === '7'){
    paths.push({d: 'w', r: start.r, c: start.c + 1});
    startDirection |= 0b0001;
  }

  const startPipe = {
    0b1100: '|',
    0b0011: '-',
    0b1001: 'L',
    0b1010: 'J',
    0b0110: '7',
    0b0101: 'F',
  };
  // replace start
  detailedMap[start.r][start.c] = JSON.parse(JSON.stringify(tiles[startPipe[startDirection]]));

  while (paths[0].r != paths[1].r || paths[0].c != paths[1].c) {
    paths.forEach(path => {
      detailedMap[path.r][path.c] = JSON.parse(JSON.stringify(tiles[map[path.r][path.c]]));
      const rule = rules[map[path.r][path.c]][path.d];
      path.r += rule.r;
      path.c += rule.c;
      path.d = rule.d;
    });
    steps++;
  }
  // add tile for ending location
  detailedMap[paths[0].r][paths[0].c] = JSON.parse(JSON.stringify(tiles[map[paths[0].r][paths[0].c]]));
};

const search = () => {
  const stack = [{
    mapLocation: {r: 0, c: 0},
    detailedMapLocation: {r: 0, c: 0},
  }];
  while (stack.length) {
    const cell = stack.pop();
    // are we not on a pipe
    if (detailedMap[cell.mapLocation.r][cell.mapLocation.c][1][1] === '.') {
      seen[cell.mapLocation.r][cell.mapLocation.c] = true;
    }

    // track on detailed map
    detailedMap[cell.mapLocation.r][cell.mapLocation.c][cell.detailedMapLocation.r][cell.detailedMapLocation.c] = 'x';

    // push new steps to queue in all four directions
    // north
    if (cell.detailedMapLocation.r === 0) {
      // stepping into a new tile
      if (cell.mapLocation.r > 0) {
        // check that next step would be a '.'
        if (detailedMap[cell.mapLocation.r - 1][cell.mapLocation.c][2][cell.detailedMapLocation.c] === '.') {
          stack.push({
            mapLocation: {r: cell.mapLocation.r - 1, c: cell.mapLocation.c},
            detailedMapLocation: {r: 2, c: cell.detailedMapLocation.c},
          });
        }
      }
    } else {
      // staying in the same tile
      // check that next step would be a '.'
      if (detailedMap[cell.mapLocation.r][cell.mapLocation.c][cell.detailedMapLocation.r - 1][cell.detailedMapLocation.c] === '.') {
        stack.push({
          mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c},
          detailedMapLocation: {r: cell.detailedMapLocation.r - 1, c: cell.detailedMapLocation.c},
        });
      }
    }

    // south
    if (cell.detailedMapLocation.r === 2) {
      // stepping into a new tile
      if (cell.mapLocation.r < map.length - 1) {
        // check that next step would be a '.'
        if (detailedMap[cell.mapLocation.r + 1][cell.mapLocation.c][0][cell.detailedMapLocation.c] === '.') {
          stack.push({
            mapLocation: {r: cell.mapLocation.r + 1, c: cell.mapLocation.c},
            detailedMapLocation: {r: 0, c: cell.detailedMapLocation.c},
          });
        }
      }
    } else {
      // staying in the same tile
      // check that next step would be a '.'
      if (detailedMap[cell.mapLocation.r][cell.mapLocation.c][cell.detailedMapLocation.r + 1][cell.detailedMapLocation.c] === '.') {
        stack.push({
          mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c},
          detailedMapLocation: {r: cell.detailedMapLocation.r + 1, c: cell.detailedMapLocation.c},
        });
      }
    }

    // west
    if (cell.detailedMapLocation.c === 0) {
      // stepping into a new tile
      if (cell.mapLocation.c > 0) {
        // check that next step would be a '.'
        if (detailedMap[cell.mapLocation.r][cell.mapLocation.c - 1][cell.detailedMapLocation.r][2] === '.') {
          stack.push({
            mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c - 1},
            detailedMapLocation: {r: cell.detailedMapLocation.r, c: 2},
          });
        }
      }
    } else {
      // staying in the same tile
      // check that next step would be a '.'
      if (detailedMap[cell.mapLocation.r][cell.mapLocation.c][cell.detailedMapLocation.r][cell.detailedMapLocation.c - 1] === '.') {
        stack.push({
          mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c},
          detailedMapLocation: {r: cell.detailedMapLocation.r, c: cell.detailedMapLocation.c - 1},
        });
      }
    }

    // east
    if (cell.detailedMapLocation.c === 2) {
      // stepping into a new tile
      if (cell.mapLocation.c < map[0].length - 1) {
        // check that next step would be a '.'
        if (detailedMap[cell.mapLocation.r][cell.mapLocation.c + 1][cell.detailedMapLocation.r][0] === '.') {
          stack.push({
            mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c + 1},
            detailedMapLocation: {r: cell.detailedMapLocation.r, c: 0},
          });
        }
      }
    } else {
      // staying in the same tile
      // check that next step would be a '.'
      if (detailedMap[cell.mapLocation.r][cell.mapLocation.c][cell.detailedMapLocation.r][cell.detailedMapLocation.c + 1] === '.') {
        stack.push({
          mapLocation: {r: cell.mapLocation.r, c: cell.mapLocation.c},
          detailedMapLocation: {r: cell.detailedMapLocation.r, c: cell.detailedMapLocation.c + 1},
        });
      }
    }
  }
};

const viz = () => {
  // vizualize detailed map
  detailedMap.forEach((row, i) => {
    let a = [];
    let b = [];
    let c = [];
    row.forEach(cell => {
      a.push(cell[0].join(''));
      b.push(cell[1].join(''));
      c.push(cell[2].join(''));
    });
    console.log(a.join(''));
    console.log(b.join(''));
    console.log(c.join(''));
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('10.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    followPath();
    viz()
    search();
    viz();

    const seenCount = seen.reduce((acc, cur) => cur.filter(cell => cell).length + acc, 0);
    console.log('seen:', seenCount);
    const pathSize = steps * 2;
    console.log('pathSize:', pathSize);
    const totalCells = map.length * map[0].length;
    console.log('totalCells:', totalCells);
    const encolsed = totalCells - seenCount - pathSize;
    console.log('enclosed:', encolsed);

  } catch (err) {
    console.error(err);
  }
})();
