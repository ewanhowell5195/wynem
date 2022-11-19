export default class FeaturesPage extends Page {
  constructor() {
    super("features")
    $("a").removeClass("selected")
    $('[href="/features"]').addClass("selected")
  }

  static tag = "features-page"
}