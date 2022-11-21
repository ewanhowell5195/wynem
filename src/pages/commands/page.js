export default class extends Page {
  constructor() {
    super("commands")
    $("a").removeClass("selected")
    $('[href="/commands"]').addClass("selected")
  }

  static tag = "commands-page"
  static title = "Commands - Wynem"
  static description = "View all of Wynem's commands"

  async setData({ path }) {
    await this.ready
    const $ = this.$
    await fetchJSON("commands")
    path = path?.split("/") ?? []
    
    let category = commands
    let index = 0
    while (category?.categories?.[path[index]]) {
      category = category?.categories?.[path[index]]
      index++
    }

    let command
    if (index - 1 <= path.length) {
      if (category.commands?.[path[index]]) {
        command = category.commands?.[path[index]]
        if (index - 1 < path.length) {
          this.newState = `/commands/${path.slice(0, index).join("/")}/${path[index]}`
        }
      } else {
        this.newState = `/commands/${path.slice(0, index).join("/")}`
      }
    }
    const pathStr = `/commands/${path.slice(0, index).join("/")}${path.length ? "/" : ""}`
    const categories = $("#categories")
    if (index !== 0) {
      categories.append(E("a", { is: "f-a" }).attr({
        id: "category-back",
        href: `/commands/${path.slice(0, index - 1).join("/")}${index !== 1 ? "/" : ""}`
      }).text("Back"))
    }
    if (category.categories) for (const subcategory of Object.keys(category.categories)) {
      categories.append(E("a", { is: "f-a" }).attr({
        href: `${pathStr}${subcategory}`
      }).text(subcategory))
    }
    const content = $("#content")
    if (command) {
      content.append(E("a", { is: "f-a" }).attr({
        id: "command-back",
        href: `/commands/${path.slice(0, index).join("/")}${index !== 1 ? "/" : ""}`
      }).text("Back"))
      const commandInfo = E("div").attr("id", "command-info").append(
        E("h1").text(path[index]),
        E("h3").text("Description")
      ).appendTo(content)
      for (const section of command.description.split("``````")) commandInfo.append(E("p").text(section))
      commandInfo.append(
        E("h3").text("Formatting"),
        E("p").text(`e!${path[index]} ${command.arguments ?? ""}`),
        E("h3").text("Cooldown"),
        E("p").text(`${command.cooldown ?? 1} Second${(command.cooldown ?? 1) === 1 ? "" : "s"}`)
      )
      if (command.aliases) {
        const aliases = E("ul")
        for (const alias of command.aliases) aliases.append(E("li").text(alias))
        commandInfo.append(
          E("h3").text("Aliases"),
          aliases
        )
      }
      if (command.permissions) {
        const permissions = E("ul")
        for (const alias of command.permissions) permissions.append(E("li").text(alias))
        commandInfo.append(
          E("h3").text("Restricted to"),
          permissions
        )
      }
    } else {
      if (category.commands) {
        const commandsContainer = E("div").attr("id", "commands").appendTo(content)
        for (const [command, info] of Object.entries(category.commands)) {
          commandsContainer.append(
            E("div").addClass("command").append(
              E("a", { is: "f-a" }).attr({
                href: `${pathStr}${command}`
              }).text(command),
              E("p").text(info.description.split("``````")[0])
            )
          )
        }
      }
    }
  }

  onOpened() {
    history.replaceState({}, null, this.newState)
  }
}