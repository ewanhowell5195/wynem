export default class extends Page {
  constructor() {
    super("features", async $ => {
      await fetchJSON("features")
      const container = $("#features")
      const categories = ["Moderation", "Server Setup", "Messages & Responses", "Tools & Utilities"]
      for (const feature of features) {
        if (!categories.includes(feature.category ?? "Other")) categories.push(feature.category ?? "Other")
      }
      const grids = {}
      for (const category of categories) {
        if (!features.some(e => (e.category ?? "Other") === category)) continue
        E("div").addClass("feature-category").append(
          E("h2").text(category),
          grids[category] = E("div").addClass("feature-grid")
        ).appendTo(container)
      }
      for (const feature of features) {
        const name = feature.name ?? feature.id.replace(/-/g, " ").toTitleCase()
        E("a", { is: "f-a" }).attr("href", `/features/${feature.id}`).addClass("feature").attr("data-search", `${name} ${feature.description}`.toLowerCase()).append(
          E("div").addClass("feature-top").append(
            feature.icon ? E("img").addClass(feature.iconPlain ? "plain" : undefined).attr("src", `/assets/images/${feature.icon}.webp`) : undefined,
            E("div").addClass("title").text(name)
          ),
          E("div").addClass("text").text(feature.description)
        ).appendTo(grids[feature.category ?? "Other"])
      }
      $("#search input").on("input", e => {
        const query = e.currentTarget.value.toLowerCase().trim()
        let any = false
        $(".feature").each((i, feature) => {
          const show = !query || feature.getAttribute("data-search").includes(query)
          feature.style.display = show ? "" : "none"
          if (show) any = true
        })
        $(".feature-category").each((i, category) => {
          category.style.display = Array.from(category.querySelectorAll(".feature")).some(e => e.style.display !== "none") ? "" : "none"
        })
        $("#no-results").css("display", any ? "none" : "")
      })
    })
    $('[href="/features"]').addClass("selected")
  }

  static tag = "features-page"
  static title = "Features - Wynem"
  static description = "View all of Wynem's main features, what they each do, and how you can use each one in your server!"
}