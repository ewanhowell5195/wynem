import { Page } from "/js/libs/pages.js"

window.Page = Page

window.E = (tagName = "div", options) => $(document.createElement(tagName, options))

const rgxURLParams = /(?:^\?|&)([A-z0-9-]+)(?:=([^&]+)|(?=&)|$|=)/g

window.getURLParams = s => {
  let str = s
  if (!str) str = location.search
  if (str.length < 2) return null
  let params = {}
  let m; while (m = rgxURLParams.exec(str)) {
    params[m[1]] = m[2] ? decodeURIComponent(m[2].replace(/\+/g, "%20")) : true
  }
  return params
}

window.toURLParams = o => {
  let arr = []
  for (let k in o) if (o.hasOwnProperty(k) && o[k] != null) {
    if (o[k] === true) arr.push(`${arr.length == 0 ? "?" : "&"}${k}`)
    else {
      let encodedVal = encodeURIComponent(o[k])
        .replace(/%3A/g, ":")
        .replace(/%3B/g, ";")
        .replace(/%20/g, "+")
        .replace(/%2C/g, ",")
        .replace(/%2F/g, "/")
        .replace(/%40/g, "@")
      arr.push(`${arr.length == 0 ? "?" : "&"}${k}=${encodedVal}`)
    }
  }
  return arr.join("")
}

String.prototype.toTitleCase = function(c, n) {
  let t
  if (c) t = this.replace(/\s/g, "").replace(n ? /([A-Z])/g : /([A-Z0-9])/g, " $1").replace(/[_-]/g, " ")
  else t = this
  return t.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).trim()
}

// analytics

window.lastAnalytics = ""
window.analytics = () => {
  if (location.href === lastAnalytics) return
  const title = document.title.split(" - ").filter(e => e !== "Wynem")
  if (!title.length) title.push("Home")
  const params = new URL(location).searchParams
  if (location.pathname.startsWith("/commands")) {
    const path = location.pathname.split("/").filter(e => e).slice(1)
    if (path.length) {
      title.push(path[0].toTitleCase())
      if (path.length > 1) title.push(path[path.length - 1].toTitleCase())
    }
  } else if (location.pathname === "/cem") {
    if (params.get("entity")) title.push(params.get("entity").toTitleCase(true))
  }
  gtag("event", "page_view", {
    page_title: title.join(" - "),
    page_path: location.pathname,
    page_location: location.href
  })
  lastAnalytics = location.href
}

// lazy loading

window.imageObserver  =  new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if ("src" in entry.target.dataset) {
      if (entry.isIntersecting) {
        entry.target.src  =  entry.target.dataset.src
        imageObserver.unobserve(entry.target)
      }
    } else imageObserver.unobserve(entry.target)
  })
})

// sidebar

const sidebarButton = $(".sidebar-button")
const sidebar = $("#sidebar")
sidebarButton.on("click", e => {
  sidebarButton.toggleClass("active")
  sidebar.toggleClass("active")
})

$(window).on({
  click(e) {
    const target = $(e.target)
    if (globalThis.innerWidth < 1330 + sidebar.width() * 2 + 200 && ((target.hasClass("page-button") || target.parents(".page-button").length && target.parents("#sidebar").length) || sidebar.hasClass("active") && !(e.target === sidebar[0] || target.parents("#sidebar").length) && !(e.target === sidebarButton[0] || target.parents(".sidebar-button").length))) {
      sidebarButton.removeClass("active")
      sidebar.removeClass("active")
    }
  },
  resize() {
    if (globalThis.innerWidth < 1330 + sidebar.width() * 2 + 200 && sidebar.hasClass("active")) {
      sidebarButton.removeClass("active")
      sidebar.removeClass("active")
    }
  }
})

;(async () => {
  try {
    const data = await fetch("https://api.wynem.com/info").then(e => e.json())
    $("#bot-info-extra").append(
      E("div").html(`Ping: <strong>${data.ping.toLocaleString("en")} ms</strong>`),
      E("div").html(`Servers: <strong>${data.guilds.toLocaleString("en")}</strong>`)
    )
  } catch {
    $("#bot-info-status-icon").addClass("offline")
    $("#bot-info-status > strong").text("Offline")
    $("#bot-info-extra").next().remove()
  }
})()

// pages

async function setupPage(PageClass, container, data) {
  if (!customElements.get(PageClass.tag)) customElements.define(PageClass.tag, PageClass)
  const page = E(PageClass.tag)
  if (PageClass.title) document.title = PageClass.title
  container.children()[0]?.onClosed?.()
  container.empty().append(page)
  if (data) return await page[0].setData?.(data) ?? true
  return true
}

function historyHandler(updateHistory, url) {
  if (updateHistory === "replace") {
    history.replaceState({}, "", url)
  } else if (updateHistory) {
    history.pushState({}, "", url)
  }
}

