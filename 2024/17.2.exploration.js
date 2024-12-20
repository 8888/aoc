const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '17.2.test.txt' };
const goal = { file: '17.txt' };
const game = goal;

const reg = {
  a: 0,
  b: 0,
  c: 0
}
const program = [];
let pointer = 0;
let output = [];

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
    reg.b = comboOperands[x]() & 7;
  },
  3: (x) => {
    if (reg.a != 0) pointer = x - 2; // let the pointer still jump 2
  },
  4: (x) => {
    reg.b = reg.b ^ reg.c;
  },
  5: (x) => {
    output.push(comboOperands[x]() & 7);
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

const comparePrograms = (a, b) => {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  return false;
}

const explore = () => {
  /*
  Again inerested in starting with the really large number that produces a full length output
  8 ** 16 = 281474976710655
  281474976710655 === 7777777777777777
  Let run A as 281474976710655 => -3-3-3-3555555555522

  */
  resetProgram(281474976710655)
  run();
  console.log(output.join(''));
  return;

  /*
  Is it 3 bits off of register A each time?
  Would length of A in octal need to be program.length * 3?
  octal     => decimal
  000 - 777 => 0 - 511

  how long will the input be?
  Program: 2411750314405530 (length 16)
  Input in octal needs to be length 16?
  000000000000000 - 7777777777777777
  0 - 281474976710655

  Ok next
  the Instruction that modifies A is 0,3 which divides A by 8
  Every run through, we divide A by 8 until A is zero?
  It gets truncated so it doesn't have to be a clean multiple

  First half of program ends with 0,3, which divides A by 8
  second half doesnt change A at all
  2,4,1,1,7,5,0,3
  1,4,4,0,5,5,3,0


  Lets grab an example we saw that worked for some
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                           1,4,4,0,5,5,3,0
  value: 12061399
  v oct: 56005327

  ✅ 771929582 / 8 = 96491197.75
  ❌ 96491197 / 8 = 12061399.625
  ✅ 12061399 / 8 = 1507674.875
  ❌ 1507674 / 8 = 188459.25
  ✅ 188459 / 8 = 23557.375
  ❌ 23557 / 8 = 2944.625
  ✅ 2944 / 8 = 368
  ❌ 368 / 8 = 46
  ✅ 46 / 8 = 5.75
  ❌ 5 / 8 = 0.625
  ✅ 0

  771929582
  12061399
  188459
  2944
  46

  46 * 64 = 2944
  2944 * 64 = 188416
  188416 * 64 = 12058624
  12058624 * 64 = 771751936
  771751936 * 64 = 49392123904
  49392123904 * 64 = 3161095929856
  3161095929856 * 64 = 202310139510784
  202310139510784 * 64 = 12947848928690176
  12947848928690176 * 64 = 828662331436171300

  12947848928690176 is too high

  dec = oct
  202310139510784 == 5600000000000000

  The clean * 64 falls off because the other division is truncated
  */


  const map = {};
  for (let i = 0; i < 64; i++) {
    reg.a = i;
    reg.b = 0;
    reg.c = 0;
    output = [];
    pointer = 0;
    run();
    const str = output.join('');
    console.log(`Input dec value: ${i} | Input oct value: ${i.toString(8)} | output: ${output.join('')}`)
    if (!map[str]) map[str] = i;
  }

  return;

  for (let [key, value] of Object.entries(map)) {
    console.log(`input: ${value.toString(8)}, output: ${key}`)
  }

  const resultOct = [];
  for (let i = program.length - 1; i >= 0; i--) {
    resultOct.push(parseInt(map[program[i]]).toString(8));
  }
  console.log(resultOct);
  return;

  for (let i = program.length - 1; i > 0; i -= 2) {
    const programStr = `${program[i-1]}${program[i]}`;
    const oct = parseInt(map[programStr]).toString(8);
    console.log(`${programStr} => dec: ${map[programStr]} | oct: ${oct}`);
  }
  return;
  /*
  30 => dec: 46 | oct: 56
  55 => dec: 9 | oct: 11
  40 => dec: 43 | oct: 53
  14 => dec: undefined | oct: NaN
  03 => dec: 52 | oct: 64
  75 => dec: undefined | oct: NaN
  11 => dec: undefined | oct: NaN
  24 => dec: undefined | oct: NaN

  405530
  561153 ??
  why not
  560053

  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                       0,3,1,4,4,0,5,5,3,0
  value: 771929582
  v oct: 5600532756

  input: 5, output: 0
  input: 4, output: 1
  input: 7, output: 2
  input: 6, output: 3
  input: 1, output: 5 ????
  input: 3, output: 6
  input: 2, output: 7

  ^^ no possible 4 output? why does 1 output 5?

  oh! There are multiple xx to produce yy!
  When you find an xx that works, move on to nnxx, if that doesn't work, try the next xx
  Recursively keep going until we find a solution
  All loops are no more than 64 iterations
  */

  // initial pattern hunting
  for (let dec = 0; dec < 100000; dec ++) {
    reg.a = dec;
    reg.b = 0;
    reg.c = 0;
    output = [];
    pointer = 0;
    run();
    const oct = dec.toString(8);
   console.log(`dec: ${dec}, oct: ${oct}, out: ${output.join('')}, dec: ${parseInt(output.join(''), 8)}`);
   if (output.join(',') === '4,0,5,5,3,0') return;
  }
  /* Learnings:
  This is my program:
  2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  - When the input increaes it increases the last number in the output first
  - Lots of patterns in the test re: multipies of 8. Everything in this problem octal so just try exploring more of this
    - patterns appear and loop in mults of 8. To increase a digit more significant while keeping the lest significant mult by 8 and search, everything below that will be a miss
  - Let's search for our first match at the end of the progam 3,0
    - dec: 46, oct: 56, out: 30, dec: 24
    - 46 * 8 = 368 -> start searching from here for 5,5,3,0
    - dec: 2944, oct: 5600, out: 5530, dec: 2904
    - 2994 * 8 = 23952 -> search for 4,0,5,5,3,0
    - dec: 188459, oct: 560053, out: 405530, dec: 133976
  - This pattern could work if it doesn't become too large to search at all
  - If it does, do we know an upper bounds? maybe another 8 multiple? Then we can binary search. We'd also need a way to know if we went past a digit.

  - First run through was too slow to complete
      Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                                           3,0
      value: 46
      v oct: 56
      Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                                       5,5,3,0
      value: 2944
      v oct: 5600
      Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                                   4,0,5,5,3,0
      value: 188459
      v oct: 560053
      Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                               1,4,4,0,5,5,3,0
      value: 12061399
      v oct: 56005327
      Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
                           0,3,1,4,4,0,5,5,3,0
      value: 771929582
      v oct: 5600532756
  - This pattern will let us know which value to itterate better. Using the octal representation of the input knowing which bits need to change
    56
    5600
    560053
    56005327
    5600532756
  - we do have a min and max now
          00 -        77
        xx00 -      xx77
      xxxx00 -    xxxx77
    xxxxxx00 -  xxxxxx77
    The x carries over to each

  46 (oct 56)
  46 << 6 = 2944 (oct 5600)
  2944 << 6 = 188416 (itterate until 188459 for oct 560053)
  188459 << 6 = 12061376 (itterate until 12061399 for oct 56005327)
  12061399 << 6 = 771929536 (itterate until 771929582 for oct 5600532756)


  Now we are trying to really minimize our search field but still getting hung up here
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  3,0
  value: 46
  v oct: 56
  searched from 0 to 46 across 46 numbers
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  5,5,3,0
  value: 2944
  v oct: 5600
  searched from 2944 to 2944 across 0 numbers
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  4,0,5,5,3,0
  value: 188459
  v oct: 560053
  searched from 188416 to 188459 across 43 numbers
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  1,4,4,0,5,5,3,0
  value: 12061399
  v oct: 56005327
  searched from 12061376 to 12061399 across 23 numbers
  Program: 2,4,1,1,7,5,0,3,1,4,4,0,5,5,3,0
  0,3,1,4,4,0,5,5,3,0
  value: 771929582
  v oct: 5600532756
  searched from 771929536 to 771929582 across 46 numbers
  */
}

const programsEqual = (target = [], suspect = [], depth = 2) => {
  return (
    suspect.length === depth &&
    target.slice(target.length - depth).join(',') === suspect.join(',')
  )
}

const search = () => {
  let value = 0;
  for (let depth = 0; depth < program.length; depth += 2) {
    let start, end;
    start = value;
    while (true) {
      reg.a = value;
      reg.b = 0;
      reg.c = 0;
      output = [];
      pointer = 0;
      run();
      if (programsEqual(program, output, depth + 2)) {
        console.log(`Program: ${program.join(',')}`);
        console.log(output.join(','));
        console.log(`value: ${value}`)
        console.log(`v oct: ${value.toString(8)}`);
        end = value;
        console.log(`searched from ${start} to ${end} across ${end - start} numbers`);
        value = value << 6;
        break;
      } else {
        value++;
      }
    }
  }
}

const resetProgram = (a) => {
  reg.a = a;
  reg.b = 0;
  reg.c = 0;
  output = [];
  pointer = 0;
}

const searchRecursively = (start = 0, depth = 2) => {
  /* Result when changing the start + from 64 to 6400000
  Input dec: 46 | Input oct: 56 | Output: 30
  Input dec: 2944 | Input oct: 5600 | Output: 5530
  Input dec: 188459 | Input oct: 560053 | Output: 405530
  Input dec: 12061399 | Input oct: 56005327 | Output: 14405530
  Input dec: 771929582 | Input oct: 5600532756 | Output: 0314405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 12065495 | Input oct: 56015327 | Output: 14405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 188523 | Input oct: 560153 | Output: 405530
  Input dec: 12065495 | Input oct: 56015327 | Output: 14405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 2945 | Input oct: 5601 | Output: 5530
  Input dec: 188523 | Input oct: 560153 | Output: 405530
  Input dec: 12065495 | Input oct: 56015327 | Output: 14405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 2948 | Input oct: 5604 | Output: 5530
  Input dec: 2953 | Input oct: 5611 | Output: 5530
  Input dec: 2956 | Input oct: 5614 | Output: 5530

  It still doesn't find a match and this is already getting too slow
  */
  for (let i = start; i < start + 6400000; i++) {
    resetProgram(i);
    run();
    if (programsEqual(program, output, depth)) {
      console.log(`Input dec: ${i} | Input oct: ${i.toString(8)} | Output: ${output.join('')}`)
      searchRecursively(i << 6, depth + 2);
    }
  }
}

const searchRecursively2 = (start = 0, depth = 1) => {
  /*
  trying to find single digits instead of pairs
  Input dec: 5 | Input oct: 5 | Output: 0
  Input dec: 46 | Input oct: 56 | Output: 30
  Input dec: 368 | Input oct: 560 | Output: 530
  Input dec: 2944 | Input oct: 5600 | Output: 5530
  Input dec: 23557 | Input oct: 56005 | Output: 05530
  Input dec: 188459 | Input oct: 560053 | Output: 405530
  Input dec: 1507674 | Input oct: 5600532 | Output: 4405530
  Input dec: 12061399 | Input oct: 56005327 | Output: 14405530
  Input dec: 96491197 | Input oct: 560053275 | Output: 314405530
  Input dec: 771929582 | Input oct: 5600532756 | Output: 0314405530
  Input dec: 23565 | Input oct: 56015 | Output: 05530
  Input dec: 188523 | Input oct: 560153 | Output: 405530
  Input dec: 1508186 | Input oct: 5601532 | Output: 4405530
  Input dec: 12065495 | Input oct: 56015327 | Output: 14405530
  Input dec: 96523965 | Input oct: 560153275 | Output: 314405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 23588 | Input oct: 56044 | Output: 05530
  Input dec: 2945 | Input oct: 5601 | Output: 5530
  Input dec: 23565 | Input oct: 56015 | Output: 05530
  Input dec: 188523 | Input oct: 560153 | Output: 405530
  Input dec: 1508186 | Input oct: 5601532 | Output: 4405530
  Input dec: 12065495 | Input oct: 56015327 | Output: 14405530
  Input dec: 96523965 | Input oct: 560153275 | Output: 314405530
  Input dec: 772191726 | Input oct: 5601532756 | Output: 0314405530
  Input dec: 23588 | Input oct: 56044 | Output: 05530
  Input dec: 2948 | Input oct: 5604 | Output: 5530
  Input dec: 23588 | Input oct: 56044 | Output: 05530
  Input dec: 2953 | Input oct: 5611 | Output: 5530
  Input dec: 2956 | Input oct: 5614 | Output: 5530
  Input dec: 369 | Input oct: 561 | Output: 530
  Input dec: 2953 | Input oct: 5611 | Output: 5530
  Input dec: 2956 | Input oct: 5614 | Output: 5530
  */
  for (let i = start; i < start + 64; i++) {
    resetProgram(i);
    run();
    if (programsEqual(program, output, depth)) {
      console.log(`Input dec: ${i} | Input oct: ${i.toString(8)} | Output: ${output.join('')}`)
      searchRecursively2(i << 3, depth + 1);
    }
  }
}

const searchRecursively3 = (start = 0, depth = 1) => {
  /*
  Input dec: 5 | Input oct: 05 | Output: 0
  Input dec: 46 | Input oct: 406 | Output: 30
  Input dec: 368 | Input oct: 3680 | Output: 530
  Input dec: 2944 | Input oct: 29440 | Output: 5530
  Input dec: 23557 | Input oct: 235525 | Output: 05530
  Input dec: 188459 | Input oct: 1884563 | Output: 405530
  Input dec: 1507674 | Input oct: 15076722 | Output: 4405530
  Input dec: 12061399 | Input oct: 120613927 | Output: 14405530
  Input dec: 96491197 | Input oct: 964911925 | Output: 314405530
  Input dec: 771929582 | Input oct: 7719295766 | Output: 0314405530
  Input dec: 6175436657 | Input oct: 61754366561 | Output: 50314405530
  Input dec: 6175436662 | Input oct: 61754366566 | Output: 50314405530
  Input dec: 2945 | Input oct: 29441 | Output: 5530
  Input dec: 23565 | Input oct: 235605 | Output: 05530
  Input dec: 188523 | Input oct: 1885203 | Output: 405530
  Input dec: 1508186 | Input oct: 15081842 | Output: 4405530
  Input dec: 12065495 | Input oct: 120654887 | Output: 14405530
  Input dec: 96523965 | Input oct: 965239605 | Output: 314405530
  Input dec: 772191726 | Input oct: 7721917206 | Output: 0314405530
  Input dec: 6177533809 | Input oct: 61775338081 | Output: 50314405530
  Input dec: 6177533814 | Input oct: 61775338086 | Output: 50314405530
  Input dec: 2948 | Input oct: 29444 | Output: 5530
  Input dec: 23588 | Input oct: 235844 | Output: 05530
  Input dec: 369 | Input oct: 3681 | Output: 530
  Input dec: 2953 | Input oct: 29521 | Output: 5530
  Input dec: 2956 | Input oct: 29524 | Output: 5530
  */
  for (let i = 0; i < 8; i++) {
    resetProgram(start + i);
    run();
    if (programsEqual(program, output, depth)) {
      console.log(`Input dec: ${start + i} | Input oct: ${start + i.toString(8)} | Output: ${output.join('')}`)
      searchRecursively3((start + i) * 8, depth + 1);
    }
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

    // explore();
    // search();
    // searchRecursively();
    // searchRecursively2();
    searchRecursively3();

  } catch (err) {
    console.error(err);
  }
})();
