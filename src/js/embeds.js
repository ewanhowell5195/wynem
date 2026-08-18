const fileIcon = '<svg viewBox="0 0 30 40"><path d="M4 0 H20 L30 10 V36 A4 4 0 0 1 26 40 H4 A4 4 0 0 1 0 36 V4 A4 4 0 0 1 4 0 Z" fill="#5865F2"/><path d="M20 0 L30 10 H22 A2 2 0 0 1 20 8 Z" fill="#CDD7FF"/><rect x="5" y="16" width="20" height="3" rx="1.5" fill="#FFF"/><rect x="5" y="23" width="20" height="3" rx="1.5" fill="#FFF"/><rect x="5" y="30" width="12" height="3" rx="1.5" fill="#FFF"/></svg>'
const uploadIcon = '<svg viewBox="0 0 24 24"><path d="M11 16 V7.83 L8.41 10.41 L7 9 L12 4 L17 9 L15.59 10.41 L13 7.83 V16 Z"/><path d="M5 18 H19 V20 H5 Z"/></svg>'
const hashIcon = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.25 3.35 8.51 8 H5.21 L4.89 10 H8.19 L7.55 14 H4.25 L3.93 16 H7.23 L6.49 20.65 H8.52 L9.26 16 H13.23 L12.49 20.65 H14.52 L15.26 16 H18.56 L18.88 14 H15.58 L16.22 10 H19.52 L19.84 8 H16.54 L17.28 3.35 H15.25 L14.51 8 H10.54 L11.28 3.35 Z M10.22 10 H14.19 L13.55 14 H9.58 Z"/></svg>'
const personIcon = '<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4.5" fill="currentColor"/><path d="M3.5 21 a8.5 8.5 0 0 1 17 0 Z" fill="currentColor"/></svg>'
const roleIcon = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="9.5" r="3.2" style="fill: var(--dc-popout)"/><path d="M6 18.5 a6 6 0 0 1 12 0 Z" style="fill: var(--dc-popout)"/></svg>'

function makeChrome($, data, args = {}) {
  let reply, content
  const container = E("div").addClass("embed-container").append(
    reply = E("div").addClass("reply-container").css("display", "none"),
    E("div").append(
      E("div").addClass("pfp-container").append(
        E("img").addClass(args.outline ? "outline" : undefined).attr("src", data.avatar ?? "/assets/images/logo/logo.webp")
      ),
      content = E("div").addClass("embed-content").append(
        E("div").addClass("name-row").append(
          E("div").addClass("name").css("color", data.colour).text(data.username ?? "Wynem"),
          data.tag === false ? undefined : E("div").addClass("tag").append(
            data.tag ? undefined : $("#check-icon").contents().clone(),
            E("div").text(data.tag ?? "APP")
          ),
          E("div").addClass("msg-timestamp").text(data.time ?? "12:34")
        )
      )
    )
  )
  if (data.userless) container.addClass("userless")
  if (data.reply) {
    reply.css("display", "flex").append(
      E("img").attr("src", data.reply.image),
      E("div").css("color", data.reply.colour).text(data.reply.name),
      E("div").html(parseString(data.reply.message))
    )
  }
  if (data.content) {
    content.append(E("div").addClass("text-content").html(parseString(data.content)))
  }
  return { container, content }
}

