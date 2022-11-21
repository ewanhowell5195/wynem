export default class extends Page {
  constructor() {
    super("features")
    $("a").removeClass("selected")
    $('[href="/features"]').addClass("selected")
  }

  static tag = "features-page"
  static title = "Features - Wynem"
  static description = "This page doesn't exist"
}