function pageRoute(path, rgx) {
  return [
    typeof rgx === "string" ? new RegExp(`^${rgx.replace(/:(?<name>[^/?.]+)/g, (m, name) => `(?<${name}>[^/?.]+)(?=$|/|\\?|.)`).replace(/\./g, "\\$&")}/?(?:\\?.*)?$`, "i") : rgx ?? new RegExp(`^/${path}/?(?:\\?.*)?$`, "i"),
    async (url, container, updateHistory, params) => {
      const searchParams = Object.fromEntries(url.searchParams)
      if (await setupPage((await import(`/pages/${path}/page.js`)).default, container, params !== undefined ? Object.assign(params, {searchParams}) : searchParams)) {
        historyHandler(updateHistory, url)
        return true
      } else {
        return false
      }
    }
  ]
}

const routes = [
  pageRoute("home", "/"),
  pageRoute("commands", /\/commands(\/(?<path>.+))?/),
  pageRoute("colours"),
  pageRoute("privacy"),
  pageRoute("terms"),
  pageRoute("cem"),
  pageRoute("cemanimation"),
  pageRoute("features"),
  pageRoute("feature", "/features/:name")
]

function compareURLs(a, b) {
  return a.href === b.href || a.search === b.search && a.hash === b.hash && (
    a.pathname.endsWith("/") && !b.pathname.endsWith("/") && a.pathname === b.pathname + "/" ||
    b.pathname.endsWith("/") && !a.pathname.endsWith("/") && b.pathname === a.pathname + "/"
  )
}

let pageLoadPromise = Promise.resolve()
let isOpeningPage = false
window.openPage = function(url, updateHistory = false, forceUpdate = false) {
  if (!forceUpdate && (isOpeningPage || compareURLs(url, location))) return
  $("a").removeClass("selected")
  return pageLoadPromise = pageLoadPromise.finally(async () => {
    $("#mobile-menu").addClass("hidden")
    $('link[rel="icon"][sizes="16x16"]').attr("href", "/assets/images/logo/logo_16.webp")
    $('link[rel="icon"][sizes="32x32"]').attr("href", "/assets/images/logo/logo_32.webp")
    document.title = "Wynem"
    isOpeningPage = true
    const findPage = async ps => {
      for (const [rgx, func] of routes) {
        const m = ps.match(rgx)
        if (m !== null) return await func(url, $("#content"), updateHistory, m.groups)
      }
    }
    let foundPage = await findPage(url.pathname + url.search)
    if (!foundPage) {
      let i = 1
      const parts = url.pathname.split("/")
      while (!foundPage && parts.length > i) {
        const path = parts.slice(0, -i++).join('/')
        const ps = (path.length ? path : '/') + url.search
        foundPage = await findPage(ps)
        if (foundPage) historyHandler("replace", ps)
      }
    }
    isOpeningPage = false
    $('meta[name="theme-color"]').attr("content", "#6C80F6")
    $("#content > *")[0].onOpened?.()
    analytics()
  })
}

const onLoad = () => openPage(new URL(location.href), false, true)

class FastAnchorElement extends HTMLAnchorElement {
  constructor() {
    super()
    this.addEventListener("click", evt => {
      evt.preventDefault()
      if (evt.button === 0) {
        evt.preventDefault()
        openPage(new URL(this.href), true)
      }
    })
  }
}

customElements.define("f-a", FastAnchorElement, { extends: "a" })

{
  let cbieTestRegistered = false
  window.supportsCBIE = () => {
    if (!cbieTestRegistered) {
      class TestElement extends HTMLAnchorElement {
        constructor() {
          super()
          this.output = true
        }
      }
      customElements.define("cbie-test", TestElement, { extends: "a" })
      cbieTestRegistered = true
    }
    return !!document.createElement("a", { is: "cbie-test" }).output
  }

  if (!supportsCBIE()) {
    $(document).on("click", 'a[is="f-a"]', evt => {
      evt.preventDefault()
      openPage(new URL(evt.currentTarget.href), true)
    })
  }
}

// files

const jsonFetch = {}
window.fetchJSON = async name => {
  if (window[name] === undefined && jsonFetch[name] === undefined) try {
    jsonFetch[name] = await fetch(`/assets/json/${name}.json`).then(e => e.json())
  } catch {
    return false
  }
  window[name] = jsonFetch[name]
  return true
}

// select menus

globalThis.openSelects = []
document.addEventListener("click", e => {
  const path = e.composedPath()
  for (const select of openSelects.slice()) {
    if (!path.some(e => select.includes(e))) {
      select[0].classList.remove("active")
      $(select[1]).hide()
      openSelects.splice(openSelects.indexOf(select), 1)
    }
  }
})

// end

addEventListener("popstate", onLoad)
onLoad()