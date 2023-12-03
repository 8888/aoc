const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let top = '';
let mid = '';
let bot = '';

const doWork = (line) => {
  // process line
  let lineList = [];
  let stack = [];
  let prev = null;
  for (let i = 0; i < line.length; i++) {
    while (stack.length) {
      const {item, val} = stack.pop();
      item.val = val;
      if (item.parent) stack.push({item: item.parent, val});
    }
    if (!isNaN(line[i])) {
      if (prev) {
        const val = prev.val + line[i];
        const item = {val, parent: prev};
        lineList.push(item);
        stack.push({item: prev, val});
        prev = item;
      } else {
        const item = {val: line[i], parent: null};
        lineList.push(item);
        prev = item;
      }
    } else {
      lineList.push(line[i]);
      prev = null;
    }
  }
  // run the stack again in case of a number at the end
  while (stack.length) {
    const {item, val} = stack.pop();
    item.val = val;
    if (item.parent) stack.push({item: item.parent, val});
  }

  // init state
  if (!top) {
    top = lineList;
    return;
  } else if (!mid) {
    mid = lineList;
    return;
  } else {
    bot = lineList;
  }

  // search for gear
  for (let c = 0; c < mid.length; c++) {
    let nums = Array(8);
    if (mid[c] === '*') {
      if (top[c].val) nums[1] = parseInt(top[c].val); // tm
      if (!nums[1]) { // no need to check tl and tr if there is a mid num connecting them
        if (c > 0 && top[c-1].val) nums[0] = parseInt(top[c-1].val); // tl
        if (c < mid.length - 1 && top[c+1].val) nums[2] = parseInt(top[c+1].val); // tr
      }
      if (c > 0 && mid[c-1].val) nums[3] = parseInt(mid[c-1].val); // ml
      if (c < mid.length - 1 && mid[c+1].val) nums[4] = parseInt(mid[c+1].val); // mr
      if (bot[c].val) nums[6] = parseInt(bot[c].val); // bm
      if (!nums[6]) { // no need to check bl and br if there is a mid num connecting them
        if (c > 0 && bot[c-1].val) nums[5] = parseInt(bot[c-1].val); // bl
        if (c < mid.length - 1 && bot[c+1].val) nums[7] = parseInt(bot[c+1].val); // br
      }
    }
    let found = nums.filter(n => n)
    if (found.length === 2) {
      total += found.reduce((a, b) => a * b);
    }
  }

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
