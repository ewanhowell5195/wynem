export default class extends Page {
  constructor() {
    super("home")
    $("a").removeClass("selected")
    $('[href="/"]').addClass("selected")
  }

  static tag = "home-page"

  async setData(params) {
    if (Object.keys(params).length) {
      if (params.commands) this.redirect = `commands/${params.commands}/${params.command ?? ""}`
      else if ("features" in params) this.redirect = "features"
      else if ("privacy" in params) this.redirect = "privacy"
      else if (params.cem) this.redirect = `cem/?entity=${params.cem}`
      else if ("cem" in params) this.redirect = `cem`
    }
  }

  onOpened() {
    if (this.redirect) openPage(new URL(this.redirect, location.origin), "replace")
  }
}