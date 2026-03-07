import { describe, expect, it } from "vitest";
import { newGenerator } from "./index";

describe("indentation", () => {
  it("uses default spaces", () => {
    const g = newGenerator();
    g.line("if (true) {")
      .indent()
      .line("console.log('hello')")
      .dedent()
      .line("}");
    expect(g.toString()).toBe("if (true) {\n  console.log('hello')\n}\n");
  });

  it("uses custom spaces", () => {
    const g = newGenerator().withSpaces(4);
    g.line("if (true) {")
      .indent()
      .line("console.log('hello')")
      .dedent()
      .line("}");
    expect(g.toString()).toBe("if (true) {\n    console.log('hello')\n}\n");
  });

  it("uses tabs", () => {
    const g = newGenerator().withTabs();
    g.line("if (true) {")
      .indent()
      .line("console.log('hello')")
      .dedent()
      .line("}");
    expect(g.toString()).toBe("if (true) {\n\tconsole.log('hello')\n}\n");
  });
});

describe("block", () => {
  it("handles simple blocks", () => {
    const g = newGenerator().withSpaces(2);
    g.line("if (true) {")
      .block(() => {
        g.line("console.log('hello')").line("console.log('world')");
      })
      .line("}");

    expect(g.toString()).toBe(
      "if (true) {\n  console.log('hello')\n  console.log('world')\n}\n",
    );
  });

  it("handles nested blocks", () => {
    const g = newGenerator().withSpaces(2);
    g.line("function example() {")
      .block(() => {
        g.line("if (condition) {")
          .block(() => {
            g.line("console.log('condition true')");
          })
          .line("} else {")
          .block(() => {
            g.line("console.log('condition false')");
          })
          .line("}");
      })
      .line("}");

    expect(g.toString()).toBe(
      "function example() {\n  if (condition) {\n    console.log('condition true')\n  } else {\n    console.log('condition false')\n  }\n}\n",
    );
  });

  it("restores indentation after thrown error", () => {
    const g = newGenerator().withSpaces(2);

    expect(() => {
      g.block(() => {
        throw new Error("boom");
      });
    }).toThrow("boom");

    g.line("after");
    expect(g.toString()).toBe("after\n");
  });
});

describe("line and inline", () => {
  it("supports template literal usage with line", () => {
    const g = newGenerator();
    const name = "User";
    g.line(`interface ${name} {`)
      .indent()
      .line(`id: ${"string"}`)
      .dedent()
      .line("}");
    expect(g.toString()).toBe("interface User {\n  id: string\n}\n");
  });

  it("supports template literal usage with inline", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().inline(`const greeting = ${JSON.stringify("Hello, World!")}`);
    expect(g.toString()).toBe('  const greeting = "Hello, World!"');
  });

  it("writes consecutive inline content on same line", () => {
    const g = newGenerator().withSpaces(2);
    g.inline("a").inline("b").inline("c");
    expect(g.toString()).toBe("abc");
  });

  it("supports inline continuation after line", () => {
    const g = newGenerator().withSpaces(2);
    g.line("const x = ").indent().inline("1").inline(" + ").inline("2;");
    expect(g.toString()).toBe("const x = \n  1 + 2;");
  });

  it("handles multiline input in line", () => {
    const g = newGenerator().withSpaces(2);
    g.line("function test() {");
    g.block(() => {
      g.line("console.log('hello')\nconsole.log('world')");
    });
    g.line("}");

    expect(g.toString()).toBe(
      "function test() {\n  console.log('hello')\n  console.log('world')\n}\n",
    );
  });
});

describe("raw", () => {
  it("writes raw content without indentation", () => {
    const g = newGenerator().withSpaces(4).indent();
    g.raw("x");
    expect(g.toString()).toBe("x");
  });

  it("preserves line-start state after trailing newline", () => {
    const g = newGenerator().withSpaces(2).indent();
    g.raw("line1\n");
    g.inline("line2");
    expect(g.toString()).toBe("line1\n  line2");
  });
});

describe("safety", () => {
  it("never dedents below zero", () => {
    const g = newGenerator();
    g.dedent().line("x");
    expect(g.toString()).toBe("x\n");
  });

  it("allows repeated dedent calls safely", () => {
    const g = newGenerator();
    g.dedent().dedent().dedent().line("safe");
    expect(g.toString()).toBe("safe\n");
  });

  it("toString is stable across multiple reads", () => {
    const g = newGenerator();
    g.line("a").line("b");
    const first = g.toString();
    const second = g.toString();
    expect(first).toBe("a\nb\n");
    expect(second).toBe(first);
  });
});

describe("indent configuration", () => {
  it("supports zero spaces as indentation", () => {
    const g = newGenerator().withSpaces(0);
    g.indent().line("x");
    expect(g.toString()).toBe("x\n");
  });

  it("treats negative spaces as zero", () => {
    const g = newGenerator().withSpaces(-4);
    g.indent().line("x");
    expect(g.toString()).toBe("x\n");
  });

  it("applies indentation unit changes only to future writes", () => {
    const g = newGenerator().withSpaces(2);

    g.line("root");
    g.indent().line("space");
    g.withTabs().line("tab");
    g.withSpaces(4).line("four");

    expect(g.toString()).toBe("root\n  space\n\ttab\n    four\n");
  });
});

describe("empty and newline inputs", () => {
  it("ignores empty inline content", () => {
    const g = newGenerator();
    g.inline("").line("x");
    expect(g.toString()).toBe("x\n");
  });

  it("ignores empty raw content", () => {
    const g = newGenerator();
    g.raw("").line("x");
    expect(g.toString()).toBe("x\n");
  });

  it("line with empty content still writes one newline", () => {
    const g = newGenerator();
    g.line("").line("x");
    expect(g.toString()).toBe("\nx\n");
  });

  it("inline with only newline preserves line-start state", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().inline("\n").inline("x");
    expect(g.toString()).toBe("\n  x");
  });

  it("raw with trailing newline resets for next indented write", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().raw("a\n").inline("b");
    expect(g.toString()).toBe("a\n  b");
  });
});

describe("multiline behavior", () => {
  it("indents each non-empty subline", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().inline("a\nb\nc");
    expect(g.toString()).toBe("  a\n  b\n  c");
  });

  it("keeps intentionally blank sublines blank", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().inline("a\n\nb");
    expect(g.toString()).toBe("  a\n\n  b");
  });

  it("handles content ending with newline inside inline", () => {
    const g = newGenerator().withSpaces(2);
    g.indent().inline("a\n").inline("b");
    expect(g.toString()).toBe("  a\n  b");
  });

  it("supports multiline content in raw without extra indentation", () => {
    const g = newGenerator().withSpaces(2).indent();
    g.raw("a\nb\n").inline("c");
    expect(g.toString()).toBe("a\nb\n  c");
  });
});

describe("block semantics", () => {
  it("restores previous indentation level after block", () => {
    const g = newGenerator().withSpaces(2);

    g.indent();
    g.line("before");
    g.block(() => {
      g.line("inside");
    });
    g.line("after");

    expect(g.toString()).toBe("  before\n    inside\n  after\n");
  });

  it("supports empty block callback", () => {
    const g = newGenerator().withSpaces(2);
    g.line("start")
      .block(() => {})
      .line("end");
    expect(g.toString()).toBe("start\nend\n");
  });
});
