(function () {
  var el = document.getElementById("countdown");
  if (!el) return;

  var target = new Date(el.getAttribute("data-target")).getTime();
  var daysEl = document.getElementById("cd-days");
  var hoursEl = document.getElementById("cd-hours");
  var minutesEl = document.getElementById("cd-minutes");
  var secondsEl = document.getElementById("cd-seconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    var now = Date.now();
    var diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      clearInterval(timer);
      return;
    }

    var seconds = Math.floor(diff / 1000) % 60;
    var minutes = Math.floor(diff / (1000 * 60)) % 60;
    var hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));

    daysEl.textContent = String(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  var timer = setInterval(tick, 1000);
})();
