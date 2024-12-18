const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = {
  file: '18.test.txt',
  r: 7,
  c: 7,
  start: {r: 0, c: 0},
  end: {r: 6, c: 6},
};
const goal = {
  file: '18.txt',
  r: 71,
  c: 71,
  start: {r: 0, c: 0},
  end: {r: 70, c: 70},
};
const game = goal;

const bytes = [];

const baseMap = [];
for (let i = 0; i < game.r; i++) {
  baseMap.push(new Array(game.c).fill('.'));
}
let map = [];

const init = (line = '') => {
  const [x, y] = [...line.matchAll(/[0-9]+/g)];
  bytes.push({r: y[0], c: x[0]})
}

const buildMap = (end) => {
  map = JSON.parse(JSON.stringify(baseMap));
  for (let i = 0; i <= end; i++) {
    map[bytes[i].r][bytes[i].c] = '#'
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

const findBlocker = () => {
  let min = 0;
  let max = bytes.length - 1;
  let solution;
  while (min <= max) {
    const mid = Math.ceil(min + ((max - min) / 2));
    buildMap(mid);
    const result = search();
    if (result) {
      min = mid + 1;
    } else {
      solution = bytes[mid];
      max = mid - 1;
    }
  }
  return `${solution.c},${solution.r}`;
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

    console.log(findBlocker());

  } catch (err) {
    console.error(err);
  }
})();
