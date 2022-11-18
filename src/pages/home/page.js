export default class HomePage extends Page {
  constructor() {
    super("home")
    $("a").removeClass("selected")
    $('[href="/"]').addClass("selected")
  }

  static tag = "home-page"
}

customElements.define(HomePage.tag, HomePage)