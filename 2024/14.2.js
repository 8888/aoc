const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let seconds = 0;
const example = {
  file: '14.example.txt',
  rows: 7,
  cols: 11,
};
const test = {
  file: '14.test.txt',
  rows: 7,
  cols: 11,
};
const silver = {
  file: '14.txt',
  rows: 103,
  cols: 101,
};
const game = silver;

const robots = [];

const init = (line = '') => {
  if (line === '') return;
  const input = [...line.matchAll(/-?[0-9]+/g)];
  robots.push({
    r: parseInt(input[1][0]),
    c: parseInt(input[0][0]),
    vr: parseInt(input[3][0]),
    vc: parseInt(input[2][0]),
  });
}

const moveRobots = () => {
  while (!isTree()) {
    seconds++;
    robots.forEach(robot => {
      robot.r += robot.vr;
      robot.c += robot.vc;
      robot.r -= Math.trunc(robot.r/ game.rows) * game.rows;
      robot.c -= Math.trunc(robot.c/ game.cols) * game.cols;
      robot.r = robot.r < 0 ? robot.r + game.rows : robot.r;
      robot.c = robot.c < 0 ? robot.c + game.cols : robot.c;
    });
    robots.sort((a, b) => {
      if (a.r !== b.r) {
        return a.r - b.r;
      } else {
        return a.c = b.c;
      }
    });
    // console.log(seconds);
  }
}

const isTree = () => {
  /*
  I guess this is a tree? If this isn't right try adding a stump?
  .........
  1....x....
  2...xxx...
  3..xxxxx..
  4.xxxxxxx.
  5.........
  sort all, start with top r
  each level should have previous level +2 total bots
  and they should be sequential
  and the middle should be the same as the top

  start looping through what should be a tree from 0,0
  check that the bots match with an offset set as bot[0]
  */

  let count = 3;
  let targetR = robots[0].r + 1;
  let currentBot = 1;
  while (currentBot < robots.length) {
    if (currentBot == 15) console.log('whoa 9 bots')
    for (let i = 0; i < count; i++) {
      if (robots[currentBot].r !== targetR) return false;
      currentBot++;
    }
    count += 2;
    targetR++;
  }
  return true;
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

    moveRobots();
    console.log(seconds);

  } catch (err) {
    console.error(err);
  }
})();
