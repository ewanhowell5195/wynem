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
        writeIndex(dir, PageClass)
      }
    }

    const commands = JSON.parse(fs.readFileSync("src/assets/json/commands.json"))
    const queue = [["commands", commands, "commands"]]
    while (queue.length) {
      const [dir, category, name] = queue.shift()
      if (category.categories) queue.push(...Object.entries(category.categories).map(e => [`${dir}/${e[0]}`, e[1], e[0]]))
      writeIndex(dir, {
        title: `${name.toTitleCase()} - Commands - Ewan Howell`,
        description: category.description ? (Array.isArray(category.description) ? category.description[0] : category.description.split("``````")[0]) : `View the commands in the ${name.toTitleCase()} category`
      })
      if (category.commands) for (const [name, command] of Object.entries(category.commands)) {
        writeIndex(path.join(dir, name), {
          title: `${name.includes("-") ? name.replace(/-/g, " ").toTitleCase() : name} - Commands - Ewan Howell`,
          description: Array.isArray(command.description) ? command.description[0] : command.description.split("``````")[0]
        })
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

globalThis.Page = class {}

String.prototype.toTitleCase = function() {
  return this.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()).trim()
}

function writeIndex(dir, args) {
  fs.mkdirSync(path.join("dist", dir), { recursive: true })
  fs.writeFileSync(path.join("dist", dir, "index.html"), processPug(`extends /../includes/main.pug

block meta
  -
    meta = {
      title: "${args.title}",
      description: "${args.description.replace(/\n/g, " ").replace(/"/g, '\\"')}",
      ${args.image ? `image: "${args.image}",` : ""}
      ${args.colour ? `colour: "${args.colour}",` : ""}
      ${args.icon ? `icon: "${args.icon}"` : ""}
    }`))
}