/**
 * Builds text code with automatic indentation and newlines.
 */
export class Generator {
  private readonly chunks: string[] = [];
  private indentLevel = 0;
  private indentUnit = "  ";
  private atStartOfLine = true;

  /**
   * Uses spaces for one indent level.
   *
   * Example: `withSpaces(2)` makes each level equal to two spaces.
   */
  withSpaces(spaces: number): this {
    this.indentUnit = " ".repeat(Math.max(0, spaces));
    return this;
  }

  /**
   * Uses one tab character for each indent level.
   */
  withTabs(): this {
    this.indentUnit = "\t";
    return this;
  }

  /**
   * Moves one indentation level deeper for future writes.
   */
  indent(): this {
    this.indentLevel++;
    return this;
  }

  /**
   * Moves one indentation level up for future writes.
   *
   * If already at zero, it stays at zero.
   */
  dedent(): this {
    if (this.indentLevel > 0) this.indentLevel--;
    return this;
  }

  /**
   * Writes text exactly as given.
   *
   * It does not add indentation or newlines.
   */
  raw(content: string): this {
    if (content.length === 0) return this;

    this.chunks.push(content);
    this.atStartOfLine = content.endsWith("\n");

    return this;
  }

  /**
   * Writes exactly one newline character.
   */
  break(): this {
    this.chunks.push("\n");
    this.atStartOfLine = true;
    return this;
  }

  /**
   * Writes text on the current line.
   *
   * It adds indentation only when writing at the start of a line.
   */
  inline(content: string): this {
    if (content.length === 0) {
      return this;
    }

    const sublines = content.split("\n");

    for (let index = 0; index < sublines.length; index++) {
      const subline = sublines[index] ?? "";

      if (index > 0) {
        this.chunks.push("\n");
        this.atStartOfLine = true;
      }

      if (subline.length > 0) {
        if (this.atStartOfLine) {
          this.chunks.push(this.indentUnit.repeat(this.indentLevel));
        }

        this.chunks.push(subline);
        this.atStartOfLine = false;
      }
    }

    if (content.endsWith("\n")) {
      this.atStartOfLine = true;
    }

    return this;
  }

  /**
   * Same as `inline` but adds one newline at the end of the content.
   */
  line(content: string): this {
    this.inline(content);
    this.break();
    return this;
  }

  /**
   * Runs a callback one level deeper, then restores the previous level.
   */
  block(run: () => void): this {
    this.indent();

    try {
      run();
    } finally {
      this.dedent();
    }

    return this;
  }

  /**
   * Returns all generated content as a single string.
   */
  toString(): string {
    return this.chunks.join("");
  }
}

/**
 * Creates a new generator with default settings.
 */
export function newGenerator(): Generator {
  return new Generator();
}
