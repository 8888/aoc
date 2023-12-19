const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const rulesMap = {};
const parts = [];
let rulesParsed = false;

const parse = (line) => {
  if (!line) {
    rulesParsed = true;
    return;
  }
  if (!rulesParsed) {
    const ruleList = [];
    let [ruleName, rules] = line.match(/[a-z]+(?={)|(?!{).*(?=})/g);
    rules = rules.split(',')
    rules.forEach(rule => {
      if (rule.includes(':')) {
        const [cat, op, value, result] = rule.match(/[](?!:)[x|m|a|s]|[<|>]|[0-9]+|([a-zA-Z]+)/g);
        if (op === '<') {
          const ruleFunc = (part) => {
            if (part[cat] < value) {
              if (result === 'A' || result === 'R') {
                return {rule: null, result};
              } else {
                return {rule: result, result: null};
              }
            }
          };
          ruleList.push(ruleFunc)
        } else {
          const ruleFunc = (part) => {
            if (part[cat] > value) {
              if (result === 'A' || result === 'R') {
                return {rule: null, result};
              } else {
                return {rule: result, result: null};
              }
            }
          };
          ruleList.push(ruleFunc);
        }
      } else {
        const ruleFunc = (part) => {
          return {rule, result: null};
        };
        ruleList.push(ruleFunc);
      }
    });
    rulesMap[ruleName] = ruleList;
  } else {
    // handle parts
    const values = line.match(/[0-9]+/g);
    const part = {
      x: parseInt(values[0]),
      m: parseInt(values[1]),
      a: parseInt(values[2]),
      s: parseInt(values[3]),
    }
    parts.push(part);
  }
}

const doWork = () => {
  const accepted = [];
  parts.forEach(part => {
    let ruleName = 'in';
    let decision = false;
    while (!decision) {
      if (ruleName === 'A') {
        accepted.push(part);
        decision = true;
        break;
      } else if (ruleName === 'R') {
        decision = true;
        break;
      }

      const rules = rulesMap[ruleName];
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const output = rule(part);
        if (!output) {
          continue;
        } else if (output.result === 'A') {
          accepted.push(part);
          decision = true;
          break;
        } else if (output.result === 'R') {
          decision = true;
          break;
        } else {
          ruleName = output.rule;
          break;
        }
      }
    }
  });
  return countTotal(accepted);
}

const countTotal = (accepted) => {
  return accepted.reduce((acc, cur) => {
    return acc + cur.x + cur.m + cur.a + cur.s;
  }, 0);
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
