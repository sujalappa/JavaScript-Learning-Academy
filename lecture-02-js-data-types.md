# Lecture 02: Data Types in JavaScript

## Why Data Types Exist

Computer memory is just bytes — raw 0s and 1s. The same sequence `01001000` could mean the number `72`, the character `'H'`, a memory address, or `true`.

**A data type is a label that tells the computer:**
1. How many bytes to use for this value
2. What operations make sense on it (multiply? uppercase?)

### JavaScript's Design Choice

Java requires declaring types upfront: `int x = 5;`

JavaScript (created by Brendan Eich in 1995 for web designers, not programmers) took a different approach: **let variables hold any type and figure it out at runtime.** This one decision explains everything interesting — and annoying — about JS types.

---

## Variable Declarations

### `const`

- **Scope:** Block `{ ... }`
- **Reassignment:** ❌ Not allowed — throws `TypeError`
- **Initialization:** ✅ Required at declaration
- **Hoisting:** Hoisted but uninitialized → **Temporal Dead Zone (TDZ)**
- **Mutability:** The *reference* is constant, not the value — object properties can still change

```js
const PI = 3.14159;
// PI = 3; ❌ TypeError

const CONFIG = { port: 8080 };
CONFIG.port = 3000; // ✅ Allowed — same reference, mutated value

// console.log(MY_CONST); ❌ ReferenceError (TDZ)
const MY_CONST = 100;
```

---

### `let`

- **Scope:** Block `{ ... }`
- **Reassignment:** ✅ Allowed
- **Initialization:** Optional (defaults to `undefined`)
- **Hoisting:** Hoisted but uninitialized → **TDZ**

```js
let counter = 0;
counter = 1; // ✅ Allowed

let name; // undefined
name = "Alice";

// console.log(myLetVar); ❌ ReferenceError (TDZ)
let myLetVar = "test";
```

---

### `var`

> ⚠️ **Avoid in modern JS (ES6+)**

- **Scope:** Function (not block) — leaks out of `if`, `for`, etc.
- **Reassignment & Redeclaration:** ✅ Both allowed
- **Hoisting:** Hoisted and initialized to `undefined`

```js
if (true) {
  var leak = "visible outside";
}
console.log(leak); // ✅ "visible outside" — leaks!

console.log(myVar); // undefined (no error — hoisted)
var myVar = "Hello";

var x = 10;
var x = 20; // ✅ Redeclaration allowed
```

---

### Comparison Table

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Reassignable | ✅ | ✅ | ❌ |
| Redeclarable | ✅ | ❌ | ❌ |
| Hoisted Value | `undefined` | TDZ | TDZ |
| Attaches to `window` | ✅ | ❌ | ❌ |
| Modern Practice | Avoid | Use when reassigning | Use as default |

---

## Data Types

### 1. Primitive Types

Primitives are **immutable** — operations don't change them, they create new values. Variables store the value directly.

There are **7 primitive types:**

---

#### `string`
Textual data. Use `'`, `"`, or `` ` `` (template literals).

```js
let name = "Alice";
let greeting = 'Hello, World!';
let template = `User: ${name}`; // embeds expressions
```

---

#### `number`
Both integers and floats — no distinction in JS.

```js
let intVal = 100;
let floatVal = 3.14;
let bad = NaN;       // result of invalid math like 0/0
let inf = Infinity;
```

---

#### `boolean`

```js
let isActive = true;
let isDone = false;
```

---

#### `undefined`
A variable declared but **not assigned** — JS sets it to `undefined` automatically.

```js
let user;
console.log(user); // undefined
```

---

#### `null`
Intentional absence of value — explicitly assigned by the developer.

```js
let data = null;
```

> **`null` vs `undefined`:**
> - `undefined` = declared, nothing assigned (JS's default)
> - `null` = explicitly set to "no value" (developer's intent)

---

#### `bigint`
For integers larger than `Number.MAX_SAFE_INTEGER`. Add `n` suffix.

```js
const huge = 9007199254740991n;
const another = BigInt(9007199254740992);
```

---

#### `symbol`
Unique, anonymous identifiers — mainly used as object keys to avoid collisions.

```js
const id1 = Symbol('id');
const id2 = Symbol('id');
console.log(id1 === id2); // false — every symbol is unique
```

---

### 2. Object Type (Non-Primitive)

Objects are **mutable** collections of key-value pairs. Variables don't store the object — they store a **reference** (pointer) to it in memory.

```js
// Object literal
let person = { firstName: "John", age: 30 };

// Array (specialized object)
let nums = [10, 20, 30];

// Function (also an object in JS)
function greet() { console.log("Hello"); }
```

Other built-ins: `Date`, `Map`, `Set`, `RegExp`, etc.

---

### Value vs. Reference — The Critical Difference

#### Primitives → copied by **value**

```js
let a = 10;
let b = a; // copies the value

b = 20;
console.log(a); // 10 — unaffected
console.log(b); // 20
```

#### Objects → copied by **reference**

```js
let obj1 = { value: 10 };
let obj2 = obj1; // copies the reference — same object!

obj2.value = 20;
console.log(obj1.value); // 20 — obj1 is affected too
console.log(obj2.value); // 20
```

Both variables point to the **same object in memory**.

---

### The `typeof` Operator

```js
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
```

> ⚠️ `typeof null === "object"` is a historical bug in JS — `null` is a primitive, not an object.
