import { makeEmbed, makeMessage, makeModal, parseString } from "/js/embeds.js"

export default class extends Page {
  constructor() {
    super("feature", async $ => {
      await fetchJSON("features")
      const section = $("#features")
    })
    $('[href="/features"]').addClass("selected")
  }

  static tag = "feature-page"

  async setData(args) {
    await this.ready
    const check = await fetchJSON(`features/${args.name}`)
    if (!check) return false
    await fetchJSON("features")
    await fetchJSON("commands")
    const $ = this.$
    const feature = window[`features/${args.name}`]
    const title = features.find(e => e.id === args.name).name ?? args.name.replace(/-/g, " ").toTitleCase()
    jQuery("title").text(`${title} - Wynem`)
    const linkIcon = $("#link-icon").contents()
    $("#title").text(title)
    $("#subtitle").text(features.find(e => e.id === args.name).description)
    if (feature.commands) {
      const commandTabs = $("#command-tabs")
      const commandLists = $("#command-lists")
      for (const [type, related] of Object.entries(feature.commands)) {
        commandTabs.append(
          E("div").addClass("command-tab tab").append(E("span").text(type.toTitleCase()))
        )
        const commandList = E("div").attr("id", `command-list-${type}`).addClass("command-list").appendTo(commandLists)
        for (const commandData of related) {
          let commandPath = commandData
          if (!Array.isArray(commandPath)) commandPath = commandPath.path
          if (commandData.type === "category") commandList.append(
            E("a", { is: "f-a" }).attr("href", `/commands/${type}/${commandPath.join("/")}`).addClass("button secondary").append(
              linkIcon.clone(true),
              E("span").text(commandData.text)
            )
          )
          else {
            let command = commands.categories[type]
            for (let [i, part] of commandPath.entries()) {
              if (i === commandPath.length - 1) command = command.commands[part]
              else command = command.categories[part]
            }
            let commandName
            if (type === "prefix") commandName = `e!${commandPath[commandPath.length - 1]}`
            else if (type === "slash") commandName = `/${commandPath.join(" ")}`
            else if (type === "context") commandName = command.name ?? commandPath[commandPath.length - 1].replace(/-/g, " ").toTitleCase()
            commandList.append(
              E("h3").text(commandName),
              E("p").html(commandData.description ?? (Array.isArray(command.description) ? command.description[0] : command.description)),
              E("a", { is: "f-a" }).attr("href", `/commands/${type}/${commandPath.join("/")}`).addClass("button secondary").append(
                linkIcon.clone(true),
                E("span").text("More info...")
              )
            )
          }
        }
      }
      $(".command-list").first().addClass("selected")
      if (Object.keys(feature.commands).length === 1) {
        commandTabs.css("display", "none")
        $("#sidebar").addClass("tabless")
      } else {
        $(".command-tab").on("click", e => {
          $(".command-list.selected").removeClass("selected")
          $(".command-tab.active").removeClass("active")
          $(e.currentTarget).addClass("active")
          $(`#command-list-${e.currentTarget.textContent.toLowerCase()}`).addClass("selected")
          $(".command").css("display", "none")
          $(`.${e.currentTarget.textContent.toLowerCase()}`).css("display", "")
        }).first().addClass("active")
      }
    }

    addBlocks($, $("#description"), feature.description, args.name, {
      outline: true,
      view: args.searchParams.view?.split(",") ?? []
    })
    if (scrollTo) setTimeout(() => scrollTo[0].scrollIntoView({
      behavior: "smooth"
    }), 100)

    $(".command").css("display", "none")
    $(".prefix").css("display", "")
  }

  onClosed() {
    scrollTo = null
  }
}

let scrollTo
function addBlocks($, element, blocks, feature, args) {
  const section = E("div").addClass("section")
  for (const [b, block] of blocks.entries()) {
    const blockPath = (args.blockPath ?? []).concat(b)
    if (typeof block === "string") {
      E("div").addClass("text").html(parseString(block)).appendTo(section)
    } else if (block.type === "heading") {
      copyHandler(E("div").addClass("heading").html(block.text).appendTo(section), blockPath)
    } else if (block.type === "tablelist") {
      const table = E("table").addClass("tablelist").appendTo(section)
      for (const row of block.rows) {
        const tr = E("tr").appendTo(table)
        for (const [i, cell] of row.entries()) tr.append(E("td").html(cell))
      }
    } else if (block.type === "image") {
      E("img").attr("src", `/assets/images/features/${feature}/${block.name}.webp`).css("max-height", `${block.height ?? 256}px`).appendTo(section)
    } else if (block.type === "embed") {
      makeEmbed($, section, block.data, args)
    } else if (block.type === "message") {
      makeMessage($, section, block.data, args)
    } else if (block.type === "modal") {
      makeModal($, section, block.data)
    } else if (block.type === "tabs") {
      let tabs, sections
      E("div").addClass(`tab-container${args?.depth === 1 ? " light" : ""}`).append(
        tabs = E("div").addClass("tabs"),
        sections = E("div").addClass("tab-sections sections")
      ).appendTo(section)
      for (const [i, sect] of block.tabs.entries()) {
        const tab = E("div").attr("data-tab", i).addClass("section-tab tab").append(sect.name).on("click", e => {
          sections.children().removeClass("selected")
          tabs.children().removeClass("active")
          sections.children(`[data-tab="${$(e.currentTarget).addClass("active").attr("data-tab")}"]`).addClass("selected")
          history.replaceState({}, null, `${location.pathname}?view=${blockPath.concat(i).join()}`)
        }).appendTo(tabs)
        const section2 = E("div").attr("data-tab", i).addClass("tab-section")
        const tabPath = blockPath.concat(i)
        addBlocks($, section2, sect.content, feature, {
          depth: (args.depth ?? 0) + 1,
          blockPath: tabPath,
          view: args.view
        })
        sections.append(section2)
        if (tabPath.every((val, index) => val == args.view[index])) {
          tab.addClass("active")
          section2.addClass("selected")
          if (tabPath.length === args.view.length) scrollTo = tab
        }
      }
      if (!tabs.find(".active").length) {
        tabs.children().first().addClass("active")
        sections.children().first().addClass("selected")
      }
    }
    if (!scrollTo) if (blockPath.length === args.view.length && blockPath.every((val, index) => val == args.view[index])) scrollTo = section.children().last()
  }
  element.append(section)
}

function copyHandler(element, path) {
  let timeout
  element.on("click", e => {
    clearTimeout(timeout)
    navigator.clipboard.writeText(`${location.href.split("?")[0]}?view=${path.join()}`)
    element.addClass("copied")
    timeout = setTimeout(() => element.removeClass("copied"), 2000)
  })
}