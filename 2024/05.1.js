const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const rules = {};
/*
{
  '29': { before: { '13': true } },
  '47': { before: { '13': true, '29': true, '53': true, '61': true } },
}
*/

let allRulesRead = false;

const init = (line) => {
  if (line === '') {
    allRulesRead = true;
  } else if (allRulesRead) {
    // process print jobs
    isLineCorrect(line.split(','));
  } else {
    // process rules
    const r = line.split('|');
    if (rules[r[0]]) {
      rules[r[0]].before[r[1]] = true;
    } else {
      rules[r[0]] = { before: { [r[1]]: true }};
    }
  }
}

const isLineCorrect = (line) => {
  console.log(line);
  for (let i = 0; i < line.length -1 ; i++) {
    for (let n = i+1; n < line.length; n++) {
      // if n should be before i, this is invalid
      const left = line[i];
      const right = line[n];
      if (rules?.[right]?.before?.[left]) return;
    }
  }
  const middle = Math.floor(line.length / 2);
  total += parseInt(line[middle]);
};

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
      input: createReadStream('05.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    // doWork();
    console.log(rules)
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
