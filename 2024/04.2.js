const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const dir = [
  [ [-1, -1], [1, 1] ],
  [ [-1, 1], [1, -1] ],
];

let total = 0;

const matrix = [];
const starts = [];

const init = (line) => {
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 'A') {
      starts.push({
        loc: [matrix.length, i],
        dir: undefined,
        m: false,
        s: false,
      });
    }
  }
  matrix.push(line);
}

const isStepInBounds = (loc, dir) => {
  return (
    loc[0] + dir[0] >= 0 &&
    loc[0] + dir[0] < matrix.length &&
    loc[1] + dir[1] >= 0 &&
    loc[1] + dir[1] < matrix[0].length
  );
}

const noBadLetters = (loc, dir) => {
  const step = [loc[0] + dir[0], loc[1] + dir[1]];
  return (
    matrix[step[0]][step[1]] !== 'X' &&
    matrix[step[0]][step[1]] !== 'A'
  );
}

const lettersDiffer = (loc, directions) => {
  const stepA = [loc[0] + directions[0][0], loc[1] + directions[0][1]];
  const stepB = [loc[0] + directions[1][0], loc[1] + directions[1][1]];
  return matrix[stepA[0]][stepA[1]] !== matrix[stepB[0]][stepB[1]];
}

const doWork = () => {
  console.log(matrix);
  console.log(starts);
  while (starts.length) {
    const search = starts.pop();
    let found = 0;
    dir.forEach(d => {
      if (
        isStepInBounds(search.loc, d[0]) &&
        isStepInBounds(search.loc, d[1]) &&
        noBadLetters(search.loc, d[0]) &&
        noBadLetters(search.loc, d[1]) &&
        lettersDiffer(search.loc, d)
      ) found++;
      if (found === 2) total++;
    });
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
