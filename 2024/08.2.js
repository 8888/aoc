const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let rows = 0;
let cols = 0;
const map = {};
const results = new Set();

const init = (line) => {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== '.') {
      if (map[line[i]]) {
        map[line[i]].push({r: rows, c: i});
      } else {
        map[line[i]] = [ {r: rows, c: i} ];
      }
    }
  }
  rows++;
  cols = line.length;
}

const isInBounds = (loc) => {
  return (
    loc.r >= 0 &&
    loc.r < rows &&
    loc.c >= 0 &&
    loc.c < cols
  );
};

const doWork = () => {
  for (const [_, locs] of Object.entries(map)) {
    console.log(locs)
    for (let l = 0; l < locs.length - 1; l++) {
      for (let r = l + 1; r < locs.length; r++) {
        const left = locs[l];
        const right = locs[r];
        results.add(`${left.r},${left.c}`)
        results.add(`${right.r},${right.c}`)
        console.log(`${left.r},${left.c} and ${right.r},${right.c}`)
        const dif = {r: left.r - right.r, c: left.c - right.c};
        console.log(`diff: ${dif.r},${dif.c}`)
        let nextL = {r: left.r + dif.r, c: left.c + dif.c };
        while (isInBounds(nextL)) {
          results.add(`${nextL.r},${nextL.c}`)
          nextL = {r: nextL.r + dif.r, c: nextL.c + dif.c };
        }
        let nextR = {r: right.r - dif.r, c: right.c - dif.c };
        while (isInBounds(nextR)) {
          results.add(`${nextR.r},${nextR.c}`)
          nextR = {r: nextR.r - dif.r, c: nextR.c - dif.c };
        }
      }
    }
  }
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('08.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(results.size)

  } catch (err) {
    console.error(err);
  }
})();
