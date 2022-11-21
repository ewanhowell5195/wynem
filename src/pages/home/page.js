export default class extends Page {
  constructor() {
    super("home")
    $("a").removeClass("selected")
    $('[href="/"]').addClass("selected")
  }

  static tag = "home-page"
}