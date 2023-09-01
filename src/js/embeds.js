function populateEmbed(embed, text, thumbnail, data) {
  if (data.colour) embed.css("border-left", `4px solid ${data.colour}`)
  if (data.author) {
    E("div").addClass("embed-author").append(
      data.author[1] ? E("img").attr("src", data.author[1]) : undefined,
      E("div").text(data.author[0])
    ).appendTo(text)
  } else if (data.warning) {
    E("div").addClass("embed-author").append(
      E("img").attr("src", "/assets/images/emojis/warn.webp"),
      E("div").text("Warning!")
    ).appendTo(text)
  }
  if (data.title) {
    E(data.url ? "a" : "div").attr({ href: data.url, target: "_blank" }).addClass("embed-title").attr("href", data.url).html(parseString(data.title)).appendTo(text)
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
    E("img").addClass("embed-image popupable").attr("src", data.image).appendTo(embed)
  }
  if (data.thumbnail) {
    E("img").addClass("embed-thumbnail popupable").attr("src", data.thumbnail).appendTo(thumbnail)
  } else {
    thumbnail.remove()
  }
  if (data.footer) {
    E("div").addClass("embed-footer").append(
      data.footer[1] ? E("img").attr("src", data.footer[1]) : undefined,
      E("div").text(data.footer[0])
    ).appendTo(embed)
  }
  if (!(data.author || data.warning || data.title || data.description || data.fields || data.image || data.thumbnail || data.footer)) embed.remove()
}

export function makeEmbed($, parent, data, args = {}) {
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
            $("#check-icon").contents().clone(),
            E("div").text("BOT")
          )
        ),
        embed = E("div").addClass(`embed${data.warning ? " warning" : ""}`).append(
          E("div").append(
            text = E("div"),
            thumbnail = E("div")
          )
        ),
        buttons = E("div").addClass("embed-buttons")
      )
    )
  )
  populateEmbed(embed, text, thumbnail, data)
  if (data.embeds) for (const data2 of data.embeds) {
    let text2, thumbnail2
    const embed2 = E("div").addClass(`embed${data.warning ? " warning" : ""}`).append(
      E("div").append(
        text2 = E("div"),
        thumbnail2 = E("div")
      )
    ).insertAfter(embed)
    populateEmbed(embed2, text2, thumbnail2, data2)
  }
  if (data.reply) {
    reply.append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
  if (data.content) {
    E("div").addClass("text-content").html(parseString(data.content)).insertBefore(embed)
  }
  if (data.buttons) {
    for (const button of data.buttons)
    E(button.url ? "a" : "div").attr({ href: button.url, target: "_blank" }).addClass(`embed-button${button.style ? ` embed-button-${button.style}` : ""}`).append(
      button.emoji ? E("img").attr("src", `/assets/images/emojis/${button.emoji}.webp`) : undefined,
      button.label ? E("div").text(button.label) : undefined,
      button.url ? $("#external-icon").contents().clone() : undefined
    ).appendTo(buttons)
  }
  parent.append(container)
}

export function makeMessage($, parent, data, args = {}) {
  let message
  const container = E("div").addClass("embed-container message-container").append(
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", data.image)
      ),
      E("div").addClass("embed-content").append(
        E("div").addClass("name-row").append(
          E("div").addClass("name").text(data.name).css("color", data.colour)
        ),
        message = E("div").addClass("message").text(data.message)
      )
    )
  )
  parent.append(container)
}

export function makeModal($, parent, data) {
  let modal
  const container = E("div").addClass("modal-container").append(
    E("div").addClass("modal-top").append(
      E("img").attr("src", "/assets/images/logo/logo.webp"),
      E("div").text(data.title),
      $("#close-icon").contents().clone()
    ),
    modal = E("div").addClass("modal"),
    E("div").addClass("modal-bottom").append(
      E("div").addClass("modal-close").text("Close"),
      E("div").addClass("modal-submit").text("Submit")
    )
  )
  for (const row of data.rows) {
    let input, count
    E("div").addClass("modal-row").append(
      E("div").addClass("modal-row-title").html(`${row[0]}${row[2] ? " <span>*</span>" : ""}`),
      E("div").addClass("modal-row-input-container").append(
        input = E(row[3] ? "textarea" : "input").addClass(`modal-row-input${row[3] ? " long" : ""}`).attr({
          placeholder: row[1],
          rows: 3,
          maxlength: row[3] ?? 128
        }),
        row[3] ? count = E("div").addClass("count").text(row[3]) : undefined
      )
    ).appendTo(modal)
    if (count) input.on("input", e => count.text(row[3] - parseInt(input.val().length)))
  }
  parent.append(container)
}

export function parseString(str) {
  return str.replace(/<command:(.+?)\|(.+?)>/g, '<code class="command prefix">e!$1</code><code class="command slash">/$2</code>')
            .replace(/```((?:.|\n)+?)```/g, '<div class="codeblock">$1</div>')
            .replace(/`((?:.|\n)+?)`/g, "<code>$1</code>")
            .replace(/<([@#].+?)>/g, '<span class="ping">$1</span>')
            .replace(/<:(\/.+?)>/g, (s, m) => `<a is="f-a" class="ping" href="/commands/slash${m.replace(/\s/g, "/")}">${m}</a>`)
            .replace(/<:(.+?):>/g, '<img class="emoji" src="/assets/images/emojis/$1.webp" />')
            .replace(/<t:(.+?)>/g, '<span class="timestamp">$1</span>')
            .replace(/\*\*((?:.|\n)+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^>\s/gm, '<span class="listbar"></span>')
            .replace(/^##\s(.*)$/gm, '<div class="heading2">$1</div>')
            .replace(/\[([^\[\]]+?)\]\((.+?)\)/g, (m, s, l) => {
              if (l.startsWith("/")) return `<a is="f-a" href="${l}">${s}</a>`
              return `<a href="${l}" target="_blank">${s}</a>`
            })
}