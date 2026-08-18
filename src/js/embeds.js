function populateEmbed(embed, text, thumbnail, data) {
  if (data.colour) embed.css("border-left", `4px solid ${data.colour}`)
  if (data.author) {
    E("div").addClass("embed-author").append(
      data.author[1] ? E("img").attr("src", data.author[1]) : undefined,
      data.author[2] ? E("a").attr("href", data.author[2]).text(data.author[0]) : E("div").text(data.author[0])
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
    E("img").addClass("embed-image").attr({ src: data.image, "data-popupable": "" }).appendTo(embed)
  }
  if (data.thumbnail) {
    E("img").addClass("embed-thumbnail").attr({ src: data.thumbnail, "data-popupable": "" }).appendTo(thumbnail)
  } else {
    thumbnail.remove()
  }
  if (data.timestamp) {
    if (data.footer) {
      data.footer[0] += " • " + data.timestamp
    } else {
      data.footer = [data.timestamp]
    }
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
  let reply, nameRow, embed, selectContainer, buttons, text, thumbnail
  const container = E("div").addClass("embed-container").append(
    reply = E("div").addClass("reply-container").css("display", "none"),
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", data.avatar ?? "/assets/images/logo/logo.webp")
      ),
      E("div").addClass("embed-content").append(
        nameRow = E("div").addClass("name-row").append(
          E("div").addClass("name").text(data.username ?? "Wynem"),
          E("div").addClass("tag").append(
            data.tag ? undefined : $("#check-icon").contents().clone(),
            E("div").text(data.tag ?? "BOT")
          )
        ),
        embed = E("div").addClass(`embed${data.warning ? " warning" : ""}`).append(
          E("div").append(
            text = E("div"),
            thumbnail = E("div")
          )
        ),
        selectContainer = E("div").addClass("embed-selects").css("display", "none"),
        buttons = E("div").addClass("embed-buttons").css("display", "none")
      )
    )
  )
  if (data.userless) container.addClass("userless")
  populateEmbed(embed, text, thumbnail, data)
  if (data.embeds) {
    for (const data2 of data.embeds) {
      let text2, thumbnail2
      const embed2 = E("div").addClass(`embed${data.warning ? " warning" : ""}`).append(
        E("div").append(
          text2 = E("div"),
          thumbnail2 = E("div")
        )
      ).insertAfter(embed)
      populateEmbed(embed2, text2, thumbnail2, data2)
    }
  }
  if (data.reply) {
    reply.css("display", "flex").append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
  if (data.content) {
    E("div").addClass("text-content").html(parseString(data.content)).insertAfter(nameRow)
  }
  const selectDatas = data.selects ?? (data.select ? [data.select] : [])
  if (selectDatas.length) {
    selectContainer.css("display", "flex")
    for (const select of selectDatas) makeSelect($, E("div").addClass("embed-select-container").appendTo(selectContainer), select)
  }
  if (data.buttons) {
    buttons.css("display", "flex")
    for (const button of data.buttons) buttons.append(makeButton($, button))
  }
  parent.append(container)
}

function makeButton($, button) {
  return E(button.url ? "a" : "div").attr({ href: button.url, target: "_blank" }).addClass(`embed-button${button.style ? ` embed-button-${button.style}` : ""}`).append(
    button.emoji ? E("img").attr("src", `/assets/images/emojis/${button.emoji}.webp`) : undefined,
    button.label ? E("div").text(button.label) : undefined,
    button.url ? $("#url-icon").contents().clone() : undefined
  )
}

function makeSelect($, selectContainer, data) {
  let text
  const drop = E("div").addClass("embed-select").append(
    text = E("div").text(data.placeholder).addClass("placeholder"),
    $("#drop-icon").contents().clone(),
  ).on("click", e => {
    const select = $(e.currentTarget)
    select.toggleClass("active")
    options.toggle()
    if (select.hasClass("active")) {
      openSelects.push([select[0], options[0]])
    }
  }).appendTo(selectContainer)
  const options = E("div").addClass("embed-select-options").hide().appendTo(selectContainer)
  for (const option of data.options) {
    const [label, description] = Array.isArray(option) ? option : [option]
    const div = E("div").append(
      E("div").text(label),
      description ? E("div").text(description) : undefined,
      $("#check-icon").contents().clone()
    ).on("click", e => {
      text.text(label).removeClass("placeholder")
      drop.click()
      options.find(".active").removeClass("active")
      div.addClass("active")
    }).appendTo(options)
  }
}

export function makeComponents($, parent, data, args = {}) {
  let reply, cv2
  const container = E("div").addClass("embed-container").append(
    reply = E("div").addClass("reply-container").css("display", "none"),
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", data.avatar ?? "/assets/images/logo/logo.webp")
      ),
      E("div").addClass("embed-content").append(
        E("div").addClass("name-row").append(
          E("div").addClass("name").text(data.username ?? "Wynem"),
          E("div").addClass("tag").append(
            data.tag ? undefined : $("#check-icon").contents().clone(),
            E("div").text(data.tag ?? "BOT")
          )
        ),
        cv2 = E("div").addClass("cv2")
      )
    )
  )
  if (data.colour) cv2.css("border-left", `4px solid ${data.colour}`)
  for (const item of data.components) {
    if (typeof item === "string") {
      E("div").addClass("cv2-text").html(parseString(item)).appendTo(cv2)
    } else if (item.type === "separator") {
      E("div").addClass(`cv2-separator${item.line === false ? " invisible" : ""}`).appendTo(cv2)
    } else if (item.type === "section") {
      E("div").addClass("cv2-section").append(
        E("div").addClass("cv2-text").html(parseString(item.text)),
        item.button ? makeButton($, item.button) : item.thumbnail ? E("img").addClass("cv2-thumbnail").attr({ src: item.thumbnail, "data-popupable": "" }) : undefined
      ).appendTo(cv2)
    } else if (item.type === "row") {
      const row = E("div").addClass("cv2-buttons").appendTo(cv2)
      for (const button of item.buttons) row.append(makeButton($, button))
    } else if (item.type === "select") {
      makeSelect($, E("div").addClass("embed-select-container").appendTo(cv2), item)
    } else if (item.type === "gallery") {
      const gallery = E("div").addClass("cv2-gallery").appendTo(cv2)
      for (const image of item.images) gallery.append(E("img").attr({ src: image, "data-popupable": "" }))
    }
  }
  if (data.reply) {
    reply.css("display", "flex").append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
  parent.append(container)
}

