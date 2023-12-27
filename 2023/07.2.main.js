const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const cardRanks = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'T': 11,
  '9': 10,
  '8': 9,
  '7': 8,
  '6': 7,
  '5': 6,
  '4': 5,
  '3': 4,
  '2': 3,
  'J': 2,
};

const hands = [];
/*
hand = { cards: [], counts: {}, j: 0, value: 1, bid: 1 }
value:
  five of a kind = 7
  ...
  high card = 1
*/

const parseCards = (line) => {
  console.log(line)
  const inputs = line.split(' ');
  const hand = {
    cards: inputs[0],
    bid: parseInt(inputs[1]),
    counts: {},
    j: 0,
    value: 1,
  };

  for (let i = 0; i < hand.cards.length; i++) {
    const card = hand.cards[i];
    if (card === 'J') {
      hand.j++;
    } else {
      hand.counts[card] = hand.counts[card] ? hand.counts[card] + 1 : 1;
    }
  }

  for (const [card, count] of Object.entries(hand.counts)) {
    if (count === 1) {
      continue;
    } else if (count === 2) {
      if (hand.value === 1 || hand.value === 2 || hand.value === 4) {
        hand.value++;
      }
    } else if (count === 3) {
      if (hand.value === 1 || hand.value === 2) {
        hand.value += 3;
      }
    } else if (count === 4) {
      hand.value = 6;
    } else if (count === 5) {
      hand.value = 7;
    }
  }

  if (hand.j) {
    if (hand.j === 1) {
      switch (hand.value) {
        case 1:
          hand.value = 2;
          break;
        case 2:
          hand.value = 4;
          break;
        case 3:
          hand.value = 5;
          break;
        case 4:
          hand.value = 6;
          break;
        case 6:
          hand.value = 7;
          break;
      }
    } else if (hand.j === 2) {
      switch (hand.value) {
        case 1:
          hand.value = 4;
          break;
        case 2:
          hand.value = 6;
          break;
        case 4:
          hand.value = 7;
          break;
      }
    } else if (hand.j === 3) {
      switch (hand.value) {
        case 1:
          hand.value = 6;
          break;
        case 2:
          hand.value = 7;
          break;
      }
    } else if (hand.j >= 4) {
      hand.value = 7;
    }
  }

  hands.push(hand);
}

const sortHands = () => {
  // start with sorting full hand at end instead of sorted insertion
  hands.sort((a, b) => {
    if (a.value === b.value) {
      // find highest card
      for (let i = 0; i < a.cards.length; i++) {
        if (a.cards[i] === b.cards[i]) continue;
        return cardRanks[a.cards[i]] - cardRanks[b.cards[i]];
      }
      return 0;
    } else {
      return a.value - b.value;
    }
  });
}

const calculateTotal = () => {
  hands.forEach((hand, i) => {
    total += hand.bid * (i + 1);
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('7.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parseCards(line);
    });

    await once(rl, 'close');

    sortHands();
    calculateTotal();
    console.log(hands);
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
