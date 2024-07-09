import { Subprocess } from "bun"

console.log("BUILD START\n")

const entrypoints = (await Array.fromAsync(new Bun.Glob("**/*.[tj]s").scan(import.meta.dir + "/src")))
  .filter(file => !file.includes("stories")).map(file => `${import.meta.dir}/src/${file}`)

console.log("Inputs:")
for (const entrypoint of entrypoints)
  console.log(`\t${entrypoint.replace(new RegExp(`^${import.meta.dir}/`), "")}`)
console.log()

const results = await Bun.build({
  entrypoints,
  outdir: import.meta.dir + "/dist",
  target: "browser",
  sourcemap: "inline",
  minify: true,
  root: import.meta.dir + "/src",
  splitting: true,
})
if (!results.success) {
  for (const log of results.logs)
    console.error(log)
  throw new Error("BUILD FAILURE")

} else {
  console.log("Outputs: ")
  for (const output of results.outputs)
    console.log(`\t${output.path.replace(new RegExp(`^${import.meta.dir}/`), "")}`)
}

async function write(subprocess: Subprocess<"ignore", "pipe", "pipe">, stream: "out" | "err" = "out") {
  const std = `std${stream}` as "stdout" | "stderr"
  process[std].write(await new Response(subprocess[std]).text())
}
async function cleanup(message: string, subprocess: Subprocess<"ignore", "pipe", "pipe">) {
  process.stdout.write(`\n${message}... `)
  if (await subprocess.exited !== 0) {
    for (const std of ["out", "err"])
      write(subprocess, std as "out" | "err")
    throw new Error(`BUILD FAILED (${subprocess.exitCode})`)
  } else
    console.log("done!")
}

for (const [message, command] of [
  ["Generating type definitions", ["tsc"]],
  ["Running Custom Elements Manifest analyzer", ["cem", "analyze", "--globs", "dist/**", "--outdir", "dist"]],
] as [string, string[]][]) {
  await cleanup(message, Bun.spawn({
    cmd: command,
    stderr: "pipe",
  }))
}
  
console.log("\nBUILD SUCCESS\n")
