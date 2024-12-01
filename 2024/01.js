const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let left = [];
let right = [];

const silver = (line) => {
  console.log(line);
  const [l, r] = line.split('   ');
  left.push(l);
  right.push(r);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('01.1.input.txt'),
      // input: createReadStream('01.2.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      silver(line);
      // gold(line);
    });

    await once(rl, 'close');

    left = left.sort((a, b) => a - b);
    right = right.sort((a, b) => a - b);
    console.log(left);
    console.log(right);
    for (let i = 0; i < left.length; i++) {
      total += Math.abs(parseInt(left[i]) -parseInt(right[i]));
    }
    console.log(Math.abs(total));

  } catch (err) {
    console.error(err);
  }
})();
