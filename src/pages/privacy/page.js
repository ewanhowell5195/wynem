export default class extends Page {
  constructor() {
    super("privacy")
    $("a").removeClass("selected")
    $('[href="/privacy"]').addClass("selected")
  }

  static tag = "privacy-page"
  static title = "Privacy Policy - Wynem"
  static description = "View the Privacy Policy for Wynem"
}