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

  var SEGMENTS_BY_DIGIT = {
    "0": "abcdef",
    "1": "bc",
    "2": "abged",
    "3": "abgcd",
    "4": "fgbc",
    "5": "afgcd",
    "6": "afgecd",
    "7": "abc",
    "8": "abcdefg",
    "9": "abcdfg"
  };
  var SEGMENT_KEYS = ["a", "b", "c", "d", "e", "f", "g"];

  function pad(num, size) {
    var s = String(Math.max(0, Math.floor(num)));
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }

  function createDigitElement(digitChar) {
    var el = document.createElement("span");
    el.className = "seg-digit";
    var litSegments = SEGMENTS_BY_DIGIT[digitChar] || "";
    for (var i = 0; i < SEGMENT_KEYS.length; i++) {
      var key = SEGMENT_KEYS[i];
      var seg = document.createElement("span");
      seg.className = "seg seg-" + key + (litSegments.indexOf(key) !== -1 ? " on" : "");
      el.appendChild(seg);
    }
    return el;
  }

  function createSeparatorElement(kind) {
    var el = document.createElement("span");
    el.className = "seg-sep " + kind;
    if (kind === "colon") {
      var top = document.createElement("span");
      top.className = "dot top";
      var bottom = document.createElement("span");
      bottom.className = "dot bottom";
      el.appendChild(top);
      el.appendChild(bottom);
    } else {
      var mid = document.createElement("span");
      mid.className = "dot mid";
      el.appendChild(mid);
    }
    return el;
  }

  function fillDigitGroup(container, items) {
    container.innerHTML = "";
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.sep) {
        container.appendChild(createSeparatorElement(item.sep));
      } else {
        container.appendChild(createDigitElement(item.digit));
      }
    }
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
      var minutes = pad(Math.floor(ms / 60000), 2);
      var seconds = pad(Math.floor((ms % 60000) / 1000), 2);
      fillDigitGroup(majorDigits, [
        { digit: minutes[0] },
        { digit: minutes[1] },
        { sep: "colon" },
        { digit: seconds[0] },
        { digit: seconds[1] }
      ]);
      hundredthsDigits.innerHTML = "";
      hundredthsDigits.classList.add("hidden");
    } else {
      var wholeSeconds = pad(Math.floor(ms / 1000), 2);
      var tenths = String(Math.floor((ms % 1000) / 100));
      var hundredths = String(Math.floor((ms % 100) / 10));

      fillDigitGroup(majorDigits, [
        { digit: wholeSeconds[0] },
        { digit: wholeSeconds[1] },
        { sep: "point" },
        { digit: tenths }
      ]);

      if (hundredthsToggle.checked) {
        fillDigitGroup(hundredthsDigits, [{ digit: hundredths }]);
        hundredthsDigits.classList.remove("hidden");
      } else {
        hundredthsDigits.innerHTML = "";
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
