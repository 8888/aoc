const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let cardNumber = 0;
let cards = {}; // {card number: number of cards won of this type}

const doWork = (line) => {
  // add cards to total
  cardNumber++;
  total = cards[cardNumber] ? total + 1 + cards[cardNumber] : total + 1;

  // parse card
  const card = line.replace(/Card +[0-9]+: /, '');
  const numbers = card.split('|');
  const winners = numbers[0].match(/[0-9]+/g);
  const yourNumbers = numbers[1].match(/[0-9]+/g);

  // create map of winners
  const map = {};
  winners.forEach(n => {
    map[n] = true;
  });

  // check for matches
  let score = 0;
  yourNumbers.forEach(n => {
    if (map[n]) score++;
  });

  // track won cards
  const cardsPlayed = cards[cardNumber] ? cards[cardNumber] + 1 : 1;
  for (let i = 1; i <= score; i++) {
    cards[cardNumber + i] ? cards[cardNumber + i] += cardsPlayed : cards[cardNumber + i] = cardsPlayed;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('4.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
