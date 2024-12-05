const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const dir = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const word = 'XMAS'

let total = 0;

const matrix = [];
const starts = [];

const init = (line) => {
  for (let i = 0; i < line.length; i++) {
    if (line[i] === word[0]) {
      starts.push({
        loc: [matrix.length, i],
        dir: undefined,
        char: 0,
      });
    }
  }
  matrix.push(line);
}

const doWork = () => {
  console.log(matrix);
  console.log(starts);
  while (starts.length) {
    const search = starts.pop();
    if (search.char === 0) { // first letter in word
      // search all directions
      dir.forEach(d => {
        if (
          // check in bounds
          (search.loc[0] + d[0] >= 0 && search.loc[0] + d[0] < matrix.length) &&
          (search.loc[1] + d[1] >= 0 && search.loc[1] + d[1] < matrix[0].length) &&
          // assumes all same size!! ^
          // now check for next char
          matrix[search.loc[0] + d[0]][search.loc[1] + d[1]] === word[search.char + 1]
        ) {
          // found an in bounds next letter!
          if (search.char + 1 === word.length - 1) {
            // last letter in word
            total++;
          } else {
            starts.push({
              loc: [search.loc[0] + d[0], search.loc[1] + d[1]],
              dir: d,
              char: search.char + 1,
            })
          }
        }
      });
    } else {
      if (
        // check in bounds
        (search.loc[0] + search.dir[0] >= 0 && search.loc[0] + search.dir[0] < matrix.length) &&
        (search.loc[1] + search.dir[1] >= 0 && search.loc[1] + search.dir[1] < matrix[0].length) &&
        // assumes all same size!! ^
        // now check for next char
        matrix[search.loc[0] + search.dir[0]][search.loc[1] + search.dir[1]] === word[search.char + 1]
      ) {
        // found an in bounds next letter!
        if (search.char + 1 === word.length - 1) {
          // last letter in word
          total++;
        } else {
          starts.push({
            loc: [search.loc[0] + search.dir[0], search.loc[1] + search.dir[1]],
            dir: search.dir,
            char: search.char + 1,
          })
        }
      }
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('04.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
