export interface TestResult {
  description: string;
  passed: boolean;
  actual: any;
  expected: any;
  error?: string;
}

export interface EvalResult {
  logs: string[];
  error?: string;
  tests?: TestResult[];
  passedAll?: boolean;
}

/**
 * Safe client-side evaluator using Web Workers to run JS code,
 * capturing console logs and preventing browser freeze due to infinite loops.
 */
export function evaluateCode(
  userCode: string,
  testCases: any[] = [],
  _challengeType: "function" | "class" | "async" = "function",
  challengeId: string = ""
): Promise<EvalResult> {
  return new Promise((resolve) => {
    // Harness injected code for specific challenge types
    let runnerScript = `
      const logs = [];
      const userCodeStr = ${JSON.stringify(userCode)};
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        }).join(' '));
        originalLog(...args);
      };
      
      // Inject user code
      ${userCode}
      
      // Test execution
      const testResults = [];
      let passedAll = true;
      const testCases = ${JSON.stringify(testCases)};
      
      async function runTests() {
        if (!testCases || testCases.length === 0) {
          postMessage({ type: 'success', logs, testResults: [], passedAll: true });
          return;
        }
        
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const desc = tc.description;
          let actual;
          let passed = false;
          let testError = null;
          
          try {
            // Evaluator rules
            if ("${challengeId}" === "m6-impl") {
              // BankAccount class test
              // tc.input format: ["deposit" | "withdraw" | "withdraw-fail", owner, balance, amount]
              const [action, owner, balance, amount] = tc.input;
              if (typeof BankAccount === 'undefined') {
                throw new Error("BankAccount class is not defined");
              }
              const account = new BankAccount(owner, balance);
              if (action === "deposit") {
                actual = account.deposit(amount);
              } else if (action === "withdraw" || action === "withdraw-fail") {
                actual = account.withdraw(amount);
              }
            } else if ("${challengeId}" === "m7-impl") {
              // fetchDataWithTimeout test
              // tc.input format: [url, timeout]
              if (typeof fetchDataWithTimeout === 'undefined') {
                throw new Error("fetchDataWithTimeout function is not defined");
              }
              const [url, timeout] = tc.input;
              
              // We need mock fetch simulation inside the worker since real fetch might fail or be blocked by CORS
              const originalFetch = self.fetch;
              self.fetch = async (fetchUrl) => {
                // Return a mock response or wait
                await new Promise(r => setTimeout(r, 100)); // simulate latency
                return {
                  json: async () => ({ title: "delectus aut autem" })
                };
              };
              
              try {
                actual = await fetchDataWithTimeout(url, timeout);
              } catch(e) {
                actual = e; // Expecting string "Request timed out" on rejection
              } finally {
                self.fetch = originalFetch; // restore
              }
            } else if ("${challengeId}" === "m7-debug") {
              // getUserData mock API test
              if (typeof getUserData === 'undefined') {
                throw new Error("getUserData function is not defined");
              }
              const [userId] = tc.input;
              const originalFetch = self.fetch;
              self.fetch = async (fetchUrl) => {
                return {
                  json: async () => ({ name: "Leanne Graham" })
                };
              };
              try {
                actual = await getUserData(userId);
              } finally {
                self.fetch = originalFetch;
              }
            } else {
              // Standard function call
              // Extract the function name from user code or assume the first function
              const functionName = userCodeStr.match(/function\\s+([a-zA-Z0-9_$]+)/)?.[1] || 
                                   userCodeStr.match(/const\\s+([a-zA-Z0-9_$]+)\\s*=\\s*\\(?/)?.[1];
              
              if (!functionName) {
                throw new Error("Could not find function declaration. Verify syntax.");
              }
              
              const fn = self[functionName] || eval(functionName);
              if (typeof fn !== 'function') {
                throw new Error(functionName + " is not a function");
              }
              
              actual = fn(...tc.input);
            }
            
            // Compare expected vs actual
            if (typeof tc.expected === 'object') {
              passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
            } else {
              passed = actual === tc.expected;
            }
          } catch (err) {
            passed = false;
            testError = err.message;
          }
          
          if (!passed) passedAll = false;
          testResults.push({
            description: desc,
            passed,
            actual,
            expected: tc.expected,
            error: testError
          });
        }
        
        postMessage({ type: 'success', logs, testResults, passedAll });
      }
      
      // Run the async test suite
      runTests().catch(err => {
        postMessage({ type: 'error', logs, error: err.message });
      });
    `;

    const blob = new Blob([runnerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // Timeout mechanism (1.5 seconds)
    const timeoutId = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: [],
        error: "Timeout Error: Your code took too long to execute (potential infinite loop). Check your loop termination conditions!",
      });
    }, 1800);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);

      if (e.data.type === "success") {
        resolve({
          logs: e.data.logs,
          tests: e.data.testResults,
          passedAll: e.data.passedAll,
        });
      } else {
        resolve({
          logs: e.data.logs,
          error: e.data.error || "Runtime Error occurred during test suite evaluation.",
        });
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: [],
        error: `Syntax Error: ${err.message}`,
      });
    };
  });
}
