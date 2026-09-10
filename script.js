(function () {
  "use strict";

  var majorDigits = document.getElementById("majorDigits");
  var hundredthsDigits = document.getElementById("hundredthsDigits");
  var startStopBtn = document.getElementById("startStopBtn");
  var resetBtn = document.getElementById("resetBtn");
  var minutesInput = document.getElementById("minutesInput");
  var hundredthsToggle = document.getElementById("hundredthsToggle");

  var running = false;
  var remainingMs = 0; // time left when clock is stopped
  var endTime = null; // performance.now() timestamp when clock will hit 0, while running
  var rafId = null;

  function pad(num, size) {
    var s = String(Math.max(0, Math.floor(num)));
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }

  function getRemainingMs() {
    if (running && endTime !== null) {
      return Math.max(0, endTime - performance.now());
    }
    return remainingMs;
  }

  function render() {
    var ms = getRemainingMs();
    var underAMinute = ms < 60000;

    if (!underAMinute) {
      var minutes = Math.floor(ms / 60000);
      var seconds = Math.floor((ms % 60000) / 1000);
      majorDigits.textContent = pad(minutes, 2) + ":" + pad(seconds, 2);
      hundredthsDigits.textContent = "";
      hundredthsDigits.classList.add("hidden");
    } else {
      var wholeSeconds = Math.floor(ms / 1000);
      var tenths = Math.floor((ms % 1000) / 100);
      var hundredths = Math.floor((ms % 100) / 10);

      majorDigits.textContent = pad(wholeSeconds, 2) + "." + tenths;

      if (hundredthsToggle.checked) {
        hundredthsDigits.textContent = hundredths;
        hundredthsDigits.classList.remove("hidden");
      } else {
        hundredthsDigits.textContent = "";
        hundredthsDigits.classList.add("hidden");
      }
    }
  }

  function tick() {
    if (!running) {
      return;
    }
    var ms = getRemainingMs();
    render();
    if (ms <= 0) {
      running = false;
      remainingMs = 0;
      startStopBtn.textContent = "Start";
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) {
      return;
    }
    if (remainingMs <= 0) {
      remainingMs = Math.max(0, Number(minutesInput.value) || 0) * 60000;
    }
    if (remainingMs <= 0) {
      return;
    }
    endTime = performance.now() + remainingMs;
    running = true;
    startStopBtn.textContent = "Stop";
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) {
      return;
    }
    remainingMs = getRemainingMs();
    running = false;
    endTime = null;
    startStopBtn.textContent = "Start";
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function reset() {
    stop();
    remainingMs = Math.max(0, Number(minutesInput.value) || 0) * 60000;
    render();
  }

  startStopBtn.addEventListener("click", function () {
    if (running) {
      stop();
    } else {
      start();
    }
  });

  resetBtn.addEventListener("click", reset);

  minutesInput.addEventListener("change", function () {
    if (!running) {
      remainingMs = Math.max(0, Number(minutesInput.value) || 0) * 60000;
      render();
    }
  });

  hundredthsToggle.addEventListener("change", render);

  reset();
})();
