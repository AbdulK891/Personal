// The Seal Unfastens entry
(function () {
  var overlay = document.getElementById("seal-overlay");
  var invitation = document.getElementById("invitation");
  var btn = document.getElementById("seal-btn");
  if (!overlay || !invitation || !btn) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];
  var finished = false;

  document.body.style.overflow = "hidden";
  btn.focus({ preventScroll: true });

  function clearSkipListeners() {
    window.removeEventListener("wheel", onSkip, true);
    window.removeEventListener("touchstart", onSkip, true);
    window.removeEventListener("keydown", onSkip, true);
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    overlay.classList.add("is-settled");
    document.body.style.overflow = "";
    invitation.hidden = false;
    invitation.setAttribute("tabindex", "-1");
    invitation.focus({ preventScroll: true });
    clearSkipListeners();
    window.setTimeout(function () {
      overlay.classList.add("is-done");
    }, 500);
  }

  function onSkip(e) {
    if (finished) return;
    if (e.type === "keydown") {
      if (e.key !== "Escape") return;
    } else if (e.target && e.target.closest && e.target.closest("#seal-btn")) {
      // Ignore gestures that begin on the seal itself; those are entry, not skip.
      return;
    }
    finish();
  }

  function play() {
    var step = function (cls, delay) {
      timers.push(window.setTimeout(function () {
        overlay.classList.add(cls);
      }, delay));
    };
    step("is-pressing", 0);
    step("is-cracked", 400);
    step("is-open", 850);
    step("is-risen", 1900);
    step("is-drawn", 2250);
    // Hold the risen card so guests can read the names and Bismillah.
    timers.push(window.setTimeout(finish, 4100));
  }

  btn.addEventListener("click", function () {
    if (finished) return;
    if (reduceMotion) {
      finish();
      return;
    }
    play();
  });

  // A scroll gesture or Escape skips straight into the invitation.
  window.addEventListener("wheel", onSkip, { capture: true, passive: true });
  window.addEventListener("touchstart", onSkip, { capture: true, passive: true });
  window.addEventListener("keydown", onSkip, { capture: true });
})();