export function makeMessage($, parent, data, args = {}) {
  let reply
  const container = E("div").addClass("embed-container message-container").append(
    reply = E("div").addClass("reply-container").css("display", "none"),
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", data.image)
      ),
      E("div").addClass("embed-content").append(
        E("div").addClass("name-row").append(
          E("div").addClass("name").text(data.name).css("color", data.colour)
        ),
        E("div").addClass("message").text(data.message)
      )
    )
  )
  if (data.reply) {
    reply.css("display", "flex").append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
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
      E("div").addClass("modal-close").text("Cancel"),
      E("div").addClass("modal-submit").text("Submit")
    )
  )
  for (const row of data.rows) {
    if (!Array.isArray(row)) {
      const selectContainer = E("div").addClass("embed-select-container")
      makeSelect($, selectContainer, row.select)
      E("div").addClass("modal-row").append(
        E("div").addClass("modal-row-title").html(`${row.label}${row.required ? " <span>*</span>" : ""}`),
        row.description ? E("div").addClass("modal-row-description").text(row.description) : undefined,
        selectContainer
      ).appendTo(modal)
      continue
    }
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
            .replace(/```((?:.|\n)+?)```/g, (_, code) => `<div class="codeblock">${code.replace(/`/g, "´")}</div>`)
            .replace(/`((?:.|\n)+?)`/g, "<code>$1</code>")
            .replace(/´/g, "`")
            .replace(/<@&(.+?)>/g, '<span class="ping role">@$1</span>')
            .replace(/<([@#].+?)>/g, '<span class="ping">$1</span>')
            .replace(/<:(\/.+?)>/g, (s, m) => `<a is="f-a" class="ping" href="/commands/slash${m.replace(/\s/g, "/")}">${m}</a>`)
            .replace(/<:(.+?):>/g, '<img class="emoji" src="/assets/images/emojis/$1.webp" />')
            .replace(/<t:(.+?)>/g, '<span class="timestamp">$1</span>')
            .replace(/\*\*((?:.|\n)+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^>\s/gm, '<span class="listbar"></span>')
            .replace(/^##\s(.*)$/gm, '<div class="heading2">$1</div>')
            .replace(/^-#\s(.*)$/gm, '<div class="small">$1</div>')
            .replace(/\[([^\[\]]+?)\]\((.+?)\)/g, (m, s, l) => {
              if (l.startsWith("/")) return `<a is="f-a" href="${l}">${s}</a>`
              return `<a href="${l}" target="_blank">${s}</a>`
            })
}