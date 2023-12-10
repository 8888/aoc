const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];
let start;
let steps = 1;

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

const parse = (line) => {
  const row = line.split('');
  map.push(row);
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 'S') start = {r: map.length - 1, c: i};
  }
}

const doWork = () => {
  const paths = [];
  // check adjacent for path starts
  const n = start.r > 0 && map[start.r - 1][start.c];
  const s = start.r < map.length - 1 && map[start.r + 1][start.c];
  const w = start.c > 0 && map[start.r][start.c - 1];
  const e = start.c < map[0].length - 1 && map[start.r][start.c + 1];

  if (n === '|' || n === '7' || n === 'F') paths.push({d: 's', r: start.r - 1, c: start.c});
  if (s === '|' || s === 'L' || s === 'J') paths.push({d: 'n', r: start.r + 1, c: start.c});
  if (w === '-' || w === 'L' || w === 'F') paths.push({d: 'e', r: start.r, c: start.c - 1});
  if (e === '-' || e === 'J' || e === '7') paths.push({d: 'w', r: start.r, c: start.c + 1});

  while (paths[0].r != paths[1].r || paths[0].c != paths[1].c) {
    paths.forEach(path => {
      const rule = rules[map[path.r][path.c]][path.d];
      path.r += rule.r;
      path.c += rule.c;
      path.d = rule.d;
    });
    steps++;
  }
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

    doWork();
    console.log('steps:', steps);

  } catch (err) {
    console.error(err);
  }
})();
