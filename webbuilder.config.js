import path from "node:path"
import fs from "node:fs"

export default {
  async build(config, { processPug }) {
    globalThis.processPug = processPug

    console.log("Generating open graph...")

    for await (const f of getFiles("src/pages")) if (f.endsWith(".js")) {
      const PageClass = (await import("./" + path.relative(".", f))).default
      if (PageClass.description) {
        const dir = path.relative("src/pages", path.dirname(f))
        fs.mkdirSync(path.join("dist", dir), { recursive: true })
        fs.writeFileSync(path.join("dist", dir, "index.html"), processPug(`extends /../includes/main.pug

block meta
  -
    meta = {
      title: "${PageClass.title}",
      description: "${PageClass.description}",
      ${PageClass.image ? `image: "${PageClass.image}",` : ""}
      ${PageClass.colour ? `colour: "${PageClass.colour}",` : ""}
      ${PageClass.icon ? `icon: "${PageClass.icon}"` : ""}
    }`))
      }
    }

    console.log("Generated open graph")
  }
}

globalThis.getFiles = async function*(dir) {
  const dirents = await fs.promises.readdir(dir, {withFileTypes: true})
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

globalThis.Page = class {
  
}