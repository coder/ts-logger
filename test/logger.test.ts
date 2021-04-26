import * as assert from "assert"
import { Argument, logger } from "../src/logger"

function testLog(level: "trace" | "debug" | "info" | "warn" | "error", skip = false): void {
  const original = console[level]
  const fn = logger[level].bind(logger)

  let called = 0
  const args: Argument[] = []
  const message = `log: ${level}`

  console[level] = (...a: Argument[]) => {
    ++called
    args.push(...a)
  }

  try {
    fn(message)
  } finally {
    console[level] = original
  }

  if (skip) {
    return assert.strictEqual(0, called)
  }

  // Colors are only used for TTYs.
  const colors = !!process.stdout.isTTY

  assert.strictEqual(1, called)

  const expectedLength = colors ? 6 : 4
  assert.strictEqual(args.length, expectedLength)

  // The first argument contains all the formats for the arguments.
  let i = 0
  assert.strictEqual(args[i++], "[%s] " + "%s".repeat(expectedLength - 2))

  // The next part is the date.
  assert.strictEqual(true, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(args[i++]))

  // Then the log level color.
  if (colors) {
    assert.strictEqual(true, args[i++].startsWith("\x1B["))
  }

  // The log level.
  assert.strictEqual(args[i++].trim(), level)

  // Reset colors back to base.
  if (colors) {
    assert.strictEqual(true, args[i++].startsWith("\x1B[0m"))
  }

  // The actual message.
  assert.strictEqual(args[i++], message)
}

describe("Logger", () => {
  it("should *NOT* log a trace message", () => {
    testLog("trace", true)
  })

  it("should *NOT* log a debug message", () => {
    testLog("debug", true)
  })

  it("should log an info message", () => {
    testLog("info")
  })

  it("should log a warning message", () => {
    testLog("warn")
  })

  it("should log an error message", () => {
    testLog("error")
  })
})
