import "/js/libs/FileSaver.js"

export default class extends Page {
  constructor() {
    super("cemanimation")
    $('[href="/cemanimation"]').addClass("selected")
  }

  static tag = "cemanimation-page"
  static title = "CEM Animation Documentation - Wynem"
  static description = "View the CEM Animation documentation for OptiFine"

  async setData(params) {
    await this.ready
    const $ = this.$
    await fetchJSON("cem_animation_doc")
    const doc = $("#cem-doc")
    const tabs = $("#cem-doc-tabs")
    for (const tab of cem_animation_doc.tabs){
      const name = tab.name.replace(/ /g, "-").toLowerCase()
      tabs.append(E("div").attr("id", `cem-doc-tab-${name}`).html(tab.name).on("click", evt => {
        $("#cem-doc-tabs > div").removeClass("selected")
        $("#cem-doc > div").removeClass("selected")
        $(evt.target).addClass("selected")
        $(`#cem-doc-page-${name}`).addClass("selected")
        window.scrollTo(0, 0)
        history.replaceState({}, null, `/cemanimation/?tab=${name}`)
      }))
      const page = E("div").attr("id", `cem-doc-page-${name}`).appendTo(doc)
      for (const element of tab.elements) {
        if (element.type === "heading") page.append(E("h2").html(element.text))
        else if (element.type === "text") page.append(E("p").html(element.text))
        else if (element.type === "code") page.append(E("pre").html(element.text))
        else if (element.type === "table") {
          const table = E("table").appendTo(page)
          if (element.tableType === "list") table.addClass("cem-doc-table-list")
          for (const row of element.rows) {
            const tr = E("tr").appendTo(table)
            for (const [i, cell] of row.entries()) tr.append(E("td").html(cell))
          }
        }
        else if (element.type === "image") page.append(E("img").attr({
          src: element.url,
          width: element.width,
          height: element.height
        }))
      }
    }
    $("#cem-doc-tabs > :first-child").addClass("selected")
    $("#cem-doc > :first-child").addClass("selected")
    $(".cem-doc-tab-link").on("click", evt => {
      const name = evt.target.textContent.replace(/ /g, "-").toLowerCase()
      $("#cem-doc-tabs > div").removeClass("selected")
      $("#cem-doc > div").removeClass("selected")
      $(`#cem-doc-tab-${name}`).addClass("selected")
      $(`#cem-doc-page-${name}`).addClass("selected")
      window.scrollTo(0, 0)
      history.replaceState({}, null, `/cemanimation/?tab=${name}`)
    })
    doc.append(
      E("hr"),
      E("p").html(`Documentation version:   <span style="font-family:var(--font-code)">v${cem_animation_doc.version}</span>\nUpdated to:   <span style="font-family:var(--font-code)">OptiFine ${cem_animation_doc.optifineVersion}</span>`)
    )

    if (params.tab) {
      const tab = $(`#cem-doc-tab-${params.tab}`)
      if (tab.length) tab.trigger("click")
      else this.newState = "/cemanimation"
    }
  }

  onOpened() {
    if (this.newState) history.replaceState({}, null, this.newState)
  }
}