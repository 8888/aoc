const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '24.test.txt' };
const example = { file: '24.example.txt' };
const goal = { file: '24.txt' };
const game = goal;

const wires = {};
const operations = [];

let wiresProcessed = false;
const init = (line = '') => {
  if (line === '') {
    wiresProcessed = true;
  } else if (wiresProcessed) {
    // gates
    const [in1, gate, in2, out] = [...line.matchAll(/[a-z]{3}|[a-z][0-9]{2}|AND|XOR|OR/g)];
    operations.push({
      in1: in1[0],
      gate: gate[0],
      in2: in2[0],
      out: out[0],
    });
  } else {
    // wires
    const [wire, value] = line.split(': ');
    wires[wire] = value;
  }
}

const doWork = () => {
  let stack = [...operations];
  stack.sort((a, b) => a.in1.localeCompare(b.in1));
  while (stack.length) {
    console.log(stack.length)
    for (let i = stack.length - 1; i >= 0; i--) {
      if (wires.hasOwnProperty(stack[i].in1) && wires.hasOwnProperty(stack[i].in2)) {
        const cur = stack.splice(i, 1)[0];
        if (cur.gate === 'AND') {
          wires[cur.out] = wires[cur.in1] & wires[cur.in2];
        } else if (cur.gate === 'XOR') {
          wires[cur.out] = wires[cur.in1] ^ wires[cur.in2];
        } else {
          wires[cur.out] = wires[cur.in1] | wires[cur.in2];
        }
      }
    }
  }

  let results = [];
  for (let [wire, value] of Object.entries(wires)) {
    if (wire[0] == 'z') results.push({wire, value});
  }
  results.sort((a, b) => {
    return parseInt(`${b.wire[1]}${b.wire[2]}`) - parseInt(`${a.wire[1]}${a.wire[2]}`);
  })
  let result = '';
  results.forEach(r => result += r.value);
  console.log(`Binary result: ${result}`)
  console.log(`Decimal result: ${parseInt(result, 2)}`)

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

    doWork();

  } catch (err) {
    console.error(err);
  }
})();
