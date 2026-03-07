# @varavel/gen

Small, chainable code generator for TypeScript.

It gives you predictable indentation, line handling, and block structure without adding framework-level complexity.

## Install

```bash
npm install @varavel/gen
```

## Quick start

```ts
import { newGenerator } from "@varavel/gen";

const g = newGenerator();

g.line("function greet(name: string) {")
  .block(() => {
    g.line('return `Hello, ${name}`;');
  })
  .line("}");

console.log(g.toString());
```

Output:

```ts
function greet(name: string) {
  return `Hello, ${name}`;
}
```

## API

- `newGenerator()` Create a new `Generator` with 2-space indentation.
- `withSpaces(spaces)` Set indentation to a fixed number of spaces.
- `withTabs()` Set indentation to tabs.
- `indent()` Increase indentation level by 1.
- `dedent()` Decrease indentation level by 1 (never below 0).
- `raw(content)` Write text exactly as provided.
- `break()` Write one newline.
- `inline(content)` Write text on the current line, indenting only when at line start.
- `line(content)` Same as `inline(content)` plus one newline.
- `block(run)` Execute `run` one indent level deeper, then restore the previous level.
- `toString()` Return the generated result.

## Common patterns

### Nested blocks

```ts
const g = newGenerator();

g.line("if (condition) {")
  .block(() => {
    g.line("if (nested) {")
      .block(() => {
        g.line("doWork();");
      })
      .line("}");
  })
  .line("}");
```

### Mixing `raw`, `inline`, and `line`

```ts
const g = newGenerator().withSpaces(2);

g.raw("/* generated */\n");
g.line("const x = ");
g.indent().inline("1").inline(" + ").inline("2;");
```

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
