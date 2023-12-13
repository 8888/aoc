const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const cache = {}; // key is stringified springs and groups, value is itterations

const parse = (line) => {
  console.log(line)
  const [springsBase, groupString] = line.split(' ');
  const groupsBase = groupString.split(',').map(g => parseInt(g));

  let springs = springsBase;
  let groups = groupsBase;
  for (let i = 0; i < 5-1; i++) {
    springs = springs + '?' + springsBase;
    groups = [...groups, ...JSON.parse(JSON.stringify(groupsBase))];
  }
  return { springs, groups };
};

const doWork = (springs, groups) => {
  const key = JSON.stringify([ springs, groups ]);
  if (cache[key]) return cache[key];

  if (springs.length === 0) {
    // are we at the end of both
    if (groups.length === 0) {
      cache[key] = 1;
      return 1;
    } else {
      cache[key] = 0;
      return 0;
    }
  } else if (groups.length === 0) {
    // just at the end of groups?
    // make sure we dont have any more springs
    for (let i = 0; i < springs.length; i++) {
      if (springs[i] === '#') {
        cache[key] = 0;
        return 0;
      }
    }
    // didn't find any
    cache[key] = 1;
    return 1;
  } else if (springs.length < groups.reduce((acc, cur) => acc + cur, 0) + groups.length - 1) {
    // is the remaining line long enough for all of the groups?
    // make sure to include the spacing needed between groups
    cache[key] = 0;
    return 0;
  } else if (springs[0] === '#') {
    // on a spring, can we cover it with our groups?
    const group = groups[0];
    for (let i = 0; i < group; i++) {
      if (springs[i] === '.') {
        // found an empty spot too soon
        cache[key] = 0;
        return 0;
      }
    }
    // make sure the next spot is not a guranteed spring
    if (springs[group] === '#') {
      cache[key] = 0;
      return 0;
    }

    // continue counting the next springs
    const result = doWork(springs.slice(group + 1), groups.slice(1));
    cache[key] = result;
    return result;
  } else if (springs[0] === '?') {
    // check for both options of spring or no spring
    const withSpring = '#' + springs.slice(1);
    const withoutSpring = '.' + springs.slice(1);
    const result = doWork(withSpring, groups) + doWork(withoutSpring, groups);
    cache[key] = result;
    return result;
  } else {
    // must be a . so just keep moving
    const result = doWork(springs.slice(1), groups);
    cache[key] = result;
    return result;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('12.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      const { springs, groups } = parse(line);
      total += doWork(springs, groups);
    });

    await once(rl, 'close');

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
