

type TokenType = 'NUMBER' | 'FUNCTION' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'CONSTANT' | 'SEPARATOR';

interface Token {
  type: TokenType;
  value: string;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1, '-': 1,
  '*': 2, '/': 2, '%': 2,
  '^': 3,
  '!': 4, // Unary Factorial
  'u-': 4 // Unary Minus
};

const ASSOCIATIVITY: Record<string, 'L' | 'R'> = {
  '+': 'L', '-': 'L',
  '*': 'L', '/': 'L', '%': 'L',
  '^': 'R',
  '!': 'L',
  'u-': 'R'
};

const CONSTANTS: Record<string, number> = {
  'pi': Math.PI,
  'π': Math.PI,
  'e': Math.E
};

// Trigonometric helper to handle Degrees vs Radians
const trig = (func: (n: number) => number, val: number, useDegrees: boolean) => {
  if (useDegrees) return func(val * (Math.PI / 180));
  return func(val);
};

const arcTrig = (func: (n: number) => number, val: number, useDegrees: boolean) => {
  const res = func(val);
  if (useDegrees) return res * (180 / Math.PI);
  return res;
};

const FUNCTIONS: Record<string, (args: number[], useDegrees: boolean) => number> = {
  'sin': (args, d) => trig(Math.sin, args[0], d),
  'cos': (args, d) => trig(Math.cos, args[0], d),
  'tan': (args, d) => trig(Math.tan, args[0], d),
  'asin': (args, d) => arcTrig(Math.asin, args[0], d),
  'acos': (args, d) => arcTrig(Math.acos, args[0], d),
  'atan': (args, d) => arcTrig(Math.atan, args[0], d),
  'sinh': (args) => Math.sinh(args[0]),
  'cosh': (args) => Math.cosh(args[0]),
  'tanh': (args) => Math.tanh(args[0]),
  'sqrt': (args) => Math.sqrt(args[0]),
  'cbrt': (args) => Math.cbrt(args[0]),
  'abs': (args) => Math.abs(args[0]),
  'log': (args) => Math.log10(args[0]),
  'ln': (args) => Math.log(args[0]),
  'exp': (args) => Math.exp(args[0]),
  'fact': (args) => factorial(args[0]),
  'root': (args) => Math.pow(args[0], 1 / args[1]), // root(x, n) -> nth root of x
  'round': (args) => Math.round(args[0]),
  'floor': (args) => Math.floor(args[0]),
  'ceil': (args) => Math.ceil(args[0]),
};

const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (!Number.isInteger(n)) return NaN; // Simple factorial for integers
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

// --- Tokenizer ---

const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  // Normalize input
  const normalized = input
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi');

  // Regex pattern
  // 1. Numbers (integers, decimals, starting with dot)
  // 2. Functions (multi-letter identifiers)
  // 3. Constants (pi, e)
  // 4. Operators
  // 5. Parens and Separators
  const pattern = /(\d+(?:\.\d*)?|\.\d+)|([a-zA-Z_][a-zA-Z0-9_]*)|(\+|-|\*|\/|\^|!|%)|(\(|\))|(,)/g;
  
  let match;
  while ((match = pattern.exec(normalized)) !== null) {
    const [_, num, ident, op, paren, sep] = match;

    if (num) {
      tokens.push({ type: 'NUMBER', value: num });
    } else if (ident) {
      if (CONSTANTS.hasOwnProperty(ident.toLowerCase())) {
        tokens.push({ type: 'CONSTANT', value: ident.toLowerCase() });
      } else {
        tokens.push({ type: 'FUNCTION', value: ident.toLowerCase() });
      }
    } else if (op) {
      tokens.push({ type: 'OPERATOR', value: op });
    } else if (paren) {
      tokens.push({ type: paren === '(' ? 'LPAREN' : 'RPAREN', value: paren });
    } else if (sep) {
      tokens.push({ type: 'SEPARATOR', value: sep });
    }
  }

  return handleImplicitMultiplication(tokens);
};

