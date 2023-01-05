export default class extends Page {
  constructor() {
    super("terms")
    $('[href="/terms"]').addClass("selected")
  }

  static tag = "terms-page"
  static title = "Terms of Service - Wynem"
  static description = "View the Terms of Service for Wynem"
}