function populateEmbed($, embed, data) {
  if (data.author) {
    E("div").addClass("embed-author").append(
      data.author[1] ? E("img").attr("src", data.author[1]) : undefined,
      E(data.author[2] ? "a" : "span").attr({ href: data.author[2], target: data.author[2] ? "_blank" : undefined }).text(data.author[0])
    ).appendTo(embed)
  } else if (data.warning) {
    E("div").addClass("embed-author").append(
      E("img").attr("src", "/assets/images/emojis/warn.webp"),
      E("span").text("Warning!")
    ).appendTo(embed)
  }
  if (data.title) {
    const title = E("div").addClass("embed-title").appendTo(embed)
    if (data.url) title.append(E("a").attr({ href: data.url, target: "_blank" }).html(parseString(data.title)))
    else title.html(parseString(data.title))
  }
  if (data.description) {
    E("div").addClass("embed-description").html(parseString(data.description)).appendTo(embed)
  }
  if (data.fields) {
    const fields = E("div").addClass("embed-fields").appendTo(embed)
    let row
    for (const field of data.fields) {
      if (!row || !field[2]) row = E("div").addClass("embed-field-row").appendTo(fields)
      row.append(E("div").append(
        E("div").addClass("embed-field-name").html(parseString(field[0])),
        E("div").addClass("embed-field-value").html(parseString(field[1]))
      ))
    }
  }
  if (data.image) {
    E("img").addClass("embed-image").attr({ src: data.image, "data-popupable": "" }).appendTo(embed)
  }
  if (data.footer || data.timestamp) {
    const footer = E("div").addClass("embed-footer").appendTo(embed)
    if (data.footer?.[1]) footer.append(E("img").attr("src", data.footer[1]))
    const text = E("span").appendTo(footer)
    if (data.footer?.[0]) text.append(document.createTextNode(data.footer[0]))
    if (data.footer?.[0] && data.timestamp) text.append(E("span").addClass("embed-footer-separator").text("•"))
    if (data.timestamp) text.append(document.createTextNode(data.timestamp))
  }
  if (data.thumbnail) {
    embed.addClass("has-thumbnail")
    E("div").addClass("embed-thumbnail").append(
      E("img").attr({ src: data.thumbnail, "data-popupable": "" })
    ).appendTo(embed)
  }
  if (!embed[0].children.length) embed.remove()
}

export function makeEmbed($, parent, data, args = {}) {
  const { container, content } = makeChrome($, data, args)
  const makeOne = embedData => {
    const embed = E("article").addClass(`embed${embedData.warning ? " warning" : ""}`).appendTo(content)
    if (embedData.colour) embed.css("border-left-color", embedData.colour)
    populateEmbed($, embed, embedData)
  }
  makeOne(data)
  for (const extra of data.embeds ?? []) makeOne(extra)
  const selectDatas = data.selects ?? (data.select ? [data.select] : [])
  if (selectDatas.length) {
    const selects = E("div").addClass("embed-selects").appendTo(content)
    for (const select of selectDatas) makeSelect($, selects, select)
  }
  if (data.buttons) {
    const buttons = E("div").addClass("embed-buttons").appendTo(content)
    for (const button of data.buttons) buttons.append(makeButton($, button))
  }
  parent.append(container)
}

function makeButton($, button) {
  return E(button.url ? "a" : "div").attr(button.url ? { href: button.url, target: "_blank" } : {}).addClass(`embed-button${button.style ? ` embed-button-${button.style}` : ""}${button.disabled ? " disabled" : ""}`).append(
    button.emoji ? E("img").attr("src", `/assets/images/emojis/${button.emoji}.webp`) : undefined,
    button.label ? E("div").text(button.label) : undefined,
    button.url ? $("#url-icon").contents().clone() : undefined
  )
}

