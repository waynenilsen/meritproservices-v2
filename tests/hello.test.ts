import { describe, expect, test } from "bun:test";

describe("hello world", () => {
  test("returns greeting", () => {
    const greeting = "Hello, world!";
    expect(greeting).toBe("Hello, world!");
  });
});
