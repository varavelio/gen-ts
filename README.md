# Varavel Gen for TypeScript

<img src="./logo-200px.png">

<br/>

<p>
  <a href="https://github.com/varavelio/gen-ts/actions">
    <img src="https://github.com/varavelio/gen-ts/actions/workflows/ci.yaml/badge.svg" alt="CI status"/>
  </a>
  <a href="https://github.com/varavelio/gen-ts/releases/latest">
    <img src="https://img.shields.io/github/release/varavelio/gen-ts.svg" alt="Release Version"/>
  </a>
  <a href="https://www.npmjs.com/package/@varavel/gen">
    <img src="https://img.shields.io/npm/v/%40varavel%2Fgen" alt="NPM Version"/>
  </a>
  <a href="https://github.com/varavelio/gen-ts">
    <img src="https://img.shields.io/github/stars/varavelio/gen-ts?style=flat&label=github+stars" alt="GitHub Stars"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/varavelio/gen-ts.svg" alt="License"/>
  </a>
</p>

<p>
  <a href="https://varavel.com">
    <img src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/project.svg" alt="A Varavel project"/>
  </a>
</p>

Small, chainable code generator for TypeScript.

It gives you predictable indentation, line handling, and block structure without adding framework-level complexity.

This is a port of [Gen for Golang](https://github.com/varavelio/gen).

## Install

```bash
npm install @varavel/gen
```

## Quick start

```ts
import { newGenerator } from "@varavel/gen";

const g = newGenerator();

g.line("function greet(name: string) {");
g.block(() => {
  g.line("return `Hello, ${name}`;");
});
g.line("}");

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
