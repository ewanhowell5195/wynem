window.Page = (await import("/js/libs/pages.js")).Page

window.E = (tagName, options) => $(document.createElement(tagName, options))

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
    if (o[k] === true) {
      arr.push(`${arr.length == 0 ? "?" : "&"}${k}`)
    } else {
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

if (!String.prototype.toTitleCase) String.prototype.toTitleCase = function() {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()})
}

// lazy loading

window.imageObserver  =  new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if ("src" in entry.target.dataset) {
      if (entry.isIntersecting) {
        entry.target.src  =  entry.target.dataset.src
        imageObserver.unobserve(entry.target)
      }
    } else {
      imageObserver.unobserve(entry.target)
    }
  })
})

// pages

function setupPage(PageClass, container, data) {
  const page = E(PageClass.tag)
  if (PageClass.title) document.title = PageClass.title
  container.empty().append(page)
  if (data) page[0].setData(data)
}

function historyHandler(updateHistory, url) {
  if (updateHistory === "replace") {
    history.replaceState({}, "", url)
  } else if (updateHistory) {
    history.pushState({}, "", url)
  }
}

function basicPageRoute(path, rgx) {
  return [
    rgx ?? new RegExp(`^/${path}/?(?:\\?.*)?$`,"i"),
    async (url, container, updateHistory) => {
      setupPage((await import(`/pages/${path}/page.js`)).default, container, Object.fromEntries(url.searchParams))
      historyHandler(updateHistory, url)
      return true
    }
  ]
}

const routes = [
  basicPageRoute("features")
]

let isOpeningPage = false
window.openPage = async function(url, updateHistory = false, forceUpdate = false) {
  if (isOpeningPage || (!forceUpdate && url.href === location.href)) return
  $("#mobile-menu").addClass("hidden")
  $('link[rel="icon"][sizes="16x16"]').attr("href", "/assets/images/logo/logo_16.webp")
  $('link[rel="icon"][sizes="32x32"]').attr("href", "/assets/images/logo/logo_32.webp")
  $("title").text("Wynem")
  isOpeningPage = true
  let foundPage = false
  const ps = url.pathname + url.search
  for (const [rgx, func] of routes) {
    if (ps.match(rgx)) {
      if (!(await func(url, $("#content"), updateHistory))) {
        setupPage((await import("/pages/home/page.js")).default, $("#content"), Object.fromEntries(url.searchParams))
        history.replaceState({}, "", "/")
      }
      foundPage = true
      break
    }
  }
  if (!foundPage) {
    setupPage((await import("/pages/home/page.js")).default, $("#content"), Object.fromEntries(url.searchParams))
    historyHandler(updateHistory, "/")
  }
  isOpeningPage = false
  $('meta[name="theme-color"]').attr("content", "#6C80F6")
}

const onLoad = () => openPage(new URL(location.href), false, true)

class FastAnchorElement extends HTMLAnchorElement {
  constructor() {
    super()
    this.addEventListener("click", evt => {
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

const entriesFetch = {}
window.fetchEntries = async type => {
  if (window[type] === undefined && entriesFetch[type] === undefined) entriesFetch[type] = fetch(`/assets/json/${type}.json`).then(e => e.json())
  window[type] = await entriesFetch[type]
}

// end

addEventListener("popstate", onLoad)
onLoad()