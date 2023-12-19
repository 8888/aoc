const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const rulesMap = {};
let rulesParsed = false;

const parse = (line) => {
  if (!line || rulesParsed) {
    rulesParsed = true;
    return;
  }

  const ruleList = [];
  let [ruleName, rules] = line.match(/[a-z]+(?={)|(?!{).*(?=})/g);
  rules = rules.split(',')
  rules.forEach(rule => {
    if (rule.includes(':')) {
      const [cat, op, value, result] = rule.match(/[](?!:)[x|m|a|s]|[<|>]|[0-9]+|([a-zA-Z]+)/g);
      ruleList.push({cat, op, value: parseInt(value), result});
    } else {
      ruleList.push({result: rule});
    }
  });
  rulesMap[ruleName] = ruleList;
}

const doWork = () => {
  const accepted = [];
  const stack = [{
    range: { x: [1, 4001], m: [1, 4001], a: [1, 4001], s: [1, 4001] },
    ruleName: 'in',
    idx: 0,
  }];
  while (stack.length) {
    const {range, ruleName, idx} = stack.pop();
    if (ruleName === 'A') {
      accepted.push(range);
      continue;
    } else if (ruleName === 'R') {
      continue;
    }
    const rule = rulesMap[ruleName][idx];
    // is rule a catchall
    if (!rule.op) {
      if (rule.result === 'A') {
        accepted.push(range);
      } else if (rule.result === 'R') {
        continue;
      } else {
        // must point to a new rule
        stack.push({ range, ruleName: rule.result, idx: 0 });
      }
    } else {
      // work range through the rule
      let rangeHit = JSON.parse(JSON.stringify(range));
      let rangeMiss = JSON.parse(JSON.stringify(range));
      if (rule.op === '<') {
        rangeHit[rule.cat][1] = rule.value // min=min  max=value
        rangeMiss[rule.cat][0] = rule.value // min=value  max=max
        stack.push({range: rangeHit, ruleName: rule.result, idx: 0});
        if (idx + 1 <= rulesMap[ruleName].length - 1) {
          // is there another rule in this set
          stack.push({range: rangeMiss, ruleName, idx: idx + 1});
        }
      } else { // rule.op === '>'
        rangeHit[rule.cat][0] = rule.value + 1 // min=value+1 max=max
        rangeMiss[rule.cat][1] = rule.value + 1 // min=min max=value+1
        stack.push({range: rangeHit, ruleName: rule.result, idx: 0});
        if (idx + 1 <= rulesMap[ruleName].length - 1) {
          // is there another rule in this set
          stack.push({range: rangeMiss, ruleName, idx: idx + 1});
        }
      }
    }
  }

  return countTotal(accepted);
}

const countTotal = (accepted) => {
  // console.log(accepted.map(a => `x: (${a.x}), m: (${a.m}), a: (${a.a}), s: (${a.s})`))
  let total = 0;
  accepted.forEach(range => {
    total += (range.x[1] - range.x[0]) * (range.m[1] - range.m[0]) * (range.a[1] - range.a[0]) * (range.s[1] - range.s[0])
  });
  return total;
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('19.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    const total = doWork();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
