const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let map = [];
let trailHeads = [];

const directions = [
  { r: -1, c: 0 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
];

const init = (line) => {
  const row = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] == '0') trailHeads.push({ r: map.length, c: i, v: 0 });
    row.push(parseInt(line[i]));
  }
  map.push(row);
}

const isStepInBound = (loc, dir) => {
  return (
    loc.r + dir.r >= 0 &&
    loc.r + dir.r < map.length &&
    loc.c + dir.c >= 0 &&
    loc.c + dir.c < map[0].length
  );
}

const doWork = () => {
  trailHeads.forEach(t => {
    const found = new Set();
    const stack = [{...t}];
    while (stack.length) {
      const loc = stack.pop();
      directions.forEach(dir => {
        if (isStepInBound(loc, dir)) {
          const next = { r: loc.r + dir.r, c: loc.c + dir.c };
          if (map[next.r][next.c] == loc.v + 1) {
            next.v = loc.v + 1;
            if (next.v == 9) {
              found.add(`${next.r},${next.c}`);
            } else {
              stack.push(next);
            }
          }
        }
      });
    }
    total += found.size;
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('10.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
