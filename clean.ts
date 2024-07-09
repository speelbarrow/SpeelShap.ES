// This is a Bun script (instead of a shell script) so that it always gets the path right (using `import.meta.dir`)
import { rmSync } from "node:fs"
rmSync(import.meta.dir + "/dist", { recursive: true })
