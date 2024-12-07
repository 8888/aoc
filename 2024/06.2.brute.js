const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const start = { r: undefined, c: undefined, d: undefined };
const baseMap = [];
const directions = [
  { r: -1, c: 0 }, // u
  { r: 0, c: 1 }, // r
  { r: 1, c: 0 }, // d
  { r: 0, c: -1 }, // l
];
let steps = new Map();

const init = (line) => {
  const row = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '^') {
      start.r = baseMap.length;
      start.c = i;
      start.d = 0;
      row.push({ space: '.', seen: { 0: true, 1: false, 2: false, 3: false }});
    } else {
      row.push({ space: line[i], seen: { 0: false, 1: false, 2: false, 3: false }});
    }
  }
  baseMap.push(row);
}

const isStepInBounds = (loc, dir, map) => {
  return (
    loc.r + dir.r >= 0 &&
    loc.r + dir.r < map.length &&
    loc.c + dir.c >= 0 &&
    loc.c + dir.c < map[0].length
  );
};

const isStepBlocked = (loc, dir, map) => {
  return map[loc.r + dir.r][loc.c + dir.c].space === '#';
}

const move = (map, shouldLog) => {
  const pos = structuredClone(start);
  while (isStepInBounds(pos, directions[pos.d], map)) {
    if (isStepBlocked(pos, directions[pos.d], map)) {
      pos.d = pos.d === directions.length - 1 ? 0 : pos.d + 1; // turn 90
    } else {
      pos.r += directions[pos.d].r;
      pos.c += directions[pos.d].c;
      if (shouldLog) steps.set(`${pos.r},${pos.c}`, { r: pos.r, c: pos.c });
      if (map[pos.r][pos.c].seen[pos.d]) {
        console.log(stepBlocked);
        total++;
        return;
      } else {
        map[pos.r][pos.c].seen[pos.d] = true;
      }
    }
  }
};

let stepBlocked;
const runAllSteps = () => {
  for (const [key, value] of steps) {
    stepBlocked = value;
    const map = structuredClone(baseMap);
    map[stepBlocked.r][stepBlocked.c].space = '#';
    move(map, false);
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('06.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    const map = structuredClone(baseMap);
    move(map, true);
    runAllSteps();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
