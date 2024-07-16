import type { Subprocess } from "bun"
import { test, expect, type MatcherResult } from "bun:test"

test.if(process.env["SPALL"] === "true")("Storybook", async () => {
  const dep = Bun.spawn({
    cmd: ["bunx", "playwright", "install"],
    stderr: "pipe",
  })
  expect(await dep.exited, `STDOUT:\n${await new Response(dep.stdout).text()}\nSTDERR:\n` +
         `${await new Response(dep.stderr).text()}\n`).toBe(0)

  const ui = Bun.spawn({
    cmd: ["bunx", "storybook", "dev", "--no-open", "-p", "6006"],
    stderr: "pipe",
  })

  // Let it start
  await Bun.sleep(10000)

  const testRun = Bun.spawn({
    cmd: ["bunx", "test-storybook", "-i"],
    stderr: "pipe",
  })

  if (await testRun.exited !== 0) {
    ui.kill(await testRun.exited)
    expect().fail(`=== TEST RUN ===\nExit code: ${await testRun.exited}\n\nSTDOUT:\n` +
                 `${await new Response(testRun.stdout).text()}\nSTDERR:\n${await new Response(testRun.stderr).text()}` +
                 `\n\n=== UI ===\nExit code: ${await ui.exited}\n\nSTDOUT:\n${await new Response(ui.stdout).text()}\n` +
                 `STDERR:\n${await new Response(ui.stderr).text()}`)
  }
}, { timeout: 30000 })
