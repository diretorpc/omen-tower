import { describe, it, expect, afterEach } from "vitest";
import { accessConfigured, codeMatches } from "@/src/access";

const original = process.env.ACCESS_CODE;
afterEach(() => {
  if (original === undefined) delete process.env.ACCESS_CODE;
  else process.env.ACCESS_CODE = original;
});

describe("accessConfigured", () => {
  it("is false when ACCESS_CODE is unset", () => {
    delete process.env.ACCESS_CODE;
    expect(accessConfigured()).toBe(false);
  });
  it("is false when ACCESS_CODE is empty", () => {
    process.env.ACCESS_CODE = "";
    expect(accessConfigured()).toBe(false);
  });
  it("is true when ACCESS_CODE is set", () => {
    process.env.ACCESS_CODE = "hunter2";
    expect(accessConfigured()).toBe(true);
  });
});

describe("codeMatches", () => {
  it("matches the exact code", () => {
    process.env.ACCESS_CODE = "hunter2";
    expect(codeMatches("hunter2")).toBe(true);
  });
  it("rejects a wrong code", () => {
    process.env.ACCESS_CODE = "hunter2";
    expect(codeMatches("nope")).toBe(false);
  });
  it("rejects everything when no code is configured", () => {
    delete process.env.ACCESS_CODE;
    expect(codeMatches("")).toBe(false);
    expect(codeMatches("anything")).toBe(false);
  });
});
