import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

for (const file of ['index.html', 'site.css', 'site.js']) {
  if (existsSync(join(root, file))) {
    await cp(join(root, file), join(dist, file))
  }
}

if (existsSync(join(root, 'public'))) {
  await cp(join(root, 'public'), dist, { recursive: true })
}

for (const dir of ['media', 'fonts']) {
  if (existsSync(join(root, dir))) {
    await cp(join(root, dir), join(dist, dir), { recursive: true })
  }
}

console.log('Static EXCO GEOVISTA site built to dist/')

