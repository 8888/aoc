const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const numbers = [
  {s: 'zero', n: '0'},
  {s: 'one', n: '1'},
  {s: 'two', n: '2'},
  {s: 'three', n: '3'},
  {s: 'four', n: '4'},
  {s: 'five', n: '5'},
  {s: 'six', n: '6'},
  {s: 'seven', n: '7'},
  {s: 'eight', n: '8'},
  {s: 'nine', n: '9'},
];

const doWork = (line) => {
  // two pointers to find first ints and spelled ints
  let l = 0;
  let r = line.length - 1;
  let n, m;

  let searching = [];
  // LEFT
  while (!n && l < line.length) {
    if (!isNaN(parseInt(line[l]))) {
      // check for int
      n = line[l];
      break;
    }

    // check for spelling of started ints
    for (let i = 0; i < searching.length; i++) {
      let target = searching[i]
      if (line[l] === target.s[target.i]) {
        if (target.i === target.s.length - 1) {
          // word complete
          n = target.n;
          break;
        } else {
          // keep searching this word
          target.i++;
        }
      } else {
        // not found, remove from searches
        searching.splice(i, 1);
        i--;
      }
    }
    if (n) break;

    // check for spelling of new ints
    numbers.forEach((n) => {
      if (line[l] === n.s[0]) {
        searching.push({...n, i: 1});
      }
    });

    l++;
  }

  // RIGHT
  searching = [];
  while (!m && r >= 0) {
    if (!isNaN(parseInt(line[r]))) {
      m = line[r];
      break;
    }

    // check for spelling of started ints
    for (let i = 0; i < searching.length; i++) {
      let target = searching[i]
      if (line[r] === target.s[target.i]) {
        if (target.i === 0) {
          // word complete
          m = target.n;
          break;
        } else {
          // keep searching this word
          target.i--;
        }
      } else {
        // not found, remove from searches
        searching.splice(i, 1);
        i--;
      }
    }
    if (m) break;

    // check for spelling of new ints
    numbers.forEach((n) => {
      if (line[r] === n.s[n.s.length-1]) {
        searching.push({...n, i: n.s.length-2});
      }
    });

    r--;
  }

  total += parseInt(n + m);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('1.2.input.txt'),
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
