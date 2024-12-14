const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const example = {
  file: '14.example.txt',
  rows: 7,
  cols: 11,
  seconds: 5,
};
const test = {
  file: '14.test.txt',
  rows: 7,
  cols: 11,
  seconds: 100,
};
const silver = {
  file: '14.txt',
  rows: 103,
  cols: 101,
  seconds: 100,
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
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;

  robots.forEach(robot => {
    // console.log(robot);
    robot.r += robot.vr * game.seconds;
    robot.c += robot.vc * game.seconds;
    // console.log(robot);
    robot.r -= Math.trunc(robot.r/ game.rows) * game.rows;
    robot.c -= Math.trunc(robot.c/ game.cols) * game.cols;
    // console.log(robot);
    robot.r = robot.r < 0 ? robot.r + game.rows : robot.r;
    robot.c = robot.c < 0 ? robot.c + game.cols : robot.c;
    // console.log(robot);

    if (robot.r < Math.floor(game.rows/2)) {
      if (robot.c < Math.floor(game.cols/2)) {
        a++;
      } else if (robot.c > Math.floor(game.cols/2)) {
        b++;
      }
    } else if (robot.r > Math.floor(game.rows/2)) {
      if (robot.c < Math.floor(game.cols/2)) {
        c++;
      } else if (robot.c > Math.floor(game.cols/2)) {
        d++;
      }
    }
  });

  total = a*b*c*d;
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
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
