import { makeEmbed } from "/js/embeds.js"

export default class extends Page {
  #resizePage

  constructor() {
    super("commands")
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
          command[1].id = command[0]
          command = command[1]
        }
        if (command && index - 1 < path.length) {
          this.newState = `/commands/${path.slice(0, index).join("/")}/${command.id}`
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
          E("span").text("Parent category")
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
          E("span").text(command.id)
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
        E("div").addClass("title").text(command.name ?? (path[0] === "context" ? command.id.replace(/-/g, " ").toTitleCase() : command.id))
      ).appendTo(content)
      for (const section of (Array.isArray(command.description) ? command.description : [command.description])) commandInfo.append(
        E("div").addClass("description").text(section)
      )
      if (command.extra) addMoreInfo(command.extra, commandInfo, arrowRight)
      if (command.prefixCommand || command.slashCommand || command.contextCommand) {
        const buttonRow = E("div").addClass("button-row").appendTo(commandInfo)
        if (command.prefixCommand) buttonRow.append(E("a", { is: "f-a" }).attr("href", `/commands/prefix/${command.prefixCommand}`).append(E("span").text("Prefix Command")))
        if (command.slashCommand) buttonRow.append(E("a", { is: "f-a" }).attr("href", `/commands/slash/${command.slashCommand}`).append(E("span").text("Slash Command")))
        if (command.contextCommand) buttonRow.append(E("a", { is: "f-a" }).attr("href", `/commands/context/${command.contextCommand}`).append(E("span").text("Context Command")))
      }
      if (path[0] === "prefix") commandInfo.append(
        E("div").addClass("heading").text("Formatting"),
        E("div").addClass("formatting").text(`e!${command.id} ${command.arguments ?? ""}`)
      )
      else if (path[0] === "slash") commandInfo.append(
        E("div").addClass("heading").text("Formatting"),
        E("div").addClass("formatting").text(`/${path.slice(1, index + 1).join(" ")} ${command.arguments?.map(e => `${e.name}:${e.required ? "required" : "optional"}`).join(" ") ?? ""}`)
      )
      else {
        commandInfo.append(
          E("div").addClass("heading").text("How to use"),
          E("div").html(`Right click on a <strong>${command.type ?? "message"}</strong>, go to <strong>Apps</strong>, then select <strong>${command.id.replace(/-/g, " ").toTitleCase()}</strong>`)
        )
      }
      if (command.arguments) {
        commandInfo.append(E("div").addClass("heading").text("Arguments"))
        for (const option of command.arguments) {
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
      let description
      if (category.description) {
        description = E("div").attr("id", "category-description")
        description.append((Array.isArray(category.description) ? category.description : [category.description]).map(e => E("div").addClass("category-description").text(e)))
      }
      if (category.extra) {
        if (!description) description = E("div").attr("id", "category-description")
        addMoreInfo(category.extra, description, arrowRight)
      }
      if (description) {
        content.append(
          description,
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
              E("div").addClass("command-name").text(info.name ?? (path[0] === "context" ? command.replace(/-/g, " ").toTitleCase() : command)),
              E("div").addClass("command-description").text(Array.isArray(info.description) ? info.description[0] : info.description)
            )
          )
        }
      } else {
        if (index > 1) content.append(E("div").text("There are no commands in this category, please select a subcategory"))
        else if (index === 0) {
          content.append(E("div").addClass("commands-home").html(_pug`
            h1#category-name Wynem Commands
            p You can use the commands in Wynem to make funny images, configure settings, advance the management of your server, and much more!
            p There are many Wynem commands, so they are sorted into categories which you can find on the left side of the screen!
          `))
        } else if (path[index - 1] === "prefix") {
          $("#category-name").text("Prefix Commands")
          content.append(E("div").addClass("category-info").html(_pug`
            p Prefix commands are the original way to use bots on Discord.
            p Simply start a message with the prefix <strong>e!</strong>, followed by the command name to run a prefix command.
            p You can also run a prefix command by pinging <span class="ping">@Wynem</span> instead of using a prefix. Example: <span class="ping">@Wynem</span> help
            h2 Custom prefixes
            p The prefix that Wynem uses can be customised with the <a href="/commands/prefix/bot/prefixes" is="f-a">prefix commands</a>.
            p If you are unsure what prefix Wynem is set to use in the current server, you can ping <span class="ping">@Wynem</span>, and it will tell you the current prefix.
          `))
          makeEmbed($, content, {
            reply: {
              name: "Ewan",
              colour: "#D14949",
              image: "/assets/images/logo/ewan.webp",
              message: "<@Wynem>"
            },
            title: "Wynem",
            description: "My default prefix is `e!`\n\nUse `e!help` to view the commands that are available",
            thumbnail: "/assets/images/logo/logo.webp"
          }, { outline: true })
        } else {
          $("#category-name").text("Context Commands")
          content.append(E("div").addClass("category-info").html(_pug`
            p Context commands are a way to run commands directly on a user or a message.
            p To access context commands, right click on either a user or a message, and go to the <strong>Apps</strong> option.
            img(src = "/assets/images/misc/context.webp")
            h2 Users
            p User context commands can be accessed by either right clicking the user in the sidebar, or their profile picture/name next to a message.
            h2 Messages
            p Message context commands can be accessed by right clicking on a message.
          `))
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
    let searchTimeout
    searchInput.on("input", e => {
      clearTimeout(searchTimeout)
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
      searchTimeout = setTimeout(() => {
        gtag("event", "search", { "search_term": `Command: ${val}` })
      }, 1000)
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

    this.#resizePage = () => {
      this.shadowBody[0].querySelectorAll(".extra").forEach(e => {
        if (e.style.maxHeight && e.style.maxHeight !== "0px") {
          e.style.maxHeight = `${e.scrollHeight}px`
        }
      })
    }
    window.addEventListener("resize", this.#resizePage)
  }

  onOpened() {
    history.replaceState({}, null, this.newState)
  }

  onClosed() {
    window.removeEventListener("resize", this.#resizePage)
  }
}

function addMoreInfo(embeds, parent, arrowRight) {
  let arrow
  const extra = E("div").addClass("extra").appendTo(
    E("div").addClass("extra-container").append(
      E("div").append(
        E("div").append(
          E("span").text("More information"),
          arrow = arrowRight.clone()
        )
      ).on("click", e => {
        arrow.toggleClass("flip")
        if (extra.css("max-height") === "0px") extra.css("max-height", `${extra[0].scrollHeight}px`)
        else extra.css("max-height", "0px")
      })
    ).appendTo(parent)
  )
  for (const embed of embeds) {
    makeEmbed($, extra, embed)
  }
}