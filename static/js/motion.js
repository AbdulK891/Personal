/* Phase 4 — scroll choreography (Anime.js v4, vendored locally).
   Principles: transform/opacity only, IntersectionObserver/onScroll (no raw scroll listeners),
   reduced-motion and no-anime get a complete static experience. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasAnime = typeof window.anime === "object" && !!window.anime.animate;

  var sections = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!sections.length) return;

  /* ---- Fallback: plain reveal (no anime; no-JS handled by <noscript>) ---- */
  function staticReveal() {
    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    sections.forEach(function (el) { obs.observe(el); });
  }

  if (reduced || !hasAnime) { staticReveal(); return; }

  var A = window.anime;

  function onEnter(target, fn) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { fn(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    obs.observe(target);
  }

  /* Inline-clone symbol paths so we can measure and draw them (<use> shadow DOM cannot be measured). */
  function inlineSymbol(svgEl, symbolId) {
    if (!svgEl || svgEl.__inlined) return [];
    var symbol = document.getElementById(symbolId);
    if (!symbol) return [];
    svgEl.__inlined = true;
    var paths = [];
    Array.prototype.forEach.call(symbol.children, function (child) {
      var clone = child.cloneNode(true);
      svgEl.appendChild(clone);
      if (clone.tagName.toLowerCase() === "path") paths.push(clone);
    });
    return paths;
  }

  function prepareDraw(paths) {
    paths.forEach(function (p) {
      if (!p.getTotalLength) return;
      var len = p.getTotalLength();
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = len;
    });
  }

  function drawPaths(paths, duration, delay) {
    paths.forEach(function (p, i) {
      if (!p.getTotalLength) return;
      A.animate(p, {
        strokeDashoffset: [p.getTotalLength(), 0],
        ease: "outQuart",
        duration: duration,
        delay: (delay || 0) + i * 120,
      });
    });
  }

  /* ---- 1. Section entrances: section reveals (CSS), children stagger in ---- */
  sections.forEach(function (section) {
    Array.prototype.forEach.call(section.querySelectorAll(":scope > *"), function (kid) {
      if (kid.classList.contains("corner")) return;
      kid.style.opacity = "0";
      kid.style.transform = "translateY(16px)";
    });
    onEnter(section, function (el) {
      el.classList.add("is-visible");
      var kids = Array.prototype.filter.call(el.querySelectorAll(":scope > *"), function (kid) {
        return !kid.classList.contains("corner");
      });
      try {
        A.animate(kids, {
          opacity: [0, 1],
          y: [16, 0],
          ease: "outExpo",
          duration: 850,
          delay: A.stagger(80, { start: 140 }),
        });
      } catch (e) {
        kids.forEach(function (kid) { kid.style.opacity = "1"; kid.style.transform = "none"; });
      }
      var corners = el.querySelectorAll(".corner");
      Array.prototype.forEach.call(corners, function (corner, i) {
        var paths = inlineSymbol(corner, "orn-flourish");
        prepareDraw(paths);
        drawPaths(paths, 900, 250 + i * 100);
      });
    });
  });

  /* ---- 2. Garlands draw themselves when they enter view ---- */
  Array.prototype.forEach.call(document.querySelectorAll(".garland"), function (g, idx) {
    var paths = inlineSymbol(g, "orn-garland");
    var dots = g.querySelectorAll("circle");
    Array.prototype.forEach.call(dots, function (dot) { dot.style.opacity = "0"; });
    onEnter(g, function () {
      prepareDraw(paths);
      drawPaths(paths, 1100, idx * 60);
      if (dots.length) {
        A.animate(dots, { opacity: [0, 1], ease: "outQuad", duration: 450, delay: 550 + idx * 60 });
      }
    });
  });

  /* ---- 3. Countdown units settle on first view ---- */
  var countdown = document.getElementById("countdown");
  if (countdown) {
    var units = countdown.querySelectorAll(".countdown-unit .value");
    Array.prototype.forEach.call(units, function (v) {
      v.style.opacity = "0";
      v.style.transform = "translateY(12px)";
    });
    onEnter(countdown, function () {
      A.animate(units, {
        opacity: [0, 1],
        y: [12, 0],
        ease: "outExpo",
        duration: 750,
        delay: A.stagger(90),
      });
    });
  }

  /* ---- 4. Desktop-only faint parallax on hero corners ---- */
  try {
    var wide = window.matchMedia("(min-width: 1000px)").matches;
    var hero = document.querySelector(".hero");
    if (wide && hero && A.onScroll) {
      Array.prototype.forEach.call(hero.querySelectorAll(".corner"), function (corner, i) {
        A.animate(corner, {
          y: i % 2 === 0 ? [-6, 10] : [10, -6],
          ease: "linear",
          duration: 100,
          autoplay: A.onScroll({ target: hero, sync: true }),
        });
      });
    }
  } catch (e) { /* parallax is enhancement-only */ }
})();