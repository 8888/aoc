const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let map = [];

const init = (line) => {
  let file = 0;
  for (let i = 0; i < line.length; i++) {
    if (i % 2) {
      for (let n = 0; n < parseInt(line[i]); n++) {
        map.push('.');
      }
    } else {
      for (let n = 0; n < parseInt(line[i]); n++) {
        map.push(file);
      }
      file++;
    }
  }
}

const defrag = () => {
  let left = 0;
  let right = map.length - 1;
  while (left < right) {
    while (map[left] !== '.') left++;
    while (map[right] === '.') right--;
    if (left >= right) break;
    map[left] = map[right];
    map[right] = '.';
  }
}

const checkSum = () => {
  for (let i = 0; i < map.length; i++) {
    if (map[i] === '.') return;
    total += i * parseInt(map[i]);
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('09.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    console.log(map)
    defrag()
    console.log(map)
    checkSum();
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