const handleImplicitMultiplication = (tokens: Token[]): Token[] => {
  const result: Token[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (i > 0) {
      const prev = tokens[i - 1];
      
      // Cases to insert *:
      // 1. Number followed by Function: 2sin -> 2*sin
      // 2. Number followed by LParen: 2( -> 2*(
      // 3. Number followed by Constant: 2pi -> 2*pi
      // 4. RParen followed by LParen: )( -> )*(
      // 5. RParen followed by Number: )2 -> )*2
      // 6. RParen followed by Function: )sin -> )*sin
      // 7. RParen followed by Constant: )pi -> )*pi
      // 8. Constant followed by Function: pi sin -> pi*sin
      // 9. Constant followed by Number: pi 2 -> pi*2
      
      const isPrevNumeric = prev.type === 'NUMBER' || prev.type === 'CONSTANT' || prev.type === 'RPAREN';
      const isCurrValue = token.type === 'NUMBER' || token.type === 'CONSTANT' || token.type === 'FUNCTION' || token.type === 'LPAREN';
      
      if (isPrevNumeric && isCurrValue) {
        // Exception: Function followed by paren is normal `sin(`. 
        // But here prev is numeric (not function).
        result.push({ type: 'OPERATOR', value: '*' });
      }
    }
    result.push(token);
  }
  return result;
};

// --- Shunting Yard ---

const shuntingYard = (tokens: Token[]): Token[] => {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'NUMBER':
      case 'CONSTANT':
        outputQueue.push(token);
        break;
      
      case 'FUNCTION':
        operatorStack.push(token);
        break;
      
      case 'SEPARATOR':
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
        break;

      case 'OPERATOR':
        // Handle Unary Minus: If - is first, or follows operator/LPAREN
        let isUnary = false;
        if (token.value === '-') {
            const prev = i > 0 ? tokens[i - 1] : null;
            if (!prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN' || prev.type === 'SEPARATOR') {
                isUnary = true;
                token.value = 'u-'; // Mark as unary
            }
        }

        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'LPAREN') break;
          
          const op1 = token.value;
          const op2 = top.value;
          
          const p1 = PRECEDENCE[op1] || 0;
          const p2 = PRECEDENCE[op2] || 0;
          const a1 = ASSOCIATIVITY[op1] || 'L';

          if ((a1 === 'L' && p1 <= p2) || (a1 === 'R' && p1 < p2)) {
             outputQueue.push(operatorStack.pop()!);
          } else {
             break;
          }
        }
        operatorStack.push(token);
        break;
      
      case 'LPAREN':
        operatorStack.push(token);
        break;
      
      case 'RPAREN':
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'LPAREN') {
          operatorStack.pop(); // Pop LPAREN
          // If function preceded LPAREN, pop it too
          if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
            outputQueue.push(operatorStack.pop()!);
          }
        }
        break;
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op.type === 'LPAREN' || op.type === 'RPAREN') {
      // Mismatched parens, safe to ignore or throw
    } else {
      outputQueue.push(op);
    }
  }

  return outputQueue;
};

// --- RPN Solver ---

const solveRPN = (rpn: Token[], useDegrees: boolean): number => {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'CONSTANT') {
      stack.push(CONSTANTS[token.value] || 0);
    } else if (token.type === 'OPERATOR') {
      if (token.value === 'u-') {
        if (stack.length < 1) return NaN;
        stack.push(-stack.pop()!);
      } else if (token.value === '!') {
         if (stack.length < 1) return NaN;
         stack.push(factorial(stack.pop()!));
      } else {
        if (stack.length < 2) return NaN;
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/': stack.push(a / b); break;
          case '^': stack.push(Math.pow(a, b)); break;
          case '%': stack.push(a % b); break; 
          default: return NaN;
        }
      }
    } else if (token.type === 'FUNCTION') {
       // Determine arity. Most are 1, root is 2.
       // In a robust system we'd check definition.
       // Here we assume 1 unless known binary function.
       const funcName = token.value;
       const funcDef = FUNCTIONS[funcName];
       if (!funcDef) return NaN;

       if (funcName === 'root') {
          if (stack.length < 2) return NaN;
          const n = stack.pop()!; // argument order: root(x, n) -> x, n pushed
          const x = stack.pop()!;
          stack.push(funcDef([x, n], useDegrees));
       } else {
          if (stack.length < 1) return NaN;
          const arg = stack.pop()!;
          stack.push(funcDef([arg], useDegrees));
       }
    }
  }

  if (stack.length !== 1) return NaN;
  return stack[0];
};

export const evaluate = (expression: string, useDegrees: boolean = true): number => {
  if (!expression || !expression.trim()) return 0;
  try {
    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    return solveRPN(rpn, useDegrees);
  } catch (e) {
    console.warn('Evaluator Error:', e);
    return NaN;
  }
};
