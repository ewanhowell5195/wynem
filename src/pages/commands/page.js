export default class extends Page {
  constructor() {
    super("commands")
    $("a").removeClass("selected")
    $('[href="/commands"]').addClass("selected")
  }

  static tag = "commands-page"
  static title = "Commands - Wynem"
  static description = "View all of Wynem's commands"

  async setData({ path, searchParams }) {
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
    for (let i = 0; i < index; i++) breadcrumbs.prepend(
      E("a", { is: "f-a" }).attr("href", `/commands/${path.slice(0, i + 1).join("/")}`).append(
        E("span").text(path[i])
      ),
      arrowRight.clone()
    )
    const categories = $("#categories")
    const categoryContainer = $("#categories-container")
    const main = $("#main")
    if (index !== 0) {
      categories.append(
        E("a", { is: "f-a" }).attr({
          id: "category-back",
          href: `/commands/${path.slice(0, index - 1).join("/")}${index !== 1 ? "/" : ""}`
        }).append(
          arrowLeft.clone(),
          E("span").text("Previous category")
        )
      )
      if (category.commands) categories.append(
        E("a").addClass("mobile-only").text("View commands").on("click", e => {
          main.addClass("opened")
          categoryContainer.addClass("closed")
        })
      )
      if (category.categories) categories.append(
        E("div").addClass("category-title subcategory-title").text(index === 1 ? "Categories" : "Subcategories")
      )
      if (!category.categories || "commandview" in searchParams) {
        main.addClass("opened")
        categoryContainer.addClass("closed")
      }
    } else categories.append(
      E("div").addClass("category-title desktop-only").text("Commands"),
      E("div").addClass("category-title mobile-only").text("Wynem Commands"),
      E("div").addClass("mobile-only").css("margin-bottom", "10px").text("Please select a command type")
    )
    if (category.categories) for (const subcategory of Object.keys(category.categories)) {
      categories.append(E("a", { is: "f-a" }).attr({
        href: `${pathStr}${subcategory}`
      }).append(
        E("span").text(subcategory.replace(/-/g, " "))
      ))
    }
    const content = $("#content")
    if (command) {
      main.addClass("opened")
      categoryContainer.addClass("closed")
      breadcrumbs.prepend(
        E("a", { is: "f-a" }).attr({
          id: "command-breadcrumb",
          href: `/commands/${path.slice(0, index + 1).join("/")}`
        }).append(
          E("span").text(command.name)
        ),
        arrowRight.clone()
      )
      const commandInfo = E("div").attr("id", "command-info").append(
        E("a", { is: "f-a" }).attr({
          id: "command-back",
          href: `/commands/${path.slice(0, index).join("/")}${index !== 1 ? "/" : ""}/?commandview`
        }).append(
          arrowLeft.clone(),
          E("span").text("Back to command list")
        ),
        E("div").addClass("title").text(path[0] === "context" ? command.name.replace(/-/g, " ").toTitleCase() : command.name)
      ).appendTo(content)
      for (const section of (Array.isArray(command.description) ? command.description : [command.description])) commandInfo.append(
        E("div").addClass("description").text(section)
      )
      if (path[0] === "prefix") commandInfo.append(
        E("div").addClass("heading").text("Formatting"),
        E("div").addClass("formatting").text(`e!${command.name} ${command.arguments ?? ""}`)
      )
      else if (path[0] === "slash") commandInfo.append(
        E("div").addClass("heading").text("Formatting"),
        E("div").addClass("formatting").text(`/${path.slice(1, index + 1).join(" ")} ${command.options?.map(e => `${e.name}:${e.required ? "required" : "optional"}`).join(" ") ?? ""}`)
      )
      else {
        commandInfo.append(
          E("div").addClass("heading").text("How to use"),
          E("div").html(`Right click on a <strong>${command.type ?? "message"}</strong>, go to <strong>Apps</strong>, then select <strong>${command.name.replace(/-/g, " ").toTitleCase()}</strong>`)
        )
      }
      if (command.options) {
        commandInfo.append(E("div").addClass("heading").text("Options"))
        for (const option of command.options) {
          commandInfo.append(
            E("div").addClass("option-name").html(`${option.name}${option.required ? ' <span class="option-required">(required)</span>' : ""}`),
            E("div").addClass("option-description").text(option.description)
          )
        }
      }
      if (command.permissions) {
        const permissions = E("ul")
        for (const alias of command.permissions) permissions.append(E("li").text(alias))
        commandInfo.append(
          E("div").addClass("heading").text("Restricted to"),
          permissions
        )
      }
      if (command.botPermissions) {
        const permissions = E("ul")
        for (const alias of command.botPermissions) permissions.append(E("li").text(alias))
        commandInfo.append(
          E("div").addClass("heading").text("Wynem needs these permissions"),
          permissions
        )
      }
      commandInfo.append(
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
    } else {
      if (path[index - 1]) content.append(E("div").attr("id", "category-name").text(path[index - 1]))
      if (category.description) {
        content.append(
          E("div").attr("id", "category-description").append((Array.isArray(category.description) ? category.description : [category.description]).map(e => E("div").addClass("category-description").text(e))),
          E("div").attr("id", "category-heading").text("Commands")
        )
      }
      if (category.commands) {
        const commandsContainer = E("div").attr("id", "commands").appendTo(content)
        for (const [command, info] of Object.entries(category.commands)) {
          commandsContainer.append(
            E("a", { is: "f-a" }).attr({
              href: `${pathStr}${command}`
            }).append(
              E("div").addClass("command-name").text(path[0] === "context" ? command.replace(/-/g, " ").toTitleCase() : command),
              E("div").addClass("command-description").text(Array.isArray(info.description) ? info.description[0] : info.description)
            )
          )
        }
      }
    }
    const searchResults = $("#search-results")
    const searchInput = $("#search > input")
    this.shadowBody.on("click", e => {
      const target = $(e.target)
      if (!(target.attr("id") === "search" || target.parents("#search").length)) {
        searchResults.empty()
      } else if ((target.attr("id") === "search" || target.parents("#search").length) && searchInput.val()) {
        searchInput.trigger("input")
      }
    })
    searchInput.on("input", e => {
      searchResults.empty()
      const val = e.currentTarget.value.toLowerCase()
      if (!val) return
      let matches = []
      const queue = Object.entries(commands.categories).map(e => [e[1], `/${e[0]}`])
      while (queue.length) {
        const [category, path] = queue.shift()
        if (category.categories) for (const [subCategory, data] of Object.entries(category.categories)) {
          queue.push([data, `${path}/${subCategory}`])
        }
        if (category.commands) for (const [command, info] of Object.entries(category.commands)) {
          if (command.replace(/-/g, " ").includes(val) || path.includes(val)) matches.push([command, command.includes("-") ? command.replace(/-/g, " ").toTitleCase() : command, `${path}/${command}`])
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
            E("div").addClass("path").append(match[2].split("/").slice(1).map(e => [arrowRight.clone(), E("span").text(e.includes("-") ? e.replace(/-/g, " ").toTitleCase() : e)]).flat().slice(1))
          ).on("click", e => searchResults.empty())
        )
      }
    })
    const switchLeft = $("#mobile-switch-left")
    const switchRight = $("#mobile-switch-right")
    switchRight.on("click", e => {
      main.addClass("opened")
      categoryContainer.addClass("closed")
    })
    switchLeft.on("click", e => {
      main.removeClass("opened")
      categoryContainer.removeClass("closed")
    })
  }

  onOpened() {
    history.replaceState({}, null, this.newState)
  }
}