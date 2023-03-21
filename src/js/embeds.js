export function makeEmbed($, parent, data, args = {}) {
  const checkIcon = $("#check-icon").contents()
  const externalIcon = $("#external-icon").contents()
  let reply, embed, buttons, text, thumbnail
  const container = E("div").addClass("embed-container").append(
    reply = E("div").addClass("reply-container"),
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", "/assets/images/logo/logo.webp")
      ),
      E("div").addClass("embed-content").append(
        E("div").addClass("name-row").append(
          E("div").addClass("name").text("Wynem"),
          E("div").addClass("tag").append(
            checkIcon.clone(),
            E("div").text("BOT")
          )
        ),
        embed = E("div").addClass("embed").append(
          E("div").append(
            text = E("div"),
            thumbnail = E("div")
          )
        ),
        buttons = E("div").addClass("embed-buttons")
      )
    )
  )
  if (data.reply) {
    reply.append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
  if (data.author) {
    E("div").addClass("embed-author").append(
      data.author[1] ? E("img").attr("src", data.author[1]) : undefined,
      E("div").text(data.author[0])
    ).appendTo(text)
  }
  if (data.title) {
    E(data.url ? "a" : "div").attr({ href: data.url, target: "_blank" }).addClass("embed-title").attr("href", data.url).text(data.title).appendTo(text)
  }
  if (data.description) {
    E("div").addClass("embed-description").html(parseString(data.description)).appendTo(text)
  }
  if (data.fields) {
    let fields
    for (const field of data.fields) {
      if (!fields || !field[2]) fields = E("div").addClass("embed-fields").appendTo(text)
      fields.append(E("div").append(
        E("div").addClass("embed-field-name").html(parseString(field[0])),
        E("div").addClass("embed-field-value").html(parseString(field[1]))
      ))
    }
  }
  if (data.image) {
    E("img").addClass("embed-image").attr("src", data.image).appendTo(embed)
  }
  if (data.thumbnail) {
    E("img").addClass("embed-thumbnail").attr("src", data.thumbnail).appendTo(thumbnail)
  }
  if (data.footer) {
    E("div").addClass("embed-footer").append(
      data.footer[1] ? E("img").attr("src", data.footer[1]) : undefined,
      E("div").text(data.footer[0])
    ).appendTo(embed)
  }
  if (data.buttons) {
    for (const button of data.buttons)
    E(button.url ? "a" : "div").attr({ href: button.url, target: "_blank" }).addClass(`embed-button${button.style ? ` embed-button-${button.style}` : ""}`).append(
      button.emoji ? E("img").attr("src", `/assets/images/emojis/${button.emoji}.webp`) : undefined,
      button.label ? E("div").text(button.label) : undefined,
      button.url ? externalIcon.clone() : undefined
    ).appendTo(buttons)
  }
  parent.append(container)
}

function parseString(str) {
  return str.replace(/```((?:.|\n)+?)```/g, '<div class="codeblock">$1</div>')
            .replace(/`((?:.|\n)+?)`/g, "<code>$1</code>")
            .replace(/<(@.+?)>/g, '<span class="ping">$1</span>')
            .replace(/<:(.+?):>/g, '<img class="emoji" src="/assets/images/emojis/$1.webp" />')
            .replace(/<t:(.+?)>/g, '<span class="timestamp">$1</span>')
            .replace(/\*\*((?:.|\n)+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^>\s/gm, '<span class="listbar"></span>')
}