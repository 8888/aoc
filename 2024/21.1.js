const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '21.test.txt' };
const goal = { file: '21.txt' };
const game = goal;

let total = 0;
const tasks = [];

const numeric = {
  /*
  +---+---+---+
  | 7 | 8 | 9 |
  +---+---+---+
  | 4 | 5 | 6 |
  +---+---+---+
  | 1 | 2 | 3 |
  +---+---+---+
      | 0 | A |
      +---+---+
  029A = <A ^A >^^A vvvA
  */
  7: {r: 0, c: 0},
  8: {r: 0, c: 1},
  9: {r: 0, c: 2},
  4: {r: 1, c: 0},
  5: {r: 1, c: 1},
  6: {r: 1, c: 2},
  1: {r: 2, c: 0},
  2: {r: 2, c: 1},
  3: {r: 2, c: 2},
  0: {r: 3, c: 1},
  A: {r: 3, c: 2},
};

const directional = {
  /*
      +---+---+
      | ^ | A |
  +---+---+---+
  | < | v | > |
  +---+---+---+
  <A^A>^^AvvvA = v<<A >>^A <A >A vA <^A A >A <vA A A >^A
  */
  '^': {r: 0, c: 1},
  'A': {r: 0, c: 2},
  '<': {r: 1, c: 0},
  'v': {r: 1, c: 1},
  '>': {r: 1, c: 2},
};

const padTypes = {numeric, directional};

const init = (code = '') => {
  tasks.push({
    code,
    pads: [{key: 'A', presses: []}, {key: 'A', presses: []}, {key: 'A', presses: []}],
  });
}

const debugSteps = (code = [], presses = []) => {
  const match = [...presses.join('').matchAll(/[^A]*A/g)];
  console.log(`Same length of moves? ${code.length === match.length}`)
  code.forEach((keyToPress, i) => {
    console.log(`${i}) ${keyToPress} -- ${match[i][0]}`)
  })
}

const right = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].c < currentPad[keyToPress].c) {
    pad.presses.push(...new Array(currentPad[keyToPress].c - currentPad[pad.key].c).fill('>'));
  }
}

const down = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].r < currentPad[keyToPress].r) {
    pad.presses.push(...new Array(currentPad[keyToPress].r - currentPad[pad.key].r).fill('v'));
  }
}

const up = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].r > currentPad[keyToPress].r) {
    pad.presses.push(...new Array(currentPad[pad.key].r - currentPad[keyToPress].r).fill('^'));
  }
}

const left = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].c > currentPad[keyToPress].c) {
    pad.presses.push(...new Array(currentPad[pad.key].c - currentPad[keyToPress].c).fill('<'));
  }
}


const doWork = () => {
  /*
  When stepping we must avoid the blank space in each pad
  It's in the bottom left of numeric and top left of directional
  Ordering our moves will avoid
  */
  // { code: '029A', pads: [ {key: 'A', presses: []} ] }
  tasks.forEach(task => {
    task.pads.forEach((pad, i) => {
      const code = i === 0 ? task.code.split('') : task.pads[i-1].presses;
      const padType = i === 0 ? 'numeric' : 'directional';
      const currentPad = padTypes[padType];

      code.forEach(keyToPress => {
        // moving from pad.key to key, then set pad.key to key for next move
        // check moves right, up, left, down
        // -: pad.key <--> keyToPress
        // r: 1,1 <--> 1,2 | pad.key.c < keyToPress.c | keyToPress.c - pad.key.c
        // d: 1,1 <--> 2,1 | pad.key.r < keyToPress.r | keyToPress.r - pad.key.r
        // u: 1,1 <--> 0,1 | pad.key.r > keyToPress.r | pad.key.r - keyToPress.r
        // l: 1,1 <--> 1,0 | pad.key.c > keyToPress.c | pad.key.c - keyToPress.c
        /*
        move order still seems to be a bit unintuitively off

        I don't think there is an order that works for all cases,
        There will be an ideal order, but need to switch if we are going to hit the blank
        ^> -- vertical then horizontal
        v> -- vertical then horizontal
        <^ -- horizontal then vertical
        <v -- horizontal then vertical
        So then ideal order is <v^>

        Moving left - horiz then vert
        Moving right - vert then horiz

        if we'll hit the emtpy spot then switch it
        // from ^ to < crosses the empty space if you go left down -> must go vh
        // from 0 to 1 crosses the empty space if you go left up -> must go vh
        // from 1 to 0 crosses the empty space if you go down right -> must go hv
        // from < to ^ crosses the empty space if you go up right -> must go hv

        3 cases
        - the specific move that crosses a space resulting in required vh
        - the specific move that crosses a space resulting in required hv
        - ideal case of <v^>
        */

        if (
          (padType === 'numeric' && (
            (pad.key == 7 || pad.key == 4 || pad.key == 1) &&
            (keyToPress == 0 || keyToPress === 'A'))
          ) ||
          (padType === 'directional' && (
            pad.key === '<' &&
            (keyToPress === '^' || keyToPress === 'A'))
          )
        ) {
          // must go hv
          left(currentPad, pad, keyToPress);
          right(currentPad, pad, keyToPress);
          down(currentPad, pad, keyToPress);
          up(currentPad, pad, keyToPress);
        } else if (
          (padType === 'numeric' && (
            (pad.key == 0 || pad.key === 'A') &&
            (keyToPress == 1 || keyToPress == 4 || keyToPress == 7))
          ) ||
          (padType === 'directional' && (
            (pad.key === '^' || pad.key === 'A') &&
            (keyToPress === '<'))
          )
        ) {
          // must go vh
          down(currentPad, pad, keyToPress);
          up(currentPad, pad, keyToPress);
          left(currentPad, pad, keyToPress);
          right(currentPad, pad, keyToPress);
        } else {
          // ideal case of <v^>
          left(currentPad, pad, keyToPress);
          down(currentPad, pad, keyToPress);
          up(currentPad, pad, keyToPress);
          right(currentPad, pad, keyToPress);
        }
        pad.presses.push('A');
        pad.key = keyToPress;
      });
    })
    const complexity = task.pads[2].presses.length * parseInt(task.code.substring(0, 3))
    total += complexity;
    console.log(`code: ${task.code}`)
    console.log(`pad 0: ${task.pads[0].presses.length} ${task.pads[0].presses.join('')}`)
    console.log(`pad 1: ${task.pads[1].presses.length} ${task.pads[1].presses.join('')}`)
    console.log(`pad 2: ${task.pads[2].presses.length} ${task.pads[2].presses.join('')}`)
    console.log(`complexity: ${complexity}`)

    // debugSteps(task.code.split(''), task.pads[0].presses)
    // debugSteps(task.pads[0].presses, task.pads[1].presses)
    // debugSteps(task.pads[1].presses, task.pads[2].presses)
  })
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
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
