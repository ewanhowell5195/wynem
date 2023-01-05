export default class extends Page {
  constructor() {
    super("features")
    $('[href="/features"]').addClass("selected")
  }

  static tag = "features-page"
  static title = "Features - Wynem"
  static description = "View all of Wynem's main features, what they each do, and how you can use each one in your server!"
}