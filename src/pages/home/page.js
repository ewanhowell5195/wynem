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
      else if (params.features !== undefined) this.redirect = `features`
      else if (params.privacy !== undefined) this.redirect = `privacy`
    }
  }

  onOpened() {
    if (this.redirect) openPage(new URL(this.redirect, location.origin), "replace")
  }
}