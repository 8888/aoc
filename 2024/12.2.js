const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const map = [];

const directions = [
  {r: -1, c: 0, d: 'u'},
  {r: 0, c: 1, d: 'r'},
  {r: 1, c: 0, d: 'd'},
  {r: 0, c: -1, d: 'l'},
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

const calcSides = (sides, key) => {
  let totalSides = 0;

  if (key === 'u' || key === 'd') {
    let rows = {};
    sides[key].forEach(space => {
      if (rows[space.r]) {
        rows[space.r].push(space.c);
      } else {
        rows[space.r] = [space.c];
      }
    });
    for (const [_, value] of Object.entries(rows)) {
      value.sort();
      let prev = -1;
      value.forEach(v => {
        if (prev != -1 && prev + 1 === v) {
          prev = v;
        } else {
          totalSides++;
          prev = v;
        }
      })
    }
  } else {
    let cols = {};
    sides[key].forEach(space => {
      if (cols[space.c]) {
        cols[space.c].push(space.r);
      } else {
        cols[space.c] = [space.r];
      }
    });
    for (const [_, value] of Object.entries(cols)) {
      value.sort();
      let prev = -1;
      value.forEach(v => {
        if (prev != -1 && prev + 1 === v) {
          prev = v;
        } else {
          totalSides++;
          prev = v;
        }
      })
    }
  }
  return totalSides;
}

const searchRegion = (r, c) => {
  let area = 0;
  const sides = {
    u: [],
    r: [],
    d: [],
    l: [],
  };
  const plant = map[r][c].plant;
  const stack = [map[r][c]];
  while (stack.length) {
    const current = stack.pop();
    if (current.seen) continue;
    area++;
    current.seen = true;
    directions.forEach(dir => {
      if (isStepInBounds(current, dir)) {
        const next = map[current.r + dir.r][current.c + dir.c];
        if (next.plant === plant) {
          if (!next.seen) stack.push(next);
        } else {
          sides[dir.d].push(current);
        }
      } else {
        sides[dir.d].push(current);
      }
    });
  }

  let totalSides = 0;
  totalSides += calcSides(sides, 'u');
  totalSides += calcSides(sides, 'd');
  totalSides += calcSides(sides, 'r');
  totalSides += calcSides(sides, 'l');

  console.log(`plant: ${plant}`)
  console.log(`area: ${area}, sides: ${totalSides}, cost: ${area * totalSides}`);
  total += area * totalSides;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('12.test.txt'),
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
