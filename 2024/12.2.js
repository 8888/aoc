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

const corners = [
  [0, 1], // Up Right
  [1, 2], // Right Down
  [2, 3], // Down left
  [3, 0], // Left Up
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

const checkForCorner = (space) => {
  let sides = 0;
  corners.forEach(corner => {
    // are the next plots the same as this
    const d1 = isStepInBounds(space, directions[corner[0]]) &&
      map[space.r + directions[corner[0]].r][space.c + directions[corner[0]].c].plant === space.plant;
    const d2 = isStepInBounds(space, directions[corner[1]]) &&
      map[space.r + directions[corner[1]].r][space.c + directions[corner[1]].c].plant === space.plant;
    // diaganol for inside corner
    const d3Dir = {
      r: directions[corner[0]].r + directions[corner[1]].r,
      c: directions[corner[0]].c + directions[corner[1]].c,
    };
    const d3 = isStepInBounds(space, d3Dir) &&
      map[space.r + d3Dir.r][space.c + d3Dir.c].plant === space.plant;
    if (!d1 && !d2) { // outside corner
      sides++;
    } else if (d1 && d2 && !d3) { // inside corner
      sides++;
    }
  });
  return sides;
};

const searchRegion = (r, c) => {
  let area = 0;
  let sides = 0;
  const plant = map[r][c].plant;
  const stack = [map[r][c]];
  while (stack.length) {
    const current = stack.pop();
    if (current.seen) continue;
    area++;
    current.seen = true;
    sides += checkForCorner(current);
    directions.forEach(dir => {
      if (isStepInBounds(current, dir)) {
        const next = map[current.r + dir.r][current.c + dir.c];
        if (next.plant === plant) {
          if (!next.seen) stack.push(next);
        }
      }
    });
  }

  console.log(`plant: ${plant}`)
  console.log(`area: ${area}, sides: ${sides}, cost: ${area * sides}`);
  total += area * sides;
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
