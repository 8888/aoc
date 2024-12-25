const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '24.test.txt' };
const example = { file: '24.example.txt' };
const goal = { file: '24.2.txt' };
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

const exploreResult = () => {
  let wireCount = 0;
  for (let [key, value] of Object.entries(wires)) {
    if (key.match(/x[0-9][0-9]/)) {
      wireCount++;
    }
  }

  const xList = [];
  const yList = [];
  const zList = [];
  for (let i = 0; i < wireCount; i++) {
    const keyNum = i < 10 ? `0${i}` : `${i}`;
    const x = wires[`x${keyNum}`];
    const y = wires[`y${keyNum}`];
    const z = wires[`z${keyNum}`];
    xList.unshift(x);
    yList.unshift(y);
    zList.unshift(z);
    console.log(`x${keyNum} ${x}, y${keyNum} ${y}, z${keyNum} ${z}`)
  }
  const xDec = parseInt(xList.join(''), 2);
  const yDec = parseInt(yList.join(''), 2);
  const zDec = parseInt(zList.join(''), 2);
  console.log(`Current: ${xDec} + ${yDec} = ${zDec}`)
  console.log(`Correct? ${xDec + yDec === zDec}`)
  console.log(`Current: ${xList.join('')} + ${yList.join('')} =  ${zList.join('')}`)
  console.log(`Goal   : ${xList.join('')} + ${yList.join('')} = ${(xDec + yDec).toString(2)}`)
  // console.log(wires);
}

/*
Doesn't output answer by running!!
Solved by hand

four pairs of gates whose output wires have been swapped

BASE INPUT
Current: 33338013867725 + 27101540591641 = 25530051886854
Correct? false
Current:  101110011100000101101101011000111111100000110
Goal   : 1101101111100000101110001011001000011011100110
Issue at z05
x05 AND y05 -> z05

x[0-9][0-9] XOR y[0-9][0-9] -> z
y[0-9][0-9] XOR x[0-9][0-9] -> z

((x[0-9][0-9])|(y[0-9][0-9])) XOR ((x[0-9][0-9])|(y[0-9][0-9]))

pjg XOR kmg -> frt ✅
hkc XOR tdd -> sps ✅
pvb XOR vtn -> tst ✅
x13 XOR y13 -> whw ❌

kmg AND pjg -> z23 ✅
x05 AND y05 -> z05 ✅
tff OR rrr -> z11 ✅

gnj OR frt -> jkv ❌
y38 AND x38 -> cgh ✅
x38 XOR y38 -> pmd ✅

frt,jkv,sps,tst,whw,z05,z11,z23 ❌
cgh,frt,pmd,sps,tst,z05,z11,z23 ✅
*/

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
    exploreResult();

  } catch (err) {
    console.error(err);
  }
})();
