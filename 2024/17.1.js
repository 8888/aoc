const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '17.test.txt' };
const goal = { file: '17.txt' };
const game = goal;

const reg = {
  a: 0,
  b: 0,
  c: 0
}
const program = [];
let pointer = 0;
const output = [];

const comboOperands = {
  0: () => 0,
  1: () => 1,
  2: () => 2,
  3: () => 3,
  4: () => reg.a,
  5: () => reg.b,
  6: () => reg.c,
};

const instructions = {
  0: (x) => {
    reg.a = Math.trunc(reg.a / Math.pow(2, comboOperands[x]()));
  },
  1: (x) => {
    reg.b = reg.b ^ x;
  },
  2: (x) => {
    reg.b = comboOperands[x]() % 8;
  },
  3: (x) => {
    if (reg.a != 0) pointer = x - 2; // let the pointer still jump 2
  },
  4: (x) => {
    reg.b = reg.b ^ reg.c;
  },
  5: (x) => {
    output.push(comboOperands[x]() % 8);
  },
  6: (x) => {
    reg.b = Math.trunc(reg.a / Math.pow(2, comboOperands[x]()));
  },
  7: (x) => {
    reg.c = Math.trunc(reg.a / Math.pow(2, comboOperands[x]()));
  },
};

const init = (line = '') => {
  if (line.match(/Register A:/)) {
    reg.a = parseInt(line.match(/[0-9]+/)[0]);
  } else if (line.match(/Program:/)) {
    line.matchAll(/[0-9]/g).forEach(p => program.push(parseInt(p[0])));
  }
}

const run = () => {
  while (pointer < program.length) {
    instructions[program[pointer]](program[pointer + 1]);
    pointer += 2;
  }
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

    console.log(program);
    run();
    console.log(reg);
    console.log(output.join(','));

  } catch (err) {
    console.error(err);
  }
})();
