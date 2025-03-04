// ==UserScript==
// @version     1.0
// @run-at      document-body
// @name        Saturate Old YouTube Videos
// @description Saturates aged (3 years cap) YouTube videos
// @author      Shaehl
// @namespace   https://github.com/Shaehl
// @match       https://www.youtube.com/*
// ==/UserScript==

// bug: no update on tab switch

const AGE_MAX = TIME_UNITS.y * 3.5

const TIME_UNITS = {}
TIME_UNITS.s = 1000
TIME_UNITS.mi = TIME_UNITS.s * 60
TIME_UNITS.h = TIME_UNITS.mi * 60
TIME_UNITS.d = TIME_UNITS.h * 24
TIME_UNITS.w = TIME_UNITS.d * 7
TIME_UNITS.mo = TIME_UNITS.d * 30
TIME_UNITS.y = TIME_UNITS.mo * 12

const FOCUS_LOCALS = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer"
]

const lerp = (n, a, b) => (1 - n) * a + n * b

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n))

const toFixed = (n, d = 3) => parseFloat((n).toFixed(d))

const toPerc = (n) => Math.round(n * 100)

const stringDateToTimestamp = (s = "") => {
    const r = s.match(/(\d+)*? (\S+) ago/)
    if (!r) return -1
    
    const n = parseInt(r[r.length-2]) | 0, u = r[r.length-1]
    const m = TIME_UNITS[Object.keys(TIME_UNITS).find(e => u.startsWith(e))]
    if (!m) return -1

    return n > 0 ? n * m : m
}

const handleRichItemAge = (age = 0, el) => {
    const n = clamp((age / AGE_MAX) ** (4/3))
    const filter = `brightness(${toFixed(lerp(n, 1, 3/4))}) sepia(${toPerc(n)}%)`
    console.log(age, n, filter, el)
    el.style.filter = filter
}

const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
        try {
            const {target} = mutation
            if (target && target.localName && FOCUS_LOCALS.find(l => target.localName.match(l))) {
                for (const line of target.querySelector("#metadata-line").children) {
                    let timestamp = stringDateToTimestamp(line.textContent)
                    if (timestamp > 0) {
                        handleRichItemAge(timestamp, target)
                    }
                }
            }
        } catch (err) {
            console.error(err, mutation)
        }
    }
})

observer.observe(document.querySelector("#content"), {
    // attributes: true,
    childList: true,
    subtree: true
})