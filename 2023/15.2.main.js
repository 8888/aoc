const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const boxes = [];
for (let i = 0; i < 256; i++) {
  boxes.push(new Map());
}

const doWork = (line) => {
  const steps = line.split(',');
  steps.forEach(step => {
    const [label, operation, focal] = step.match(/[a-z]+|=|-|[0-9]/g);
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash += step.charCodeAt(i);
      hash *= 17;
      hash %= 256;
    }
    // console.log(hash, label, operation, focal);
    if (operation === '=') {
      boxes[hash].set(label, focal);
    } else {
      boxes[hash].delete(label);
    }
  });

  boxes.forEach((box, boxIndex) => {
    let slotIndex = 0;
    box.forEach((focal, label) => {
      total += (1 + boxIndex) * (slotIndex + 1) * parseInt(focal);
      slotIndex++;
    });
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('15.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
