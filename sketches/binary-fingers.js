(function () {
  const widgets = new Set();

  const SPEEDS = [700, 350, 160, 70, 20];
  const SPEED_NAMES = ["slow", "medium", "normal", "fast", "turbo"];

  function mountAll(root = document) {
    root.querySelectorAll("[data-binary-fingers]").forEach((host) => {
      if (host.dataset.mounted === "true") {
        return;
      }
      host.dataset.mounted = "true";
      widgets.add(createWidget(host));
    });
  }

  function cleanup() {
    widgets.forEach((widget) => widget.destroy());
    widgets.clear();
  }

  function createWidget(host) {
    host.innerHTML = `
      <div class="binary-counter-card">
        <div class="binary-counter-header">
          <div class="binary-big-num" data-role="big-number">0</div>
          <div class="binary-string" data-role="binary-string">00000 00000<sub>2</sub></div>
        </div>
        <div class="binary-hands">
          <div class="binary-hand-col">
            <span>Left hand &middot; bits 9-5</span>
            <canvas data-role="left-hand" width="148" height="165"></canvas>
          </div>
          <div class="binary-hand-col">
            <span>Right hand &middot; bits 4-0</span>
            <canvas data-role="right-hand" width="148" height="165"></canvas>
          </div>
        </div>
        <div class="binary-bit-grid-wrap">
          <div class="binary-bit-grid" data-role="bit-grid"></div>
          <div class="binary-pow-grid" data-role="pow-grid"></div>
          <div class="binary-val-grid" data-role="val-grid"></div>
        </div>
        <div class="binary-equation" data-role="equation"></div>
        <div class="binary-controls">
          <button type="button" data-action="prev">Previous</button>
          <button type="button" class="primary" data-action="play">Play</button>
          <button type="button" data-action="next">Next</button>
        </div>
        <div class="binary-speed-row">
          <label>Speed</label>
          <input type="range" min="1" max="5" value="3" step="1" data-action="speed" />
          <span data-role="speed-label">normal</span>
        </div>
        <div class="binary-scrub-wrap">
          <input type="range" min="0" max="1023" value="0" step="1" data-action="scrub" />
          <span>Scrub 0 to 1023</span>
        </div>
      </div>
    `;

    const state = {
      current: 0,
      playing: false,
      intervalId: null,
      speedIndex: 2
    };

    const refs = {
      bigNumber: host.querySelector('[data-role="big-number"]'),
      binaryString: host.querySelector('[data-role="binary-string"]'),
      leftHand: host.querySelector('[data-role="left-hand"]'),
      rightHand: host.querySelector('[data-role="right-hand"]'),
      bitGrid: host.querySelector('[data-role="bit-grid"]'),
      powGrid: host.querySelector('[data-role="pow-grid"]'),
      valGrid: host.querySelector('[data-role="val-grid"]'),
      equation: host.querySelector('[data-role="equation"]'),
      play: host.querySelector('[data-action="play"]'),
      speed: host.querySelector('[data-action="speed"]'),
      speedLabel: host.querySelector('[data-role="speed-label"]'),
      scrubber: host.querySelector('[data-action="scrub"]')
    };

    if (Object.values(refs).some((ref) => !ref)) {
      return {
        destroy() {
          host.dataset.mounted = "false";
          host.innerHTML = "";
        }
      };
    }

    const handlers = [
      [host.querySelector('[data-action="prev"]'), "click", () => step(state, refs, -1)],
      [host.querySelector('[data-action="next"]'), "click", () => step(state, refs, 1)],
      [refs.play, "click", () => togglePlay(state, refs)],
      [refs.speed, "input", () => updateSpeed(state, refs)],
      [refs.scrubber, "input", () => scrub(state, refs)],
      [window.matchMedia("(prefers-color-scheme: dark)"), "change", () => render(state, refs)]
    ];

    handlers.forEach(([target, event, handler]) => {
      if (target) {
        target.addEventListener(event, handler);
      }
    });
    render(state, refs);

    return {
      destroy() {
        stop(state);
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

  function getBits(n) {
    const bits = [];
    for (let power = 9; power >= 0; power -= 1) {
      bits.push((n >> power) & 1);
    }
    return bits;
  }

  function getTheme() {
    const styles = getComputedStyle(document.documentElement);
    const fallback = {
      accent: "#118ab2",
      soft: "#647086",
      palm: "#d6e8f7",
      off: "#e8edf5",
      knuckle: "#c8c4bc",
      text: "#172034"
    };

    return {
      accent: fallback.accent,
      soft: styles.getPropertyValue("--text-soft").trim() || fallback.soft,
      palm: fallback.palm,
      off: fallback.off,
      knuckle: fallback.knuckle,
      text: styles.getPropertyValue("--text").trim() || fallback.text
    };
  }

  function drawHand(canvas, fingerBits, isRight) {
    const ctx = canvas.getContext("2d");
    const theme = getTheme();
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const fingerWidth = 17;
    const fingerGap = 6;
    const totalWidth = 4 * fingerWidth + 3 * fingerGap;
    const startX = (width - totalWidth) / 2;
    const fingerTopY = 10;
    const palmY = fingerTopY + 65;
    const palmHeight = 58;

    roundedRect(ctx, startX - 5, palmY, totalWidth + 10, palmHeight, 10, theme.palm);

    const heights = [55, 65, 68, 64];
    for (let i = 0; i < 4; i += 1) {
      const x = startX + i * (fingerWidth + fingerGap);
      const fingerHeight = heights[i];
      const y = fingerTopY + (68 - fingerHeight);
      const fingerIndex = isRight ? 4 - i : i + 1;
      const raised = fingerBits[fingerIndex] === 1;

      roundedRect(ctx, x, y, fingerWidth, fingerHeight, 8, raised ? theme.accent : theme.off);
      drawKnuckles(ctx, x, y, fingerWidth, fingerHeight, theme.knuckle);
    }

    const thumbX = isRight ? startX + totalWidth + 5 : startX - 17;
    roundedRect(ctx, thumbX, palmY + 7, 14, 40, 7, fingerBits[0] === 1 ? theme.accent : theme.off);
  }

  function drawKnuckles(ctx, x, y, width, height, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.7;
    for (let k = 1; k <= 2; k += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 3, y + height * (k / 3.2));
      ctx.lineTo(x + width - 3, y + height * (k / 3.2));
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundedRect(ctx, x, y, width, height, radius, fill) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function renderBitGrid(bits, refs) {
    refs.bitGrid.innerHTML = "";
    refs.powGrid.innerHTML = "";
    refs.valGrid.innerHTML = "";

    bits.forEach((bit, index) => {
      const power = 9 - index;
      const value = bit << power;

      const bitCell = document.createElement("div");
      bitCell.className = `binary-bit-cell ${bit ? "on" : "off"}`;
      bitCell.textContent = bit;
      refs.bitGrid.appendChild(bitCell);

      const powCell = document.createElement("div");
      powCell.className = "binary-pow-cell";
      powCell.innerHTML = `2<sup>${power}</sup>`;
      refs.powGrid.appendChild(powCell);

      const valueCell = document.createElement("div");
      valueCell.className = `binary-val-cell ${bit ? "active" : ""}`;
      valueCell.textContent = bit ? value : ".";
      refs.valGrid.appendChild(valueCell);
    });
  }

  function renderEquation(bits, refs, state) {
    refs.equation.innerHTML = "";
    const terms = [];
    bits.forEach((bit, index) => {
      if (bit) terms.push(1 << (9 - index));
    });

    if (!terms.length) {
      refs.equation.textContent = "0";
      return;
    }

    terms.forEach((value, index) => {
      if (index > 0) refs.equation.appendChild(eqSpan("+", "operator"));
      refs.equation.appendChild(eqSpan(value, "term"));
    });
    refs.equation.appendChild(eqSpan("=", "operator"));
    refs.equation.appendChild(eqSpan(state.current, "result"));
  }

  function eqSpan(text, type) {
    const span = document.createElement("span");
    span.className = `binary-eq-${type}`;
    span.textContent = text;
    return span;
  }

  function render(state, refs) {
    const bits = getBits(state.current);
    const binary = bits.join("");
    refs.bigNumber.textContent = state.current;
    refs.binaryString.innerHTML = `${binary.slice(0, 5)} ${binary.slice(5)}<sub>2</sub>`;
    refs.scrubber.value = state.current;

    drawHand(refs.rightHand, [
      (state.current >> 0) & 1,
      (state.current >> 1) & 1,
      (state.current >> 2) & 1,
      (state.current >> 3) & 1,
      (state.current >> 4) & 1
    ], true);

    drawHand(refs.leftHand, [
      (state.current >> 9) & 1,
      (state.current >> 8) & 1,
      (state.current >> 7) & 1,
      (state.current >> 6) & 1,
      (state.current >> 5) & 1
    ], false);

    renderBitGrid(bits, refs);
    renderEquation(bits, refs, state);
  }

  function step(state, refs, direction) {
    state.current = Math.max(0, Math.min(1023, state.current + direction));
    render(state, refs);
  }

  function scrub(state, refs) {
    state.current = Number.parseInt(refs.scrubber.value, 10);
    render(state, refs);
  }

  function updateSpeed(state, refs) {
    state.speedIndex = Number.parseInt(refs.speed.value, 10) - 1;
    refs.speedLabel.textContent = SPEED_NAMES[state.speedIndex];
    if (state.playing) {
      stop(state);
      start(state, refs);
    }
  }

  function start(state, refs) {
    state.playing = true;
    refs.play.textContent = "Pause";
    state.intervalId = window.setInterval(() => {
      if (state.current >= 1023) {
        state.current = 1023;
        stop(state);
        refs.play.textContent = "Play";
        render(state, refs);
        return;
      }
      state.current += 1;
      render(state, refs);
    }, SPEEDS[state.speedIndex]);
  }

  function stop(state) {
    state.playing = false;
    if (state.intervalId) {
      window.clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function togglePlay(state, refs) {
    if (state.playing) {
      stop(state);
      refs.play.textContent = "Play";
      return;
    }

    if (state.current >= 1023) {
      state.current = 0;
    }
    render(state, refs);
    start(state, refs);
  }

  window.CT7BinaryFingers = {
    cleanup,
    mountAll
  };
})();