function makeSelect($, parent, data) {
  const selectContainer = E("div").addClass("embed-select-container").appendTo(parent)
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
  for (const option of data.options ?? []) {
    const opt = typeof option === "string" ? { label: option } : Array.isArray(option) ? { label: option[0], description: option[1] } : option
    let div, selectedText
    if (opt.user || opt.role || opt.channel) {
      selectedText = opt.channel ? `# ${opt.channel}` : opt.user ?? opt.role
      div = E("div").addClass("entity").append(
        opt.user ? E("img").attr("src", opt.avatar) : undefined,
        opt.role ? E("div").addClass("entity-role").css("color", opt.colour).html(roleIcon) : undefined,
        opt.channel ? E("div").addClass("entity-channel").html(hashIcon) : undefined,
        E("div").addClass("entity-label").text(opt.user ?? opt.role ?? opt.channel),
        opt.username ? E("div").addClass("entity-sub").text(opt.username) : undefined,
        opt.members !== undefined ? E("div").addClass("entity-members").append(
          E("div").html(personIcon).contents(),
          E("div").text(opt.members)
        ) : undefined
      )
    } else {
      selectedText = opt.label
      div = E("div").append(
        opt.emoji ? E("img").attr("src", `/assets/images/emojis/${opt.emoji}.webp`) : undefined,
        E("div").addClass("embed-select-option-label").append(
          E("div").text(opt.label),
          opt.description ? E("div").text(opt.description) : undefined
        ),
        $("#check-icon").contents().clone()
      )
    }
    div.on("click", e => {
      text.text(selectedText).removeClass("placeholder")
      drop.click()
      options.find(".active").removeClass("active")
      div.addClass("active")
    }).appendTo(options)
  }
}

export function makeComponents($, parent, data, args = {}) {
  const { container, content } = makeChrome($, data, args)
  const cv2 = E("div").addClass("cv2").appendTo(content)
  const renderItems = (items, target) => {
    for (const item of items) {
      if (typeof item === "string") {
        E("div").addClass("cv2-text").html(parseString(item)).appendTo(target)
      } else if (item.type === "container") {
        const inner = E("div").addClass(`cv2-container${item.accent ? " cv2-accent" : ""}`).appendTo(target)
        if (typeof item.accent === "string") inner.css("--cv2-accent", item.accent)
        renderItems(item.components, inner)
      } else if (item.type === "separator") {
        E("div").addClass(`cv2-separator${item.large ? " large" : ""}${item.line === false ? " invisible" : ""}`).appendTo(target)
      } else if (item.type === "section") {
        E("div").addClass("cv2-section").append(
          E("div").addClass(`cv2-section-text${item.button ? " centered" : ""}`).append(
            ...(Array.isArray(item.text) ? item.text : [item.text]).map(t => E("div").addClass("cv2-text").html(parseString(t)))
          ),
          item.button ? E("div").append(makeButton($, item.button)) : item.thumbnail ? E("img").addClass("cv2-section-thumbnail").attr({ src: item.thumbnail, "data-popupable": "" }) : undefined
        ).appendTo(target)
      } else if (item.type === "row") {
        const row = E("div").addClass("cv2-buttons").appendTo(target)
        for (const button of item.buttons ?? []) row.append(makeButton($, button))
      } else if (item.type === "select") {
        makeSelect($, target, item)
      } else if (item.type === "gallery" || item.type === "image") {
        makeGallery($, target, item.type === "image" ? [item.url] : item.images)
      } else if (item.type === "file") {
        const file = E("div").addClass("cv2-file").appendTo(target)
        file.append(
          E("div").html(fileIcon).contents(),
          E("div").css({ "min-width": "0" }).append(
            E("div").addClass("cv2-file-name").text(item.name),
            E("div").addClass("cv2-file-size").text(item.size ?? "")
          )
        )
      }
    }
  }
  // legacy format: data.components was the contents of a single container, with data.colour as accent
  const isLegacy = !data.topLevel && data.components.every(item => typeof item === "string" || ["section", "separator", "row", "select", "gallery", "image", "file"].includes(item.type))
  if (isLegacy) {
    renderItems([{ type: "container", accent: data.colour ?? true, components: data.components }], cv2)
  } else {
    renderItems(data.components, cv2)
  }
  parent.append(container)
}

