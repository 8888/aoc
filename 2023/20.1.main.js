const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = {0: 0, 1: 0};
const circuit = {};
// used to assign outputs of conjunctions
const conjunctions = [];
const subscriptions = {}; // key: circuit name, value: array of circuits that send signals to it

class FlipFlop {
  constructor(outputs) {
    this.state = 0;
    this.outputs = outputs;
  }

  call(signal, _) {
    if (signal === 0) {
      this.state = this.state === 0 ? 1 : 0;
      return this.outputs.map(output => [this.state, output]);
    } else {
      return [];
    }
  }
}

class Conjunction {
  constructor(outputs) {
    this.state = {};
    this.outputs = outputs;
  }

  assignInputs(inputs) {
    inputs.forEach(input => this.state[input] = 0);
  }

  call(signal, input) {
    this.state[input] = signal;
    if (Object.values(this.state).every(value => value === 1)) {
      return this.outputs.map(output => [0, output]);
    } else {
      return this.outputs.map(output => [1, output]);
    }
  }
}

class Broadcaster {
  constructor(outputs) {
    this.outputs = outputs;
  }

  call(signal, _) {
    return this.outputs.map(output => [signal, output]);
  }
}

const parse = (line) => {
  console.log(line);
  const [name, dest] = line.split(' -> ');
  const outputs = dest.match(/[a-z]+/g);
  if (name === 'broadcaster') {
    circuit[name.substring(1)] = new Broadcaster(outputs);
  } else if (name[0] === '%') {
    circuit[name.substring(1)] = new FlipFlop(outputs);
  } else {
    circuit[name.substring(1)] = new Conjunction(outputs);
    conjunctions.push(name.substring(1));
  }
  outputs.forEach(output => {
    if (subscriptions[output]) {
      subscriptions[output].push(name.substring(1));
    } else {
      subscriptions[output] = [name.substring(1)];
    }
  });
}

const assignConjunctionInputs = () => {
  conjunctions.forEach(conjunction => {
    const inputs = subscriptions[conjunction];
    circuit[conjunction].assignInputs(inputs);
  });
}

const pressButton = () => {
  const queue = [{signal: 0, origin: 'button', dest: 'roadcaster'}];
  while (queue.length) {
    const {signal, origin, dest} = queue.shift();
    console.log(`${origin} --${signal}-> ${dest}`);
    total[signal]++;
    if (circuit[dest]) {
      const outputs = circuit[dest].call(signal, origin);
      if (outputs.length) {
        outputs.forEach(output => queue.push({signal: output[0], origin: dest, dest: output[1]}));
      }
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('20.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');
    assignConjunctionInputs();
    for (let i = 0; i < 1000; i++) {
      pressButton();
    }
    console.log(total)
    console.log(total[0] * total[1]);

  } catch (err) {
    console.error(err);
  }
})();
