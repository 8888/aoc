const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let top = '';
let mid = '';
let bot = '';

const doWork = (line) => {
  // a symbol is anything thats not a number or a period
  // symbols can only be adjacent to numbers in 3 lines
  // be careful not to count numbers twice
  // step through lines and track numbers while checking validity
  // symbol will be in above line, current, or below

  // init state
  if (!top) {
    top = line;
    return;
  } else if (!mid) {
    mid = line;
    return;
  } else {
    bot = line;
  }

  // work on mid line
  let num = '';
  let valid = false;
  for (let c = 0; c < mid.length; c++) {
    if (mid[c] === '.') {
      if (valid && num) {
        total += parseInt(num);
      }
      valid = false;
      num = '';
    } else if (!isNaN(parseInt(mid[c]))) {
      num += mid[c];
      // check for validity if needed
      if (!valid) {
        // check above
        if (
          (c > 0 && top[c-1] !== '.' && isNaN(parseInt(top[c-1]))) ||
          (top[c] !== '.' && isNaN(parseInt(top[c]))) ||
          (c < mid.length - 1 && top[c+1] !== '.' && isNaN(parseInt(top[c+1])))
        ) {
          valid = true;
        }
      }
      // check below
      if (!valid) {
        if (
          (c > 0 && bot[c-1] !== '.' && isNaN(parseInt(bot[c-1]))) ||
          (bot[c] !== '.' && isNaN(parseInt(bot[c]))) ||
          (c < mid.length - 1 && bot[c+1] !== '.' && isNaN(parseInt(bot[c+1])))
        ) {
          valid = true;
        }
      }
    } else {
      // must be a symbol
      valid = true;
      if (num) total += parseInt(num);
      num = '';
    }
  }

  // check for end of line and validity
  if (valid && num) total += parseInt(num);

  // set state for next run
  top = mid;
  mid = bot;
}

(async function processLineByLine() {
  doWork('.'.repeat(140)) // cheat to check actual first line

  try {
    const rl = createInterface({
      input: createReadStream('3.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    doWork('.'.repeat(140)) // cheat to check actual last line

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
