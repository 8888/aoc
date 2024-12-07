const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

/*
Incomplete attempt at clever non brute-force approach
*/

let total = 0;
const pos = { r: undefined, c: undefined, d: undefined };
const map = [];
const directions = [
  { r: -1, c: 0, o: 2 }, // u
  { r: 0, c: 1, o: 3 }, // r
  { r: 1, c: 0, o: 0 }, // d
  { r: 0, c: -1, o: 1 }, // l
];

const init = (line) => {
  const row = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '^') {
      pos.r = map.length;
      pos.c = i;
      pos.d = 0;
      row.push({ space: '.', seen: { 0: true, 1: false, 2: false, 3: false }});
    } else {
      row.push({ space: line[i], seen: { 0: false, 1: false, 2: false, 3: false } });
    }
  }
  map.push(row);
}

const nextDir = (d) => {
  return d === directions.length - 1 ? 0 : d + 1;
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

const couldCycle = (loc) => {
  // if we've been on this space before
  // and we we're moving in the next direction
  const seen = map[loc.r][loc.c].seen[nextDir(loc.d)];
  if (seen) {
    console.log('*'.repeat(100))
    console.log(loc)
    drawMap();
  }
  return seen;
}

const backStep = (loc) => {
  const temp = { r: loc.r, c: loc.c, d: directions[loc.d].o };
  while (isStepInBounds(temp, directions[temp.d]) && !isStepBlocked(temp, directions[temp.d])) {
    temp.r += directions[temp.d].r;
    temp.c += directions[temp.d].c;
    map[temp.r][temp.c].seen[temp.d] = true;
  }
}

const move = () => {
  while (isStepInBounds(pos, directions[pos.d])) {
    if (isStepBlocked(pos, directions[pos.d])) {
      // turn 90
      pos.d = pos.d === directions.length - 1 ? 0 : pos.d + 1;
      backStep(pos);
    } else {
      if (couldCycle(pos)) total++
      pos.r += directions[pos.d].r;
      pos.c += directions[pos.d].c;
      map[pos.r][pos.c].seen[pos.d] = true;
    }
  }
};

const drawMap = () => {
  let header = '  ';
  for (let i = 0; i < map.length; i++) {
    header += `${i} `;
  }
  console.log(header)
  map.forEach((r, ri) => {
    const row = r.reduce((acc, cur) => {
      let s;
      if (cur.space === '#' || (!cur.seen[0] && !cur.seen[1] && !cur.seen[2] && !cur.seen[3]) ) {
        s = `${cur.space} `;
      } else if ( (cur.seen[0] || cur.seen[2]) && (cur.seen[1] || cur.seen[3]) ) {
        s = `+ `;
      } else if (cur.seen[0] || cur.seen[2]) {
        s = '| ';
      } else {
        s = '- ';
      }
      return acc += s;
    }, `${ri} `);
    console.log(row)
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('06.test.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    backStep(pos);
    move();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
