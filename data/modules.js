window.CT7_MODULES = [
  {
    "id": "large-numbers",
    "shortTitle": "Large Numbers",
    "title": "Large Numbers Around Us",
    "skill": "place value and constraints",
    "theme": "teal",
    "visual": "numberline",
    "intro": "Practice place value, digit counts, and constraints.",
    "lessons": [
      {
        "title": "Build by Place",
        "text": "Break a large number into lakhs, thousands, hundreds, tens, and ones before combining it."
      },
      {
        "title": "Beyond Any Number",
        "text": "No matter how large a number is, the number line keeps going toward bigger values and smaller values."
      },
      {
        "title": "Filter Options",
        "text": "Use clues such as digit repeats, range, odd or even endings, and units digits to remove wrong choices."
      }
    ],
    "interactive": {
      "type": "infinityNumberLine",
      "title": "Endless Number Line",
      "prompt": "Slide left to move toward negative infinity, or slide right to move toward positive infinity."
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
        "text": "Imagine two number universes that both go on forever. Universe 1 has only counting numbers like 1, 2, 3, and 4. Universe 2 has counting numbers and decimal numbers like 1.1, 1.01, and 2.5. Which universe has the bigger infinity?",
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
          "note": "Both continue forever. Think about how many numbers can fit between two counting numbers."
        },
        "visual": {
          "type": "densityCompare",
          "title": "Zoom Into One Gap",
          "instruction": "Compare a counting step with what can fit inside that same step.",
          "hint": "Focus on the spaces between two neighbours. Can you keep placing more numbers inside one gap?"
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
        "text": "Imagine two never-ending number worlds. Universe 1 keeps counting 1, 2, 3, 4, and so on. Universe 2 has all the decimals between 0 and 1, like 0.1, 0.01, and 0.25. Which universe has the bigger infinity?",
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
              "detail": "Every decimal between 0 and 1: 0.1, 0.01, 0.25, ..."
            }
          ],
          "note": "Both go on forever. Notice how tightly decimals fill even the small space between 0 and 1."
        },
        "visual": {
          "type": "densityCompare",
          "title": "Counting List vs 0 to 1",
          "instruction": "Compare the whole counting list with only the decimal space from 0 to 1.",
          "countingTitle": "Counting list: 1, 2, 3, 4, ... infinity",
          "countTail": "...",
          "countNote": "The counting side keeps going toward infinity: 5, 6, 7, ...",
          "focusedGap": null,
          "startLabel": "0",
          "endLabel": "1",
          "insideLabel": "Universe 2: only 0 to 1",
          "zoomLabel": "compare with just 0 to 1",
          "decimalTitle": "This small interval can still hold more and more decimals",
          "decimalTicks": ["0.1", "0.2", "0.25", "0.5", "0.75", "0.9"],
          "hint": "Look between 0 and 1, then choose any two marked decimals. Could another decimal still go between them?"
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
    "intro": "Follow operations, test swaps, and work backward.",
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
    "interactive": {
      "type": "expressionDebugger",
      "title": "Operation Playground",
      "prompt": "Change the two numbers, then switch between +, -, x, and / to compare how the same pair gives very different answers."
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
        "text": "Start with any positive number, like 10. You multiply it by a positive number k. How does k decide whether the answer is bigger than your starting number, equal to it, or smaller?",
        "visual": {
          "type": "multiplierCompare",
          "title": "Multiplier k",
          "start": 10,
          "minK": 0,
          "maxK": 2,
          "initialK": 1,
          "cases": [
            { "k": 1, "label": "same" },
            { "k": 2, "label": "grows" },
            { "k": 0.5, "label": "shrinks" }
          ]
        },
        "optionsLayout": "stacked",
        "options": [
          "The answer is always bigger.",
          "If k is greater than 1, it grows. If k is 1, it stays the same. If k is between 0 and 1, it shrinks.",
          "If k is greater than 1, it shrinks. If k is between 0 and 1, it grows.",
          "The answer grows only when k is a whole number."
        ],
        "answer": 1,
        "clue": "Try 10 x 2, 10 x 1, and 10 x 1/2. Compare each answer with 10."
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
        "text": "Mira's bakery van can pass the weigh-station only when a batch weighs from 25 kg to 50 kg. One batch weighs 15 @ 3 + 24 / 6 x 2 kg. Replace @ with +, -, x, or /. Which operator lets the batch pass?",
        "brief": {
          "title": "Mira's batch check",
          "items": [
            {
              "label": "Batch formula",
              "value": "15 @ 3 + 24 / 6 x 2 kg",
              "detail": "Try one operator in place of @."
            },
            {
              "label": "Allowed weight",
              "value": "25 kg to 50 kg",
              "detail": "Both 25 kg and 50 kg are allowed."
            }
          ],
          "note": "Check the four possible results, then keep the one that lands in the range."
        },
        "optionsLayout": "operator-grid",
        "options": [
          "-",
          "+",
          "/",
          "x"
        ],
        "answer": 1,
        "clue": "The tail 24 / 6 x 2 evaluates to 8. The four results are: - gives 20, + gives 26, / gives 13, x gives 53. Only 26 sits in [25, 50]."
      },
      {
        "text": "A bus makes three stops. At the first stop, 5 passengers get off and 8 get in. At the second stop, 2 passengers get off and 4 get in. At the third stop, half of the passengers leave. The bus then has 20 passengers, exactly half of its 40 seats occupied. Which expression gives the number of passengers at the beginning?",
        "options": [
          "5 x 5 + 5",
          "6 x 6 - 4",
          "5 x 5 + 10",
          "6 x 6 - 5"
        ],
        "answer": 2,
        "clue": "Before half left there were 40 passengers. The first two stops add 5 passengers in all, so the beginning count was 40 - 5 = 35."
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
        "text": "A number goes through a three-step process. At each step, you can choose either to multiply the current number by 4 or subtract 12. After all three steps, the final result is 96. What is the smallest whole number you could have started with?",
        "hintBrief": {
          "title": "Board hint",
          "items": [
            {
              "label": "Start",
              "value": "A whole number",
              "detail": "This is the number you are trying to find."
            },
            {
              "label": "Each step",
              "value": "Multiply by 4 or subtract 12",
              "detail": "Choose one action for each of the three steps."
            },
            {
              "label": "Finish",
              "value": "96",
              "detail": "The third step must land on this number."
            }
          ],
          "note": "[Start] -> Slot 1 -> Slot 2 -> Slot 3 -> 96"
        },
        "options": [
          "9",
          "18",
          "4",
          "72"
        ],
        "answer": 0,
        "clue": "One working path is: start with 9, multiply by 4 to get 36, subtract 12 to get 24, then multiply by 4 to get 96."
      },
      {
        "text": "Each fruit has a secret value. Use the clues in the picture. What is pear + pear - strawberry?",
        "image": {
          "src": "assets/fruit-equation-challenge.svg",
          "alt": "Orange plus pear equals 17. Pear plus strawberry equals 14. Orange plus strawberry equals 13. Find pear plus pear minus strawberry."
        },
        "options": [
          "11",
          "12",
          "13",
          "14"
        ],
        "answer": 2,
        "clue": "Add the first two equations and subtract the third: 2 pears = 18, so pear = 9. Then strawberry = 5, and 9 + 9 - 5 = 13."
      },
      {
        "text": "Look at the expression 8 x 4 + 2 - 1. You may swap one pair of operation signs, or leave the expression unchanged. After using the normal order of operations, which choice gives the smallest value?",
        "brief": {
          "title": "Operator swap challenge",
          "items": [
            {
              "label": "Expression to test",
              "value": "8 x 4 + 2 - 1",
              "detail": "Try each option, calculate the result carefully, and choose the one that gives the smallest answer."
            }
          ]
        },
        "options": [
          "x and +",
          "+ and -",
          "- and x",
          "No change"
        ],
        "answer": 2,
        "clue": "Swapping - and x gives 8 - 4 + 2 x 1 = 6, which is the smallest result."
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
          "alt": "Four arrows labeled P, Q, R, and S point to a centre operator box. Each arrow has its own operator and equation to test.",
          "size": "wide"
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
    "intro": "Compare decimal place value with binary powers.",
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
          "title": "Build with place values",
          "instruction": "Tap place values on or off and watch the binary and decimal totals change.",
          "places": [16, 8, 4, 2, 1],
          "target": 13,
          "hideTargetLabel": true,
          "hint": "Work from the largest place value down. Use a place only if it helps without going past the number."
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
          "instruction": "Tap boxes to copy the 1s and 0s from the question, then use the total to reason it out.",
          "places": [16, 8, 4, 2, 1],
          "hint": "Treat each 1 as switched on and each 0 as switched off."
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
          "instruction": "Tap the row to reveal the doubling pattern. The final box stays hidden for you to finish.",
          "base": 2,
          "exponent": 5,
          "labels": ["0 holes", "1 hole", "2 holes", "3 holes", "4 holes", "5 holes"],
          "hideFinalValue": true,
          "hint": "Start small: think about 1 hole, then 2 holes, then keep the same doubling rule."
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
          "title": "Translate in order",
          "instruction": "Tap each hole box to choose a shape. Use the rule from the question and keep the order.",
          "binary": "01101",
          "mapping": { "0": "O", "1": "U" },
          "hideHoleAnswers": true,
          "hint": "Check one digit at a time, then compare the full pattern with the options."
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
          "instruction": "Use the same jump size to place the next marker.",
          "start": 6,
          "end": 9,
          "step": 0.25,
          "marks": [6.25, 6.75, 7.25, 7.75],
          "target": 8.25,
          "hideTargetLabel": true,
          "hint": "Compare two neighbouring terms to find the jump size, then make one more jump."
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
          "hideTargetLabel": true,
          "hint": "Each tick is one tenth. Count the tick number, then write it as a decimal."
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
          "title": "Explore place-value changes",
          "instruction": "Use the arrows to explore how the same digits can change value.",
          "value": "3.2",
          "direction": "either",
          "places": 1,
          "hint": "Focus on what happened to the place value of the digits, not on adding or rounding."
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
          "title": "Find the one option",
          "instruction": "Tap an option. The rule chips turn green when that rule passes.",
          "splits": [
            { "label": "30.12", "left": [3, 0], "right": [1, 2] },
            { "label": "31.02", "left": [3, 1], "right": [0, 2] },
            { "label": "32.01", "left": [3, 2], "right": [0, 1] },
            { "label": "21.30", "left": [2, 1], "right": [3, 0] }
          ],
          "rules": ["Left side descending", "Right side ascending", "Equal digit sums"],
          "hideBalanceFeedback": true,
          "showRuleChecks": true,
          "hint": "Use the chips as filters: left order, right order, and equal sums must all pass."
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
          "title": "Use binary finger values",
          "instruction": "Think of one hand as five binary places: 16, 8, 4, 2, and 1.",
          "places": [16, 8, 4, 2, 1],
          "target": 19,
          "hideTargetLabel": true,
          "hint": "Begin with the largest place value that does not go past the number, then check the smaller places."
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
    "intro": "Track what each symbol is allowed to mean.",
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
    "interactive": {
      "type": "quoteCard",
      "title": "A Thought About Variables",
      "quote": "Math is not only about solving for x — it’s also about finding y.",
      "note": "Letters help us describe changing values, not just one missing answer."
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
    "intro": "Use line and angle relationships precisely.",
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
    "interactive": {
      "type": "angleInspector",
      "title": "Angle Inspector",
      "prompt": "Drag the dark handle to tilt the transversal, then pull the blue grip to move the lines apart. Close together they just intersect; far apart they become parallel lines with equal corresponding angles."
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
    "intro": "Use clues to filter cases step by step.",
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
    "interactive": {
      "type": "lightFilter",
      "title": "Light Card Filter",
      "prompt": "Tap each light to set a clue (Any, ON, or OFF) and watch the eight possible cards shrink to the ones that still match."
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
        "visual": {
          "type": "binaryCount",
          "title": "Build ON/OFF Cards",
          "instruction": "Use + and - to explore 1 to 4 lights. Watch what happens each time one more ON/OFF choice is added.",
          "lights": 5,
          "practiceMax": 4,
          "hint": "Look for the doubling pattern before deciding what happens with the fifth light."
        },
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
        "text": "There are 8 RGB cards formed by all possible ON/OFF combinations of Red, Green, and Blue. If the clue says Red is ON, how many cards remain?",
        "visual": {
          "type": "rgbFilter",
          "title": "Filter the RGB Cards",
          "instruction": "Start with all three clues OFF. Tap Red once to set it ON, then count the bright cards.",
          "startState": "off",
          "hint": "For the question, change Red to ON. You can also change the other colours to see how filters remove cards."
        },
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
        "visual": {
          "type": "rgbFilter",
          "title": "Apply Two Clues",
          "instruction": "Start with all three clues OFF. Tap Red once to set it ON, leave Blue OFF, and try Green both ways.",
          "startState": "off",
          "hint": "For the question, use Red ON and Blue OFF. Then notice which colour is still free."
        },
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
        "text": "In RGB order, the positions are Red, Green, Blue. Red is ON, Blue is OFF, and every ON light must have an OFF neighbour. Which RGB pattern works?",
        "visual": {
          "type": "rgbNeighbour",
          "title": "Neighbour Rule Check",
          "instruction": "Start with all lights OFF. Tap the Red, Green, and Blue lights to test different RGB patterns.",
          "startState": "off",
          "hint": "For the question, build a pattern that keeps Red ON, Blue OFF, and every ON light next to an OFF light."
        },
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
        "visual": {
          "type": "rectanglePattern",
          "title": "Rectangle Side Pattern",
          "instruction": "Tap a rectangle to see how each pair of side lengths uses neighbouring numbers in the same sequence.",
          "dimensions": [
            [3, 5],
            [5, 8],
            [8, 13],
            [13, 21]
          ],
          "hint": "Find the next pair of side lengths first, then multiply them for the area."
        },
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
        "text": "A number filter keeps only three-digit numbers whose hundreds digit is odd, whose tens digit is greater than the units digit, and whose digit sum is a multiple of 5. Which number passes all filters?",
        "options": [
          "742",
          "581",
          "963",
          "735"
        ],
        "answer": 1,
        "clue": "Apply the filters one at a time: odd hundreds digit, tens digit greater than units digit, then digit sum divisible by 5."
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
    "intro": "Reason with triangles, folds, and angle sums.",
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
    "interactive": {
      "type": "triangleLab",
      "title": "Triangle Case Lab",
      "prompt": "Tap a preset triangle, or drag any corner to reshape it. The three angles always add to 180°, and the label names the type."
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
        "text": "What is the sum of the three interior angles of a triangle?",
        "visual": {
          "type": "triangleAngles",
          "title": "Triangle Angle Sum",
          "instruction": "Drag any corner. The dashed line through C is parallel to base AB, so matching Z-angles use the same colour.",
          "hint": "Use the parallel line to move the base angles up to C. The three coloured angles sit on one straight line."
        },
        "options": [
          "90 degrees",
          "120 degrees",
          "180 degrees",
          "360 degrees"
        ],
        "answer": 2,
        "clue": "For any triangle, the three interior angles add to 180 degrees."
      },
      {
        "text": "Three identical equilateral triangles are joined edge to edge with no overlap. Which shape can be formed?",
        "visual": {
          "type": "threeTriangleBuild",
          "title": "Build With Three Triangles",
          "instruction": "Watch three triangles join into a trapezium."
        },
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
        "visual": {
          "type": "isoscelesCases",
          "title": "Try Equal-Side Cases"
        },
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
        "text": "How many triangles are there in the given figure?",
        "image": {
          "src": "assets/triangle-count-two-rectangles.svg",
          "alt": "A rectangle split into two equal rectangles with diagonals drawn across the parts."
        },
        "visual": {
          "type": "triangleCountTrace",
          "title": "Trace Triangle Sizes"
        },
        "options": [
          "10",
          "14",
          "12",
          "16"
        ],
        "answer": 3,
        "clue": "Count the smallest triangles first, then look for larger triangles made by combining them."
      },
      {
        "text": "If you join 6 identical equilateral triangles edge to edge around one point, what shape can they make, and why?",
        "visual": {
          "type": "equilateralRing",
          "title": "Build Around One Point"
        },
        "options": [
          "a regular hexagon, because six 60-degree angles fit around one point",
          "a square, because all sides are equal",
          "a pentagon, because five outside edges are visible",
          "a circle, because the triangles go around a centre"
        ],
        "answer": 0,
        "clue": "Each equilateral triangle has a 60-degree angle. Six of those angles fill 360 degrees around a point."
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
        "text": "In a right-angled triangle, one angle is 90 degrees. What is the sum of the other two angles?",
        "options": [
          "30 degrees",
          "60 degrees",
          "90 degrees",
          "180 degrees"
        ],
        "answer": 2,
        "clue": "All three angles of a triangle add to 180 degrees. Subtract the right angle."
      },
      {
      "text": "In a 3 by 3 grid, what is the maximum number of circles you can place without making three in any row, column, or diagonal?",
        "visual": {
          "type": "gridNoThree",
          "title": "No Three In A Line"
        },
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
    "intro": "Track remaining parts and compare proportions.",
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
    "interactive": {
      "type": "fractionModel",
      "title": "Fraction Area Model",
      "prompt": "Slide the numerator and denominator to shade the bar, and read the fraction as a decimal, a percentage, and its simplest form."
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
