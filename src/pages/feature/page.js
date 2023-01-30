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
    $("#title").text(feature.title ?? args.name.replace(/-/g, " ").toTitleCase())
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
  }
}