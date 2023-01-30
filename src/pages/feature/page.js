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
    const $ = this.$
    const feature = window[`features/${args.name}`]
    const title = feature.title ?? args.name.replace(/-/g, " ").toTitleCase()
    jQuery("title").text(`${title} - Wynem`)
    $("#title").text(title)
    $("#subtitle").text(feature.subtitle)
    if (feature.commands) {
      const commandTabs = $("#command-tabs")
      const commandLists = $("#command-lists")
      for (const [type, commands] of Object.entries(feature.commands)) {
        commandTabs.append(
          E("div").addClass("command-tab button").append(E("span").text(type))
        )
        const commandList = E("div").attr("id", `command-list-${type}`).addClass("command-list").appendTo(commandLists)
        for (const command of commands) {
          commandList.append(
            E("a", { is: "f-a" }).attr("href", `/commands/${type}/${command.path}`).addClass("button secondary").append(E("span").text(command.name))
          )
        }
      }
      $(".command-list").first().addClass("selected")
      if (Object.keys(feature.commands).length === 1) commandTabs.css("display", "none")
      else {
        $(".command-tab").first().addClass("active")
        $(".command-tab").on("click", e => {
          $(".command-list.selected").removeClass("selected")
          $(".command-tab.active").removeClass("active")
          $(e.currentTarget).addClass("active")
          $(`#command-list-${e.currentTarget.textContent}`).addClass("selected")
        })
      }
    }
    addBlocks($("#description"), feature.description, args.name)
  }
}

function addBlocks(element, blocks, feature) {
  const section = E("div").addClass("section")
  for (const block of blocks) {
    if (block === "spacer") {
      E("div").appendTo(section)
    } else if (block.type === "heading") {
      E("div").addClass("heading").html(block.text).appendTo(section)
    } else if (block.type === "text") {
      E("div").addClass("text").html(block.text).appendTo(section)
    } else if (block.type === "tablelist") {
      const table = E("table").addClass("tablelist").appendTo(section)
      for (const row of block.rows) {
        const tr = E("tr").appendTo(table)
        for (const [i, cell] of row.entries()) tr.append(E("td").html(cell))
      }
    } else if (block.type === "image") {
      E("img").attr("src", `/assets/images/features/${feature}/${block.name}.webp`).css("max-height", `${block.height ?? 256}px`).appendTo(section)
    }
  }
  element.append(section)
}