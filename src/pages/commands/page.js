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
      if (category.commands) {
        command = Object.entries(category.commands).find(e => e[0] === path[index] || e[1].aliases?.find(e => e === path[index]))
        if (command) {
          command[1].name = command[0]
          command = command[1]
        }
        if (command && index - 1 < path.length) {
          this.newState = `/commands/${path.slice(0, index).join("/")}/${command.name}`
        } else {
          this.newState = `/commands/${path.slice(0, index).join("/")}`
        }
      } else {
        this.newState = `/commands/${path.slice(0, index).join("/")}`
      }
    }
    const pathStr = `/commands/${path.slice(0, index).join("/")}${index ? "/" : ""}`
    const breadcrumbs = $("#breadcrumbs")
    const arrowLeft = $("#arrow-left").contents()
    const arrowRight = $("#arrow-right").contents()
    for (let i = 0; i < index; i++) breadcrumbs.append(
      arrowRight.clone(),
      E("a", { is: "f-a" }).attr("href", `/commands/${path.slice(0, i + 1).join("/")}`).append(
        E("span").text(path[i])
      )
    )
    const categories = $("#categories")
    if (index !== 0) {
      categories.append(
        E("a", { is: "f-a" }).attr({
          id: "category-back",
          href: `/commands/${path.slice(0, index - 1).join("/")}${index !== 1 ? "/" : ""}`
        }).append(
          arrowLeft.clone(),
          E("span").text("Back")
        )
      )
      if (category.categories) categories.append(
        E("div").attr("id", "category-title").addClass("subcategory-title").text("Subcategories")
      )
    } else categories.append(
      E("div").attr("id", "category-title").text("Categories")
    )
    if (category.categories) for (const subcategory of Object.keys(category.categories)) {
      categories.append(E("a", { is: "f-a" }).attr({
        href: `${pathStr}${subcategory}`
      }).append(
        E("span").text(subcategory)
      ))
    }
    const content = $("#content")
    if (command) {
      breadcrumbs.append(
        arrowRight.clone(),
        E("a", { is: "f-a" }).attr({
          id: "command-breadcrumb",
          href: `/commands/${path.slice(0, index + 1).join("/")}`
        }).append(
          E("span").text(command.name)
        )
      )
      const commandInfo = E("div").attr("id", "command-info").append(
        E("a", { is: "f-a" }).attr({
          id: "command-back",
          href: `/commands/${path.slice(0, index).join("/")}${index !== 1 ? "/" : ""}`
        }).append(
          arrowLeft.clone(),
          E("span").text("Back to command list")
        ),
        E("div").addClass("title").text(command.name)
      ).appendTo(content)
      for (const section of (Array.isArray(command.description) ? command.description : command.description.split("``````"))) commandInfo.append(
        E("div").addClass("description").text(section)
      )
      commandInfo.append(
        E("div").addClass("heading").text("Formatting"),
        E("div").addClass("formatting").text(`e!${command.name} ${command.arguments ?? ""}`),
        E("div").addClass("heading").text("Cooldown"),
        E("div").text(`${command.cooldown?.toLocaleString("en") ?? 1} Second${(command.cooldown ?? 1) === 1 ? "" : "s"}`)
      )
      if (command.aliases) {
        const aliases = E("ul")
        for (const alias of command.aliases) aliases.append(E("li").text(alias))
        commandInfo.append(
          E("div").addClass("heading").text("Aliases"),
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
            E("a", { is: "f-a" }).attr({
              href: `${pathStr}${command}`
            }).append(
              E("div").addClass("command-name").text(command),
              E("div").addClass("command-description").text(Array.isArray(info.description) ? info.description[0] : info.description.split("``````")[0])
            )
          )
        }
      }
    }
    const searchResults = $("#search-results")
    const searchInput = $("#search > input")
    this.shadowBody.on("click", e => {
      const target = $(e.target)
      if (!(target.attr("id") === "search" || target.attr("id") === "search-results" || target.parents("#search, #search-results").length)) {
        searchResults.empty()
      } else if ((target.attr("id") === "search" || target.parents("#search").length) && searchInput.val()) {
        searchInput.trigger("input")
      }
    })
    searchInput.on("input", e => {
      searchResults.empty()
      const val = e.currentTarget.value.toLowerCase()
      let matches = []
      const queue = Object.entries(commands.categories).map(e => [e[1], `/${e[0]}`])
      while (queue.length) {
        const [category, path] = queue.shift()
        if (category.categories) for (const [subCategory, data] of Object.entries(category.categories)) {
          queue.push([data, `${path}/${subCategory}`])
        }
        if (category.commands) for (const [command, info] of Object.entries(category.commands)) {
          if (command.includes(val) || path.includes(val)) matches.push([command, command, `${path}/${command}`])
          if (info.aliases) for (const alias of info.aliases) {
            if (alias.includes(val)) matches.push([alias, `${alias} <span>(${command})</span>`, `${path}/${command}`])
          }
        }
      }
      matches.sort((a, b) => {
        a = a[0].toLowerCase()
        b = b[0].toLowerCase()
        if (a.startsWith(val) || val.startsWith(a)) {
          if (b.startsWith(val) || val.startsWith(b)) return a.localeCompare(b)
          return -1
        }
        if (b.startsWith(val) || val.startsWith(b)) return 1
        return a.localeCompare(b)
      })
      const filtered = []
      const check = new Set
      for (const command of matches) {
        if (!check.has(command[2])) {
          check.add(command[2])
          filtered.push(command)
        }
      }
      for (const match of filtered) {
        searchResults.append(
          E("a", { is: "f-a" }).attr({
            href: `/commands${match[2]}`
          }).addClass("search-result").append(
            E("div").addClass("name").html(match[1]),
            E("div").addClass("path").text(match[2])
          )
        )
      }
    })
  }

  onOpened() {
    history.replaceState({}, null, this.newState)
  }
}