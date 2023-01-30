export default class extends Page {
  constructor() {
    super("features", async $ => {
      await fetchJSON("features")
      const section = $("#features")
      for (const feature of features) {
        E("a", { is: "f-a" }).attr("href", `/features/${feature.id}`).addClass("feature").append(
          E("div").addClass("title").text(feature.name ?? feature.id.replace(/-/g, " ").toTitleCase()),
          E("div").addClass("text").text(feature.description)
        ).appendTo(section)
      }
    })
    $('[href="/features"]').addClass("selected")
  }

  static tag = "features-page"
  static title = "Features - Wynem"
  static description = "View all of Wynem's main features, what they each do, and how you can use each one in your server!"
}