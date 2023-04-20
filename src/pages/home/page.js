import { makeEmbed } from "/js/embeds.js"

export default class extends Page {
  constructor() {
    super("home", $ => {
      $("#about-button").on("click", () => $("#about")[0].scrollIntoView({ behavior: "smooth" }))
    })
    $('[href="/"]').addClass("selected")
  }

  static tag = "home-page"

  async setData(params) {
    if (Object.keys(params).length) {
      if (params.commands) this.redirect = `commands/${params.commands}/${params.command ?? ""}`
      else if ("features" in params) this.redirect = "features"
      else if ("privacy" in params) this.redirect = "privacy"
      else if (params.cem) this.redirect = `cem/?entity=${params.cem}`
      else if ("cem" in params) this.redirect = "cem"
      else if ("cem_animation_doc" in params) this.redirect = "cemanimation"
    }
    await this.ready
    const $ = this.$
    makeEmbed($, $("#image"), {
      reply: {
        name: "Ewan",
        colour: "#D14949",
        image: "/assets/images/logo/ewan.webp",
        message: "e!snap <@pynk>"
      },
      image: "/assets/images/home/snapped.webp",
      footer: ["snapped.png - 420x517 - 430.2 KB"]
    }, { outline: true })
    makeEmbed($, $("#utility"), {
      title: "What is the best Half-Life game?",
      description: "In your opinion, what is the best Half-Life game?",
      fields: [
        ["Options", "<:a:> - Half-Life\n\n<:b:> - Half-Life 2\n\n<:c:> - Hunt Down the Freeman"],
        ["End date", "<t:26 July 2020 23:55>"]
      ],
      footer: ["You can vote 1 time\n\n\n\nPoll created by ewanhowell5195#5195"],
      buttons: [
        {
          label: "Vote",
          style: "green",
          emoji: "checkbox"
        },
        {
          label: "Manage",
          emoji: "wrench"
        }
      ]
    }, { outline: true })
    makeEmbed($, $("#moderation"), {
      reply: {
        name: "Ewan",
        colour: "#D14949",
        image: "/assets/images/logo/ewan.webp",
        message: "e!records <@CCCode>"
      },
      author: ["Member records", "/assets/images/icons/logs.webp"],
      description: "**Records for** <@CCCode>\n\n**Total records:** 3\n**Total notes:** 1\n**Total warnings:** 1\n**Total timeouts:** 1\n\n<:warn:> **Warning\nGiven by** <@Ewan> **on <t:3 January 2023>\nReason:**\n> Breaking rule 17\nRecord ID: `1056`\n\n<:note:> **Note\nGiven by** <@Ewan> **on <t:3 January 2023>\nReason:**\n> Doesn't like Hunt Down the Freeman\nRecord ID: `1055`\n\n<:mute:> **Timeout\nGiven by** <@Ewan> **on <t:3 January 2023> for `10m`\nReason:**\n> Preferring Half-Life 2 over Hunt Down the Freeman\nRecord ID: `1054`",
      thumbnail: "/assets/images/avatars/cccode.webp",
      footer: ["User ID: 144918157377798144"],
      buttons: [{
        style: "red",
        emoji: "bin"
      }]
    }, { outline: true })
    makeEmbed($, $("#minecraft"), {
      reply: {
        name: "Ewan",
        colour: "#D14949",
        image: "/assets/images/logo/ewan.webp",
        message: "e!texture steve 1.19.4"
      },
      title: "steve.png",
      fields: [
        ["Version", "`1.19.4`"],
        ["Resolution", "`64x64`", true],
        ["File location", "`/assets/minecraft/textures/entity/player/wide/steve.png`"]
      ],
      image: "/assets/images/home/steve_large.webp",
      thumbnail: "/assets/images/home/steve.webp"
    }, { outline: true })
  }

  onOpened() {
    if (this.redirect) openPage(new URL(this.redirect, location.origin), "replace")
  }
}