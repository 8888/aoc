const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '25.test.txt' };
const goal = { file: '25.txt' };
const game = goal;

let total = 0;
const locks = [];
const keys = [];

let temp = [-1, -1, -1, -1, -1];
let rowsProcessed = 0;
let type = '';
const init = (line = '') => {
  if (line === '') {
    return;
  } else {
    if (rowsProcessed === 0) {
      type = line[0] === '#' ? 'lock' : 'key';
    }

    for (let i = 0; i < line.length; i++) {
      if (line[i] === '#') temp[i] += 1;
    }
    rowsProcessed++

    if (rowsProcessed === 7) {
      if (type === 'lock') {
        locks.push(temp);
      } else {
        keys.push(temp)
      }
      temp = [-1, -1, -1, -1, -1];
      rowsProcessed = 0;
      type = '';
    }
  }
}

const compareKeysAndLocks = () => {
  locks.forEach(lock => {
    keys.forEach(key => {
      let keyFits = true;
      for (let i = 0; i < lock.length; i++) {
        if (lock[i] + key[i] >= 6) {
          keyFits = false;
          break;
        }
      }
      if (keyFits) total++;
    })
  })
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream(game.file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    // console.log(locks);
    // console.log(keys);
    compareKeysAndLocks()

    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
