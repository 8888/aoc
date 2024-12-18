const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = {
  file: '18.test.txt',
  r: 7,
  c: 7,
  bytes: 12,
  start: {r: 0, c: 0},
  end: {r: 6, c: 6},
};
const goal = {
  file: '18.txt',
  r: 71,
  c: 71,
  bytes: 1024,
  start: {r: 0, c: 0},
  end: {r: 70, c: 70},
};
const game = goal;

const map = [];
for (let i = 0; i < game.r; i++) {
  map.push(new Array(game.c).fill('.'));
}

let bytesFell = 0;

const init = (line = '') => {
  if (bytesFell < game.bytes) {
    const [x, y] = [...line.matchAll(/[0-9]+/g)];
    const r = parseInt(y[0]);
    const c = parseInt(x[0]);
    map[r][c] = '#';
    bytesFell++;
  }
}

const printMap = (path = []) => {
  const temp = JSON.parse(JSON.stringify(map));
  if (path.length) {
    path.forEach(p => temp[p.r][p.c] = '0');
  }
  temp.forEach(r => console.log(r.join('')))
}

const isStepInBounds = (loc) => {
  return (
    loc.r >= 0 &&
    loc.r < map.length &&
    loc.c >= 0 &&
    loc.c < map[0].length
  );
}

const directions = [
  {r: -1, c: 0},
  {r: 0, c: 1},
  {r: 1, c: 0},
  {r: 0, c: -1},
];

const search = () => {
  const seen = new Set();
  const queue = [{
    r: game.start.r,
    c: game.start.c,
    path: [{r: game.start.r, c: game.start.c}],
  }];
  seen.add(`${queue[0].r},${queue[0].c}`);
  while (queue.length) {
    const loc = queue.shift();
    for (let d = 0; d < directions.length; d++) {
      const dir = directions[d];
      const next = {
        r: loc.r + dir.r,
        c: loc.c + dir.c,
        path: [...loc.path, {r: loc.r + dir.r, c: loc.c + dir.c}]
      };
      const str = `${next.r},${next.c}`;
      if (next.r === game.end.r && next.c === game.end.c) {
        return next;
      } else if (isStepInBounds(next) && !seen.has(str) && map[next.r][next.c] === '.') {
        queue.push(next);
        seen.add(str);
      }
    }
  }
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

    const result = search();
    printMap(result.path)
    console.log(`shortest path: ${result.path.length - 1}`); // don't include starting space

  } catch (err) {
    console.error(err);
  }
})();
