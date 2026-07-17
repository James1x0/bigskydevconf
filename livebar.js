// Time-gated site-wide announcement bar.
// Big Sky Dev Con 2026 runs July 24–25 in Bozeman, MT (Mountain Time, MDT = UTC−6).
// Anchored to UTC so it fires on the correct days no matter the visitor's timezone.
(function () {
  "use strict";

  var STREAM_URL = "https://www.youtube.com/@montanaprogrammers/streams";

  // Boundaries expressed in UTC. MDT is UTC−6, so midnight Mountain = 06:00 UTC.
  var LIVE_START = Date.UTC(2026, 6, 24, 6, 0, 0); // Jul 24, 12:00 AM MDT
  var LIVE_END = Date.UTC(2026, 6, 26, 6, 0, 0); // Jul 26, 12:00 AM MDT (end of the 25th)

  var now = Date.now();
  var state;
  if (now < LIVE_START) {
    state = "hidden"; // Before the event — no bar.
  } else if (now < LIVE_END) {
    state = "live";
  } else {
    state = "wrap";
  }

  // Dev/preview override: append ?livebar=live | wrap | hidden to any URL to
  // force a state. Remove-safe — has no effect in normal use.
  var forced = new URLSearchParams(window.location.search).get("livebar");
  if (forced === "live" || forced === "wrap" || forced === "hidden") {
    state = forced;
  }

  if (state === "hidden") {
    return;
  }

  var css =
    ".livebar{box-sizing:border-box;width:100%;font-family:inherit;" +
    "font-weight:700;letter-spacing:.02em;text-align:center;" +
    "padding:.6rem 1rem;font-size:1rem;line-height:1.3;" +
    "position:sticky;top:0;z-index:2000}" +
    ".livebar--live{background:#c0392b;color:#fff}" +
    ".livebar--wrap{background:#111;color:#fff}" +
    ".livebar a{color:#fff;text-decoration:underline;text-underline-offset:2px}" +
    ".livebar a:hover{text-decoration:none}" +
    ".livebar-dot{display:inline-block;width:.6em;height:.6em;margin-right:.5em;" +
    "border-radius:50%;background:#fff;vertical-align:middle;animation:livebarPulse 1.2s infinite}" +
    "@keyframes livebarPulse{0%,100%{opacity:1}50%{opacity:.25}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement("div");
  if (state === "live") {
    bar.className = "livebar livebar--live";
    bar.setAttribute("role", "status");
    bar.innerHTML =
      '<span class="livebar-dot" aria-hidden="true"></span>' +
      'LIVE! <a href="' +
      STREAM_URL +
      '" target="_blank" rel="noopener">Stream here &rarr;</a>';
  } else {
    bar.className = "livebar livebar--wrap";
    bar.textContent = "That's a wrap! Thanks for joining us.";
  }

  document.body.insertBefore(bar, document.body.firstChild);

  // The site's navbar is position:fixed at top:0, so it would sit on top of the
  // sticky bar. Push the navbar down by the bar's height so they stack cleanly.
  var navbar = document.getElementById("navbar");
  function offsetNavbar() {
    if (navbar) {
      navbar.style.top = bar.offsetHeight + "px";
    }
  }
  offsetNavbar();
  window.addEventListener("resize", offsetNavbar);
})();