function makeGallery($, target, images) {
  const gallery = E("div").addClass("cv2-gallery").appendTo(target)
  const items = images.map(image => typeof image === "string" ? { url: image } : image)
  const makeItem = item => {
    const img = E("img").attr({ src: item.url, "data-popupable": item.spoiler ? undefined : "" })
    if (!item.spoiler) return img
    const spoiler = E("div").addClass("cv2-spoiler").append(
      img,
      E("div").addClass("cv2-spoiler-pill").text("Spoiler")
    ).on("click", () => {
      if (spoiler.hasClass("revealed")) return
      spoiler.addClass("revealed")
      img.attr("data-popupable", "")
    })
    return spoiler
  }
  const makeRow = (rowItems, height) => {
    const row = E("div").addClass("cv2-gallery-row").css({
      "grid-template-columns": `repeat(${rowItems.length}, 1fr)`,
      height: `${height}px`
    }).appendTo(gallery)
    for (const item of rowItems) row.append(makeItem(item))
    return row
  }
  if (items.length === 1) {
    E("div").addClass("cv2-gallery-row cv2-gallery-single").append(makeItem(items[0])).appendTo(gallery)
  } else if (items.length === 2) {
    makeRow(items, 280)
  } else if (items.length === 3) {
    const row = E("div").addClass("cv2-gallery-row").css({
      "grid-template-columns": "2fr 1fr",
      "grid-template-rows": "1fr 1fr",
      height: "350px"
    }).appendTo(gallery)
    row.append(makeItem(items[0]).css("grid-row", "1 / 3"), makeItem(items[1]), makeItem(items[2]))
  } else if (items.length === 4) {
    makeRow(items.slice(0, 2), 173)
    makeRow(items.slice(2), 173)
  } else {
    let rest = items
    if (items.length % 3) {
      makeRow(items.slice(0, 2), 280)
      rest = items.slice(2)
    }
    for (let i = 0; i < rest.length; i += 3) makeRow(rest.slice(i, i + 3), 197)
  }
}

export function makeMessage($, parent, data, args = {}) {
  const { container, content } = makeChrome($, {
    username: data.name,
    avatar: data.image,
    colour: data.colour,
    tag: false,
    time: data.time,
    reply: data.reply
  }, args)
  container.addClass("message-container")
  content.append(E("div").addClass("message").text(data.message))
  parent.append(container)
}

export function makeModal($, parent, data) {
  let modal
  const container = E("div").addClass("modal-container").append(
    E("div").addClass("modal-top").append(
      E("img").attr("src", "/assets/images/logo/logo.webp"),
      E("div").text(data.title),
      E("div").addClass("modal-close").append($("#close-icon").contents().clone())
    ),
    modal = E("div").addClass("modal"),
    E("div").addClass("modal-bottom").append(
      E("div").addClass("modal-cancel").text("Cancel"),
      E("div").addClass("modal-submit").text("Submit")
    )
  )
  const makeOption = (option, radio, group) => {
    const opt = typeof option === "string" ? [option] : option
    let box
    const optionEl = E("label").addClass("modal-option").append(
      box = E("div").addClass(`${radio ? "modal-radio" : "modal-checkbox"}${opt[2] ? " checked" : ""}`).append(
        radio ? undefined : $("#check-icon").contents().clone()
      ),
      E("div").append(
        E("div").text(opt[0]),
        opt[1] ? E("div").text(opt[1]) : undefined
      )
    ).on("click", () => {
      if (radio) {
        group.find(".checked").removeClass("checked")
        box.addClass("checked")
      } else box.toggleClass("checked")
    })
    return optionEl
  }
  for (const row of data.rows) {
    if (typeof row === "string") {
      E("div").addClass("modal-text").html(parseString(row)).appendTo(modal)
      continue
    }
    if (!Array.isArray(row)) {
      if (row.checkbox !== undefined) {
        makeOption([row.label, row.description, row.checkbox], false).appendTo(modal)
        continue
      }
      const rowEl = E("div").addClass("modal-row").append(
        E("div").addClass("modal-row-title").html(`${row.label}${row.required ? " <span>*</span>" : ""}`),
        row.description ? E("div").addClass("modal-row-description").text(row.description) : undefined
      ).appendTo(modal)
      if (row.select) {
        makeSelect($, rowEl, row.select)
      } else if (row.file) {
        const count = row.file === true ? 1 : row.file
        rowEl.append(E("div").addClass("modal-file-upload").append(
          E("div").html(uploadIcon).contents(),
          E("div").append(
            document.createTextNode("Drop files here or "),
            E("span").text("browse")
          ),
          E("div").text(`Upload ${count > 1 ? `up to ${count} files` : "a file"} under 500 MB.`)
        ))
      } else if (row.checkboxes || row.radios) {
        const group = E("div").addClass("modal-option-group").appendTo(rowEl)
        for (const option of row.checkboxes ?? row.radios) makeOption(option, !!row.radios, group).appendTo(group)
      }
      continue
    }
    E("div").addClass("modal-row").append(
      E("div").addClass("modal-row-title").html(`${row[0]}${row[2] ? " <span>*</span>" : ""}`),
      E("div").addClass("modal-row-input-container").append(
        E(row[3] ? "textarea" : "input").addClass(`modal-row-input${row[3] ? " long" : ""}`).attr({
          placeholder: row[1],
          rows: 3,
          maxlength: row[3] ?? 128
        })
      )
    ).appendTo(modal)
  }
  parent.append(container)
}

