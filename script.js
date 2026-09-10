(function () {
  "use strict";

  var majorDigits = document.getElementById("majorDigits");
  var hundredthsDigits = document.getElementById("hundredthsDigits");
  var playBtn = document.getElementById("playBtn");
  var stopBtn = document.getElementById("stopBtn");
  var resetBtn = document.getElementById("resetBtn");
  var startMinutesInput = document.getElementById("startMinutesInput");
  var startSecondsInput = document.getElementById("startSecondsInput");
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

  function getStartMs() {
    var minutes = Math.max(0, Number(startMinutesInput.value) || 0);
    var seconds = Math.max(0, Math.min(59, Number(startSecondsInput.value) || 0));
    return (minutes * 60 + seconds) * 1000;
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

  function updateButtons() {
    playBtn.disabled = running;
    stopBtn.disabled = !running;
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
      updateButtons();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (running) {
      return;
    }
    if (remainingMs <= 0) {
      remainingMs = getStartMs();
    }
    if (remainingMs <= 0) {
      return;
    }
    endTime = performance.now() + remainingMs;
    running = true;
    updateButtons();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) {
      return;
    }
    remainingMs = getRemainingMs();
    running = false;
    endTime = null;
    updateButtons();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function reset() {
    stop();
    remainingMs = getStartMs();
    render();
  }

  playBtn.addEventListener("click", play);
  stopBtn.addEventListener("click", stop);
  resetBtn.addEventListener("click", reset);

  startMinutesInput.addEventListener("change", function () {
    if (!running) {
      remainingMs = getStartMs();
      render();
    }
  });

  startSecondsInput.addEventListener("change", function () {
    if (!running) {
      remainingMs = getStartMs();
      render();
    }
  });

  hundredthsToggle.addEventListener("change", render);

  updateButtons();
  reset();
})();
