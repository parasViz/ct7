window.CT7_MODULES = [
  {
    "id": "large-numbers",
    "shortTitle": "Large Numbers",
    "title": "Large Numbers Around Us",
    "skill": "place value and constraints",
    "theme": "teal",
    "visual": "numberline",
    "intro": "Large-number puzzles become easier when you separate place value, digit counts, repeated digits, and hidden constraints before trying options.",
    "lessons": [
      {
        "title": "Digit Counts",
        "text": "A number can be described by how many times each digit appears. Count first, arrange later."
      },
      {
        "title": "Place Value Bundles",
        "text": "Tens, hundreds, thousands, lakhs, and ten lakhs can be added like building blocks."
      },
      {
        "title": "Constraint Filtering",
        "text": "Clues such as descending order, repeated digits, or missing positions remove impossible answers."
      }
    ],
    "activity": {
      "title": "Password From Clues",
      "prompt": "Read each clue as a filter. Keep a small candidate list instead of guessing the whole number.",
      "chips": [
        {
          "title": "Digit count",
          "text": "If one digit appears three times, mark those three positions before arranging the rest."
        },
        {
          "title": "Place value",
          "text": "31 thousands and 42 hundreds must be converted before combining the number."
        },
        {
          "title": "Largest number",
          "text": "Put the largest allowed digit as far left as the constraints permit."
        },
        {
          "title": "Check range",
          "text": "A six-digit answer between two lakhs and eight lakhs must begin with 2, 3, 4, 5, 6, or 7."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Decomposition turns a long clue paragraph into smaller tests."
      },
      {
        "title": "Math link",
        "text": "Place value and digit properties decide which arrangements are valid."
      }
    ],
    "quiz": [
      {
        "text": "A six-digit number uses digit 8 once, digit 7 twice, and digit 6 three times. What is the largest possible number?",
        "options": [
          "876766",
          "877666",
          "887666",
          "877766"
        ],
        "answer": 1,
        "clue": "Arrange the largest available digits from left to right while keeping the required counts.",
        "visual": {
          "type": "digitBuild",
          "title": "Put the digit cards",
          "instruction": "Put the digit cards into the place-value boxes.",
          "digits": [
            { "digit": "8", "count": 1 },
            { "digit": "7", "count": 2 },
            { "digit": "6", "count": 3 }
          ],
          "places": ["Lakhs", "Ten-thousands", "Thousands", "Hundreds", "Tens", "Ones"],
          "correctOrder": ["8", "7", "7", "6", "6", "6"],
          "hint": "Use the cards from the bottom row. Each box turns green or red after you drop a card."
        }
      },
      {
        "text": "What number is represented by 3 lakhs, 45 thousands, 27 hundreds, 8 tens, and 9 ones?",
        "options": [
          "345789",
          "347789",
          "374789",
          "347098"
        ],
        "answer": 1,
        "clue": "Add 300000 + 45000 + 2700 + 80 + 9."
      },
      {
        "text": "A six-digit number has odd digits in all places except the units place, where it has an even digit. What is the digit sum of the largest such number?",
        "options": [
          "52",
          "53",
          "54",
          "55"
        ],
        "answer": 1,
        "clue": "The largest number is 999998."
      },
      {
        "text": "A special digital safe uses a 4×4 grid of buttons containing the first 16 prime numbers arranged randomly. A hacker overrides the system by multiplying all the numbers on the keypad together. What is the units digit of the final product?",
        "image": {
          "src": "assets/prime-safe-keypad.svg",
          "alt": "A digital safe keypad with a 4 by 4 grid showing the first 16 prime numbers."
        },
        "options": [
          "0",
          "2",
          "5",
          "8"
        ],
        "answer": 0,
        "clue": "The primes include 2 and 5, so the full product is a multiple of 10."
      },
      {
        "text": "A computer encryption program removes the given pattern from the plaintext, then prints one 0 for each character left. What code should replace the question mark?",
        "table": {
          "columns": ["Plaintext", "Remove", "Security code"],
          "rows": [
            ["Trillion", "ion", "00000"],
            ["Billion", "lion", "000"],
            ["Thousand", "sand", "0000"],
            ["Quintillion", "Q", "0000000000"],
            ["Million", "mil", "?"]
          ]
        },
        "options": [
          "0",
          "00",
          "0000",
          "00000"
        ],
        "answer": 2,
        "clue": "Remove mil from Million. The remaining word lion has 4 letters, so the code has four zeros."
      },
      {
        "text": "Five cards show 10, 100, 1000, 10000, and 100000. C has 4 zeros, A has 2 fewer zeros than C, D has 1 more zero than C, and B has more zeros than A but fewer than C. Which card is left for E?",
        "options": [
          "10",
          "100",
          "1000",
          "10000"
        ],
        "answer": 0,
        "clue": "C is 10000, A is 100, D is 100000, and B is 1000."
      },
      {
        "text": "Both universes go on forever. Which infinity is bigger?",
        "brief": {
          "title": "Infinity comparison",
          "items": [
            {
              "label": "Universe 1",
              "value": "Counting numbers",
              "detail": "1, 2, 3, 4, ..."
            },
            {
              "label": "Universe 2",
              "value": "Counting numbers and decimals",
              "detail": "1.1, 1.01, 2.5, ..."
            }
          ],
          "note": "Both continue forever. Compare how densely the numbers are packed."
        },
        "optionsLayout": "stacked",
        "options": [
          "Universe 1: whole numbers grow faster.",
          "Both are equal: infinity is just infinity.",
          "Universe 2: decimals are packed between whole numbers.",
          "Universe 1: decimals are only parts of numbers."
        ],
        "answer": 2,
        "clue": "Between any two whole numbers there are infinitely many decimals, so Universe 2 is a denser infinity."
      },
      {
        "text": "Now imagine two different infinite math universes. Which infinity is bigger?",
        "brief": {
          "title": "Two infinite universes",
          "items": [
            {
              "label": "Universe 1",
              "value": "Whole-Number Universe",
              "detail": "Regular counting numbers: 1, 2, 3, 4, 5, ..."
            },
            {
              "label": "Universe 2",
              "value": "Decimal Universe",
              "detail": "Contains books labeled with every single decimal stuck just between 0 and 1."
            }
          ],
          "note": "Both go on forever. Look at how many numbers fit between whole-number steps."
        },
        "optionsLayout": "stacked",
        "options": [
          "Universe 1: counting numbers are enough to match every decimal.",
          "Both are equal: any two infinities always have the same size.",
          "Universe 2: it has every decimal between 0 and 1.",
          "Universe 1: decimals are only smaller pieces of whole numbers."
        ],
        "answer": 2,
        "clue": "There are infinitely many decimals packed between 0 and 1."
      },
      {
        "text": "Using digits 0, 2, 4, 7, and 9 once, what is the smallest odd number greater than 90000?",
        "options": [
          "90247",
          "90427",
          "90742",
          "92047"
        ],
        "answer": 0,
        "clue": "Start with 9, keep the next digits as small as possible, and put an odd digit at the units place."
      },
      {
        "text": "A number has digits 9, 9, 8, 8, 8, and 7. If 2 lakhs are added to it, the result is still six digits. What is the largest possible original number?",
        "options": [
          "998887",
          "899887",
          "799888",
          "788999"
        ],
        "answer": 2,
        "clue": "The original number must be at most 799999, so it should start with 7 and then use the largest remaining arrangement."
      }
    ]
  },
  {
    "id": "arithmetic-expressions",
    "shortTitle": "Arithmetic Expressions",
    "title": "Arithmetic Expressions",
    "skill": "operators and order",
    "theme": "yellow",
    "visual": "data",
    "intro": "Arithmetic expression puzzles ask you to follow operations exactly, test swaps, compare values, and work backward from a result.",
    "lessons": [
      {
        "title": "Order Matters",
        "text": "Multiplication and division are handled before addition and subtraction unless brackets change the order."
      },
      {
        "title": "Operator Swaps",
        "text": "Interchanging two operators can completely change a value. Re-evaluate after every swap."
      },
      {
        "title": "Work Backward",
        "text": "Passenger, seminar, and machine questions often reveal the starting value by reversing the operations."
      }
    ],
    "activity": {
      "title": "Expression Debugger",
      "prompt": "Treat every operator as an instruction. Change one instruction at a time and compare the output.",
      "chips": [
        {
          "title": "Precedence",
          "text": "In 18 + 6 x 3 - 4, do 6 x 3 first."
        },
        {
          "title": "Swap",
          "text": "Swapping + and x means every old + becomes x and every old x becomes +."
        },
        {
          "title": "Inequality",
          "text": "Test each possible operator and reject the one that breaks the condition."
        },
        {
          "title": "Reverse",
          "text": "If half the bus is occupied at the end, double that count before undoing earlier stops."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Algorithmic thinking means applying operations in a precise order."
      },
      {
        "title": "Math link",
        "text": "Expressions, equations, and inequalities all depend on valid operations."
      }
    ],
    "quiz": [
      {
        "text": "A positive number is multiplied by a factor k. How does k decide whether the number grows, stays the same, or shrinks?",
        "brief": {
          "title": "Multiplier lab",
          "items": [
            {
              "label": "Start",
              "value": "Positive number",
              "detail": "Use any value greater than 0."
            },
            {
              "label": "Action",
              "value": "Multiply by k",
              "detail": "Try different values of k."
            },
            {
              "label": "Check",
              "value": "Compare final value",
              "detail": "Is it bigger, same, or smaller?"
            }
          ],
          "note": "Test the options with simple values of k, such as 2, 1, and 1/2."
        },
        "optionsLayout": "stacked",
        "options": [
          "It always gets bigger, no matter what k is.",
          "It gets bigger if k > 1, stays the same if k = 1, and gets smaller if 0 < k < 1.",
          "It gets smaller if k > 1, and gets bigger if 0 < k < 1.",
          "It only gets bigger when k is a whole number."
        ],
        "answer": 1,
        "clue": "Multiplying by more than 1 increases a positive number. Multiplying by 1 keeps it the same. Multiplying by a positive factor less than 1 makes it smaller."
      },
      {
        "text": "In 5 + 4 x 3, interchange + and x. What is NEW value minus ORIGINAL value?",
        "options": [
          "4",
          "5",
          "6",
          "8"
        ],
        "answer": 2,
        "clue": "Original is 17. New expression is 5 x 4 + 3."
      },
      {
        "text": "In the expression below, which operator CANNOT replace @ if the inequality must remain true?",
        "brief": {
          "title": "Inequality trap",
          "items": [
            {
              "label": "Expression",
              "value": "8 @ 7 - 15 < 4 x 2 x 5",
              "detail": "Only one option breaks the condition."
            },
            {
              "label": "Right side",
              "value": "40",
              "detail": "Calculate 4 x 2 x 5 first."
            },
            {
              "label": "CT move",
              "value": "Eliminate",
              "detail": "Keep the operators that make the statement true."
            }
          ],
          "note": "Try each operator in the same expression. The answer is the one that makes the inequality false."
        },
        "options": [
          "-",
          "/",
          "+",
          "x"
        ],
        "answer": 3,
        "clue": "With x, the left side is 8 x 7 - 15 = 41, and 41 < 40 is false."
      },
      {
        "text": "A 40-seat bus finishes with exactly half its seats occupied. Which expression gives the number of passengers at the beginning?",
        "brief": {
          "title": "Reverse the bus story",
          "items": [
            {
              "label": "Stop 1",
              "value": "-5, +8",
              "detail": "5 get off and 8 get in."
            },
            {
              "label": "Stop 2",
              "value": "-2, +4",
              "detail": "2 get off and 4 get in."
            },
            {
              "label": "Stop 3",
              "value": "Half leave",
              "detail": "Then 20 passengers remain."
            }
          ],
          "note": "Work backward from 20 passengers after the third stop."
        },
        "options": [
          "5 x 5 + 5",
          "6 x 6 - 4",
          "5 x 5 + 10",
          "6 x 6 - 5"
        ],
        "answer": 2,
        "clue": "Before half left there were 40 passengers. Before the first two stops, there were 40 - 5 = 35 passengers."
      },
      {
        "text": "A bus starts with n passengers. Then 6 get in, 3 get off, and 9 get in. Finally, half of the passengers leave, leaving 21. What was n?",
        "options": [
          "24",
          "28",
          "30",
          "36"
        ],
        "answer": 2,
        "clue": "Before half left there were 42 passengers, so n + 12 = 42."
      },
      {
        "text": "A three-slot machine must finish at 96. Each empty slot can be either x4 or -12. What is the least possible whole-number input n?",
        "brief": {
          "title": "Operation slots",
          "items": [
            {
              "label": "Start",
              "value": "n",
              "detail": "n must be a whole number."
            },
            {
              "label": "Each slot",
              "value": "x4 or -12",
              "detail": "Choose one operation per slot."
            },
            {
              "label": "Target",
              "value": "96",
              "detail": "Find the smallest input that can reach it."
            }
          ],
          "note": "Think like an algorithm: choose a sequence of three operations, then test the input."
        },
        "options": [
          "9",
          "18",
          "4",
          "72"
        ],
        "answer": 0,
        "clue": "The sequence x4, -12, x4 works: 9 becomes 36, then 24, then 96."
      },
      {
        "text": "A code follows n -> n squared + 1. If 2 becomes 5 and 4 becomes 17, what does 6 become?",
        "options": [
          "35",
          "36",
          "37",
          "49"
        ],
        "answer": 2,
        "clue": "6 squared is 36, then add 1."
      },
      {
        "text": "You may interchange exactly one pair of operators in the expression. Which swap gives the minimum value?",
        "brief": {
          "title": "Operator swap challenge",
          "items": [
            {
              "label": "Original",
              "value": "8 x 4 + 2 - 1",
              "detail": "Swap one pair of operators, or choose no change."
            },
            {
              "label": "Goal",
              "value": "Minimum value",
              "detail": "Calculate each possible result carefully."
            },
            {
              "label": "CT move",
              "value": "Compare cases",
              "detail": "Do not stop at the first smaller value."
            }
          ],
          "note": "After a swap, use normal order of operations."
        },
        "options": [
          "x and +",
          "+ and -",
          "- and x",
          "No change"
        ],
        "answer": 2,
        "clue": "Swapping - and x gives 8 - 4 + 2 x 1 = 6, which is the smallest option."
      },
      {
        "text": "Using + and x exactly once, which expression gives the maximum value?",
        "options": [
          "7 + 2 x 5",
          "7 x 2 + 5",
          "2 + 5 x 7",
          "5 + 7 x 2"
        ],
        "answer": 2,
        "clue": "Multiplying 5 by 7 gives the largest product before adding 2."
      },
      {
        "text": "Each arrow carries an operator. If an arrow is chosen, its operator replaces @ in that arrow's equation. Which arrow makes a true equation?",
        "image": {
          "src": "assets/operator-arrow-puzzle.svg",
          "alt": "Four arrows labeled P, Q, R, and S point to a centre operator box. Each arrow has its own operator and equation to test."
        },
        "options": [
          "Arrow P",
          "Arrow Q",
          "Arrow R",
          "Arrow S"
        ],
        "answer": 1,
        "clue": "Arrow Q uses division: 24 / 6 = 4, so its equation is true."
      }
    ]
  },
  {
    "id": "decimals-binary",
    "shortTitle": "Beyond the Point",
    "title": "A Peek Beyond the Point",
    "skill": "decimals and binary",
    "theme": "blue",
    "visual": "data",
    "hideActivity": true,
    "intro": "Decimals and binary both use place value. One uses powers of ten; the other uses powers of two and only the digits 0 and 1.",
    "extraPages": [
      {
        "type": "binaryFingers",
        "kicker": "Did you know?",
        "title": "Binary Finger Counting",
        "buttonLabel": "Open binary counting",
        "prompt": "Did you know you can count way past 10 using just your ten fingers? If you know the binary number system, what is the highest number you can reach?",
        "answer": "1023",
        "explanation": "Each finger can be down or up, like a binary bit. Ten fingers give 2^10 possible patterns, so the highest count is 2^10 - 1 = 1023.",
        "referenceImage": {
          "src": "assets/binary-finger-reference.gif",
          "alt": "Finger counting patterns labeled from 0 to 31",
          "caption": "First 32 numbers possible with one hand: 0 to 31"
        }
      }
    ],
    "video": {
      "title": "A Peek Beyond the Point",
      "url": "https://www.youtube.com/embed/F3DagixkqsQ"
    },
    "lessons": [
      {
        "title": "Decimal Shifts",
        "text": "Moving a decimal point one place right multiplies the value by 10."
      },
      {
        "title": "Binary Place Value",
        "text": "Binary places are 1, 2, 4, 8, 16, and so on."
      },
      {
        "title": "Punched Cards",
        "text": "A 0 or 1 can be represented as two hole types, giving a physical model of binary decisions."
      }
    ],
    "activity": {
      "title": "Binary Card Sort",
      "prompt": "Convert the number, then map each binary digit to a hole shape.",
      "chips": [
        {
          "title": "13",
          "text": "13 = 8 + 4 + 1, so its binary form is 1101."
        },
        {
          "title": "Five holes",
          "text": "Five binary positions can represent 2 x 2 x 2 x 2 x 2 = 32 cards."
        },
        {
          "title": "Decimal shift",
          "text": "4.7 becomes 47 when the decimal point moves one place right."
        },
        {
          "title": "Number line",
          "text": "Tenths split the interval from 0 to 1 into ten equal jumps."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Representation changes the form of data without changing the idea it carries."
      },
      {
        "title": "Math link",
        "text": "Powers of 10 and powers of 2 are both place-value systems."
      }
    ],
    "quiz": [
      {
        "text": "What is the binary representation of decimal 13?",
        "options": [
          "1011",
          "1101",
          "1110",
          "1001"
        ],
        "answer": 1,
        "clue": "13 = 8 + 4 + 1.",
        "visual": {
          "type": "binaryPlace",
          "title": "Build 13 from place values",
          "instruction": "Tap each place to switch its bit on or off. The total updates live.",
          "places": [16, 8, 4, 2, 1],
          "target": 13,
          "hint": "Pick the smallest set of places that sum to 13."
        }
      },
      {
        "text": "What decimal number is represented by binary 10110?",
        "options": [
          "20",
          "21",
          "22",
          "24"
        ],
        "answer": 2,
        "clue": "Use 16 + 4 + 2.",
        "visual": {
          "type": "binaryPlace",
          "title": "Read the binary as a sum",
          "instruction": "The bits 1 0 1 1 0 are already set. Read off the lit place values and add them.",
          "places": [16, 8, 4, 2, 1],
          "initialBits": [1, 0, 1, 1, 0],
          "hint": "Only the places under a 1 count. Add those values."
        }
      },
      {
        "text": "How many different cards can be represented using 5 binary holes?",
        "options": [
          "10",
          "16",
          "25",
          "32"
        ],
        "answer": 3,
        "clue": "Each hole has 2 choices, so calculate 2 to the power 5.",
        "visual": {
          "type": "doublingTree",
          "title": "Each hole doubles the choices",
          "instruction": "Watch how the count doubles for every hole added.",
          "base": 2,
          "exponent": 5,
          "labels": ["1 hole", "2 holes", "3 holes", "4 holes", "5 holes"],
          "hint": "2 × 2 × 2 × 2 × 2 — keep doubling five times."
        }
      },
      {
        "text": "If 0 is an O-shaped hole and 1 is a U-shaped hole, what pattern represents 01101?",
        "options": [
          "O U U O U",
          "U O O U O",
          "O U O U U",
          "U U O O U"
        ],
        "answer": 0,
        "clue": "Translate each binary digit in order.",
        "visual": {
          "type": "binaryHoles",
          "title": "Translate each digit",
          "instruction": "0 punches an O hole. 1 punches a U hole. Read left to right.",
          "binary": "01101",
          "mapping": { "0": "O", "1": "U" },
          "hint": "Tap any digit to see its hole shape highlighted."
        }
      },
      {
        "text": "Moving the decimal point in 4.7 one place to the right gives 47. By how much did the value increase?",
        "options": [
          "4.23",
          "42.3",
          "43.7",
          "47"
        ],
        "answer": 1,
        "clue": "Subtract 4.7 from 47.",
        "visual": {
          "type": "decimalShift",
          "title": "Slide the decimal point",
          "instruction": "Drag or tap the arrows to slide the decimal point.",
          "value": "4.7",
          "direction": "right",
          "places": 1,
          "hint": "Each right shift multiplies by 10. Then subtract the original."
        }
      },
      {
        "text": "What comes next: 6.25, 6.75, 7.25, 7.75, ?",
        "options": [
          "8.00",
          "8.15",
          "8.25",
          "8.75"
        ],
        "answer": 2,
        "clue": "The pattern increases by 0.50 each time.",
        "visual": {
          "type": "numberLine",
          "title": "Steady jumps of 0.50",
          "instruction": "Drag the marker to find the next jump.",
          "start": 6,
          "end": 9,
          "step": 0.25,
          "marks": [6.25, 6.75, 7.25, 7.75],
          "target": 8.25,
          "hint": "Each marker is +0.50 from the previous."
        }
      },
      {
        "text": "The interval from 0 to 1 is divided into 10 equal parts. What value is at the 7th mark to the right of 0?",
        "options": [
          "0.07",
          "0.7",
          "7.0",
          "0.17"
        ],
        "answer": 1,
        "clue": "Each mark is one tenth.",
        "visual": {
          "type": "numberLine",
          "title": "Tenths between 0 and 1",
          "instruction": "Drag the marker to the 7th tick.",
          "start": 0,
          "end": 1,
          "step": 0.1,
          "marks": [],
          "target": 0.7,
          "hint": "Each tick is +0.1. Count seven of them."
        }
      },
      {
        "text": "A sensor should show 3.2 m. Two faulty sensors show 32 m and 0.32 m. What change caused those faulty readings?",
        "options": [
          "adding 10",
          "moving the decimal point",
          "rounding to 3",
          "changing metres to grams"
        ],
        "answer": 1,
        "clue": "The faulty values are 10 times greater and 10 times smaller.",
        "visual": {
          "type": "decimalShift",
          "title": "Faulty shifts of 3.2",
          "instruction": "Slide the decimal to see how 3.2 turns into 32 or 0.32.",
          "value": "3.2",
          "direction": "either",
          "places": 1,
          "hint": "Right shift → ×10. Left shift → ÷10."
        }
      },
      {
        "text": "Which number uses digits 0, 1, 2, 3 once, has digits before the decimal in descending order, digits after it in ascending order, and equal digit sums on both sides?",
        "options": [
          "30.12",
          "31.02",
          "32.01",
          "21.30"
        ],
        "answer": 0,
        "clue": "3 + 0 equals 1 + 2.",
        "visual": {
          "type": "digitBalance",
          "title": "Match the digit sums",
          "instruction": "Each side must total the same. Tap a split to compare.",
          "splits": [
            { "label": "30.12", "left": [3, 0], "right": [1, 2] },
            { "label": "31.02", "left": [3, 1], "right": [0, 2] },
            { "label": "32.01", "left": [3, 2], "right": [0, 1] },
            { "label": "21.30", "left": [2, 1], "right": [3, 0] }
          ],
          "rules": ["Left side descending", "Right side ascending", "Equal digit sums"],
          "hint": "Only one option has matching sums AND the order rules."
        }
      },
      {
        "text": "Using one hand as five binary fingers, which finger pattern represents 19?",
        "optionsLayout": "hand-grid",
        "options": [
          "Pattern A",
          "Pattern B",
          "Pattern C",
          "Pattern D"
        ],
        "optionVisuals": [
          { "type": "binaryHand", "bits": [1, 0, 0, 1, 1] },
          { "type": "binaryHand", "bits": [1, 0, 1, 0, 1] },
          { "type": "binaryHand", "bits": [0, 1, 1, 1, 1] },
          { "type": "binaryHand", "bits": [1, 1, 0, 0, 1] }
        ],
        "answer": 0,
        "answerText": "Pattern A: 16 + 2 + 1",
        "clue": "Read the finger labels as 16, 8, 4, 2, and 1. Add only the raised fingers.",
        "visual": {
          "type": "binaryPlace",
          "title": "Raise the fingers for 19",
          "instruction": "Think of one hand as five binary places: 16, 8, 4, 2, and 1. Which fingers should be up?",
          "places": [16, 8, 4, 2, 1],
          "target": 19,
          "hint": "Start with the 16 finger, then use the smaller fingers to make the remaining 3."
        }
      }
    ]
  },
  {
    "id": "letter-numbers",
    "shortTitle": "Letter-Numbers",
    "title": "Expressions using Letter-Numbers",
    "skill": "variables and symbolic rules",
    "theme": "teal",
    "visual": "data",
    "intro": "Letters can stand for numbers, relationships, or operations. Good reasoning keeps track of what each symbol is allowed to mean.",
    "lessons": [
      {
        "title": "Variables",
        "text": "A letter can hold an unknown value, but every clue narrows what that value can be."
      },
      {
        "title": "Symbol Codes",
        "text": "Some puzzles redefine symbols such as # or @. Translate them before solving."
      },
      {
        "title": "Expression Simplifying",
        "text": "Combine like terms and cancel matching parts to reveal a simpler rule."
      }
    ],
    "activity": {
      "title": "Letter Machine",
      "prompt": "Assign values only when the clues force them. If not, keep the expression symbolic.",
      "chips": [
        {
          "title": "A + B = Z",
          "text": "If B is twice A, then Z is three times A."
        },
        {
          "title": "Pyramid",
          "text": "When each block is the sum of two below it, work upward one row at a time."
        },
        {
          "title": "Translate",
          "text": "If # means greater than, write > before comparing options."
        },
        {
          "title": "Simplify",
          "text": "Remove terms that add and subtract the same amount."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Abstraction lets letters stand for changing values."
      },
      {
        "title": "Math link",
        "text": "Equations and inequalities become clearer after translation."
      }
    ],
    "quiz": [
      {
        "text": "If A = 3, B = 2, and C = A + 2B, what is C?",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "answer": 2,
        "clue": "C = 3 + 2 x 2."
      },
      {
        "text": "If # means greater than and @ means less than, what does a # b @ c mean?",
        "options": [
          "a > b and b < c",
          "a < b and b > c",
          "a = b and b < c",
          "a > c only"
        ],
        "answer": 0,
        "clue": "Translate each symbol separately."
      },
      {
        "text": "A + B = Z, B = 3A, B > 9, and Z < 20. Which value can A have?",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 2,
        "clue": "Try values that make B greater than 9 but keep A + B below 20."
      },
      {
        "text": "The sum of four ages is 48. Each person is at least 10 years old. What is the maximum possible age of the oldest person?",
        "options": [
          "16",
          "18",
          "20",
          "22"
        ],
        "answer": 1,
        "clue": "Make the other three ages as small as allowed."
      },
      {
        "text": "If x means not less than, which ordinary symbol has the same meaning?",
        "options": [
          "<",
          ">",
          ">=",
          "="
        ],
        "answer": 2,
        "clue": "Not less than means greater than or equal to."
      },
      {
        "text": "In a number pyramid, the bottom row is 4, 7, 2. Each block is the sum of the two below it. What is the top block?",
        "options": [
          "18",
          "20",
          "22",
          "24"
        ],
        "answer": 1,
        "clue": "Middle row is 11 and 9."
      },
      {
        "text": "Which expression matches a machine that doubles n and then adds 5?",
        "options": [
          "n + 10",
          "2n + 5",
          "5n + 2",
          "2(n + 5)"
        ],
        "answer": 1,
        "clue": "Do the doubling first, then add 5."
      },
      {
        "text": "Simplify (4P + 3B) - (2P + 3C) + (2A - 3B).",
        "options": [
          "2P + 2A - 3C",
          "6P + 2A",
          "2P + 3B - 3C",
          "4P + 2A + 3C"
        ],
        "answer": 0,
        "clue": "+3B and -3B cancel."
      },
      {
      "text": "If 5A, 5B, and C9 are two-digit numbers, A, B, and C are non-zero digits, and A + B + C = 12, what is the largest possible value of A + C?",
        "options": [
          "9",
          "10",
          "11",
          "12"
        ],
        "answer": 2,
        "clue": "Keep B as small as possible while digits remain valid."
      },
      {
        "text": "If $ means equal to, what must be true in x $ y?",
        "options": [
          "x is larger",
          "y is larger",
          "x and y have the same value",
          "x and y are consecutive"
        ],
        "answer": 2,
        "clue": "The symbol is defined as equality."
      }
    ]
  },
  {
    "id": "parallel-lines",
    "shortTitle": "Parallel & Intersecting",
    "title": "Parallel and Intersecting Lines",
    "skill": "angle relationships",
    "theme": "yellow",
    "visual": "geometry",
    "intro": "Line puzzles use exact relationships: parallel lines stay apart, intersecting lines create equal opposite angles, and straight lines make 180 degrees.",
    "lessons": [
      {
        "title": "Parallel Lines",
        "text": "Parallel lines remain the same distance apart and do not meet."
      },
      {
        "title": "Intersecting Lines",
        "text": "When two lines cross, vertically opposite angles are equal."
      },
      {
        "title": "Transversals",
        "text": "A line cutting parallel lines creates matching angle relationships."
      }
    ],
    "activity": {
      "title": "Angle Inspector",
      "prompt": "Name the relationship first, then calculate. The relationship is the rule your answer follows.",
      "chips": [
        {
          "title": "Opposite",
          "text": "Vertically opposite angles are equal."
        },
        {
          "title": "Straight",
          "text": "Angles on a straight line add to 180 degrees."
        },
        {
          "title": "Perpendicular",
          "text": "Perpendicular lines meet at 90 degrees."
        },
        {
          "title": "Parallel",
          "text": "Corresponding angles are equal when a transversal cuts parallel lines."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Pattern recognition helps identify which angle rule applies."
      },
      {
        "title": "Math link",
        "text": "Geometry proofs depend on using the right relationship."
      }
    ],
    "quiz": [
      {
        "text": "In a clock, the minute hand is at 12. How many hour-hand positions make the hands perpendicular?",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "answer": 1,
        "clue": "The hour hand can point to 3 or 9."
      },
      {
        "text": "Two lines intersect. One angle is 74 degrees. What is the vertically opposite angle?",
        "options": [
          "16 degrees",
          "74 degrees",
          "106 degrees",
          "180 degrees"
        ],
        "answer": 1,
        "clue": "Vertically opposite angles are equal."
      },
      {
        "text": "Two adjacent angles form a straight line. One is 68 degrees. What is the other?",
        "options": [
          "102 degrees",
          "108 degrees",
          "112 degrees",
          "122 degrees"
        ],
        "answer": 2,
        "clue": "Subtract from 180 degrees."
      },
      {
        "text": "Two different lines are both perpendicular to the same line. What must be true?",
        "options": [
          "They are parallel",
          "They are curved",
          "They meet at 45 degrees",
          "They are equal in length"
        ],
        "answer": 0,
        "clue": "Think of two vertical lines meeting the same horizontal line at right angles."
      },
      {
        "text": "A square is divided into a 2 by 2 grid. How many squares can be counted in all?",
        "options": [
          "4",
          "5",
          "8",
          "9"
        ],
        "answer": 1,
        "clue": "Count four small squares and one large square."
      },
      {
        "text": "A planned angle of 40 degrees becomes 70 degrees. What happens to its adjacent straight-line angle?",
        "options": [
          "140 degrees becomes 110 degrees",
          "110 degrees becomes 140 degrees",
          "40 degrees becomes 70 degrees",
          "70 degrees becomes 40 degrees"
        ],
        "answer": 0,
        "clue": "Adjacent angles are supplements."
      },
      {
        "text": "Which statement about parallel lines is correct?",
        "options": [
          "They meet at one point",
          "They stay the same distance apart",
          "They always form triangles",
          "They must be vertical"
        ],
        "answer": 1,
        "clue": "Parallel lines do not intersect."
      },
      {
        "text": "If a line inside a triangle is parallel to the base, what kind of smaller triangle is formed at the top?",
        "options": [
          "a similar triangle",
          "a circle",
          "a rectangle",
          "an unrelated triangle"
        ],
        "answer": 0,
        "clue": "Parallel lines preserve angle relationships."
      },
      {
        "text": "A transversal cuts two parallel lines. Which angles are equal?",
        "options": [
          "corresponding angles",
          "random angles",
          "only all obtuse angles",
          "only all reflex angles"
        ],
        "answer": 0,
        "clue": "This is one of the standard parallel-line rules."
      },
      {
        "text": "Which property is always true for a rectangle?",
        "options": [
          "All sides are unequal",
          "Opposite sides are parallel",
          "No angle is 90 degrees",
          "It has exactly one side"
        ],
        "answer": 1,
        "clue": "A rectangle has two pairs of parallel sides."
      }
    ]
  },
  {
    "id": "number-play",
    "shortTitle": "Number Play",
    "title": "Number Play",
    "skill": "binary logic and filtering",
    "theme": "blue",
    "visual": "ai",
    "intro": "The number-play chapter models logic with ON/OFF cards, grids, digits, and filters. Complex puzzles shrink when every clue removes cases.",
    "lessons": [
      {
        "title": "Binary States",
        "text": "Each light can be ON or OFF, just like a binary digit can be 1 or 0."
      },
      {
        "title": "Logical Filtering",
        "text": "A clue such as Red is ON removes every card where Red is OFF."
      },
      {
        "title": "Case Splitting",
        "text": "When a clue says either-or, split the cases and test each one."
      }
    ],
    "activity": {
      "title": "Light Card Filter",
      "prompt": "Track U as ON and O as OFF. Each clue should cut down the remaining cards.",
      "chips": [
        {
          "title": "3 lights",
          "text": "Three lights create 2 x 2 x 2 = 8 possible cards."
        },
        {
          "title": "R is ON",
          "text": "Keep only cards with U in the R position."
        },
        {
          "title": "B is OFF",
          "text": "Keep only cards with O in the B position."
        },
        {
          "title": "Neighbour rule",
          "text": "An ON light can be accepted only if its neighbour is OFF."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Filtering is an algorithm for reducing possible solutions."
      },
      {
        "title": "Math link",
        "text": "Counting binary states uses powers of two."
      }
    ],
    "quiz": [
      {
        "text": "How many ON/OFF cards are possible for 5 lights?",
        "options": [
          "10",
          "16",
          "25",
          "32"
        ],
        "answer": 3,
        "clue": "Each light has 2 states, so calculate 2 to the power 5."
      },
      {
        "text": "In RGB notation, U means ON and O means OFF. In RGB = U O U, which bulb is OFF?",
        "options": [
          "Red",
          "Green",
          "Blue",
          "None"
        ],
        "answer": 1,
        "clue": "Read the second position for Green."
      },
      {
        "text": "For 3 lights, how many cards remain after the clue Red is ON?",
        "options": [
          "8",
          "4",
          "2",
          "1"
        ],
        "answer": 1,
        "clue": "Half of the 8 cards have Red ON."
      },
      {
        "text": "For RGB cards, after keeping Red ON and Blue OFF, how many cards remain?",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "answer": 1,
        "clue": "Only Green is still free to be ON or OFF."
      },
      {
        "text": "If Red is ON, Blue is OFF, and every ON light must have an OFF neighbour, which RGB pattern works?",
        "options": [
          "U U O",
          "U O O",
          "O U O",
          "U O U"
        ],
        "answer": 1,
        "clue": "Red's neighbour Green must be OFF."
      },
      {
        "text": "Using digits 1, 3, 6, and 8 once, what is the largest four-digit odd number?",
        "options": [
          "8631",
          "8613",
          "8361",
          "6813"
        ],
        "answer": 0,
        "clue": "Use 1 in the units place so larger digits can stay to the left."
      },
      {
        "text": "A two-digit number with different digits is reversed. The difference between the two numbers cannot be what?",
        "options": [
          "a multiple of 9",
          "an integer",
          "a prime number",
          "an even number"
        ],
        "answer": 2,
        "clue": "The difference is always 9 times the difference of the digits."
      },
      {
        "text": "A rectangle pattern has dimensions 3 x 5, 5 x 8, 8 x 13, 13 x 21. What is the area of the next rectangle?",
        "options": [
          "612",
          "693",
          "714",
          "2210"
        ],
        "answer": 2,
        "clue": "The next dimensions are 21 x 34."
      },
      {
        "text": "A four-digit number has exactly two even digits and two odd digits. Which digit sum is impossible?",
        "options": [
          "14",
          "16",
          "18",
          "19"
        ],
        "answer": 3,
        "clue": "Two odd digits add to an even number, and two even digits also add to an even number."
      },
      {
        "text": "A known OFF light in a punch-card puzzle means you should keep cards with which symbol in that light's position?",
        "options": [
          "U",
          "O",
          "X only",
          "no symbol"
        ],
        "answer": 1,
        "clue": "O represents OFF."
      }
    ]
  },
  {
    "id": "triangles-lines",
    "shortTitle": "Three Intersecting Lines",
    "title": "A Tale of Three Intersecting Lines",
    "skill": "triangles and proof",
    "theme": "yellow",
    "visual": "geometry",
    "intro": "Triangle puzzles combine shape properties, similarity, folds, angle sums, and sufficiency of information.",
    "lessons": [
      {
        "title": "Classify",
        "text": "Use side lengths and angle properties to classify triangles."
      },
      {
        "title": "Compare Area",
        "text": "Equal side length does not mean equal area across different shapes."
      },
      {
        "title": "Use Sufficiency",
        "text": "Some clues are enough alone, while others need to be combined."
      }
    ],
    "activity": {
      "title": "Triangle Case Lab",
      "prompt": "Before calculating, ask which type of triangle the clues force.",
      "chips": [
        {
          "title": "Equilateral",
          "text": "All sides equal and each angle is 60 degrees."
        },
        {
          "title": "Isosceles",
          "text": "At least two sides are equal."
        },
        {
          "title": "Right",
          "text": "One angle is 90 degrees."
        },
        {
          "title": "Similar",
          "text": "Matching angles are equal and side ratios match."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "Logical sufficiency checks whether the available clues force one answer."
      },
      {
        "title": "Math link",
        "text": "Triangle properties connect angles, sides, and transformations."
      }
    ],
    "quiz": [
      {
        "text": "A square and an equilateral triangle have the same side length. Which has the greater area?",
        "options": [
          "square",
          "triangle",
          "both equal",
          "cannot be compared"
        ],
        "answer": 0,
        "clue": "A square of side s has area s squared, which is greater than an equilateral triangle with side s."
      },
      {
        "text": "Three identical equilateral triangles are joined edge to edge with no overlap. Which shape can be formed?",
        "options": [
          "trapezium",
          "circle",
          "pentagon only",
          "cube"
        ],
        "answer": 0,
        "clue": "Two triangles can form a rhombus-like base and the third can extend it into a trapezium."
      },
      {
        "text": "A triangle is similar to a right-angled triangle and is not scalene. What type must it be?",
        "options": [
          "equilateral",
          "isosceles right",
          "obtuse scalene",
          "not a triangle"
        ],
        "answer": 1,
        "clue": "An equilateral triangle cannot be right-angled."
      },
      {
        "text": "An isosceles triangle has perimeter 25 cm, and its equal sides are multiples of 4. How many possible third-side lengths are there?",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "answer": 1,
        "clue": "Equal sides 8 and 12 both give valid whole-number third sides."
      },
      {
        "text": "Similar triangles must have:",
        "options": [
          "equal corresponding angles",
          "equal colors",
          "equal perimeters only",
          "no parallel sides"
        ],
        "answer": 0,
        "clue": "Similarity preserves angle measures."
      },
      {
        "text": "The angles of a triangle add to:",
        "options": [
          "90 degrees",
          "120 degrees",
          "180 degrees",
          "360 degrees"
        ],
        "answer": 2,
        "clue": "This is the angle-sum property of triangles."
      },
      {
        "text": "Each angle of an equilateral triangle is:",
        "options": [
          "30 degrees",
          "45 degrees",
          "60 degrees",
          "90 degrees"
        ],
        "answer": 2,
        "clue": "Divide 180 degrees equally among three angles."
      },
      {
        "text": "A scalene triangle has:",
        "options": [
          "all sides equal",
          "exactly two equal sides",
          "all sides different",
          "no angles"
        ],
        "answer": 2,
        "clue": "Scalene means unequal side lengths."
      },
      {
        "text": "In a right triangle, the angle opposite the hypotenuse is:",
        "options": [
          "30 degrees",
          "60 degrees",
          "90 degrees",
          "180 degrees"
        ],
        "answer": 2,
        "clue": "The hypotenuse is opposite the right angle."
      },
      {
      "text": "In a 3 by 3 grid, what is the maximum number of circles you can place without making three in any row, column, or diagonal?",
        "options": [
          "4",
          "5",
          "6",
          "7"
        ],
      "answer": 2,
      "clue": "Six can be placed if every row, column, and diagonal is kept from becoming full."
      }
    ]
  },
  {
    "id": "fractions",
    "shortTitle": "Fractions",
    "title": "Working with Fractions",
    "skill": "parts and proportions",
    "theme": "blue",
    "visual": "geometry",
    "intro": "Fraction problems often ask you to track what remains after each step, compare parts, and model areas or repeated changes.",
    "lessons": [
      {
        "title": "Remaining Amounts",
        "text": "After taking a fraction, always update the whole before the next step."
      },
      {
        "title": "Equivalent Forms",
        "text": "Common denominators help compare and combine fractions."
      },
      {
        "title": "Area Models",
        "text": "Grid regions and shaded parts make fractions visible."
      }
    ],
    "activity": {
      "title": "Share and Track",
      "prompt": "Keep a running whole. Fractions are easy to lose if you keep using the original amount by mistake.",
      "chips": [
        {
          "title": "Share",
          "text": "If 1/4 is kept, 3/4 remains for the next step."
        },
        {
          "title": "Compare",
          "text": "Use a common denominator before deciding which fraction is larger."
        },
        {
          "title": "Area",
          "text": "A 4 by 4 grid has 16 equal parts."
        },
        {
          "title": "Change",
          "text": "Increasing one side and decreasing another can keep perimeter steady while changing area."
        }
      ]
    },
    "checks": [
      {
        "title": "CT move",
        "text": "State tracking keeps the current whole clear after every operation."
      },
      {
        "title": "Math link",
        "text": "Fractions connect sharing, area, comparison, and ratio."
      }
    ],
    "quiz": [
      {
        "text": "A child keeps 1/4 of some chocolates, gives 1/3 of the remainder to a sister, and gives the final 18 chocolates to a brother. How many chocolates were there at first?",
        "options": [
          "24",
          "30",
          "36",
          "42"
        ],
        "answer": 2,
        "clue": "After keeping 1/4 and giving 1/3 of the remainder, half of the original remains."
      },
      {
        "text": "A bus loses 1/5 of its passengers, then 20 board. Half the passengers then get off, leaving 50. How many passengers were on the bus at first?",
        "options": [
          "80",
          "90",
          "100",
          "120"
        ],
        "answer": 2,
        "clue": "Before half got off there were 100 passengers."
      },
      {
        "text": "What is 3/4 + 1/6?",
        "options": [
          "5/10",
          "9/10",
          "11/12",
          "13/12"
        ],
        "answer": 2,
        "clue": "Use denominator 12."
      },
      {
        "text": "Which fraction is equivalent to 6/9?",
        "options": [
          "1/3",
          "2/3",
          "3/4",
          "4/9"
        ],
        "answer": 1,
        "clue": "Divide numerator and denominator by 3."
      },
      {
        "text": "A 4 by 4 square grid has 5 shaded cells. What fraction is shaded?",
        "options": [
          "5/12",
          "5/16",
          "4/16",
          "1/5"
        ],
        "answer": 1,
        "clue": "There are 16 equal cells."
      },
      {
        "text": "A rectangle's length is increased by 1/4 and its breadth is decreased by 1/4. What fraction of the original area is the new area?",
        "options": [
          "15/16",
          "1",
          "7/8",
          "9/16"
        ],
        "answer": 0,
        "clue": "Multiply 5/4 by 3/4."
      },
      {
        "text": "A 3 by 3 frame covers 9 cells. At least one-third of the covered cells must have flowers. What is the minimum number of flower cells needed?",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ],
        "answer": 1,
        "clue": "One-third of 9 is 3."
      },
      {
        "text": "A vessel has 100 litres. One-fifth evaporates on Day 1, then half of the remaining liquid is used on Day 2. What fraction of the original amount remains?",
        "options": [
          "1/5",
          "2/5",
          "1/2",
          "3/5"
        ],
        "answer": 1,
        "clue": "80 litres remain after Day 1, and 40 after Day 2."
      },
      {
        "text": "Which is greater: 5/6 or 7/9?",
        "options": [
          "5/6",
          "7/9",
          "they are equal",
          "cannot be compared"
        ],
        "answer": 0,
        "clue": "Compare using denominator 18 or use decimals."
      },
      {
        "text": "What is 2/3 of 45?",
        "options": [
          "15",
          "20",
          "30",
          "35"
        ],
        "answer": 2,
        "clue": "Divide by 3, then multiply by 2."
      }
    ]
  }
];