export function findCommand(tree, name, path = []) {
  if (tree.commands?.[name]) return path.concat(name)
  for (const [key, category] of Object.entries(tree.categories ?? {})) {
    const found = findCommand(category, name, path.concat(key))
    if (found) return found
  }
}

export function parseString(str) {
  return str.replace(/<command:(.+?)\|(.+?)>/g, '<code class="command prefix">e!$1</code><code class="command slash">/$2</code>')
            .replace(/<commandlink:(.+?)\|(.+?)\|(.+?)>/g, (m, prefixName, slashPath, label) => {
              let prefixHref = `/commands/prefix`
              if (typeof commands !== "undefined") {
                const path = findCommand(commands.categories.prefix, prefixName)
                if (path) prefixHref = `/commands/prefix/${path.join("/")}`
              }
              return `<a is="f-a" class="command prefix" href="${prefixHref}">${label}</a><a is="f-a" class="command slash" href="/commands/slash/${slashPath.replace(/\s/g, "/")}">${label}</a>`
            })
            .replace(/```(?:[a-z]*\n)?((?:.|\n)+?)```\n?/g, (_, code) => `<div class="codeblock">${code.replace(/`/g, "´").trim()}</div>`)
            .replace(/`((?:.|\n)+?)`/g, '<code class="inline-code">$1</code>')
            .replace(/´/g, "`")
            .replace(/<@&(.+?)>/g, '<span class="ping role">@$1</span>')
            .replace(/<([@#].+?)>/g, '<span class="ping">$1</span>')
            .replace(/<:(\/.+?)>/g, (s, m) => `<a is="f-a" class="ping" href="/commands/slash${m.replace(/\s/g, "/")}">${m}</a>`)
            .replace(/<:(.+?):>/g, '<img class="emoji" src="/assets/images/emojis/$1.webp" />')
            .replace(/<t:(.+?)>/g, '<span class="timestamp">$1</span>')
            .replace(/\*\*((?:.|\n)+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^>\s/gm, '<span class="listbar"></span>')
            .replace(/^(###|##|#|-#)\s(.*)\n?/gm, (m, marker, text) => `<span class="${{ "###": "heading3", "##": "heading2", "#": "heading1", "-#": "small" }[marker]}">${text}</span>`)
            .replace(/\[([^\[\]]+?)\]\((.+?)\)/g, (m, s, l) => {
              if (l.startsWith("/")) return `<a is="f-a" class="anchor" href="${l}">${s}</a>`
              return `<a class="anchor" href="${l}" target="_blank">${s}</a>`
            })
}