export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface CodingChallenge {
  id: string;
  description: string;
  initialCode?: string;
  correctCode?: string; // used for verification or AI evaluation reference
  buggyCode?: string;    // used only for debugging challenges
  testCases: {
    input: any[];
    expected: any;
    description: string;
  }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  notes: string;
  quiz: MCQQuestion[];
  debugging: CodingChallenge;
  implementation: CodingChallenge;
}

export const curriculumModules: Module[] = [
  {
    id: "module-0",
    title: "Lecture 00: Introduction to Javascript",
    description: "Learn why JavaScript was created, its role in browsers, and how it differs from C++ or Java.",
    notes: `# Lecture 00: Introduction to JavaScript

> **The Story of Netscape, Sun, and Microsoft and a Language Built in Ten Days**

---

## Why JavaScript Exists

Before you write a single line of JavaScript, it helps to know *why it exists at all*. Because here is a fair question: the world already had C++, Java, and Python — powerful, proven languages. So why invent yet another one? The answer lies in a story of a corporate war, a ten-day scramble, and a "silly little brother" language that outlived every rival.

### 1. The Web Was Born Dead
In the early 1990s, a web page was a static document. It could show text and images, and that was essentially all. There was no way for a page to react to you. If you filled in a form and made a mistake, the page could not tell you on the spot. It had to ship your data all the way to a distant server and wait for the server to send back a reply just to say "that's wrong, try again."

Netscape, makers of the dominant browser of the era, realised the web needed to come alive. It needed to respond instantly, right there in the page. That need is the seed of everything that follows.

### 2. Enter Sun, and a Language Called Java
At the same time, a company called **Sun Microsystems** had created a programming language named **Java**. Sun’s main business was selling powerful, expensive computers that ran the internet’s infrastructure — one writer called Sun the internet’s primary "arms dealer."

Java’s superpower was a promise: **"write once, run anywhere."** A Java program didn’t care whether you were on Windows, Mac, or Linux — it would run the same everywhere, inside a piece of software called the Java Virtual Machine. For a web full of all kinds of computers, that sounded perfect.

So in 1995, Sun and Netscape formed a partnership. Netscape would put Java into its browser. The two giants of the early web — the biggest browser and the biggest internet-server company — joined forces.

### 3. The Secret War Against Microsoft
But there was a deeper motive behind the alliance, and it’s the heart of the drama. Both Sun and Netscape had a common enemy: Microsoft.

In the 1990s, Microsoft’s power came from one fact — everyone needed Windows to run software. Programs were written for Windows specifically, so if you wanted to use them, you had to have Windows. Microsoft owned the ground that all software stood on.

Sun and Netscape had a dream to break that grip. What if all software ran *inside the browser* instead, written in Java? Then it wouldn’t matter what operating system you had underneath. The browser would become the new ground, and Windows would become irrelevant, reduced, as one history put it, to little more than a particularly expensive way to switch the computer on.

> *If software lived in the browser, who would pay extra for Windows? That was the threat Microsoft genuinely feared—and it was right to.*

### 4. Why a Second Language Was Needed
Here is the question students always ask: if Java was already going into the browser, **why invent JavaScript at all?** The answer is that Java, for all its power, was the wrong shape for one specific job.

Netscape pictured two very different kinds of work on a web page:
* **The heavy lifting**: Big, self-contained programs sitting in a box on the page (a chart tool, a small game). This was Java’s territory, written by professional programmers.
* **The glue**: Small touches that tie the page together—react to a click, check a form field, change some text. This needed to be simple enough for web designers to write.

Java was badly suited to the glue job for three concrete reasons:
1. It ran in a sealed box and couldn’t easily touch the page around it.
2. It was too heavyweight—firing up the whole Java engine just to check a phone number was like starting a truck to open a garage door.
3. It was too hard for the web designers who were the intended authors.

So Netscape decided it needed **both**: Java as the powerful "component language," and a new, light "glue language" for everyone else. That glue language is JavaScript.

### 5. Ten Days in May
Netscape hired an engineer named **Brendan Eich**, originally to put an existing language (Scheme) in the browser. Instead, he was asked to build the new glue language—and the prototype was written in roughly **ten days** in May 1995.

There was one strange constraint, and it’s the most interesting twist of all. Because of the Sun partnership, marketing demanded the new language *look like Java* to ride its popularity. Eich described being under orders to make it Java’s "silly little brother." That single business decision—"make it look like Java"—is what ruled out simply adopting Python or Perl, which existed and would have fit. The best technical choice lost to a marketing requirement.

The name itself was pure marketing: it was called **JavaScript** to borrow Java’s fame, even though the two languages are largely unrelated. As the saying goes: Java and JavaScript are as related as "car" and "carpet."

### 6. Two Languages, Side by Side
For years, the two languages lived together in the browser, each doing its own job:

| **Java (the "component" language)** | **JavaScript (the "glue" language)** |
| --- | --- |
| Powerful, fast, full-featured | Light, simple, forgiving |
| Written by professional programmers | Written by web designers |
| Ran in a sealed box (applet) | Woven into the page itself |
| Could NOT easily touch the page | Could touch any button, text, element |
| Needed a plugin + slow startup | Built in, ran instantly |
| Removed from browsers (~2015–2017) | Became the language of the web |

### 7. How the Little Brother Won
Java was the more powerful language. So how did JavaScript take over the frontend entirely? Not by being better—by being in the right place:
* **No plugin, no waiting**: Java needed a plugin installed, and the engine booted slowly on every page. JavaScript was already inside every browser and ran instantly.
* **Security**: The Java plugin became a notorious source of security holes, and browser makers fenced it off harder and harder.
* **JavaScript caught up**: Around 2011 onward, browsers gained fast JavaScript engines and native graphics, erasing Java’s speed and visual advantages.
* **It lived in the page**: Java sat in a box; JavaScript was woven into the document. As the web became about fluid, integrated pages, that was exactly the right shape.

Browsers dropped support for Java applets entirely around 2015–2017. The powerful component language was evicted from the browser. The silly little glue language became the foundation of the modern web.

### 8. The Same Story, Today
Here is the beautiful part. A modern technology called **WebAssembly** now lets powerful languages like C++ and Rust run in the browser at near-native speed. Sounds like Java all over again—and yet, for all its power, WebAssembly **cannot touch the page**. To change a button or react to a click, it must call out to JavaScript.

The exact word used in 1995 to describe JavaScript’s role—*"glue"*—is the exact word used today to describe its role next to WebAssembly. Thirty years on, the heavyweight component keeps changing (Java, then C++ via WebAssembly), but the glue never does.

> *Microsoft feared the right outcome but got the threat’s name wrong. The dream of OS-independent software in the browser largely came true — delivered not by mighty Java, but by the little language nobody took seriously.*

### The One-Sentence Takeaway
Those other languages own the computer. JavaScript owns the browser tab — and the browser turned out to be a very big room. It didn’t win by being the most powerful. It won by being woven into the page, already there, ready to run. **And that is the language you start learning today.**

---

## Why Do We Need JavaScript?
*(Even if a developer already knows HTML and CSS)*

1. **We Can't Put C++ in the Browser**
C++ is too heavy, unsafe, and inaccessible. Our users are not kernel developers; they’re web authors who just learned \`<table>\` and \`<font>\`. We need something lightweight, interpreted, forgiving, and safe.

\`\`\`cpp
#include<iostream>
using namespace std;
int main() {
   cout << "Hello World";
}
\`\`\`

\`\`\`javascript
console.log("Hello World");
\`\`\`

2. **The Massive Security Nightmare of Raw C++**
C++ gives you low-level control over memory and system calls. If a browser ran arbitrary C++ code from a website, that code could easily:
* Read/write any file on your computer.
* Install malware.
* Access your webcam or microphone without permission.
* Crash your entire operating system.

#### A. Unauthorized File System Access
\`\`\`cpp
#include <fstream>
std::ofstream file("C:\\\\Users\\\\rohit\\\\secrets.txt");
file << "stolen data";
\`\`\`
*Without a sandbox, this code could read, write, or delete any file on your machine.*

#### B. Destructive System Calls (Executing Programs)
\`\`\`cpp
#include <cstdlib>
system("rm -rf /");   // Linux
system("format C:");  // Windows 95 nightmare
\`\`\`
*Raw C++ can call \`system()\` to run OS commands, which could completely wipe your drive.*

#### C. Direct Memory Access (Pointers)
\`\`\`cpp
int* p = (int*)0xB8000;  // Access video memory
*p = 42;
\`\`\`
*C++ allows arbitrary pointer arithmetic, which could overwrite OS/kernel memory.*

#### D. Uncontrolled Networking
\`\`\`cpp
#include <sys/socket.h>
connect(...); // Open a raw socket to exfiltrate data
\`\`\`
*C++ can open arbitrary sockets, bypassing the browser's security boundaries.*

3. **System Configurations Were Extremely Limited in 1995**
* **RAM**: Average consumer PCs had **4 MB to 8 MB** of RAM.
* **Hard Disk**: Common sizes were **200 MB – 500 MB**.
* **CPU**: Intel **Pentium 75–133 MHz** was mainstream.

Running a sandboxed C++ runtime would’ve eaten up tons of RAM and CPU, which was impossible when you only had 8 MB of RAM shared with Windows 95 and the browser itself.

4. **Automatic Memory Management (Garbage Collection)**
Developers don't have to manually allocate and free memory. The JavaScript engine handles it automatically, reducing complexity and preventing common bugs like memory leaks that plague manual memory management in C++.
`,
    quiz: [
      {
        id: "m0-q1",
        question: "Why did Netscape need a second language (JavaScript) even though they were already putting Java in the browser?",
        options: [
          "Java was owned by Microsoft, so Netscape couldn't use it freely",
          "Java was suited for heavy components, but too heavyweight and isolated to act as a simple 'glue' language to link page elements",
          "JavaScript was designed specifically to run on mobile phones",
          "Java could not connect to internet servers"
        ],
        answerIndex: 1,
        explanation: "Netscape wanted two distinct languages: Java for heavy-duty, self-contained components, and a lightweight, forgiving 'glue' language (JavaScript) that web designers could use to react to clicks and validate form inputs directly in the document page."
      },
      {
        id: "m0-q2",
        question: "What is the historical relationship between Java and JavaScript?",
        options: [
          "JavaScript is a subset of Java that compiles into Java bytecode",
          "They are largely unrelated; the name 'JavaScript' was a marketing decision to ride on Java's popularity",
          "JavaScript is the object-oriented successor to Java",
          "They share the exact same runtime virtual machine (JVM)"
        ],
        answerIndex: 1,
        explanation: "Java and JavaScript are entirely different programming languages. Netscape named the language 'JavaScript' purely as a marketing tactic to leverage Java's popularity in 1995."
      },
      {
        id: "m0-q3",
        question: "Why is running native C++ directly in a browser considered a massive security nightmare?",
        options: [
          "C++ does not support functions",
          "C++ allows low-level memory access, pointer manipulation, file system access, and system calls that could let websites read local files or run malware",
          "C++ cannot run on computers running Windows",
          "C++ does not have an active compiler"
        ],
        answerIndex: 1,
        explanation: "Unlike safe, sandboxed scripting languages, raw C++ allows pointer arithmetic, direct file system reads/writes, and executing arbitrary system commands, which would allow any website to infect or format a visitor's PC."
      },
      {
        id: "m0-q4",
        question: "How did the typical hardware limitations of 1995 PCs (4MB–8MB RAM) affect the choice of scripting languages in early browsers?",
        options: [
          "It made running large sandboxed compiler systems like C++ libraries memory-prohibitive",
          "It meant browsers could only display text documents with no images",
          "It forced developers to use floppy disks to run scripts",
          "It had no effect because memory was unlimited"
        ],
        answerIndex: 0,
        explanation: "In 1995, standard home computers had only 4 MB to 8 MB of RAM. Running a complex sandboxed compiler runtime would consume all system resources, so browsers required a lightweight, interpreted scripting language."
      },
      {
        id: "m0-q5",
        question: "Which feature of JavaScript automatically reclaims unused memory, eliminating the need to manually free memory?",
        options: [
          "Manual Pointer Arithmetic",
          "Automatic Hoisting",
          "Garbage Collection",
          "WebAssembly Sandboxing"
        ],
        answerIndex: 2,
        explanation: "JavaScript has automatic memory management called Garbage Collection. The engine periodically scans and reclaims memory allocated for objects that are no longer referenced, preventing memory leaks and pointer bugs."
      }
    ],
    debugging: {
      id: "m0-debug",
      description: "Fix the console logging syntax typo. The function should print 'Welcome to JS Academy' to the developer console, but the keyword 'console' is misspelled.",
      buggyCode: `function logMessage() {
  consl.log("Welcome to JS Academy");
}`,
      correctCode: `function logMessage() {
  console.log("Welcome to JS Academy");
}`,
      testCases: [
        {
          input: [],
          expected: undefined,
          description: "logMessage() should run successfully without throwing a ReferenceError"
        }
      ]
    },
    implementation: {
      id: "m0-impl",
      description: "Create a function called 'welcomeToJS' that takes no parameters and returns the exact string: 'Welcome to JavaScript!'.",
      initialCode: `function welcomeToJS() {
  // Write your code here
  
}`,
      correctCode: `function welcomeToJS() {
  return "Welcome to JavaScript!";
}`,
      testCases: [
        {
          input: [],
          expected: "Welcome to JavaScript!",
          description: "welcomeToJS() returns 'Welcome to JavaScript!'"
        }
      ]
    }
  },
  {
    id: "module-1",
    title: "Lecture 01: Variables & Data Types",
    description: "Learn how to store data using variables and understand JS primitives.",
    notes: `# Lecture 01: Data Types in JavaScript

## Why Data Types Exist

Computer memory is just bytes — raw 0s and 1s. The same sequence \`01001000\` could mean the number \`72\`, the character \`'H'\`, a memory address, or \`true\`.

**A data type is a label that tells the computer:**
1. How many bytes to use for this value
2. What operations make sense on it (multiply? uppercase?)

### JavaScript's Design Choice

Java requires declaring types upfront: \`int x = 5;\`

JavaScript (created by Brendan Eich in 1995 for web designers, not programmers) took a different approach: **let variables hold any type and figure it out at runtime.** This one decision explains everything interesting — and annoying — about JS types.

---

## Variable Declarations

### \`const\`

- **Scope:** Block \`{ ... }\`
- **Reassignment:** ❌ Not allowed — throws \`TypeError\`
- **Initialization:** ✅ Required at declaration
- **Hoisting:** Hoisted but uninitialized → **Temporal Dead Zone (TDZ)**
- **Mutability:** The *reference* is constant, not the value — object properties can still change

\`\`\`javascript
const PI = 3.14159;
// PI = 3; ❌ TypeError

const CONFIG = { port: 8080 };
CONFIG.port = 3000; // ✅ Allowed — same reference, mutated value

// console.log(MY_CONST); ❌ ReferenceError (TDZ)
const MY_CONST = 100;
\`\`\`

---

### \`let\`

- **Scope:** Block \`{ ... }\`
- **Reassignment:** ✅ Allowed
- **Initialization:** Optional (defaults to \`undefined\`)
- **Hoisting:** Hoisted but uninitialized → **TDZ**

\`\`\`javascript
let counter = 0;
counter = 1; // ✅ Allowed

let name; // undefined
name = "Alice";

// console.log(myLetVar); ❌ ReferenceError (TDZ)
let myLetVar = "test";
\`\`\`

---

### \`var\`

> ⚠️ **Avoid in modern JS (ES6+)**

- **Scope:** Function (not block) — leaks out of \`if\`, \`for\`, etc.
- **Reassignment & Redeclaration:** ✅ Both allowed
- **Hoisting:** Hoisted and initialized to \`undefined\`

\`\`\`javascript
if (true) {
  var leak = "visible outside";
}
console.log(leak); // ✅ "visible outside" — leaks!

console.log(myVar); // undefined (no error — hoisted)
var myVar = "Hello";

var x = 10;
var x = 20; // ✅ Redeclaration allowed
\`\`\`

---

### Variable Scoping & Behavior Comparison

*   **\`const\`** (Modern default):
    *   **Scope:** Block \`{ ... }\` (restricted to matching brackets)
    *   **Reassignable:** ❌ No (causes a \`TypeError\` if reassigned)
    *   **Redeclarable:** ❌ No
    *   **Hoisting Value:** Temporarily inaccessible (Temporal Dead Zone - TDZ)
    *   **Attaches to \`window\`:** ❌ No
*   **\`let\`** (Use when variable values change):
    *   **Scope:** Block \`{ ... }\`
    *   **Reassignable:** ✅ Yes
    *   **Redeclarable:** ❌ No
    *   **Hoisting Value:** Temporarily inaccessible (Temporal Dead Zone - TDZ)
    *   **Attaches to \`window\`:** ❌ No
*   **\`var\`** (Legacy JS — avoid in modern programming):
    *   **Scope:** Function scope (ignores blocks like \`if\` or \`for\`, leaking values)
    *   **Reassignable:** ✅ Yes
    *   **Redeclarable:** ✅ Yes
    *   **Hoisting Value:** Hoisted and initialized to \`undefined\` (does not throw a ReferenceError)
    *   **Attaches to \`window\`:** ✅ Yes

---

## Data Types

### 1. Primitive Types

Primitives are **immutable** — operations don't change them, they create new values. Variables store the value directly.

There are **7 primitive types:**

---

#### \`string\`
Textual data. Use \`'\`, \`\"\`, or \` \` \` (template literals).

\`\`\`javascript
let name = "Alice";
let greeting = 'Hello, World!';
let template = \`User: \${name}\`; // embeds expressions
\`\`\`

---

#### \`number\`
Both integers and floats — no distinction in JS.

\`\`\`javascript
let intVal = 100;
let floatVal = 3.14;
let bad = NaN;       // result of invalid math like 0/0
let inf = Infinity;
\`\`\`

---

#### \`boolean\`

\`\`\`javascript
let isActive = true;
let isDone = false;
\`\`\`

---

#### \`undefined\`
A variable declared but **not assigned** — JS sets it to \`undefined\` automatically.

\`\`\`javascript
let user;
console.log(user); // undefined
\`\`\`

---

#### \`null\`
Intentional absence of value — explicitly assigned by the developer.

\`\`\`javascript
let data = null;
\`\`\`

> **\`null\` vs \`undefined\`:**
> - \`undefined\` = declared, nothing assigned (JS's default)
> - \`null\` = explicitly set to "no value" (developer's intent)

---

#### \`bigint\`
For integers larger than \`Number.MAX_SAFE_INTEGER\`. Add \`n\` suffix.

\`\`\`javascript
const huge = 9007199254740991n;
const another = BigInt(9007199254740992);
\`\`\`

---

#### \`symbol\`
Unique, anonymous identifiers — mainly used as object keys to avoid collisions.

\`\`\`javascript
const id1 = Symbol('id');
const id2 = Symbol('id');
console.log(id1 === id2); // false — every symbol is unique
\`\`\`

---

### 2. Object Type (Non-Primitive)

Objects are **mutable** collections of key-value pairs. Variables don't store the object — they store a **reference** (pointer) to it in memory.

\`\`\`javascript
// Object literal
let person = { firstName: "John", age: 30 };

// Array (specialized object)
let nums = [10, 20, 30];

// Function (also an object in JS)
function greet() { console.log("Hello"); }
\`\`\`

Other built-ins: \`Date\`, \`Map\`, \`Set\`, \`RegExp\`, etc.

---

### Value vs. Reference — The Critical Difference

#### Primitives → copied by **value**

\`\`\`javascript
let a = 10;
let b = a; // copies the value

b = 20;
console.log(a); // 10 — unaffected
console.log(b); // 20
\`\`\`

#### Objects → copied by **reference**

\`\`\`javascript
let obj1 = { value: 10 };
let obj2 = obj1; // copies the reference — same object!

obj2.value = 20;
console.log(obj1.value); // 20 — obj1 is affected too
console.log(obj2.value); // 20
\`\`\`

Both variables point to the **same object in memory**.

---

### The \`typeof\` Operator

\`\`\`javascript
typeof "Hello"       // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof 10n           // "bigint"
typeof Symbol('id')  // "symbol"

typeof { a: 1 }      // "object"
typeof [1, 2, 3]     // "object"
typeof function(){}  // "function"
typeof null          // "object"  ← known JS bug, not a real object
\`\`\`

> ⚠️ \`typeof null === "object"\` is a historical bug in JS — \`null\` is a primitive, not an object.
`,
    quiz: [
      {
        id: "m1-q1",
        question: "What is the primary role of a data type label in computer memory?",
        options: [
          "It determines the memory address speed",
          "It tells the computer how many bytes to use and what operations are valid on that data",
          "It converts binary code into assembly language",
          "It automatically encrypts the variable value"
        ],
        answerIndex: 1,
        explanation: "Computer memory stores raw binary data (0s and 1s). A data type specifies the layout of this memory (how many bytes) and the operations allowed on the data (e.g. adding numbers vs. uppercasing strings)."
      },
      {
        id: "m1-q2",
        question: "How does JavaScript handle variable types compared to languages like Java?",
        options: [
          "JS requires declaring types upfront (e.g., int x = 5)",
          "JS variables are strictly bound to one type at compilation time",
          "JS lets variables hold any type and resolves the type at runtime",
          "JS does not support types at all"
        ],
        answerIndex: 2,
        explanation: "JavaScript is a dynamically typed language. Unlike statically typed languages like Java, variables in JS are not tied to a single data type; they can hold values of any type, and types are resolved at runtime."
      },
      {
        id: "m1-q3",
        question: "What happens if you attempt to reassign a variable declared with 'const'?",
        options: [
          "It silently fails without error",
          "It automatically changes the variable to a 'let' variable",
          "It throws a TypeError",
          "It throws a ReferenceError"
        ],
        answerIndex: 2,
        explanation: "Reassigning a variable declared with const throws a TypeError because constants are read-only references that cannot be reassigned after initialization."
      },
      {
        id: "m1-q4",
        question: "Consider: const CONFIG = { port: 8080 }; CONFIG.port = 3000; What is the result?",
        options: [
          "It throws a TypeError because CONFIG is a const",
          "It is allowed because the object properties can be mutated, even though the reference is constant",
          "It is allowed but prints a warning to the console",
          "It throws a ReferenceError"
        ],
        answerIndex: 1,
        explanation: "For object types, const protects the reference pointer itself from being changed, but it does not make the object properties immutable. You can mutate the properties of a const object."
      },
      {
        id: "m1-q5",
        question: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
        options: [
          "The period before a script is loaded by the browser",
          "The state of a variable after it is garbage collected",
          "The period between block entry and variable declaration where accessing let/const throws a ReferenceError",
          "The time it takes for a promise to resolve"
        ],
        answerIndex: 2,
        explanation: "The TDZ is the period starting from block entry until the let or const variable's declaration is executed. Accessing the variable before its declaration within this zone throws a ReferenceError."
      },
      {
        id: "m1-q6",
        question: "What is a major scope difference between 'var' and 'let'?",
        options: [
          "var is function-scoped and can leak out of block scopes like 'if' and 'for', while let is block-scoped",
          "let is function-scoped, while var is block-scoped",
          "var is global-scoped only, while let is local-scoped only",
          "There is no difference in scoping"
        ],
        answerIndex: 0,
        explanation: "var is function-scoped (restricted only by function boundaries) and leaks out of blocks like if-statements or loops. let is block-scoped, restricted to the closest enclosing curly braces {}."
      },
      {
        id: "m1-q7",
        question: "If you access a 'var' variable before its declaration, what is its value due to hoisting?",
        options: [
          "It throws a ReferenceError",
          "It throws a TypeError",
          "It is 'undefined'",
          "It is 'null'"
        ],
        answerIndex: 2,
        explanation: "Variables declared with var are hoisted and initialized to undefined by default during the compilation phase, so accessing them before their declaration line evaluates to undefined instead of throwing a ReferenceError."
      },
      {
        id: "m1-q8",
        question: "Which statement is true about primitive types in JavaScript?",
        options: [
          "They are mutable and passed by reference",
          "They are immutable, and operations on them return new values",
          "They are always stored in heap memory as objects",
          "There are only 3 primitive types in JavaScript"
        ],
        answerIndex: 1,
        explanation: "JavaScript primitives (like strings, numbers, and booleans) are completely immutable. Operations like string concatenation do not change the original string but return a brand new string."
      },
      {
        id: "m1-q9",
        question: "What happens when you copy an object variable (e.g., obj2 = obj1)?",
        options: [
          "A deep copy of all values is created in a new memory location",
          "A new object is created, but it inherits the prototype of the original",
          "The reference (pointer) to the object is copied, so both variables point to the same memory object",
          "The assignment is ignored and obj2 remains undefined"
        ],
        answerIndex: 2,
        explanation: "Objects in JavaScript are stored and copied by reference. When you assign obj2 = obj1, you copy the reference pointer, meaning both variables point to the exact same object in memory."
      },
      {
        id: "m1-q10",
        question: "What is the result of 'typeof null' and why?",
        options: [
          "'null', because null is a primitive type",
          "'undefined', because null is uninitialized",
          "'object', due to a historical bug in JavaScript",
          "'boolean', because it represents falsiness"
        ],
        answerIndex: 2,
        explanation: "Due to a historical bug in the first implementation of JavaScript, typeof null evaluates to 'object'. Historically, null was represented as all zeros, which was the same type tag used for objects."
      }
    ],
    debugging: {
      id: "m1-debug",
      description: "Fix the variable declaration bug. The constant variable 'apiKey' is being reassigned, which causes a TypeError. Change the declaration so it can be reassigned, or adjust the reassignment.",
      buggyCode: `function getApiUrl() {
  const apiKey = "12345";
  apiKey = "abcde"; // Bug! Reassigning a const
  return "https://api.com?key=" + apiKey;
}`,
      correctCode: `function getApiUrl() {
  let apiKey = "12345";
  apiKey = "abcde";
  return "https://api.com?key=" + apiKey;
}`,
      testCases: [
        {
          input: [],
          expected: "https://api.com?key=abcde",
          description: "getApiUrl() should return url with 'abcde'"
        }
      ]
    },
    implementation: {
      id: "m1-impl",
      description: "Create a function called 'describePerson' that takes two parameters: 'name' (string) and 'age' (number). It should return a string format: 'Name is [name] and age is [age]'.",
      initialCode: `function describePerson(name, age) {
  // Write your code here
  
}`,
      testCases: [
        {
          input: ["Sujal", 20],
          expected: "Name is Sujal and age is 20",
          description: "describePerson('Sujal', 20)"
        },
        {
          input: ["Alice", 25],
          expected: "Name is Alice and age is 25",
          description: "describePerson('Alice', 25)"
        }
      ]
    }
  },
  {
    id: "module-2",
    title: "Lecture 02: Operator and Data type in JS",
    description: "Learn how to perform calculations, convert types, and compare values in JS.",
    notes: `# Lecture 02: Operator and Data type in JS

That one physical reality splits every JavaScript value into two families:

| Family | Stored & copied as | Mutable? | Comparison checks |
| --- | --- | --- | --- |
| **Primitives** | the value itself (**by value**) | No (immutable) | the actual contents |
| **Objects** | an address (**by reference**) | Yes (mutable) | the address, not the contents |

\`\`\`javascript
Every JS value
├── Primitives  (by value, immutable)
│   ├── number      → math
│   ├── string      → text
│   ├── boolean     → true / false
│   ├── undefined   → not assigned (engine's emptiness)
│   ├── null        → empty on purpose (your emptiness)
│   ├── bigint      → huge integers
│   └── symbol      → guaranteed-unique id
└── Objects     (by reference, mutable)
    ├── {}          → key → value
    ├── []          → ordered lists
    ├── function    → reusable code
    └── ...everything that isn't a primitive
\`\`\`

### **In-Depth Lecture Notes: JavaScript Operators**

### **1. Introduction: What is an Operator?**

In JavaScript, an **operator** is a special symbol or keyword used to perform an operation on values. The values that the operator works on are called **operands**. The combination of operators and operands forms an **expression**, which evaluates to a single value.

\`\`\`javascript
// In this expression: 5 + 10
// -> \`+\` is the operator.
// -> \`5\` and \`10\` are the operands.
// -> The entire expression \`5 + 10\` evaluates to the value \`15\`.
let result = 5 + 10;
\`\`\`

---

### **2. Assignment Operators**

These operators are used to assign a value to a variable.

- **= (Assignment):** The fundamental assignment operator. It assigns the value on its right to the variable on its left.
    
    \`\`\`javascript
    let score = 100;
    \`\`\`
    
- **Compound Assignment (Shorthands):** These combine a mathematical operation with an assignment. They are very common and make code more concise.

| Operator | Example | Equivalent To |
| --- | --- | --- |
| += | x += y | x = x + y |
| -= | x -= y | x = x - y |
| *= | x *= y | x = x * y |
| /= | x /= y | x = x / y |
| %= | x %= y | x = x % y |
| **= | x **= y | x = x ** y |

\`\`\`javascript
let level = 10;
level += 5; // level is now 15
level *= 2; // level is now 30
\`\`\`

---

### **3. Arithmetic Operators**

Used for standard mathematical calculations.

- + (Addition)
- - (Subtraction)
- * (Multiplication)
- / (Division)
- ** (Exponentiation - ES2016): \`2 ** 3\` evaluates to \`8\`.
- % (Remainder / Modulo): Returns the remainder of a division. This is extremely useful for tasks like checking if a number is even or odd.
    
    \`\`\`javascript
    console.log(10 % 3); // 1 (10 divided by 3 is 3, with a remainder of 1)
    console.log(10 % 2); // 0 (An even number always has a remainder of 0 when divided by 2)
    \`\`\`
    
- ++ (Increment) & -- (Decrement): Increases or decreases a number by 1.
    - **Gotcha: Prefix vs. Postfix.** The position of the operator matters critically.
    - **Postfix (variable++):** The expression evaluates to the variable's **original value**, and *then* the variable is incremented.
    - **Prefix (++variable):** The variable is incremented **first**, and *then* the expression evaluates to the **new value**.
    
    \`\`\`javascript
    let postfix = 5;
    let prefix = 5;
    
    console.log(postfix++); // Prints 5. \`postfix\` is now 6.
    console.log(postfix);   // Prints 6.
    
    console.log(++prefix); // Prints 6. \`prefix\` is now 6.
    console.log(prefix);   // Prints 6.
    \`\`\`
    

---

### **4. Comparison Operators**

These operators compare two values and evaluate to a boolean (true or false).

- > (Greater than)
- < (Less than)
- >= (Greater than or equal to)
- <= (Less than or equal to)

**The Most Critical Concept: Strict vs. Loose Equality**

- **== (Loose Equality):** Compares two values for equality **after** performing type coercion (automatic type conversion). **AVOID THIS OPERATOR.** It has complex rules and can lead to very confusing bugs.
    
    \`\`\`javascript
    console.log(7 == "7");   // true (string "7" is coerced to number 7)
    console.log(0 == false); // true (boolean false is coerced to number 0)
    \`\`\`
    
- **=== (Strict Equality):** Compares two values for equality **without** performing type coercion. It checks if both the **value AND the type** are identical. **ALWAYS PREFER THIS OPERATOR.**
    
    \`\`\`javascript
    console.log(7 === "7");   // false (number is not a string)
    console.log(0 === false); // false (number is not a boolean)
    \`\`\`
    
- != (Loose Inequality) & !== (Strict Inequality): The same rules apply. Always prefer !==.

---

### **5. Logical Operators**

Used to combine boolean expressions, typically in if statements.

- **&& (Logical AND):** Evaluates to true only if **both** operands are true (or "truthy").
    - **Short-Circuiting:** If the left-hand operand is false, the right-hand operand is **never evaluated**. This is a powerful feature for preventing errors.
    
    \`\`\`javascript
    let user = null;
    // This is safe. The code stops at \`user\` and never tries to access \`user.name\`.
    if (user && user.name === "Admin") { /* ... */ }
    \`\`\`
    
- **|| (Logical OR):** Evaluates to true if **either** operand is true.
    - **Short-Circuiting:** If the left-hand operand is true, the right-hand operand is **never evaluated**. This is commonly used to provide default values.
    
    \`\`\`javascript
    let username = ""; // an empty string is "falsy"
    let displayName = username || "Guest"; // displayName becomes "Guest"
    \`\`\`
    
- **! (Logical NOT):** Inverts the boolean value of its operand. It coerces the operand to a boolean first, then flips it.
    
    \`\`\`javascript
    let isLoggedIn = false;
    if (!isLoggedIn) {
      console.log("Please log in.");
    }
    \`\`\`
    

**Important Note: "Truthy" and "Falsy"**

When used in a logical context, every value in JavaScript has an inherent boolean value.

- **The 6 Falsy Values:** false, 0, "" (empty string), null, undefined, NaN.
- **Everything else is Truthy**, including "false", [] (an empty array), and {} (an empty object).

---

### **6. Bitwise Operators**

These are less common in web development but are important to know. They operate on the binary (base-2) representation of numbers. **Do not confuse & with && or | with ||.**

| Operator | Name | Description | Example (5 is 101, 3 is 011) |
| --- | --- | --- | --- |
| & | AND | Sets each bit to 1 if both bits are 1. | 5 & 3 -> 1 (001) |
| | | OR | Sets each bit to 1 if one of two bits is 1. | 5 | 3 -> 7 (111) |
| ^ | XOR | Sets each bit to 1 if only one of two bits is 1. | 5 ^ 3 -> 6 (110) |
| ~ | NOT | Inverts all the bits. | ~5 -> -6 |
| << | Left Shift | Shifts bits to the left, padding with zeros. | 5 << 1 -> 10 (1010) |
| >> | Right Shift | Shifts bits to the right. | 5 >> 1 -> 2 (010) |

---

### **7. Other Important Operators**

- **typeof (Unary Operator):** Returns a string indicating the type of an operand.
    
    \`\`\`javascript
    console.log(typeof 42);       // "number"
    console.log(typeof "hello");  // "string"
    console.log(typeof null);     // "object" (This is a famous, long-standing bug)
    \`\`\`
    
- **Ternary Operator (? :):** A compact shorthand for an if...else statement. It's the only operator that takes three operands.
    - **Syntax:** condition ? expressionIfTrue : expressionIfFalse
    
    \`\`\`javascript
    let age = 20;
    let message = (age >= 18) ? "You can vote." : "You cannot vote yet.";
    console.log(message); // "You can vote."
    \`\`\`
    

---

### **8. Operator Precedence**

This determines the order in which operators are executed. For example, multiplication (*) has a higher precedence than addition (+).

\`\`\`javascript
let result = 2 + 3 * 5; // result is 17, not 25
\`\`\`

**Best Practice:** Don't memorize the entire precedence table. When in doubt, use parentheses () to make the order explicit and your code more readable.

\`\`\`javascript
let result = (2 + 3) * 5; // result is 25. The intent is perfectly clear.
\`\`\`

---

## How numbers are stored in Javascript

Why 0.1 + 0.2 = 0.30000000000000004

**The computer thinks in Base 2 (binary), but we are giving it a problem in Base 10 (decimal). The translation is not perfect.**

Imagine you have a calculator that can only store **10 binary places** after the decimal point.

---

### Step 1: Translate 0.1 (Decimal) to Binary

We'll use our "multiply by 2" method to find the first 10 binary places for 0.1.

1. 0.1 * 2 = 0.2 -> **0**
2. 0.2 * 2 = 0.4 -> **0**
3. 0.4 * 2 = 0.8 -> **0**
4. 0.8 * 2 = 1.6 -> **1**
5. 0.6 * 2 = 1.2 -> **1**
6. 0.2 * 2 = 0.4 -> **0** (The pattern starts repeating here)
7. 0.4 * 2 = 0.8 -> **0**
8. 0.8 * 2 = 1.6 -> **1**
9. 0.6 * 2 = 1.2 -> **1**
10. 0.2 * 2 = 0.4 -> **0**

Because our calculator can only store 10 places, it has to stop here.

- **0.1 (Decimal) gets stored as 0.0001100110 (Binary)**

Now, what is the *actual* decimal value of this stored binary number? Let's add up the place values (1/16 + 1/32 + 1/256 ...):

0.0001100110 (Binary) = **0.10009765625** (Decimal)

As you can see, a tiny **rounding error** has already occurred. Our calculator is storing a number that is slightly *larger* than 0.1.

---

### Step 2: Translate 0.2 (Decimal) to Binary

Now we do the same for 0.2.

1. 0.2 * 2 = 0.4 -> **0**
2. 0.4 * 2 = 0.8 -> **0**
3. 0.8 * 2 = 1.6 -> **1**
4. 0.6 * 2 = 1.2 -> **1**
5. 0.2 * 2 = 0.4 -> **0** (The pattern repeats)
6. 0.4 * 2 = 0.8 -> **0**
7. 0.8 * 2 = 1.6 -> **1**
8. 0.6 * 2 = 1.2 -> **1**
9. 0.2 * 2 = 0.4 -> **0**
10. 0.4 * 2 = 0.8 -> **0**

- **0.2 (Decimal) gets stored as 0.0011001100 (Binary)**

What is the decimal value of this stored binary?

0.0011001100 (Binary) = **0.19921875** (Decimal)

Again, a tiny **rounding error**. Our calculator is storing a number that is slightly *smaller* than 0.2.

---

### Step 3: The Sum (0.1 + 0.2)

The computer doesn't see 0.1 + 0.2. It sees the **approximations** it has stored.

  0.10009765625 (the stored version of 0.1)
+ 0.19921875 (the stored version of 0.2)
-----------------
  **0.29931640625**

This is the actual result of the sum.

---

### Step 4: The Comparison with 0.3

Now, the user expects the result to be 0.3. But what does the calculator store for 0.3?

Let's convert 0.3 to 10 binary places:

1. 0.3 * 2 = 0.6 -> **0**
2. 0.6 * 2 = 1.2 -> **1**
3. 0.2 * 2 = 0.4 -> **0**
4. 0.4 * 2 = 0.8 -> **0**
5. 0.8 * 2 = 1.6 -> **1**
6. 0.6 * 2 = 1.2 -> **1** (The pattern repeats)
7. 0.2 * 2 = 0.4 -> **0**
8. 0.4 * 2 = 0.8 -> **0**
9. 0.8 * 2 = 1.6 -> **1**
10. 0.6 * 2 = 1.2 -> **1**

- **0.3 (Decimal) gets stored as 0.0100110011 (Binary)**

What is the decimal value of this stored binary?

0.0100110011 (Binary) = **0.2998046875** (Decimal)

---

### Conclusion: Why the Inaccuracy Occurs

Now we can show the user the final comparison the computer makes:

**Is 0.29931640625 (the sum) equal to 0.2998046875 (the stored 0.3)?**

**No. They are different.**

The inaccuracy occurs because:

1. **Imperfect Translation:** The numbers 0.1, 0.2, and 0.3 cannot be perfectly represented in binary.
2. **Rounding Errors:** The computer must cut off the infinite binary sequence, which creates tiny rounding errors for each number.
3. **Accumulated Errors:** The tiny, individual errors from 0.1 and 0.2 add up to a final result that is different from the tiny error produced when storing 0.3 directly.

---

## Conversion in JS

Converting data from one type to another is a fundamental task in JavaScript. This process is called **Type Conversion** or **Type Casting**.

There are two main ways this happens in JavaScript:

1. **Implicit Conversion (Coercion):** JavaScript does it automatically behind the scenes. This is what happens with the == operator. It can be convenient but is often a source of bugs because it's not obvious.
2. **Explicit Conversion:** You, the developer, intentionally write code to convert a value from one type to another. **This is the recommended, safe, and professional way to handle type conversions.**

Let's focus on **Explicit Conversion**.

---

### The "First Thought" Principle

The easiest way to think about explicit conversion is to use the **name of the type you want as a function.**

- Want a **Number**? Use Number().
- Want a **String**? Use String().
- Want a **Boolean**? Use Boolean().

This simple pattern is the most common and readable way to convert types.

---

### Converting to a String

This is the simplest conversion. Almost any value can be represented as a string.

### Method 1: The String() Function (Recommended)

This is the safest and most reliable method. It works for any value, including null and undefined.

\`\`\`javascript
let num = 123;
let strNum = String(num); // "123"

let bool = true;
let strBool = String(bool); // "true"

let value = null;
let strNull = String(value); // "null"

let arr = [1, 2];
let strArr = String(arr); // "1,2"
\`\`\`

---

### Converting to a Number

This is a very common task, especially when getting user input from the web, which is always a string.

### Method 1: The Number() Function (Recommended)

This is the most direct way. It follows a clear set of rules:

- "123" -> 123
- " 123 " (with spaces) -> 123
- "123.45" -> 123.45
- true -> 1
- false -> 0
- null -> 0
- undefined -> NaN
- "hello" (non-numeric string) -> NaN

\`\`\`javascript
let str = "99.5";
let num = Number(str); // 99.5

let strSpaces = "   100   ";
let numSpaces = Number(strSpaces); // 100

let invalidStr = "apple";
let notANumber = Number(invalidStr); // NaN
\`\`\`

### Method 2: parseInt() and parseFloat()

These functions are more specific. They parse a string from left to right and stop when they hit a non-numeric character.

- parseInt(): Parses for an integer.
- parseFloat(): Parses for a floating-point number.

\`\`\`javascript
parseInt("100px"); // 100 (it stops at 'p')
parseFloat("3.14em"); // 3.14 (it stops at 'e')

parseInt("Chapter 2"); // NaN (because it doesn't start with a number)

Number("100px"); // NaN (because the whole string is not a valid number)
\`\`\`

parseInt() is often useful for extracting a number from the beginning of a string.

### Method 3: The Unary Plus + Operator (A common trick)

Placing a + in front of a value is a concise way to convert it to a number, following the same rules as the Number() function.

\`\`\`javascript
let str = "50";
let num = +str; // 50 (as a number)
\`\`\`

---

### Converting to a Boolean

In JavaScript, every value has an inherent "truthiness." Converting to a boolean makes this explicit.

### Method 1: The Boolean() Function (Recommended)

This is the clearest way. The rules are simple: there is a small, specific list of "falsy" values. **Everything else is "truthy."**

**The 6 Falsy Values:**

1. false
2. 0 (the number zero)
3. "" (an empty string)
4. null
5. undefined
6. NaN

\`\`\`javascript
Boolean(0);        // false
Boolean("");       // false
Boolean(null);     // false
Boolean(undefined); // false
Boolean(NaN);      // false

// Everything else is truthy!
Boolean(100);       // true
Boolean("hello");   // true
Boolean("false");   // true (a non-empty string is truthy)
Boolean([]);        // true (an empty array is an object, and is truthy)
Boolean({});        // true (an empty object is truthy)
\`\`\`

---

## How to compare values

---

### Part 1: The Strict Equality Operator (===, !==)

This one is simple because it has only one rule.

- **Rule 1: Check the Types.**
    - If the types are **different**, the result is false. No coercion happens.
    - If the types are the **same**, compare the values:
        - For primitives (number, string, boolean), the values are equal if they are the same.
        - For null and undefined, they are only equal to themselves.
        - For objects (including arrays), the references must point to the **exact same object in memory**.
        - **Special Case:** NaN === NaN is always false.

---

### Part 2: The Loose Equality Operator (==, !=)

This is the **Abstract Equality Comparison Algorithm**. The engine checks these rules in order.

- **Rule 1: Same Types.**
    - If the operands have the **same type**, behave exactly like the strict equality operator (===).
- **Rule 2: null and undefined Special Case.**
    - If one operand is null and the other is undefined, the result is true.
- **Rule 3: String and Number.**
    - If one operand is a string and the other is a number, convert the string to a number and re-compare.
- **Rule 4: Boolean Conversion.**
    - If one operand is a boolean, convert the boolean to a number (true -> 1, false -> 0) and re-compare.
- **Rule 5: Object and Primitive.**
    - If one operand is an object and the other is a string, number, or symbol, convert the object to a primitive (by calling valueOf() then toString()) and re-compare.
- **Rule 6: Default.**
    - If none of the above rules apply, the result is false.

---

### Part 3: The Relational Operators (<, >, <=, >=)

This is the **Abstract Relational Comparison Algorithm**. It has a different, simpler (but still tricky) set of rules. The engine's first step is to get a primitive value from both operands.

- **Step 1: Convert to Primitives (if necessary).**
    - If an operand is an object, convert it to a primitive by calling its valueOf() and then toString() methods. The rest of the rules will operate on these new primitive values.
- **Rule 1: String vs. String.**
    - If **both** operands are strings (after the initial conversion step), perform a **lexicographical (dictionary) comparison** character by character. Do **not** convert them to numbers.
- **Rule 2: The Default Numeric Conversion.**
    - In **all other cases**, convert **both** operands to numbers and perform a numeric comparison.
    - **Coercion Details for this rule:**
        - strings are parsed ("5" -> 5, "hello" -> NaN).
        - booleans are converted (true -> 1, false -> 0).
        - null is converted to 0.
        - undefined is converted to NaN.
    - **Special Case:** If either of the final numbers is NaN, the result of the comparison is **always false**.

---

### A Simple Decision Tree for Comparisons

Here is a mental checklist you can follow when you see a comparison:

**1. Is the operator === or !==?**

- **YES:** No coercion. Are the type and value identical? Done.

**2. Is the operator == or !=?**

- Are the types the same? -> Compare values.
- Is it null == undefined? -> true.
- Is a boolean involved? -> Convert boolean to number, then restart the check.
- Is a string and number involved? -> Convert string to number, then compare.
- Is an object involved? -> Convert object to primitive, then restart the check.

**3. Is the operator <, >, <=, or >=?**

- Are **both** sides strings? -> Use dictionary rules.
- **NO?** -> Convert **both** sides to numbers (null->0, undefined->NaN) and do a numeric comparison. If NaN appears, the result is false.

This ordered breakdown reveals why the behavior is so complex: there are three distinct sets of rules, and the rules for loose equality (==) are very different from the rules for relational comparisons (>=).`,
    quiz: [
      {
        id: "m2-q1",
        question: "What is the difference between postfix increment (x++) and prefix increment (++x)?",
        options: [
          "Postfix increments the variable after the surrounding expression is evaluated; prefix increments it first",
          "Prefix increments the variable after the surrounding expression is evaluated; postfix increments it first",
          "Postfix works on numbers, while prefix works on strings",
          "Postfix is faster than prefix"
        ],
        answerIndex: 0,
        explanation: "In postfix (x++), the expression evaluates to the variable's original value first, then the variable is incremented. In prefix (++x), the variable is incremented first, and the expression evaluates to the new value."
      },
      {
        id: "m2-q2",
        question: "Which of the following values is NOT one of the six falsy values in JavaScript?",
        options: [
          "0 (the number zero)",
          "\"\" (an empty string)",
          "[] (an empty array)",
          "NaN"
        ],
        answerIndex: 2,
        explanation: "The six falsy values are false, 0, \"\", null, undefined, and NaN. Objects, including empty arrays [] and empty objects {}, are truthy."
      },
      {
        id: "m2-q3",
        question: "What does the expression 0.1 + 0.2 === 0.3 evaluate to and why?",
        options: [
          "true, because 0.1 + 0.2 is mathematically exactly equal to 0.3",
          "false, because numbers are represented in binary floating-point, leading to tiny rounding errors that accumulate",
          "true, because JavaScript automatically rounds all floats to 1 decimal place",
          "false, because JavaScript cannot add floating-point numbers"
        ],
        answerIndex: 1,
        explanation: "JavaScript numbers are stored as binary floating-point numbers. Since 0.1, 0.2, and 0.3 cannot be represented perfectly in binary, rounding errors accumulate during addition, making 0.1 + 0.2 evaluate to 0.30000000000000004, which is not strictly equal to 0.3."
      },
      {
        id: "m2-q4",
        question: "How does strict equality (===) compare objects and arrays?",
        options: [
          "It compares their keys and values character-by-character",
          "It returns true if they have identical keys in the same order",
          "It returns true only if they refer to the exact same object/address in memory",
          "It converts them to strings and compares their string representations"
        ],
        answerIndex: 2,
        explanation: "For objects and arrays, strict equality (===) compares by reference, not by value. Two separate objects in memory are never equal, even if they have the exact same contents. They must point to the same reference."
      },
      {
        id: "m2-q5",
        question: "What is the resulting type and value of: let x = '50'; let y = +x;?",
        options: [
          "y is a string with value '50'",
          "y is a number with value 50",
          "y is a boolean with value true",
          "y is a number with value NaN"
        ],
        answerIndex: 1,
        explanation: "The unary plus operator (+) placed before a value is a shorthand way to explicitly convert that value to a number. It performs the same coercion rules as the Number() function."
      },
      {
        id: "m2-q6",
        question: "What is the difference between parseInt('100px') and Number('100px')?",
        options: [
          "parseInt throws an error, while Number returns 100",
          "parseInt returns 100, while Number returns NaN",
          "parseInt returns NaN, while Number returns 100",
          "Both return NaN"
        ],
        answerIndex: 1,
        explanation: "parseInt() parses a string from left to right and extracts the numeric part until it hits a non-numeric character ('p'). Number() requires the entire string to be a valid numeric representation; otherwise, it returns NaN."
      },
      {
        id: "m2-q7",
        question: "What is logical short-circuiting in a double OR (||) operation?",
        options: [
          "The engine stops evaluating as soon as it encounters a falsy value",
          "If the left-hand operand is truthy, the engine returns it and never evaluates the right-hand operand",
          "The engine evaluates the right-hand operand first to check for errors",
          "It forces the engine to run operations in parallel"
        ],
        answerIndex: 1,
        explanation: "In an OR (||) operation, if the left-hand operand is true (or truthy), the entire expression is guaranteed to be true. The engine 'short-circuits' and returns the left operand immediately without evaluating the right side."
      },
      {
        id: "m2-q8",
        question: "What does the expression 'typeof null' evaluate to?",
        options: [
          "\"null\"",
          "\"undefined\"",
          "\"object\"",
          "\"error\""
        ],
        answerIndex: 2,
        explanation: "Due to a historical bug in the original design of JavaScript, typeof null evaluates to the string \"object\". Despite this, null is a primitive type, not an object."
      },
      {
        id: "m2-q9",
        question: "What is the result of the relational comparison: null >= 0 and why?",
        options: [
          "true, because null is coerced to the number 0 during relational comparisons",
          "false, because null is empty and cannot be compared to a number",
          "true, because null is equal to undefined",
          "false, because any comparison with null is NaN"
        ],
        answerIndex: 0,
        explanation: "During relational comparisons (<, >, <=, >=), if operands are not both strings, they are coerced to numbers. null is coerced to 0, which makes the comparison 0 >= 0 evaluate to true."
      },
      {
        id: "m2-q10",
        question: "What is the result of the bitwise XOR operation: 5 ^ 3?",
        options: [
          "15",
          "8",
          "6",
          "2"
        ],
        answerIndex: 2,
        explanation: "In binary, 5 is 101 and 3 is 011. The XOR (exclusive OR) operator comparison sets each bit to 1 if exactly one of the bits is 1. This evaluates bitwise to 110, which is the number 6 in decimal."
      }
    ],
    debugging: {
      id: "m2-debug",
      description: "Fix the comparison operator. The function checks if a number is even, but it is currently using the assignment operator '=' instead of equality '===', causing a syntax/logical error.",
      buggyCode: `function isEven(num) {
  if (num % 2 = 0) { // Bug here
    return true;
  } else {
    return false;
  }
}`,
      correctCode: `function isEven(num) {
  if (num % 2 === 0) {
    return true;
  } else {
    return false;
  }
}`,
      testCases: [
        {
          input: [4],
          expected: true,
          description: "isEven(4) should be true"
        },
        {
          input: [7],
          expected: false,
          description: "isEven(7) should be false"
        }
      ]
    },
    implementation: {
      id: "m2-impl",
      description: "Write a function 'getTicketPrice(age)' that returns the ticket price based on age rules:\n- Age < 5: 0 (free)\n- Age >= 5 and Age < 18: 10\n- Age >= 18 and Age < 65: 20\n- Age >= 65: 12 (senior discount)",
      initialCode: `function getTicketPrice(age) {
  // Write your code here
  
}`,
      testCases: [
        {
          input: [3],
          expected: 0,
          description: "getTicketPrice(3) -> 0"
        },
        {
          input: [12],
          expected: 10,
          description: "getTicketPrice(12) -> 10"
        },
        {
          input: [25],
          expected: 20,
          description: "getTicketPrice(25) -> 20"
        },
        {
          input: [70],
          expected: 12,
          description: "getTicketPrice(70) -> 12"
        }
      ]
    }
  }
,
  {
    id: "module-3",
    title: "Lecture 03: Loop, Number, math and String",
    description: "Master conditionals, for/while/do-while loops, floating-point numbers, random algorithms, and string manipulation.",
    notes: `# Lecture 03: Loop, Number, math and String

## if-else in Js

It's like deciding what to wear:

1. **Question 1 (if):** "Is it raining?"
    - **YES?** -> Put on a raincoat. (Stop here, you're done.)
    - **NO?** -> Move to the next question.
2. **Question 2 (else if):** "Okay, is it sunny?"
    - **YES?** -> Put on sunglasses. (Stop here, you're done.)
    - **NO?** -> Move to the next question.
3. **The Fallback (else):** "Since nothing else was true..."
    - Just wear a regular sweater.

---

### 1. The Basic if Statement

The if statement is the starting point. It checks a single condition. If that condition is true, the code inside its curly braces {} will run. If the condition is false, the code block is completely skipped.

**Structure:**

\`\`\`javascript
if (condition) {
  // This code runs only if the condition is true.
}
\`\`\`

**Example:**

\`\`\`javascript
let temperature = 30;

if (temperature > 25) {
  console.log("It's a hot day! Wear shorts.");
}

// Code continues here...
\`\`\`

**Output:**

\`\`\`javascript
It's a hot day! Wear shorts.
\`\`\`

If we set temperature to 15, the condition 15 > 25 would be false, and nothing would be printed.

---

### 2. The if...else Statement

The else statement provides a "fallback" or "alternative" action. It runs only when the initial if condition is false.

**Structure:**

\`\`\`javascript
if (condition) {
  // This code runs if the condition is true.
} else {
  // This code runs if the condition is false.
}
\`\`\`

**Example:**

\`\`\`javascript
let age = 16;

if (age >= 18) {
  console.log("You are old enough to vote.");
} else {
  console.log("You are not old enough to vote yet.");
}
\`\`\`

**Output:**

\`\`\`javascript
You are not old enough to vote yet.
\`\`\`

One of these two blocks is **guaranteed** to run.

---

### 3. The if...else if...else Chain

This is the full decision-making chain. It allows you to check multiple, different conditions in order.

**Key Rule:** The chain is evaluated from top to bottom. The very **first condition that is true** gets its code block executed, and the rest of the entire chain is skipped.

**Structure:**

\`\`\`javascript
if (condition1) {
  // Runs if condition1 is true.
} else if (condition2) {
  // Runs if condition1 is false AND condition2 is true.
} else if (condition3) {
  // Runs if 1 and 2 are false AND condition3 is true.
} else {
  // Runs if ALL previous conditions were false.
}
\`\`\`

**Example: Grading a test score**

This is a classic use case. The order is very important here.

\`\`\`javascript
let score = 85;
let grade;

if (score >= 90) {
  grade = 'A';
} else if (score >= 80) {
  grade = 'B';
} else if (score >= 70) {
  grade = 'C';
} else if (score >= 60) {
  grade = 'D';
} else {
  grade = 'F';
}

console.log(\`Your grade is: \${grade}\`);
\`\`\`

---

## Loop in JS

### 1. The for Loop

The for loop is the most common type of loop. It's perfect when you know **exactly how many times you want to repeat** an action.

Think of it like setting a timer for a specific number of repetitions.

**Structure:**

The for loop has a specific structure with three parts inside its parentheses, separated by semicolons:

\`for (initialization; condition; final-expression) { ... }\`

1. **Initialization:** This runs **only once** at the very beginning. It's where you create your counter variable (traditionally named i for "index").
2. **Condition:** This is checked **before each repetition**. If the condition is true, the code inside the loop runs. If it becomes false, the loop stops.
3. **Final-Expression:** This runs **after each repetition**. It's where you usually increment your counter.

\`\`\`javascript
// Initialization: let i = 1; (Start a counter at 1)
// Condition: i <= 5; (Keep looping as long as i is less than or equal to 5)
// Final-Expression: i++; (After each loop, add 1 to i)

for (let i = 1; i <= 5; i++) {
  console.log("This is repetition number:", i);
}
\`\`\`

**Output:**

\`\`\`javascript
This is repetition number: 1
This is repetition number: 2
This is repetition number: 3
This is repetition number: 4
This is repetition number: 5
\`\`\`

The loop stops because after i becomes 5 and the code runs, the i++ makes i become 6. The condition 6 <= 5 is now false, so the loop terminates.

---

### 2. The while Loop

The while loop is simpler. It's perfect when you want to **keep looping as long as a certain condition is true**, but you don't necessarily know ahead of time how many repetitions that will be.

Think of it as saying, "Keep doing this *while* this is true."

**Structure:**

\`while (condition) { ... }\`

The while loop only has a condition. The initialization must happen *before* the loop, and the final-expression (the update to the variable) must happen *inside* the loop.

**Example: A simple game loop that runs until the player runs out of health.**

\`\`\`javascript
let playerHealth = 10;

while (playerHealth > 0) {
  console.log(\`Player health is \${playerHealth}. Attacking monster!\`);
  
  // Inside the loop, we must change the variable to avoid an infinite loop
  playerHealth -= 3; // Player takes 3 damage

  if (playerHealth <= 0) {
    console.log("Player has been defeated!");
  }
}
\`\`\`

**Output:**

\`\`\`javascript
Player health is 10. Attacking monster!
Player health is 7. Attacking monster!
Player health is 4. Attacking monster!
Player health is 1. Attacking monster!
Player has been defeated!
\`\`\`

**Critical Danger:** If you forget to change the condition variable inside a while loop (like forgetting playerHealth -= 3;), the condition will always be true, and your program will get stuck in an **infinite loop** and crash.

---

### 3. The do...while Loop

This is a less common variation of the while loop. Its unique feature is that the code inside the loop is **guaranteed to run at least once**.

The condition is checked **after** the code block runs, not before.

**Structure:**

\`do { ... } while (condition);\`

Think of it as "Do this, and then check if you should do it again."

**Example: Asking the user for input until they provide a valid response.**

You always want to ask the user at least once.

\`\`\`javascript
let userResponse;

do {
  // This code will always run at least one time
  userResponse = prompt("Please type 'yes' to continue:"); 
  // The prompt() function shows a popup in the browser

} while (userResponse !== "yes");

console.log("You typed 'yes'. Thank you!");
\`\`\`

In this example, the prompt will keep appearing until the user types the exact word "yes". The first prompt is guaranteed to show.

---

## Number

### **1. Introduction: The Unified Number Type**

In JavaScript, there is only one type for numbers: \`number\`. This single type is used to represent both integers (whole numbers like \`10\`, \`-50\`) and floating-point numbers (decimals like \`3.14\`, \`-0.5\`).

**The Core Standard:** All numbers in JavaScript are implemented as **64-bit double-precision floating-point numbers**, following the international **IEEE 754 standard**. This is the same format used for \`double\` in languages like C++ and Java.

\`\`\`javascript
let integer = 100;
let float = 99.5;

console.log(typeof integer); // "number"
console.log(typeof float);   // "number"
\`\`\`

---

### **2. Creating Numbers**

You can create numbers in several ways:

- **Standard Literals:**
    
    \`\`\`javascript
    let a = 25;      // Integer
    let b = 12.34;   // Floating-point
    \`\`\`
    
- **Exponential Notation (\`e\`):** A shorthand for writing very large or very small numbers.
    
    \`\`\`javascript
    let billion = 1e9;  // 1 followed by 9 zeros -> 1000000000
    let tiny = 5e-6;    // 5 / 10^6 -> 0.000005
    \`\`\`
    
- **Other Bases (Hex, Binary, Octal):** You can also represent numbers in other numeral systems.
    
    \`\`\`javascript
    let hex = 0xFF; // Hexadecimal (base 16) -> 255 in decimal
    let binary = 0b1010; // Binary (base 2) -> 10 in decimal
    let octal = 0o77; // Octal (base 8) -> 63 in decimal
    \`\`\`

---

### **3. The "Gotcha": Floating-Point Inaccuracy**

Because numbers are stored in a binary floating-point format (base-2), they cannot perfectly represent all decimal fractions (base-10). This leads to the most famous "gotcha" in JavaScript math.

\`\`\`javascript
console.log(0.1 + 0.2); // Outputs: 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
\`\`\`

**Why?** The numbers \`0.1\` and \`0.2\` (and \`0.3\`) have infinitely repeating representations in binary, similar to how \`1/3\` is \`0.333...\` in decimal. The computer has to round them off to fit them into the 64-bit storage. These tiny rounding errors accumulate.

**How to handle this:**

1. **For financial calculations:** Never use floating-point numbers. Work with integers (e.g., store money in cents).
2. **For display:** Use the \`.toFixed()\` method to round the result to a specific number of decimal places.
3. **For comparison:** Check if two numbers are "close enough" using \`Number.EPSILON\`.

---

### **4. Special Numeric Values**

There are three special values that are technically of type \`number\`.

- **\`Infinity\`:** Represents a value larger than the largest possible number. It results from division by zero or exceeding \`Number.MAX_VALUE\`.
    
    \`\`\`javascript
    console.log(1 / 0);          // Infinity
    console.log(-1 / 0);         // -Infinity
    console.log(typeof Infinity); // "number"
    \`\`\`
    
- **\`-Infinity\`:** Represents a value smaller than the smallest possible number.
- **\`NaN\` (Not a Number):** Represents the result of an invalid or undefined mathematical operation. It's the error code for failed math.
**Key Property of \`NaN\`:** It is the only value in JavaScript that is not equal to itself.
    
    \`\`\`javascript
    console.log("hello" / 2);    // NaN
    console.log(Math.sqrt(-1));  // NaN
    console.log(typeof NaN);     // "number"
    console.log(NaN === NaN);    // false
    \`\`\`

---

### **5. Important \`Number\` Properties and Methods**

The \`Number\` object provides several useful constants and methods.

**A. \`Number\` Constants (Limits of the Type)**

- **\`Number.MAX_VALUE\`:** The largest positive number that can be represented (~1.8e+308).
- **\`Number.MIN_VALUE\`:** The smallest positive number closest to zero.
- **\`Number.MAX_SAFE_INTEGER\`:** The largest integer that can be safely represented without losing precision (\`2^53 - 1\`). **This is the one you should care about for integer math.**
- **\`Number.MIN_SAFE_INTEGER\`:** The smallest safe integer.
- **\`Number.EPSILON\`:** The smallest interval between two representable numbers. Used for floating-point comparisons.

**B. Checking Number Types**

- **\`isNaN(value)\` (Global function):** The classic way to check if a value is \`NaN\`. **Gotcha:** It coerces the value first, so \`isNaN("hello")\` is \`true\`, which can be misleading.
- **\`Number.isNaN(value)\` (Modern - ES6):** The better, more reliable way. It returns \`true\` **only if** the value is actually \`NaN\`. It does not perform type coercion.
    
    \`\`\`javascript
    isNaN("blue");       // true (coerces "blue" to NaN)
    Number.isNaN("blue"); // false (it's a string, not NaN)
    
    let result = 0 / 0; // result is NaN
    isNaN(result);       // true
    Number.isNaN(result); // true
    \`\`\`
    
- **\`isFinite(value)\` / \`Number.isFinite(value)\`:** Checks if a value is a real, finite number (not \`Infinity\`, \`-Infinity\`, or \`NaN\`). The \`Number.isFinite()\` version is stricter and does not coerce.
- **\`Number.isInteger(value)\`:** Checks if a value is an integer.

**C. Formatting and Converting Numbers**
These methods are called on a number variable.

- **\`.toString(base)\`:** Converts a number to a string. You can optionally provide a base (from 2 to 36).
    
    \`\`\`javascript
    let num = 255;
    console.log(num.toString());    // "255" (base 10 - default)
    console.log(num.toString(16));  // "ff"  (base 16 - hexadecimal)
    console.log(num.toString(2));   // "11111111" (base 2 - binary)
    \`\`\`
    
- **\`.toFixed(digits)\`:** Formats a number to a fixed number of decimal places and returns a **string**. Useful for formatting currency.
    
    \`\`\`javascript
    let price = 19.991234;
    console.log(price.toFixed(2)); // "19.99"
    \`\`\`
    
- **\`.toPrecision(digits)\`:** Formats a number to a specified total number of significant digits and returns a **string**.
    
    \`\`\`javascript
    let n = 123.456;
    console.log(n.toPrecision(4)); // "123.5" (4 significant digits)
    \`\`\`

---

### **6. The \`Math\` Object**

JavaScript provides a built-in \`Math\` object that has properties and methods for mathematical constants and functions. It is not a constructor; you use it directly.

- **Constants:** \`Math.PI\`, \`Math.E\`
- **Rounding:**
    - \`Math.round(x)\`: Standard rounding to the nearest integer.
    - \`Math.floor(x)\`: Rounds **down** to the nearest integer.
    - \`Math.ceil(x)\`: Rounds **up** to the nearest integer.
    - \`Math.trunc(x)\`: Removes the decimal part, leaving only the integer (truncates toward zero).
- **Other Common Functions:**
    - \`Math.abs(x)\`: Absolute value.
    - \`Math.pow(x, y)\`: \`x\` to the power of \`y\` (same as \`x ** y\`).
    - \`Math.sqrt(x)\`: Square root.
    - \`Math.max(a, b, c...)\`: Returns the largest of the given numbers.
    - \`Math.min(a, b, c...)\`: Returns the smallest.
    - \`Math.random()\`: Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive).
    
    \`\`\`javascript
    console.log(Math.round(4.7)); // 5
    console.log(Math.floor(4.7)); // 4
    console.log(Math.ceil(4.2));  // 5
    
    console.log(Math.max(10, -5, 100, 0)); // 100
    
    // To get a random integer between 1 and 10 (inclusive):
    let randomInt = Math.floor(Math.random() * 10) + 1;
    \`\`\`

### The Core Tool: \`Math.random()\`

JavaScript's only built-in tool for randomness is \`Math.random()\`. You must understand its behavior perfectly to build anything else.

**\`Math.random()\` returns a random floating-point number between \`0\` (inclusive) and \`1\` (exclusive).**

This means it can return \`0\`, \`0.1234\`, \`0.5\`, \`0.99999\`, but it will **never** return \`1.0\`.

- **Range:** \`[0, 1)\`

---

### The Goal: A Random Integer Between \`min\` and \`max\` (Inclusive)

Let's say our goal is to get a random whole number from 1 to 10. We want \`1\`, \`2\`, \`3\`, ..., \`9\`, \`10\`.

The formula to achieve this is:
**\`Math.floor(Math.random() * (max - min + 1)) + min\`**

This looks complicated, so let's build it up step-by-step to understand the intuition.

---

### Building the Formula from First Principles

Let's stick with our goal: a random integer between **1 (min)** and **10 (max)**.

### Step 1: Scale up the range.

\`Math.random()\` gives us a number between \`0\` and \`1\` (e.g., \`0.5\`). We want a number in a much larger range. How many different numbers do we want to be able to generate?
\`1, 2, 3, 4, 5, 6, 7, 8, 9, 10\`
There are **10** possible outcomes.

The number of outcomes is always \`max - min + 1\`.
\`10 - 1 + 1 = 10\`.

So, the first step is to scale our \`[0, 1)\` range up to a range of the correct size. We do this by multiplying.

\`\`\`javascript
Math.random() * 10;
\`\`\`

- The lowest possible value is \`0 * 10 = 0\`.
- The highest possible value is \`0.999... * 10 = 9.999...\`.
- **Our new range is \`[0, 10)\`.**

This gives us a floating-point number from \`0\` up to (but not including) \`10\`.

### Step 2: Get rid of the decimals.

We want whole numbers (integers). The perfect tool for this is \`Math.floor()\`, which always rounds **down** to the nearest whole number.

Let's see what happens when we apply \`Math.floor()\` to our range \`[0, 10)\`:

\`\`\`javascript
Math.floor(Math.random() * 10);
\`\`\`

- If \`Math.random()\` was \`0.0\`, \`Math.floor(0)\` is \`0\`.
- If \`Math.random()\` was \`0.123\`, \`Math.floor(1.23)\` is \`1\`.
- If \`Math.random()\` was \`0.999\`, \`Math.floor(9.99)\` is \`9\`.

Applying \`Math.floor()\` has transformed our float range \`[0, 10)\` into an integer range of **\`0, 1, 2, 3, 4, 5, 6, 7, 8, 9\`**.

This is close! We have 10 possible numbers, but the range is wrong. We want \`1\` to \`10\`, not \`0\` to \`9\`.

### Step 3: Shift the range to the correct starting point.

Our current range is \`[0, 9]\`. We want \`[1, 10]\`.
How do you get from 0 to 1? You add 1.
How do you get from 9 to 10? You add 1.

The final step is to shift our entire range up by adding our desired minimum value (\`min\`).

\`\`\`javascript
Math.floor(Math.random() * 10) + 1;
\`\`\`

Let's trace the outcomes:

- If the \`Math.floor()\` part gave us \`0\`, the result is \`0 + 1 = 1\`.
- If the \`Math.floor()\` part gave us \`9\`, the result is \`9 + 1 = 10\`.

This formula now correctly produces a random integer from **1 to 10, inclusive**.

---

### The General-Purpose Function

By replacing the specific numbers \`10\` and \`1\` with \`max\` and \`min\`, we get our general-purpose formula.

\`\`\`javascript
/**
 * Generates a random integer between a minimum and maximum value (inclusive).
 * @param {number} min The minimum possible value.
 * @param {number} max The maximum possible value.
 * @returns {number} A random integer within the range.
 */
function getRandomInt(min, max) {
  // 1. Calculate the number of possible outcomes (the size of our range).
  const range = max - min + 1;

  // 2. Scale up Math.random() to create a float in the range [0, range).
  const scaled = Math.random() * range;

  // 3. Round down to get an integer in the range [0, range-1].
  const floored = Math.floor(scaled);

  // 4. Shift the range up to [min, max] by adding the minimum value.
  const result = floored + min;

  return result;
}

// Example usage:
console.log("Random number between 1 and 10:", getRandomInt(1, 10));
console.log("Random number between 50 and 100:", getRandomInt(50, 100));
console.log("Random dice roll (1 to 6):", getRandomInt(1, 6));
\`\`\`

---

### **1. Introduction: What is a String?**

A string is a primitive data type in JavaScript used to represent a sequence of characters. Anything you can type—letters, numbers, symbols, punctuation—can be part of a string. It is the primary way we work with textual data.

**Key Characteristics:**

- **It's a primitive:** This means strings are **immutable**.
- **It's indexed:** Each character in a string has a numerical position (index), starting from zero.
- **It's an object-like primitive:** Although it's a primitive, it has methods and properties we can use, like \`.length\`. JavaScript temporarily wraps it in a String object when you try to access these.

---

### **2. Creating Strings**

There are three ways to create a string literal in JavaScript.

1. **Single Quotes (\`'...'\`):**
    
    \`\`\`javascript
    let singleQuoted = 'Hello, world!';
    \`\`\`
    
2. **Double Quotes (\`"..."\`):** Functionally identical to single quotes. The main reason to choose one over the other is for convenience when a string itself contains quotes.
    
    \`\`\`javascript
    let doubleQuoted = "He said, 'Hello!'"; // Easy to include single quotes
    let singleQuotedWithDouble = 'She replied, "Hi!"'; // Easy to include double quotes
    \`\`\`
    
3. **Template Literals (backticks - ES6):** The most powerful and modern way. They use backticks.
We will cover the special features of template literals later.
    
    \`\`\`javascript
    let templateLiteral = 'This is a template literal.';
    \`\`\`

---

### **3. Core Properties and Concepts**

**A. The \`.length\` Property**
Every string has a \`.length\` property that tells you how many characters it contains.

\`\`\`javascript
let greeting = "Hello";
console.log(greeting.length); // Outputs: 5

let emptyString = "";
console.log(emptyString.length); // Outputs: 0
\`\`\`

**B. Accessing Individual Characters (Zero-Based Indexing)**
You can access a character at a specific position using square bracket notation \`[]\`. The first character is at index \`0\`.

\`\`\`javascript
let message = "JavaScript";
// J  a  v  a  S  c  r  i  p  t
// 0  1  2  3  4  5  6  7  8  9

console.log(message[0]); // "J"
console.log(message[4]); // "S"

// To get the last character, a common pattern is used:
console.log(message[message.length - 1]); // "t"
\`\`\`

**C. The Golden Rule: Strings are Immutable**
This is the most critical concept. **You cannot change a string in place.** Any method that appears to modify a string will always **return a brand new string**, leaving the original untouched.

\`\`\`javascript
let name = "alex";

// Let's try to change the first character.
name[0] = "A"; // This will FAIL silently. It does nothing.
console.log(name); // Outputs: "alex" (The original string is unchanged)

// Let's use a method that "changes" the string.
let upperName = name.toUpperCase();
console.log(upperName); // Outputs: "ALEX" (This is a NEW string)
console.log(name);      // Outputs: "alex" (The original is still unchanged)
\`\`\`

---

### **4. Common and Essential String Methods**

These methods are your primary tools for working with strings. Remember, they all return **new strings**.

**A. Changing Case**

- **\`.toUpperCase()\`:** Returns a new string with all characters in uppercase.
- **\`.toLowerCase()\`:** Returns a new string with all characters in lowercase.
    
    \`\`\`javascript
    let whisper = "please be quiet";
    let shout = whisper.toUpperCase(); // "PLEASE BE QUIET"
    \`\`\`

**B. Finding Substrings**

- **\`.indexOf(substring)\`:** Returns the index of the **first occurrence** of a substring. If the substring is not found, it returns **-1**.
- **\`.lastIndexOf(substring)\`:** Returns the index of the **last occurrence** of a substring. Returns **-1** if not found.
- **\`.includes(substring)\` (ES6):** Returns a boolean (\`true\` or \`false\`) indicating if the string contains the substring. This is often more readable than \`indexOf\`.
    
    \`\`\`javascript
    let sentence = "The quick brown fox jumps over the lazy fox.";
    
    console.log(sentence.indexOf("fox"));     // 16 (the first one)
    console.log(sentence.lastIndexOf("fox")); // 40 (the last one)
    console.log(sentence.indexOf("cat"));     // -1 (not found)
    
    console.log(sentence.includes("jumps"));  // true
    console.log(sentence.includes("cat"));    // false
    \`\`\`

**C. Extracting Substrings**

- **\`.slice(startIndex, endIndex)\`:** Extracts a section of a string and returns it as a new string.
    - \`startIndex\`: The index where the extraction begins (inclusive).
    - \`endIndex\`: The index where the extraction ends (exclusive - it does not include this character).
    - You can use negative indices, which count from the end of the string.
    
    \`\`\`javascript
    let text = "JavaScript";
    
    console.log(text.slice(0, 4));  // "Java" (from index 0 up to, but not including, 4)
    console.log(text.slice(4));     // "Script" (from index 4 to the end)
    console.log(text.slice(-6));    // "Script" (the last 6 characters)
    \`\`\`
    
- **\`.substring(startIndex, endIndex)\`:** Similar to \`.slice()\`, but it doesn't accept negative indices.
- **\`.substr(startIndex, length)\`:** **(Deprecated - Avoid)**. It works with a start index and a length, which is different from the others. Use \`.slice()\` instead.

**D. Replacing Substrings**

- **\`.replace(searchValue, newValue)\`:** Finds a \`searchValue\` and replaces it with \`newValue\`.
    - **Gotcha:** By default, it only replaces the **first occurrence**.
- **\`.replaceAll(searchValue, newValue)\` (ES2021):** Replaces **all occurrences**. This is the modern, easy way to do a global replace.

\`\`\`javascript
let greeting = "hello world, hello there";

// Replaces only the first "hello"
let newGreeting = greeting.replace("hello", "hi");
console.log(newGreeting); // "hi world, hello there"

// Replaces all "hello"s
let allNewGreeting = greeting.replaceAll("hello", "hi");
console.log(allNewGreeting); // "hi world, hi there"
\`\`\`

- **Old way to replace all:** Use a regular expression with the global flag (\`/g\`). \`greeting.replace(/hello/g, "hi");\`

**E. Cleaning Up Whitespace**

- **\`.trim()\`:** Removes whitespace from both the beginning and end of a string.
- **\`.trimStart()\` / \`.trimEnd()\`:** Removes whitespace from only the start or end.
    
    \`\`\`javascript
    let userInput = "   my-username@example.com   ";
    let cleanedInput = userInput.trim(); // "my-username@example.com"
    \`\`\`

**F. Splitting a String into an Array**

- **\`.split(separator)\`:** Splits a string into an array of substrings, using the \`separator\` to decide where to split. This is incredibly useful.
    
    \`\`\`javascript
    let csvData = "item1,item2,item3";
    let items = csvData.split(","); // ["item1", "item2", "item3"]
    
    let words = "The quick brown fox";
    let word_array = words.split(" "); // ["The", "quick", "brown", "fox"]
    
    let letters = "abc";
    let letter_array = letters.split(""); // ["a", "b", "c"]
    \`\`\`

---

### **5. Template Literals (ES6) - The Modern Way**

Template literals, created with backticks, are a massive improvement for working with strings.

**A. Variable Interpolation (\`\${...}\`):**
This allows you to embed expressions and variables directly into a string. It's far more readable than using the \`+\` operator for concatenation.

- **The Old Way (Concatenation):**
    
    \`\`\`javascript
    let name = "Alice";
    let age = 30;
    let message = "Hello, my name is " + name + " and I am " + age + " years old.";
    \`\`\`
    
- **The New Way (Template Literals):**
    
    \`\`\`javascript
    let name = "Alice";
    let age = 30;
    let message = \`Hello, my name is \${name} and I am \${age} years old.\`;
    // You can even put expressions inside:
    let futureMessage = \`Next year, I will be \${age + 1}.\`;
    \`\`\`

**B. Multi-line Strings:**
Template literals respect newlines inside the string.

- **The Old Way:**
    
    \`\`\`javascript
    let htmlOld = '<div>\\n' +
                  '  <p>Hello</p>\\n' +
                  '</div>';
    \`\`\`
    
- **The New Way:**
    
    \`\`\`javascript
    let htmlNew = \`
      <div>
        <p>Hello</p>
      </div>
    \`;
    \`\`\``,
    quiz: [
      {
        id: "m3-q1",
        question: "What happens if the condition in an 'if' statement is false and there is no 'else' block?",
        options: ["An error is thrown", "The code inside the 'if' block is skipped entirely", "The code runs anyway", "The program crashes"],
        answerIndex: 1,
        explanation: "If the condition is false and there is no else block, the code inside the if block is simply skipped and execution continues after it."
      },
      {
        id: "m3-q2",
        question: "In an if...else if...else chain, how many blocks of code will execute?",
        options: ["All of them", "Exactly one", "At least two", "It depends on the number of conditions"],
        answerIndex: 1,
        explanation: "JavaScript evaluates conditions top-to-bottom and runs only the FIRST block whose condition is true (or the else block if none are true). Exactly one block runs."
      },
      {
        id: "m3-q3",
        question: "What are the three parts inside a for loop's parentheses?",
        options: ["start, stop, step", "initialization, condition, final-expression", "begin, check, update", "declare, compare, increment"],
        answerIndex: 1,
        explanation: "A for loop has: initialization (runs once), condition (checked before each iteration), and final-expression (runs after each iteration)."
      },
      {
        id: "m3-q4",
        question: "What is the key difference between a 'while' loop and a 'do...while' loop?",
        options: ["while loops are faster", "do...while always executes at least once before checking the condition", "while loops can only use numbers", "There is no difference"],
        answerIndex: 1,
        explanation: "A do...while loop runs the code block first, then checks the condition. This guarantees at least one execution."
      },
      {
        id: "m3-q5",
        question: "What does 0.1 + 0.2 === 0.3 evaluate to in JavaScript?",
        options: ["true", "false", "undefined", "NaN"],
        answerIndex: 1,
        explanation: "Due to IEEE 754 floating-point representation, 0.1 + 0.2 results in 0.30000000000000004, which is not exactly equal to 0.3."
      },
      {
        id: "m3-q6",
        question: "What does Math.floor(4.9) return?",
        options: ["5", "4", "4.9", "NaN"],
        answerIndex: 1,
        explanation: "Math.floor() always rounds DOWN to the nearest integer. So 4.9 becomes 4."
      },
      {
        id: "m3-q7",
        question: "What is the formula to generate a random integer between min and max (inclusive)?",
        options: [
          "Math.random() * max + min",
          "Math.floor(Math.random() * (max - min + 1)) + min",
          "Math.ceil(Math.random() * max)",
          "Math.round(Math.random() * (max - min))"
        ],
        answerIndex: 1,
        explanation: "The formula Math.floor(Math.random() * (max - min + 1)) + min correctly generates a random integer in the inclusive range [min, max]."
      },
      {
        id: "m3-q8",
        question: "What is NaN === NaN in JavaScript?",
        options: ["true", "false", "NaN", "undefined"],
        answerIndex: 1,
        explanation: "NaN is the only value in JavaScript that is NOT equal to itself. Use Number.isNaN() to reliably check for NaN."
      },
      {
        id: "m3-q9",
        question: "What does the string method .slice(4) do on the string 'JavaScript'?",
        options: ["Returns 'Java'", "Returns 'Script'", "Returns 'aScr'", "Returns 'Jav'"],
        answerIndex: 1,
        explanation: ".slice(4) extracts from index 4 to the end of the string. 'JavaScript'.slice(4) returns 'Script'."
      },
      {
        id: "m3-q10",
        question: "Why are strings called 'immutable' in JavaScript?",
        options: [
          "Because they can only be created once",
          "Because you cannot change a string's characters in place — any modification creates a new string",
          "Because they are always stored in memory",
          "Because they cannot be compared"
        ],
        answerIndex: 1,
        explanation: "Strings are immutable — you cannot alter individual characters. Methods like .toUpperCase() return a NEW string, leaving the original unchanged."
      }
    ],
    debugging: {
      id: "m3-debug",
      description: "Fix the infinite loop. The loop decrementer is missing or incorrect, which would cause the environment to hang. Make sure the count reaches 0 to exit the loop.",
      buggyCode: `function countDown(start) {
  let result = "";
  let i = start;
  while (i > 0) {
    result += i + "...";
    // Bug: i is never decremented, causing infinite loop!
  }
  return result + "Blastoff!";
}`,
      correctCode: `function countDown(start) {
  let result = "";
  let i = start;
  while (i > 0) {
    result += i + "...";
    i--;
  }
  return result + "Blastoff!";
}`,
      testCases: [
        {
          input: [3],
          expected: "3...2...1...Blastoff!",
          description: "countDown(3) should return sequence"
        }
      ]
    },
    implementation: {
      id: "m3-impl",
      description: "Write a function 'sumOdds(limit)' that calculates and returns the sum of all positive ODD numbers up to and including 'limit'. E.g. sumOdds(5) should calculate 1 + 3 + 5 = 9.",
      initialCode: `function sumOdds(limit) {
  // Write your code here
  
}`,
      testCases: [
        {
          input: [5],
          expected: 9,
          description: "sumOdds(5) -> 9"
        },
        {
          input: [1],
          expected: 1,
          description: "sumOdds(1) -> 1"
        },
        {
          input: [6],
          expected: 9,
          description: "sumOdds(6) -> 9 (1+3+5)"
        },
        {
          input: [10],
          expected: 25,
          description: "sumOdds(10) -> 25"
        }
      ]
    }
  }
];
