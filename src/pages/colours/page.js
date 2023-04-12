export default class ColoursPage extends Page {
  constructor() {
    super("colours")
  }

  static tag = "colours-page"
  static title = "Colours - Wynem"
  static description = "View a colour palette"

  async setData({id}) {
    await this.ready
    const container = this.$("#color-container")
    const r = await fetch(`https://api.wynem.com/palette/${id}`)
    container.empty()
    if (r.status !== 200) {
      container.append(
        E("p").text("Palette not found. It probably timed out.")
      )
      return console.log("error")
    }
    const palette = await r.json()
    const slice = palette.slice(0, 128)
    loadPalette(this.$, container, slice)
    if (slice.length < palette.length) {
      const loadMore = this.$("#load-more")
      let offset = 128
      loadMore.css("display", "flex").on("click", e => {
        loadPalette(this.$, container, palette.slice(offset, offset + 128))
        offset += 128
        if (offset === palette.length) loadMore.css("display", "none")
      })
    }
  }

  onOpened() {
    if (this.newState) history.replaceState({}, null, this.newState)
  }
}

function loadPalette($, container, palette) {
  for (const col of palette) {
    container.append(
      E("div").addClass("colour").append(
        E("div").addClass("hex").css("background-color", col[0]).append(
          E("div").addClass("text").text(col[0])
        )
      ).on("click", async e => {
        const input = $("#text-copier")
        input.val(col[0]).select()
        document.execCommand("Copy")
        input.blur()
        $(e.currentTarget).find(".text").text("copied...")
        await new Promise(fulfil => setTimeout(fulfil, 1000))
        $(e.currentTarget).find(".text").text(col[0])
      })
    )
  }
}