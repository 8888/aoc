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
    let job = line.split(',');
    let result = isLineCorrect(job);
    if (result.correct) return;
    while (!result.correct) {
      const element = job.splice(result.r, 1);
      job.splice(result.l, 0, element[0]);
      result = isLineCorrect(job);
    }
    const middle = Math.floor(job.length / 2);
    total += parseInt(job[middle]);
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
  for (let i = 0; i < line.length -1 ; i++) {
    for (let n = i+1; n < line.length; n++) {
      // if n should be before i, this is invalid
      const left = line[i];
      const right = line[n];
      if (rules?.[right]?.before?.[left]) return { correct: false, l: i, r: n };
    }
  }
  return { correct: true };
};

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

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
