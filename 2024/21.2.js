const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '21.test.txt' };
const goal = { file: '21.txt' };
const game = goal;

let total = 0;
const tasks = [];
let goalSequence = [];

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
  const pads = [];
  for (let i = 0; i < 1; i++) {
    pads.push({key: 'A', presses: []});
  }
  tasks.push({code, pads});
}

const debugSteps = (code = [], presses = []) => {
  const match = [...presses.join('').matchAll(/[^A]*A/g)];
  console.log(`Same length of moves? ${code.length === match.length}`)
  code.forEach((keyToPress, i) => {
    console.log(`${i}) ${keyToPress} -- ${match[i][0]}`)
  })
}

const printAnalysis = (task, complexity) => {
  console.log(`code: ${task.code}`)
  for (let i = 0; i < task.pads.length; i++) {
    console.log(`pad ${i}: ${task.pads[i].presses.length} ${task.pads[i].presses.join('')}`)
  }
  console.log(`complexity: ${complexity}`)
}

const right = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].c < currentPad[keyToPress].c) {
    return Array(currentPad[keyToPress].c - currentPad[pad.key].c).fill('>');
  }
  return [];
}

const down = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].r < currentPad[keyToPress].r) {
    return Array(currentPad[keyToPress].r - currentPad[pad.key].r).fill('v');
  }
  return [];
}

const up = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].r > currentPad[keyToPress].r) {
    return Array(currentPad[pad.key].r - currentPad[keyToPress].r).fill('^');
  }
  return [];
}

const left = (currentPad, pad, keyToPress) => {
  if (currentPad[pad.key].c > currentPad[keyToPress].c) {
    return Array(currentPad[pad.key].c - currentPad[keyToPress].c).fill('<');
  }
  return [];
}

const calcPresses = (padType, pad, keyToPress, currentPad) => {
  // we are going from pad.key to keyToPress
  if (padType === 'directional') {
    const str = `${pad.key},${keyToPress}`;
  }

  const presses = [];
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
    presses.push(...left(currentPad, pad, keyToPress))
    presses.push(...right(currentPad, pad, keyToPress))
    presses.push(...down(currentPad, pad, keyToPress))
    presses.push(...up(currentPad, pad, keyToPress))
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
    presses.push(...down(currentPad, pad, keyToPress))
    presses.push(...up(currentPad, pad, keyToPress))
    presses.push(...left(currentPad, pad, keyToPress))
    presses.push(...right(currentPad, pad, keyToPress))
  } else {
    // ideal case of <v^>
    presses.push(...left(currentPad, pad, keyToPress))
    presses.push(...down(currentPad, pad, keyToPress))
    presses.push(...up(currentPad, pad, keyToPress))
    presses.push(...right(currentPad, pad, keyToPress))
  }
  presses.push('A');

  if (padType === 'directional') {
    const str = `${pad.key},${keyToPress}`;
  }

  return ({presses, keyToPress});

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
      const currentPad = padTypes[padType]; // current pad is the actual object of numerical or directional

      code.forEach(keyToPress => {
        const result = calcPresses(padType, pad, keyToPress, currentPad);
        pad.presses.push(...result.presses);
        pad.key = result.keyToPress;
      });
    })

    goalSequence = task.pads[0].presses;
    // reset variables and run gold
    goldPresses = 0;
    gold();
    const complexity = goldPresses * parseInt(task.code.substring(0, 3))
    total += complexity;
    // printAnalysis(task, complexity);

    // debugSteps(task.code.split(''), task.pads[0].presses)
    // debugSteps(task.pads[0].presses, task.pads[1].presses)
    // debugSteps(task.pads[1].presses, task.pads[2].presses)
  })
}

const moves = {
  // from,to
  'A,A': 'A',
  'A,^': '<A',
  'A,>': 'vA',
  'A,v': '<vA',
  'A,<': 'v<<A',
  '^,^': 'A',
  '^,A': '>A',
  '^,>': 'v>A',
  '^,v': 'vA',
  '^,<': 'v<A',
  '>,>': 'A',
  '>,^': '<^A',
  '>,A': '^A',
  '>,v': '<A',
  '>,<': '<<A',
  'v,v': 'A',
  'v,^': '^A',
  'v,A': '^>A',
  'v,>': '>A',
  'v,<': '<A',
  '<,<': 'A',
  '<,^': '>^A',
  '<,A': '>>^A',
  '<,>': '>>A',
  '<,v': '>A',
}
/*
    +---+---+
    | ^ | A |
+---+---+---+
| < | v | > |
+---+---+---+
*/

const gold = () => {
  console.log(`Goal sequence: ${goalSequence.join('')}`);
  const state = [];
  for (let i = 0; i < 25; i++) { // change to number of robots requireds
    state.push({loc: 'A'});
  }
  goalSequence.forEach(goal => {
    goldPresses += pressButton(goal, state)
  });
  console.log(`Gold presses: ${goldPresses}`)
}

