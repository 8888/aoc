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
const gold = {
  file: '14.txt',
  rows: 103,
  cols: 101,
};
const game = gold;

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
  let found = false;
  while (!found) {
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
        return a.c - b.c;
      }
    });
    found = isTree();
  }
}

const isTree = () => {
  for (let i = 1; i < robots.length; i++) {
    if (robots[i].r === robots[i-1].r && robots[i].c === robots[i-1].c) return false;
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
