const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const lines = [];
// const min = 7;
// const max = 27;
const min = 200000000000000;
const max = 400000000000000;

const parse = (line) => {
  console.log(line);
  const [px, py, pz, vx, vy, vz] = line.match(/-?[0-9]+/g).map(n => parseInt(n));
  lines.push([px, py, pz, vx, vy, vz]);
}

const doWork = () => {
  for (let i = 0; i < lines.length; i++) {
    const [ax, ay, az, adx, ady, adz] = lines[i]
    for (let j = i+1; j < lines.length; j++) {
      const [bx, by, bz, bdx, bdy, bdz] = lines[j];
      const bt = ((bx-ax) / adx - (by-ay) / ady) / (bdy/ady - bdx/adx);
      const at = (bx + bt*bdx - ax) / adx;
      const ix = ax+adx*at;
      const iy = ay+ady*at;
      if (bt >= 0 && at >= 0 && min <= ix && ix <= max && min <= iy && iy <= max) {
        total++;
      }
    }
  }
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('24.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