let goldPresses = 0;
const memo = {}
const pressButton = (goal, state = []) => {
  // goal is the button we are targeting
  // state is our state array except sliced to just the relevant bots
  const stateStr = state.map(s => s.loc).join(',');
  const memoStr = `${goal},${stateStr}`;

  if (state.length === 0) {
    return 1;
  } else if (memo[memoStr]) {
    state[0].loc = goal;
    return memo[memoStr];
  } else {
    const currentMoveRequired = `${state[0].loc},${goal}`
    const nextBotMove = moves[currentMoveRequired];
    let tempPresses = 0;
    for (let i = 0; i < nextBotMove.length; i++) {
      tempPresses += pressButton(nextBotMove[i], state.slice(1));
    }
    state[0].loc = goal;
    memo[memoStr] = tempPresses;
    return tempPresses;
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

    const startTime = performance.now()
    doWork();
    const endTime = performance.now()
    console.log(`Run time: ${endTime - startTime}`);
    console.log(`Total complexity: ${total}`);

  } catch (err) {
    console.error(err);
  }
})();



/*
+---+---+---+
| 7 | 8 | 9 |
+---+---+---+
| 4 | 5 | 6 |
+---+---+---+      +---+---+
| 1 | 2 | 3 |      | ^ | A |
+---+---+---+  +---+---+---+
    | 0 | A |  | < | v | > |
    +---+---+  +---+---+---+

code: 0
pad 0: 2 <A
pad 1: 8 v<<A>>^A
pad 2: 18 <vA<AA>>^AvAA<^A>A

Pairs of movements, (start,finish)
To get: <A from above
We have (A,<) & (<,A)
Move from implicit A to <, then from < to A
Pair (A,<) requires v<<A
Pair (<,A) requires >>^A
So <A will output v<<A>>^A

Run the numeric through the system to get the required directional
We are overflowing the arrays so we cant complete full levels
Maybe we can count presses in smallest chunks, and only work on the level that we just wrote out

Maybe instead of getting all moves necessary we have a state object that holds where all robots are
Then we just calculate what "my" next manual button press is, increment counter, and take that action to the state

code: 029A
pad 0: 12 <A^A^^>AvvvA
pad 1: 28 v<<A>>^A<A>A<AAv>A^A<vAAA^>A
pad 2: 68 <vA<AA>>^AvAA<^A>Av<<A>>^AvA^Av<<A>>^AA<vA>A^A<A>Av<<A>A^>AAA<Av>A^A

so we have a numeric key pad, to enter 029A
2 robo key pads (pads 0 & 1)
1 key pad that I am pressing manually

The question here is how many presses do I need to make on my pad to have the first robo pad type in:

goal: <A^A^^>AvvvA

state = [a, a] (just the robo pads)
step 1, bot 0 needs to move (a,<)
  (a,<) is v<<A, buabout the first move
    I click <
      new state = [a, ^]
step 2, bot 0 needs to move (a,<) still
  (a,<) is v<<A, but we only care about the first move to set the new state
  bot 1 neesd to move (^,v)
      (^,v) is vA, but we only care about the first move to set the new state
      I click v
      bot 1 moves v
        new state = [a, v]
step 3, bot 0 needs to move (a,<) still
  (a,<) is v<<A, but we only care about the first move to set the new state
  bot 1 needs to move (v,v), we are at the destination
    I click A
    bot 1 clicks v
    bot 0 moves v
      new state = [>, v]
step 4, bot 0 needs to move (>, <)
  (>, <) is <<A, but we only care about the first move to set the new state
  bot 1 needs to move (v, <)
    (v, <) is <
    I click <
    bot 1 moves <
      new state = [>, <]
step 5, bot 0 needs to move (>, <)
  (>, <) is <<A, but we only care about the first move to set the new state
  bot 1 needs to move(<, <), we are at the destination
    I click A
    bot 1 clicks <
    bot 0 moves <
      new state = [v, <]
step 6, bot 0 needs to move (v, <)
  (v, <) is <A
  bot 1 needs to move (<, <), we are there
    I click A
    bot 1 clicks <
    bot 0 moves <
      new state = [<, <]
step 7, bot 0 needs to move (<, <), we are there
  bot 1 needs to click A, so t we only care about the first move to set the new state
  bot 1 neesd to move (a,v)
    (a,v) is <vA, but we only care move (<, A)
    (<, A) is >>^
    I click >
    bot 1 moves >
      new state = [<, v]

      +---+---+
      | ^ | A |
  +---+---+---+
  | < | v | > |
  +---+---+---+
Always try to fo LDUR <v^> unless we hit the blank space
moves = {
  'A,A': 'A',
  'A,^': '<',
  'A,>': 'v',
  'A,v': '<v',
  'A,<': 'v<<<',
  '^,^': 'A',
  '^,A': '>',
  '^,>': 'v>',
  '^,v': 'v',
  '^,<': 'v<',
  '>,>': 'A',
  '>,^': '<^',
  '>,A': '^',
  '>,v': '<',
  '>,<': '<<',
  'v,v': 'A',
  'v,^': '^',
  'v,A': '^>',
  'v,>': '>',
  'v,<': '<',
  '<,<': 'A',
  '<,^': '>^',
  '<,A': '>>^',
  '<,>': '>>',
  '<,v': '>',
}

*/
