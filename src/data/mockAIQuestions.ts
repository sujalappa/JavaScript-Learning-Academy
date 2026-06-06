import type { MCQQuestion, CodingChallenge } from "./curriculum";

export interface MockAIDatabase {
  quizzes: Record<string, MCQQuestion[]>;
  debugging: Record<string, CodingChallenge[]>;
  implementation: Record<string, CodingChallenge[]>;
  hints: Record<string, string[]>;
}

export const mockAIDatabase: MockAIDatabase = {
  quizzes: {
    "module-1": [
      {
        id: "m1-ai-1",
        question: "What does code output: let a = 5; { let a = 10; } console.log(a);?",
        options: ["10", "5", "ReferenceError", "undefined"],
        answerIndex: 1
      },
      {
        id: "m1-ai-2",
        question: "Which data type is used to represent very large integers beyond the Number safe range?",
        options: ["BigInt", "LargeInt", "Double", "HugeNumber"],
        answerIndex: 0
      },
      {
        id: "m1-ai-3",
        question: "Is JavaScript statically typed or dynamically typed?",
        options: ["Statically typed", "Dynamically typed", "Both", "Neither"],
        answerIndex: 1
      },
      {
        id: "m1-ai-4",
        question: "Which of the following creates a symbol type in JavaScript?",
        options: ["Symbol()", "new Symbol()", "create Symbol()", "@Symbol"],
        answerIndex: 0
      },
      {
        id: "m1-ai-5",
        question: "What is the typeof null in JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'string'"],
        answerIndex: 2
      }
    ],
    "module-2": [
      {
        id: "m2-ai-1",
        question: "What does the expression 3 + 4 + '5' evaluate to?",
        options: ["'12'", "'75'", "12", "'345'"],
        answerIndex: 1
      },
      {
        id: "m2-ai-2",
        question: "Which value is considered 'falsy' in JavaScript?",
        options: ["'false'", "[]", "0", "{}"],
        answerIndex: 2
      },
      {
        id: "m2-ai-3",
        question: "What is the return value of null || 'default'?",
        options: ["null", "'default'", "true", "false"],
        answerIndex: 1
      },
      {
        id: "m2-ai-4",
        question: "What does '10' === 10 evaluate to?",
        options: ["true", "false", "TypeError", "undefined"],
        answerIndex: 1
      },
      {
        id: "m2-ai-5",
        question: "What is the operator priority order for: &&, ||, and !",
        options: ["&&, ||, !", "!, &&, ||", "||, &&, !", "&&, !, ||"],
        answerIndex: 1
      }
    ],
    "module-3": [
      {
        id: "m3-ai-1",
        question: "What is the output of: for(let i=0; i<3; i++) { if(i===1) continue; console.log(i); }?",
        options: ["Prints: 0, 1, 2", "Prints: 0, 2", "Prints: 0", "Prints: 2"],
        answerIndex: 1
      },
      {
        id: "m3-ai-2",
        question: "Which loop runs its body AT LEAST once even if the condition is false?",
        options: ["for loop", "while loop", "do-while loop", "for-in loop"],
        answerIndex: 2
      },
      {
        id: "m3-ai-3",
        question: "How do you loop through keys of an Object?",
        options: ["for...of", "for...in", "while", "forEach"],
        answerIndex: 1
      },
      {
        id: "m3-ai-4",
        question: "How do you loop through values of an Array in modern JS?",
        options: ["for...of", "for...in", "do-while", "None of the above"],
        answerIndex: 0
      },
      {
        id: "m3-ai-5",
        question: "What does 'break' do inside a nested loop?",
        options: [
          "Exits all nested loops",
          "Exits only the immediate loop containing the break keyword",
          "Jumps back to the outer loop initialization",
          "Thows a compiler error"
        ],
        answerIndex: 1
      }
    ],
    "module-4": [
      {
        id: "m4-ai-1",
        question: "What is a closure in JavaScript?",
        options: [
          "A method to close browser tabs",
          "A function that remembers and accesses variables from its outer scope even after the outer function has finished executing",
          "A safety feature to prevent memory leaks",
          "A style of writing loops"
        ],
        answerIndex: 1
      },
      {
        id: "m4-ai-2",
        question: "What does the expression (x => x + 1)(5) return?",
        options: ["5", "6", "NaN", "x"],
        answerIndex: 1
      },
      {
        id: "m4-ai-3",
        question: "Which variables are hoisted in a way that allows them to be accessed before declaration without throwing a ReferenceError?",
        options: ["let variables", "const variables", "var variables (as undefined) and function declarations", "None of them"],
        answerIndex: 2
      },
      {
        id: "m4-ai-4",
        question: "What is a callback function?",
        options: [
          "A function that returns to its starting line",
          "A function passed into another function as an argument to be executed later",
          "An emergency recovery function",
          "An async promise handler"
        ],
        answerIndex: 1
      },
      {
        id: "m4-ai-5",
        question: "Can an arrow function be used as a constructor (with the 'new' keyword)?",
        options: ["Yes, always", "No, arrow functions do not have their own 'this' or prototype context", "Only if it returns an object", "Only in strict mode"],
        answerIndex: 1
      }
    ],
    "module-5": [
      {
        id: "m5-ai-1",
        question: "Which of the following array methods modifies the original array (in-place)?",
        options: ["filter", "map", "concat", "sort"],
        answerIndex: 3
      },
      {
        id: "m5-ai-2",
        question: "What is the return value of [10, 20, 30].find(num => num > 15)?",
        options: ["20", "[20, 30]", "1", "undefined"],
        answerIndex: 0
      },
      {
        id: "m5-ai-3",
        question: "How do you check if an array contains a specific item in modern JS?",
        options: ["array.has(item)", "array.includes(item)", "array.contains(item)", "array.find(item)"],
        answerIndex: 1
      },
      {
        id: "m5-ai-4",
        question: "What does Array.isArray({ name: 'Sujal' }) evaluate to?",
        options: ["true", "false", "TypeError", "undefined"],
        answerIndex: 1
      },
      {
        id: "m5-ai-5",
        question: "Which method joins all elements of an array into a single string?",
        options: ["split", "join", "concat", "toString"],
        answerIndex: 1
      }
    ],
    "module-6": [
      {
        id: "m6-ai-1",
        question: "How do you delete a property 'age' from object 'user'?",
        options: ["delete user.age", "remove user.age", "user.age = null", "user.delete('age')"],
        answerIndex: 0
      },
      {
        id: "m6-ai-2",
        question: "Which keyword allows a class to inherit from another class?",
        options: ["implements", "extends", "inherits", "super"],
        answerIndex: 1
      },
      {
        id: "m6-ai-3",
        question: "Inside a subclass constructor, what function MUST be called before referencing 'this'?",
        options: ["parent()", "super()", "this.init()", "class.constructor()"],
        answerIndex: 1
      },
      {
        id: "m6-ai-4",
        question: "What is the output of: Object.keys({a: 1, b: 2})?",
        options: ["['a', 'b']", "[1, 2]", "[{a: 1}, {b: 2}]", "'a, b'"],
        answerIndex: 0
      },
      {
        id: "m6-ai-5",
        question: "What is the output of: typeof class Person {}?",
        options: ["'class'", "'object'", "'function'", "'constructor'"],
        answerIndex: 2
      }
    ],
    "module-7": [
      {
        id: "m7-ai-1",
        question: "What is the event loop in JavaScript?",
        options: [
          "A loop for repeating UI transitions",
          "A mechanism that monitors the call stack and callback queue to execute tasks when the stack is empty",
          "A way to fetch network files",
          "A code generator for async functions"
        ],
        answerIndex: 1
      },
      {
        id: "m7-ai-2",
        question: "If fetch() fails due to a network connection error, how do you handle it?",
        options: [
          "It automatically retries",
          "It resolves to false",
          "It rejects the promise, caught in a catch block",
          "It returns null"
        ],
        answerIndex: 2
      },
      {
        id: "m7-ai-3",
        question: "What does Promise.all() do when one of the input promises rejects?",
        options: [
          "Waits for others and returns the successful ones",
          "Immediately rejects with the error of the rejected promise",
          "Ignores the error and resolves to undefined",
          "Retries the rejected promise"
        ],
        answerIndex: 1
      },
      {
        id: "m7-ai-4",
        question: "What is the microtask queue priority compared to the macrotask (callback) queue?",
        options: [
          "Microtasks execute first (higher priority)",
          "Macrotasks execute first",
          "They have equal priority and execute randomly",
          "Microtasks are ignored inside the event loop"
        ],
        answerIndex: 0
      },
      {
        id: "m7-ai-5",
        question: "What is the return value of: async function test() { return 5; }?",
        options: ["5", "A Promise that resolves to 5", "A Promise that rejects with 5", "undefined"],
        answerIndex: 1
      }
    ]
  },
  debugging: {
    "module-1": [
      {
        id: "m1-ai-debug-1",
        description: "The developer declared 'pi' as a constant, but later attempted to add 1 to it. Fix the code so 'pi' is modifiable.",
        buggyCode: `function getNextPi() {
  const pi = 3.14;
  pi = pi + 1; // BUG!
  return pi;
}`,
        correctCode: `function getNextPi() {
  let pi = 3.14;
  pi = pi + 1;
  return pi;
}`,
        testCases: [
          { input: [], expected: 4.14, description: "getNextPi() -> 4.14" }
        ]
      }
    ]
  },
  implementation: {
    "module-1": [
      {
        id: "m1-ai-impl-1",
        description: "Write a function 'sumTwo(a, b)' that accepts two inputs and returns their sum.",
        initialCode: `function sumTwo(a, b) {\n  \n}`,
        testCases: [
          { input: [2, 3], expected: 5, description: "sumTwo(2, 3) -> 5" }
        ]
      }
    ]
  },
  hints: {
    "syntax": [
      "Check for unclosed curly braces `{}` or parentheses `()`.",
      "Ensure all strings are closed with matching quotes (double, single, or backticks).",
      "Check if you are using assignment `=` instead of strict equality `===` inside condition statements."
    ],
    "variables": [
      "Are you trying to reassign a variable declared with `const`? Use `let` instead.",
      "Check if the variable name is misspelled. Remember that JS is case-sensitive (`myVar` is different from `myvar`)."
    ],
    "loops": [
      "Check if the loop counter variable is actually changing (incrementing/decrementing) in the body.",
      "Ensure that your loop condition will eventually evaluate to false, or the code will run infinitely."
    ],
    "functions": [
      "Ensure you have a `return` statement inside the function if you expect a output value.",
      "Double-check the number of parameters the function accepts compared to the arguments you passed."
    ]
  }
};
