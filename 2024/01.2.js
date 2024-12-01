const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let left = [];
let right = {};

const silver = (line) => {
  console.log(line);
  const [l, r] = line.split('   ');
  left.push(l);
  if (right[r]) {
    right[r]++;
  } else {
    right[r] = 1;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('01.2.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      silver(line);
    });

    await once(rl, 'close');

    for (let i = 0; i < left.length; i++) {
      if (right[left[i]]) total += left[i] * right[left[i]];
    }
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
