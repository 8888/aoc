const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const map = [];

const directions = [
  {r: -1, c: 0},
  {r: 0, c: 1},
  {r: 1, c: 0},
  {r: 0, c: -1},
];

const isStepInBounds = (loc, dir) => {
  return (
    loc.r + dir.r >= 0 &&
    loc.r + dir.r < map.length &&
    loc.c + dir.c >= 0 &&
    loc.c + dir.c < map[0].length
  );
};

const init = (line) => {
  const row = [];
  line.split('').forEach((v, i) => {
    row.push({plant: v, seen: false, r: map.length, c: i});
  });
  map.push(row);
}

const doWork = () => {
  let r = 0;
  let c = 0;
  while (r < map.length) {
    if (map[r][c].seen) {
      c++;
      if (c >= map[0].length) {
        c = 0;
        r++;
      }
    } else {
      searchRegion(r, c);
    }
  }
}

const searchRegion = (r, c) => {
  let area = 0;
  let perimeter = 0;
  const plant = map[r][c].plant;
  const stack = [map[r][c]];
  while (stack.length) {
    const current = stack.pop();
    if (current.seen) continue;
    area++;
    let per = 4;
    current.seen = true;
    directions.forEach(dir => {
      if (isStepInBounds(current, dir)) {
        const next = map[current.r + dir.r][current.c + dir.c];
        if (next.plant === plant) {
          per--;
          if (!next.seen) stack.push(next);
        }
      }
    });
    perimeter += per;
  }
  console.log(`plant: ${plant}`)
  console.log(`area: ${area}, per: ${perimeter}, cost: ${area * perimeter}`);
  total += area * perimeter;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('12.txt'),
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
