import "/js/libs/FileSaver.js"

export default class extends Page {
  constructor() {
    super("cem")
    $('[href="/cem"]').addClass("selected")
  }

  static tag = "cem-page"
  static title = "Custom Entity Models - Wynem"
  static description = "View the Custom Entity Models for OptiFine"

  async setData(params) {
    await this.ready
    const $ = this.$
    await fetchJSON("cem_template_models")
    const downloadIcon = $("#download-icon").contents()
    const linkIcon = $("#link-icon").contents()
    const entityContainer = $("#entity-container")
    for (const category of cem_template_models.categories) {
      const entities = E("div").addClass("entities").appendTo(
        E("div").addClass("category").append(
          E("div").addClass("category-heading").append(
            E("h2").text(category.name),
            E("p").text(category.description)
          ),
        ).appendTo(entityContainer)
      )
      for (let entity of category.entities) {
        if (typeof entity === "string") entity = { name: entity }
        if (!entity.display_name) entity.display_name = entity.name.replace(/_/g, " ").toTitleCase()
        if (!entity.model) entity.model = entity.name
        if (!entity.file_name) entity.file_name = entity.name
        if (!entity.texture_name) entity.texture_name = entity.name
        entities.append(
          E("div").addClass("entity").attr("data-id", entity.name).append(
            E("img").attr("src", `/assets/images/minecraft/renders/${entity.name}.webp`),
            E("div").text(entity.display_name)
          ).on("click", e => {
            const params = getURLParams() ?? {}
            params.entity = entity.name
            const model = JSON.parse(cem_template_models.models[entity.model].model)
            if ("download" in params) {
              saveAs(new Blob([compileJSON(model)]), `${entity.file_name}.jem`)
              delete params.download
            }
            history.replaceState({}, null, `/cem/${toURLParams(params)}`)
            const padding = [0, 1, 2].map(e => model.models.reduce((a, b) => Math.max(a, (b.translate?.[e] ?? 0).toString().split(".")[0].length), 0))
            const popup = E("div").addClass("popup").append(
              E("div").addClass("popup-container").append(
                E("div").addClass("popup-contents").append(
                  E("div").addClass("entity-info").append(
                    E("div").addClass("entity-name").text(entity.display_name),
                    E("div").addClass("entity-parts").append(
                      E("table").append(
                        E("tr").append(
                          E("th").text("Part name"),
                          E("th").attr("colspan", "3").text("Pivot point location")
                        ),
                        model.models.map(part => E("tr").append(
                          E("td").text(part.part),
                          (part.translate ?? [0, 0, 0]).map((e, i) => E("td").attr("data-padding", Math.trunc(e).toString().padStart(padding[i]).match(/^\s*/)[0]).text(`${Math.trunc(e)}${Math.trunc(e) === e ? "" : `.${(Math.round(e % 1 * 100) / 100).toString().split(".")[1]}`}`))
                        ))
                      )
                    )
                  ),
                  E("div").addClass("entity-extras").append(
                    E("div").addClass("entity-texture").append(
                      E("img").attr("src", `/assets/images/minecraft/entities/${entity.name}.png`)
                    ),
                    E("div").addClass("button").append(
                      downloadIcon.clone(),
                      E("span").text("Download Model")
                    ).on("click", e => saveAs(new Blob([compileJSON(model)]), `${entity.file_name}.jem`)),
                    E("a").addClass("button").attr({
                      title: "Requires the CEM Template Loader plugin to be installed in the web app",
                      href: `https://web.blockbench.net/?plugins=cem_template_loader&model=${entity.name}&texture`,
                      target: "_blank"
                    }).append(
                      linkIcon.clone(),
                      E("span").text("Open in Blockbench")
                    )
                  )
                )
              )
            ).on("click", e => {
              if ($(e.target).hasClass("popup")) {
                const params = getURLParams() ?? {}
                delete params.entity
                history.replaceState({}, null, `/cem/${toURLParams(params)}`)
                popup.remove()
              }
            }).appendTo(this.shadowRoot)
            analytics()
          })
        )
      }
    }
    let searchTimeout
    $("#search > input").on("input", e => {
      clearTimeout(searchTimeout)
      const val = e.currentTarget.value.toLowerCase().replace(/_/g, " ")
      
      const params = getURLParams() ?? {}
      params.search = val
      if (!params.search) delete params.search
      history.replaceState({}, null, `/cem/${toURLParams(params)}`)

      const underscored = val.replace(/\s/g, "_")
      $(".entities > div").each((i, e) => {
        const name = $(e).children().last().text().toLowerCase()
        if (name.includes(val) || name.includes(underscored) || e.dataset.id.includes(val) || e.dataset.id.includes(underscored)) $(e).css("display", "")
        else $(e).css("display", "none")
      })
      $(".category-heading").each((i, e) => e.style.display = $(e).next().children().toArray().some(e => e.style.display === "") ? "" : "none")
      $(".no-results").remove()
      if (!$(".category-heading").toArray().some(e => e.style.display === "")) entityContainer.append(
        E("h2").addClass("no-results").text("No results")
      )
      searchTimeout = setTimeout(() => {
        gtag("event", "search", { "search_term": `CEM: ${val}` })
      }, 1000)
    })

    if (params.entity) {
      const element = $(`.entity[data-id="${params.entity}"]`)
      if (element.length) element.click()
      else {
        const params = getURLParams() ?? {}
        delete params.entity
        this.newState = `/cem/${toURLParams(params)}`
      }
    }

    if (params.search) {
      $("#search > input").val(params.search).trigger("input")
    }
  }

  onOpened() {
    if (this.newState) history.replaceState({}, null, this.newState)
  }
}

function compileJSON(object) {
  function newLine(tabs) {
    let s = "\n"
    for(let i = 0; i < tabs; i++) s += "\t"
    return s
  }
  const escape = str => str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n|\r\n/g, "\\n").replace(/\t/g, "\\t")
  function handleVar(o, tabs) {
    let out = ""
    if (typeof o === "string") out += '"' + escape(o) + '"'
    else if (typeof o === "boolean") out += (o ? "true" : "false")
    else if (o === null || o === Infinity || o === -Infinity) out += "null"
    else if (typeof o === "number") {
      o = (Math.round(o * 100000) / 100000).toString()
      out += o
    } else if (o instanceof Array) {
      let has_content = false
      let has_objects = !!o.find(item => typeof item === "object")
      out += "["
      for (let i = 0; i < o.length; i++) {
        let compiled = handleVar(o[i], tabs+1)
        if (compiled) {
          if (has_content) out += ',' + (has_objects ? "" : " ")
          if (has_objects) out += newLine(tabs)
          out += compiled
          has_content = true
        }
      }
      if (has_objects) out += newLine(tabs-1)
      out += "]"
    } else if (typeof o === "object") {
      let breaks = o.constructor.name !== 'oneLiner'
      let has_content = false
      out += "{"
      for (const key in o) {
        if (o.hasOwnProperty(key)) {
          let compiled = handleVar(o[key], tabs+1)
          if (compiled) {
            if (has_content) {out += "," + (breaks ? "" : " ")}
            if (breaks) {out += newLine(tabs)}
            out += '"' + escape(key) + '":' + " "
            out += compiled
            has_content = true
          }
        }
      }
      if (breaks && has_content) out += newLine(tabs - 1)
      out += "}"
    }
    return out
  }
  return handleVar(object, 1)
}