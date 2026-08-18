import { makeComponents, makeEmbed, makeMessage, makeModal } from "/js/embeds.js"

export default class extends Page {
  constructor() {
    super("embeds", async $ => {
      const section = $("#showcase")
      const heading = text => E("h2").text(text).appendTo(section)
      const args = { outline: true }

      heading("Full embed")
      makeEmbed($, section, {
        content: "Message content above the embed",
        author: ["Author name", "/assets/images/logo/logo.webp", "https://wynem.com"],
        title: "Embed title as a link",
        url: "https://wynem.com",
        description: "Normal **bold** `code` [link](https://wynem.com) <@Ewan> <#bot-testing> <t:6 minutes ago>\n# Heading 1\n## Heading 2\n### Heading 3\n-# Small subtext\n> Blockquote line\n```js\nconst code = true\n```",
        fields: [
          ["Field A", "Row 1 left"],
          ["Field B", "Row 1 right", true],
          ["Field C", "Row 2 left"],
          ["Field D", "Row 2 right", true],
          ["Full width field", "Not inline, spans the full width"]
        ],
        image: "/assets/images/features/glados.webp",
        thumbnail: "/assets/images/logo/logo.webp",
        footer: ["Footer text", "/assets/images/logo/logo.webp"],
        timestamp: "Today at 12:34"
      }, args)

      heading("Multiple embeds, colours, warning style")
      makeEmbed($, section, {
        embeds: [
          { title: "Second embed", description: "With a green colour", colour: "#43B481" },
          { description: "Third embed with a custom colour", colour: "#DD2E44" },
          { warning: true, description: "The warning confirm style\n\nAre you sure you want to continue?" }
        ],
        description: "First embed with the default colour"
      }, args)

      heading("Buttons")
      makeEmbed($, section, {
        description: "Every button style, hover them to see the hover states",
        buttons: [
          { label: "Primary", style: "blue" },
          { label: "Secondary" },
          { label: "Success", style: "green" },
          { label: "Danger", style: "red" },
          { label: "Link button", url: "https://wynem.com" }
        ]
      }, args)
      makeEmbed($, section, {
        description: "Emoji, emoji only, and disabled buttons",
        buttons: [
          { label: "With emoji", emoji: "star" },
          { emoji: "star" },
          { label: "Disabled primary", style: "blue", disabled: true },
          { label: "Disabled secondary", disabled: true }
        ]
      }, args)

      heading("Selects")
      makeEmbed($, section, {
        description: "Every select type, click to open them",
        selects: [
          { placeholder: "String select", options: [
            { label: "Option A", description: "Description of option A", emoji: "star" },
            ["Option B", "Description of option B"],
            "Option C no description"
          ] },
          { placeholder: "Select a user", options: [
            { user: "Ewan", avatar: "/assets/images/logo/ewan.webp", username: "ewanhowell5195" },
            { user: "Wynem", avatar: "/assets/images/logo/logo.webp", username: "wynembot" }
          ] },
          { placeholder: "Select a role", options: [
            { role: "Admin", colour: "#D14949", members: 1 },
            { role: "Moderator", colour: "#5865F2", members: 4 },
            { role: "Member", colour: "#979AA4", members: 128 }
          ] },
          { placeholder: "Select a channel", options: [
            { channel: "general" },
            { channel: "bot-testing" },
            { channel: "welcome" }
          ] }
        ]
      }, args)

      heading("Modal")
      makeModal($, section, {
        title: "Capture Modal",
        rows: [
          "A text display component with **markdown** support",
          ["Short input", "Placeholder text", true],
          ["Paragraph input", "A longer multiline input", false, 1000],
          { label: "Select in a modal", description: "Pick an option", required: true, select: { placeholder: "Select an option", options: [["Option A", "First option"], "Option B"] } },
          { label: "User select in a modal", select: { placeholder: "Select a user", options: [
            { user: "Ewan", avatar: "/assets/images/logo/ewan.webp", username: "ewanhowell5195" },
            { user: "Wynem", avatar: "/assets/images/logo/logo.webp", username: "wynembot" }
          ] } },
          { label: "File upload", description: "Upload up to 3 files", file: 3 },
          { label: "Checkbox group", description: "Pick some options", required: true, checkboxes: [["Checkbox A", "Description for A", true], "Checkbox B"] },
          { label: "Radio group", description: "Pick one option", required: true, radios: [["Radio A", "Description for A", true], "Radio B"] },
          { label: "Single checkbox", description: "Toggle this on or off", checkbox: false }
        ]
      })

      heading("Components V2")
      makeComponents($, section, {
        topLevel: true,
        components: [
          "Top level text display outside any container",
          { type: "container", accent: "#6C80F6", components: [
            "## Container with accent colour\nText display with **markdown**, `code`, [link](https://wynem.com) and <@Ewan>\n-# Small subtext line",
            { type: "section", text: "Section with a button accessory. This text is long enough to wrap onto multiple lines so the layout around the accessory can be seen properly.", button: { label: "Accessory" } },
            { type: "separator" },
            { type: "section", text: "Section with a thumbnail accessory", thumbnail: "/assets/images/logo/logo.webp" },
            { type: "separator", large: true },
            "Large spacing divider above, invisible below",
            { type: "separator", line: false },
            { type: "image", url: "/assets/images/features/glados.webp" },
            { type: "gallery", images: ["/assets/images/features/glados.webp", "/assets/images/logo/wynem_banner.webp"] },
            { type: "row", buttons: [
              { label: "Row in container", style: "blue" },
              { label: "Danger", style: "red" },
              { label: "Link", url: "https://wynem.com" }
            ] },
            { type: "select", placeholder: "Select inside a container", options: [["Option A", "Description here"], "Option B"] },
            { type: "file", name: "capture.txt", size: "21 bytes" }
          ] },
          { type: "container", components: ["Container without an accent colour"] }
        ]
      }, args)

      heading("Media gallery layouts")
      const imgs = ["/assets/images/features/glados.webp", "/assets/images/logo/wynem_banner.webp", "/assets/images/logo/ewan_large.webp", "/assets/images/logo/logo.webp", "/assets/images/avatars/theannoying.webp"]
      makeComponents($, section, {
        topLevel: true,
        components: [
          "Two images",
          { type: "gallery", images: [imgs[0], imgs[1]] },
          "Three images",
          { type: "gallery", images: [imgs[0], imgs[1], imgs[2]] },
          "Four images",
          { type: "gallery", images: [imgs[0], imgs[1], imgs[2], imgs[3]] },
          "Five images, one spoilered, click the spoiler to reveal it",
          { type: "gallery", images: [imgs[0], imgs[1], imgs[2], imgs[3], { url: imgs[4], spoiler: true }] }
        ]
      }, args)

      heading("Identities")
      makeEmbed($, section, {
        username: "Wynem - Server logs",
        tag: "APP",
        description: "A webhook message, plain APP tag with no verified tick"
      }, args)
      makeEmbed($, section, {
        avatar: "/assets/images/features/customisation/avatar.webp",
        description: "A custom avatar override"
      }, args)

      heading("User messages and replies")
      makeMessage($, section, {
        name: "Ewan",
        colour: "#D14949",
        image: "/assets/images/logo/ewan.webp",
        message: "A plain user message"
      }, args)
      makeEmbed($, section, {
        reply: {
          name: "Ewan",
          colour: "#D14949",
          image: "/assets/images/logo/ewan.webp",
          message: "e!command args"
        },
        title: "Reply",
        description: "A bot reply to a user message"
      }, args)
    })
  }

  static tag = "embeds-page"
  static title = "Embed Showcase - Wynem"
  static description = "Test page for the website's Discord mock system."
}