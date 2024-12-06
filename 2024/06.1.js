const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const pos = { r: undefined, c: undefined, d: undefined };
const map = [];
const directions = [
  { r: -1, c: 0 }, // u
  { r: 0, c: 1 }, // r
  { r: 1, c: 0 }, // d
  { r: 0, c: -1 }, // l
];

const init = (line) => {
  const row = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '^') {
      pos.r = map.length;
      pos.c = i;
      pos.d = 0;
      row.push({ space: '.', seen: true });
      total++;
    } else {
      row.push({ space: line[i], seen: false });
    }
  }
  map.push(row);
}

const isStepInBounds = (loc, dir) => {
  return (
    loc.r + dir.r >= 0 &&
    loc.r + dir.r < map.length &&
    loc.c + dir.c >= 0 &&
    loc.c + dir.c < map[0].length
  );
};

const isStepBlocked = (loc, dir) => {
  return map[loc.r + dir.r][loc.c + dir.c].space === '#';
}

const move = () => {
  while (isStepInBounds(pos, directions[pos.d])) {
    if (isStepBlocked(pos, directions[pos.d])) {
      pos.d = pos.d === directions.length - 1 ? 0 : pos.d + 1; // turn 90
    } else {
      pos.r += directions[pos.d].r;
      pos.c += directions[pos.d].c;
      if (!map[pos.r][pos.c].seen) {
        map[pos.r][pos.c].seen = true;
        total++;
      }
    }
  }
};


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

    move();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
