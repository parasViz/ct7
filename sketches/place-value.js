(function () {
  const sketches = new Set();

  // Place columns, highest to lowest. multiplier = 10 ** power.
  // group keys map to the Indian comma groups (crore | lakh | thousand | ones).
  const COLUMNS = [
    { power: 7, name: ["Crore"], group: "crore" },
    { power: 6, name: ["Ten", "Lakh"], group: "lakh" },
    { power: 5, name: ["Lakh"], group: "lakh" },
    { power: 4, name: ["Ten", "Thousand"], group: "thousand" },
    { power: 3, name: ["Thousand"], group: "thousand" },
    { power: 2, name: ["Hundred"], group: "ones" },
    { power: 1, name: ["Tens"], group: "ones" },
    { power: 0, name: ["Ones"], group: "ones" }
  ];

  function mountAll(root = document) {
    if (!root) {
      return;
    }
    root.querySelectorAll("[data-place-value]").forEach((host) => {
      if (host.dataset.mounted === "true") {
        return;
      }
      host.dataset.mounted = "true";
      sketches.add(createWidget(host));
    });
  }

  function cleanup() {
    sketches.forEach((widget) => widget.destroy());
    sketches.clear();
  }

  function createWidget(host) {
    const start = clampNumber(Number.parseInt(host.dataset.start || "3245760", 10));
    const state = { digits: toDigits(start) };

    host.innerHTML = `
      <div class="pv-card">
        <div class="pv-readout">
          <div class="pv-number" data-role="number"></div>
          <p class="pv-words" data-role="words"></p>
        </div>
        <div class="pv-stage" data-role="stage" aria-label="Drag a column up or down, or tap its arrows, to change each digit"></div>
        <div class="pv-controls">
          <button type="button" data-action="random">Shuffle</button>
          <button type="button" data-action="reset">Reset</button>
        </div>
      </div>
    `;

    const refs = {
      stage: host.querySelector('[data-role="stage"]'),
      number: host.querySelector('[data-role="number"]'),
      words: host.querySelector('[data-role="words"]')
    };

    function renderReadouts() {
      const value = currentValue(state);
      refs.number.innerHTML = groupedNumberHtml(value);
      refs.words.textContent = numberToWordsIndian(value);
    }

    const sketch = window.p5 ? new window.p5(buildSketch(refs.stage, state, renderReadouts), refs.stage) : null;
    if (!sketch) {
      refs.stage.innerHTML = `<div class="sketch-fallback">Interactive visual is still loading. Refresh the page if it doesn't appear.</div>`;
    }

    // The host can be mounted while the module section is still hidden (clientWidth 0).
    // A ResizeObserver re-sizes the canvas once it becomes visible and on layout changes.
    let observer = null;
    if (sketch && window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        const width = Math.max(300, Math.floor(refs.stage.clientWidth || 680));
        const height = width < 480 ? 206 : 184;
        if (sketch.width !== width || sketch.height !== height) {
          sketch.resizeCanvas(width, height);
        }
      });
      observer.observe(refs.stage);
    }

    const handlers = [
      [host.querySelector('[data-action="random"]'), "click", () => {
        state.digits = state.digits.map(() => Math.floor(Math.random() * 10));
        if (currentValue(state) === 0) {
          state.digits[0] = 1 + Math.floor(Math.random() * 9);
        }
        renderReadouts();
      }],
      [host.querySelector('[data-action="reset"]'), "click", () => {
        state.digits = state.digits.map(() => 0);
        renderReadouts();
      }]
    ];

    handlers.forEach(([target, event, handler]) => {
      if (target) {
        target.addEventListener(event, handler);
      }
    });

    renderReadouts();

    return {
      destroy() {
        if (observer) {
          observer.disconnect();
        }
        if (sketch) {
          sketch.remove();
        }
        handlers.forEach(([target, event, handler]) => {
          if (target) {
            target.removeEventListener(event, handler);
          }
        });
        host.dataset.mounted = "false";
        host.innerHTML = "";
      }
    };
  }

  function buildSketch(stage, state, onChange) {
    const theme = ctTheme();
    const groupColor = {
      crore: theme.orange,
      lakh: theme.pink,
      thousand: theme.blue,
      ones: theme.teal
    };

    return (p) => {
      const pops = COLUMNS.map(() => 0);
      let hover = { col: -1, zone: "" };
      let drag = null; // { col, startDigit, startY }

      p.setup = () => {
        p.createCanvas(stageWidth(), stageHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };

      p.windowResized = () => {
        p.resizeCanvas(stageWidth(), stageHeight());
      };

      p.draw = () => {
        p.clear();
        const cols = columnRects();
        cols.forEach((rect, i) => drawColumn(rect, i));
        for (let i = 0; i < pops.length; i += 1) {
          pops[i] *= 0.86;
          if (pops[i] < 0.001) pops[i] = 0;
        }
      };

      function stageWidth() {
        return Math.max(300, Math.floor(stage.clientWidth || 680));
      }

      function stageHeight() {
        return stageWidth() < 480 ? 206 : 184;
      }

      function columnRects() {
        const w = p.width;
        const outer = 6;
        const gap = w < 480 ? 5 : 8;
        const cellW = (w - outer * 2 - gap * (COLUMNS.length - 1)) / COLUMNS.length;
        const top = 6;
        const height = p.height - 12;
        return COLUMNS.map((_, i) => ({
          x: outer + i * (cellW + gap),
          y: top,
          w: cellW,
          h: height
        }));
      }

      function arrowZones(rect) {
        const size = Math.min(30, rect.w * 0.7);
        const cx = rect.x + rect.w / 2;
        return {
          up: { cx, cy: rect.y + 50, r: size / 2 },
          down: { cx, cy: rect.y + rect.h - 24, r: size / 2 }
        };
      }

      function drawColumn(rect, i) {
        const col = COLUMNS[i];
        const digit = state.digits[i];
        const color = groupColor[col.group] || theme.teal;
        const active = digit > 0;
        const isHover = hover.col === i;

        p.push();
        p.noStroke();
        p.fill(active ? color + "12" : theme.card);
        p.rect(rect.x, rect.y, rect.w, rect.h, 12);
        p.stroke(isHover ? color : theme.border);
        p.strokeWeight(isHover ? 2 : 1.2);
        p.noFill();
        p.rect(rect.x, rect.y, rect.w, rect.h, 12);
        p.pop();

        // place name
        p.push();
        p.noStroke();
        p.fill(color);
        p.textStyle(p.BOLD);
        p.textSize(rect.w < 56 ? 9 : 10.5);
        p.textAlign(p.CENTER, p.TOP);
        col.name.forEach((line, lineIndex) => {
          p.text(line, rect.x + rect.w / 2, rect.y + 10 + lineIndex * 11);
        });
        p.pop();

        const zones = arrowZones(rect);
        drawArrow(zones.up, "up", isHover && hover.zone === "up", color);
        drawArrow(zones.down, "down", isHover && hover.zone === "down", color);

        // digit, centred between the two arrows
        const scale = 1 + pops[i] * 0.28;
        p.push();
        p.translate(rect.x + rect.w / 2, (zones.up.cy + zones.down.cy) / 2);
        p.scale(scale);
        p.noStroke();
        p.fill(active ? theme.text : "#c2c9d3");
        p.textStyle(p.BOLD);
        p.textSize(Math.min(48, rect.w * 0.82));
        p.textAlign(p.CENTER, p.CENTER);
        p.text(digit, 0, 0);
        p.pop();
      }

      function drawArrow(zone, dir, lit, color) {
        const r = zone.r;
        p.push();
        p.noStroke();
        p.fill(lit ? color + "22" : theme.page);
        p.circle(zone.cx, zone.cy, r * 2);
        p.fill(lit ? color : theme.soft);
        const h = r * 0.5;
        const w = r * 0.62;
        if (dir === "up") {
          p.triangle(zone.cx, zone.cy - h, zone.cx - w, zone.cy + h * 0.7, zone.cx + w, zone.cy + h * 0.7);
        } else {
          p.triangle(zone.cx, zone.cy + h, zone.cx - w, zone.cy - h * 0.7, zone.cx + w, zone.cy - h * 0.7);
        }
        p.pop();
      }

      function hitColumn(mx, my) {
        const cols = columnRects();
        for (let i = 0; i < cols.length; i += 1) {
          const rect = cols[i];
          if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
            return { i, rect };
          }
        }
        return null;
      }

      function within(zone, mx, my) {
        return (mx - zone.cx) ** 2 + (my - zone.cy) ** 2 <= (zone.r + 4) ** 2;
      }

      function changeDigit(i, delta) {
        state.digits[i] = (state.digits[i] + delta + 10) % 10;
        pops[i] = 1;
        onChange();
      }

      function setDigit(i, value) {
        const clamped = Math.max(0, Math.min(9, value));
        if (clamped !== state.digits[i]) {
          state.digits[i] = clamped;
          pops[i] = 1;
          onChange();
        }
      }

      p.mouseMoved = () => {
        const hit = hitColumn(p.mouseX, p.mouseY);
        if (!hit) {
          hover = { col: -1, zone: "" };
          return;
        }
        const zones = arrowZones(hit.rect);
        if (within(zones.up, p.mouseX, p.mouseY)) {
          hover = { col: hit.i, zone: "up" };
        } else if (within(zones.down, p.mouseX, p.mouseY)) {
          hover = { col: hit.i, zone: "down" };
        } else {
          hover = { col: hit.i, zone: "body" };
        }
      };

      p.mousePressed = () => {
        const hit = hitColumn(p.mouseX, p.mouseY);
        if (!hit) {
          return;
        }
        const zones = arrowZones(hit.rect);
        if (within(zones.up, p.mouseX, p.mouseY)) {
          changeDigit(hit.i, 1);
        } else if (within(zones.down, p.mouseX, p.mouseY)) {
          changeDigit(hit.i, -1);
        } else {
          drag = { col: hit.i, startDigit: state.digits[hit.i], startY: p.mouseY };
        }
      };

      p.mouseDragged = () => {
        if (!drag) {
          return;
        }
        const steps = Math.round((drag.startY - p.mouseY) / 24);
        setDigit(drag.col, drag.startDigit + steps);
      };

      p.mouseReleased = () => {
        drag = null;
      };

      p.touchStarted = () => {
        if (insideCanvas()) {
          p.mousePressed();
          return false;
        }
        return true;
      };
      p.touchMoved = () => {
        if (drag) {
          p.mouseDragged();
          return false;
        }
        return true;
      };
      p.touchEnded = () => {
        p.mouseReleased();
        return true;
      };

      function insideCanvas() {
        return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
      }
    };
  }

  // ----- number helpers -----

  function clampNumber(value) {
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }
    return Math.min(99999999, Math.floor(value));
  }

  function toDigits(value) {
    return String(clampNumber(value)).padStart(COLUMNS.length, "0").split("").map(Number);
  }

  function currentValue(state) {
    return state.digits.reduce((sum, digit, i) => sum + digit * Math.pow(10, COLUMNS[i].power), 0);
  }

  function groupIndian(numStr) {
    if (numStr.length <= 3) {
      return numStr;
    }
    const last3 = numStr.slice(-3);
    let rest = numStr.slice(0, -3);
    const groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length) {
      groups.unshift(rest);
    }
    return `${groups.join(",")},${last3}`;
  }

  function groupedNumberHtml(value) {
    const grouped = groupIndian(String(value));
    const parts = grouped.split(",");
    // colour each comma-group from the right so the mapping stays stable.
    const palette = ["teal", "blue", "pink", "orange"];
    return parts
      .map((part, index) => {
        const fromRight = parts.length - 1 - index;
        const tone = palette[Math.min(fromRight, palette.length - 1)];
        const comma = index < parts.length - 1 ? `<span class="pv-comma">,</span>` : "";
        return `<span class="pv-grp pv-grp-${tone}">${part}</span>${comma}`;
      })
      .join("");
  }

  function numberToWordsIndian(num) {
    if (num === 0) {
      return "Zero";
    }
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
      "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    const twoDigits = (n) => {
      if (n < 20) {
        return ones[n];
      }
      const t = tens[Math.floor(n / 10)];
      const r = n % 10;
      return r ? `${t}-${ones[r]}` : t;
    };

    const threeDigits = (n) => {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      let str = "";
      if (h) {
        str += `${ones[h]} hundred`;
      }
      if (rest) {
        str += `${h ? " " : ""}${twoDigits(rest)}`;
      }
      return str;
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = num % 1000;

    const parts = [];
    if (crore) parts.push(`${twoDigits(crore)} crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} lakh`);
    if (thousand) parts.push(`${twoDigits(thousand)} thousand`);
    if (hundred) parts.push(threeDigits(hundred));

    const sentence = parts.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  function ctTheme() {
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      text: read("--text", "#172034"),
      soft: read("--text-soft", "#647086"),
      border: read("--border", "#e5e8ef"),
      card: read("--card", "#ffffff"),
      page: read("--bg-page", "#f7f8fb"),
      teal: read("--accent-teal", "#06d6a0"),
      pink: read("--accent-pink", "#f95877"),
      yellow: read("--accent-yellow", "#ffd166"),
      blue: read("--accent-blue", "#4c7cff"),
      orange: read("--accent-orange", "#ef7140")
    };
  }

  window.CT7PlaceValue = {
    mountAll,
    cleanup
  };
})();
