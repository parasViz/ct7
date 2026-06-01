let activePatternSketch = null;

function destroyPatternVisual() {
  if (activePatternSketch) {
    activePatternSketch.remove();
    activePatternSketch = null;
  }

  const host = document.querySelector("#pattern-visual");
  if (host) {
    host.innerHTML = "";
    host.hidden = true;
  }
}

function preparePatternHint(module, question) {
  destroyPatternVisual();

  const button = document.querySelector("#pattern-hint-button");
  if (!button) {
    return;
  }

  const hasVisualHint = Boolean(question.visual || question.hintBrief);
  button.hidden = !hasVisualHint;
  button.textContent = "Show hint";
  button.setAttribute("aria-expanded", "false");
  button.onclick = null;

  if (!hasVisualHint) {
    return;
  }

  button.onclick = () => {
    const host = document.querySelector("#pattern-visual");
    const isOpen = host && !host.hidden;
    if (isOpen) {
      destroyPatternVisual();
      button.textContent = "Show hint";
      button.setAttribute("aria-expanded", "false");
      return;
    }

    renderQuestionVisual(module, question);
    button.textContent = "Hide hint";
    button.setAttribute("aria-expanded", "true");
  };
}

function renderQuestionVisual(module, question) {
  const host = document.querySelector("#pattern-visual");
  if (!host) {
    return;
  }

  destroyPatternVisual();

  if (question.hintBrief) {
    host.hidden = false;
    host.innerHTML = briefHintMarkup(question.hintBrief);
    return;
  }

  if (!question.visual) {
    return;
  }

  host.hidden = false;
  window.requestAnimationFrame(() => {
    if (host.hidden) {
      return;
    }
    createPatternSketch(host, question.visual);
  });
}

// Visual-type -> { selector, mount } registry. Each visual file registers its
// own mounter. createPatternSketch looks up the entry and calls the mount fn.
const SKETCH_MOUNTERS = window.__ct7HintMounters || (window.__ct7HintMounters = {});

function createPatternSketch(host, visual) {
  host.innerHTML = patternHintMarkup(visual);
  const entry = SKETCH_MOUNTERS[visual.type];
  if (!entry) return;
  const sketchHost = host.querySelector(entry.selector);
  if (sketchHost) {
    const mounted = entry.mount(sketchHost, visual);
    if (mounted && typeof mounted.remove === "function") {
      activePatternSketch = mounted;
    }
  }
}

Object.assign(SKETCH_MOUNTERS, {
  digitBuild:        { selector: ".digit-build",          mount: mountDigitBuild },
  binaryPlace:       { selector: ".binary-place-host",    mount: mountBinaryPlaceSketch },
  doublingTree:      { selector: ".doubling-tree-host",   mount: mountDoublingTreeSketch },
  binaryHoles:       { selector: ".binary-holes-host",    mount: mountBinaryHolesSketch },
  decimalShift:      { selector: ".decimal-shift-host",   mount: mountDecimalShiftSketch },
  numberLine:        { selector: ".number-line-host",     mount: mountNumberLineSketch },
  digitBalance:      { selector: ".digit-balance-host",   mount: mountDigitBalanceSketch },
  multiplierCompare: { selector: ".multiplier-compare-host", mount: mountMultiplierCompareSketch },
  operatorSwapCircles: { selector: ".operator-swap-circles-host", mount: mountOperatorSwapCirclesSketch },
  binaryCount:       { selector: ".binary-count-host",    mount: mountBinaryCountSketch }
});

function briefHintMarkup(brief) {
  const articleClasses = [
    "question-brief",
    "hint-brief",
    brief.compact ? "compact" : "",
    brief.variant === "expression" ? "expression-focus" : "",
    brief.variant && brief.variant !== "expression" ? brief.variant : ""
  ].filter(Boolean).join(" ");
  const gridClasses = [
    brief.items?.length === 3 ? "three" : "",
    brief.layout === "vertical" ? "vertical" : ""
  ].filter(Boolean);
  const itemCountClass = gridClasses.length ? ` ${gridClasses.join(" ")}` : "";
  const items = (brief.items || [])
    .map(
      (item) => `
        <section class="question-brief-card">
          <span>${escapeHintHtml(item.label)}</span>
          <strong>${escapeHintHtml(item.value)}</strong>
          <small>${escapeHintHtml(item.detail)}</small>
        </section>
      `
    )
    .join("");
  const text = brief.text
    ? `<p class="question-brief-line">${escapeHintHtml(brief.text)}</p>`
    : "";
  const grid = items
    ? `<div class="question-brief-grid${itemCountClass}">${items}</div>`
    : "";
  const note = brief.note
    ? `<p class="question-brief-note">${escapeHintHtml(brief.note)}</p>`
    : "";

  return `
    <article class="${articleClasses}">
      <p class="question-brief-title">${escapeHintHtml(brief.title || "Hint")}</p>
      ${text}
      ${grid}
      ${note}
    </article>
  `;
}

function escapeHintHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function patternHintMarkup(visual) {
  const takeaway = visual.hint
    ? `
      <footer class="hint-takeaway">
        <strong>Try this:</strong>
        <span>${visual.hint}</span>
      </footer>
    `
    : "";
  return `
    <article class="hint-card hint-${visual.type}">
      <header class="hint-card-header">
        <span>Hint</span>
        <h4>${visual.title}</h4>
      </header>
      <div class="hint-card-body">
        ${patternHintBody(visual)}
      </div>
      ${takeaway}
    </article>
  `;
}

// Visual-type -> hint-markup-fn registry. Each visual file (this one + any
// split files) appends its entries here.
const HINT_RENDERERS = window.__ct7HintRenderers || (window.__ct7HintRenderers = {});

function patternHintBody(visual) {
  const renderer = HINT_RENDERERS[visual.type];
  return renderer ? renderer(visual) : "";
}

Object.assign(HINT_RENDERERS, {
  digitBuild: digitBuildHint,
  binaryPlace: binaryPlaceHint,
  doublingTree: doublingTreeHint,
  binaryHoles: binaryHolesHint,
  decimalShift: decimalShiftHint,
  numberLine: numberLineHint,
  digitBalance: digitBalanceHint,
  multiplierCompare: multiplierCompareHint,
  operatorSwapCircles: operatorSwapCirclesHint,
  binaryCount: binaryCountHint,
  densityCompare: densityCompareHint
});

function digitBuildHint(visual) {
  const values = visual.digits
    .flatMap((group) => Array.from({ length: group.count }, () => group.digit))
    .sort((a, b) => Number(a) - Number(b));

  const slotsMarkup = visual.places
    .map(
      (place, index) => `
        <button type="button" class="digit-slot" data-slot="${index}" data-status="empty" aria-label="${place} place, empty">
          <span class="digit-slot-value" aria-hidden="true">?</span>
          <span class="digit-slot-label">${place}</span>
        </button>
      `
    )
    .join("");

  const cardsMarkup = values
    .map(
      (value, index) => `
        <button type="button" class="digit-card" data-card="${index}" data-value="${value}" data-placed="false">${value}</button>
      `
    )
    .join("");

  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    <div class="digit-build" data-correct="${(visual.correctOrder || []).join(",")}">
      <div class="digit-build-row">
        <p class="digit-build-row-label">Boxes</p>
        <div class="digit-build-slots">${slotsMarkup}</div>
      </div>
      <div class="digit-build-row">
        <p class="digit-build-row-label">Cards</p>
        <div class="digit-build-tray">${cardsMarkup}</div>
      </div>
      <p class="digit-build-status" aria-live="polite">Drag a card into the matching box.</p>
    </div>
  `;
}

function mountDigitBuild(root, visual) {
  const correctOrder = visual.correctOrder || [];
  const places = visual.places || [];
  const slots = Array.from(root.querySelectorAll(".digit-slot"));
  const cards = Array.from(root.querySelectorAll(".digit-card"));
  const status = root.querySelector(".digit-build-status");
  const idleMessage = "Drag a card into the matching box.";
  let activePointerId = null;

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  setStatus(idleMessage);

  cards.forEach((card) => {
    card.addEventListener("pointerdown", (event) => startDrag(event, card));
  });

  function startDrag(event, card) {
    if (card.dataset.placed === "true") return;
    if (event.button !== undefined && event.button !== 0) return;
    if (activePointerId !== null) return;
    event.preventDefault();
    activePointerId = event.pointerId;

    const startRect = card.getBoundingClientRect();
    const offsetX = event.clientX - startRect.left;
    const offsetY = event.clientY - startRect.top;

    const ghost = card.cloneNode(true);
    ghost.classList.add("is-ghost");
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${startRect.left}px`,
      top: `${startRect.top}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      margin: "0",
      pointerEvents: "none",
      zIndex: "1000",
      transition: "none",
      transform: "scale(1.06)"
    });
    document.body.appendChild(ghost);
    card.style.visibility = "hidden";

    let hoverSlot = null;

    const onMove = (ev) => {
      if (ev.pointerId !== activePointerId) return;
      ghost.style.left = `${ev.clientX - offsetX}px`;
      ghost.style.top = `${ev.clientY - offsetY}px`;

      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      const slot = under && under.closest ? under.closest(".digit-slot") : null;
      const candidate = slot && slot.dataset.locked !== "true" ? slot : null;
      if (candidate !== hoverSlot) {
        if (hoverSlot) hoverSlot.classList.remove("is-target");
        if (candidate) candidate.classList.add("is-target");
        hoverSlot = candidate;
      }
    };

    const onEnd = (ev) => {
      if (ev.pointerId !== activePointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      activePointerId = null;

      const target = hoverSlot;
      if (hoverSlot) hoverSlot.classList.remove("is-target");
      hoverSlot = null;

      if (!target) {
        returnToTray(card, ghost, startRect);
        setStatus(idleMessage);
        return;
      }

      const index = Number(target.dataset.slot);
      const value = card.dataset.value;
      if (value === correctOrder[index]) {
        lockIntoSlot(card, ghost, target, index, value);
      } else {
        rejectAndReturn(card, ghost, target, index, value, startRect);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function animateGhost(ghost, targetLeft, targetTop, duration, transform = "scale(1)") {
    const ease = "cubic-bezier(0.2, 0.7, 0.2, 1)";
    ghost.style.transition = `left ${duration}ms ${ease}, top ${duration}ms ${ease}, transform ${duration}ms ${ease}`;
    ghost.style.left = `${targetLeft}px`;
    ghost.style.top = `${targetTop}px`;
    ghost.style.transform = transform;
  }

  function returnToTray(card, ghost, startRect) {
    animateGhost(ghost, startRect.left, startRect.top, 220);
    window.setTimeout(() => {
      ghost.remove();
      card.style.visibility = "";
    }, 240);
  }

  function lockIntoSlot(card, ghost, slot, index, value) {
    const slotRect = slot.getBoundingClientRect();
    const cardW = ghost.offsetWidth;
    const targetLeft = slotRect.left + (slotRect.width - cardW) / 2;
    const targetTop = slotRect.top + 10;

    slot.dataset.status = "correct";
    slot.dataset.locked = "true";
    const valueNode = slot.querySelector(".digit-slot-value");
    if (valueNode) valueNode.textContent = value;
    slot.setAttribute("aria-label", `${places[index]} place holds ${value}, correct.`);

    animateGhost(ghost, targetLeft, targetTop, 180);
    window.setTimeout(() => {
      ghost.remove();
      card.dataset.placed = "true";
      card.style.visibility = "";
    }, 200);

    setStatus(`${value} fits the ${places[index]} place.`);
  }

  function rejectAndReturn(card, ghost, slot, index, value, startRect) {
    const slotRect = slot.getBoundingClientRect();
    const cardW = ghost.offsetWidth;
    const overLeft = slotRect.left + (slotRect.width - cardW) / 2;
    const overTop = slotRect.top + 10;

    slot.dataset.status = "wrong";
    const valueNode = slot.querySelector(".digit-slot-value");
    if (valueNode) valueNode.textContent = value;
    ghost.classList.add("is-wrong");
    setStatus(`${value} is not the ${places[index]} digit — sending it back.`);

    animateGhost(ghost, overLeft, overTop, 130);

    window.setTimeout(() => {
      slot.dataset.status = "empty";
      if (valueNode) valueNode.textContent = "?";
      ghost.classList.remove("is-wrong");
      animateGhost(ghost, startRect.left, startRect.top, 300);
      window.setTimeout(() => {
        ghost.remove();
        card.style.visibility = "";
        setStatus(idleMessage);
      }, 320);
    }, 600);
  }
}

function p5SketchHost(className, label) {
  return `<div class="${className}" role="application" aria-label="${label}"></div>`;
}

function binaryPlaceHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("binary-place-host", "Binary place value interactive")}
  `;
}

function doublingTreeHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("doubling-tree-host", "Doubling tree interactive")}
  `;
}

function binaryHolesHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("binary-holes-host", "Binary hole pattern interactive")}
  `;
}

function decimalShiftHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("decimal-shift-host", "Decimal point shift interactive")}
  `;
}

function numberLineHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("number-line-host", "Number line interactive")}
  `;
}

function digitBalanceHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("digit-balance-host", "Digit sum balance interactive")}
  `;
}

function multiplierCompareHint(visual) {
  return `
    ${p5SketchHost("multiplier-compare-host", "Multiplier comparison animation")}
  `;
}

function operatorSwapCirclesHint() {
  return `
    ${p5SketchHost("operator-swap-circles-host", "Operator swap circle visual hint")}
  `;
}

function binaryCountHint(visual) {
  return `
    <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
    ${p5SketchHost("binary-count-host", "ON and OFF card counter interactive")}
  `;
}

function densityCompareHint(visual) {
  const countNumbers = visual.countNumbers || ["1", "2", "3", "4"];
  const decimalTicks = visual.decimalTicks || ["1.1", "1.2", "1.35", "1.5", "1.75", "1.9"];
  const startLabel = visual.startLabel || "1";
  const endLabel = visual.endLabel || "2";
  const insideLabel = visual.insideLabel || `Inside ${startLabel} to ${endLabel}`;
  const zoomLabel = visual.zoomLabel || "zoom inside one counting gap";
  const countingTitle = visual.countingTitle || "Counting steps";
  const decimalTitle = visual.decimalTitle || "There is still room to keep adding decimals";
  const hasFocusedGap = visual.focusedGap !== null;
  const focusedGap = Number.isInteger(visual.focusedGap) ? visual.focusedGap : 0;
  const focusCaption = visual.focusCaption || "look inside";
  const countingTrack = countNumbers
    .map((value, index) => {
      const gap =
        index < countNumbers.length - 1
          ? `<span class="count-gap ${hasFocusedGap && index === focusedGap ? "is-focused" : ""}">${hasFocusedGap && index === focusedGap ? `<i data-caption="${focusCaption}"></i>` : ""}</span>`
          : "";
      return `<b>${value}</b>${gap}`;
    })
    .join("");
  const countTail = visual.countTail
    ? `<span class="count-gap count-tail-gap"></span><span class="count-tail">${visual.countTail}</span>`
    : "";
  const countNote = visual.countNote ? `<p class="count-note">${visual.countNote}</p>` : "";

  return `
    <p class="hint-focus"><span>Look</span><strong>${visual.instruction}</strong></p>
    <div class="density-hint" aria-hidden="true">
      <div class="density-panel density-panel-counting">
        <div class="density-panel-head">
          <span>Universe 1</span>
          <strong>${countingTitle}</strong>
        </div>
        <div class="counting-track">${countingTrack}${countTail}</div>
        ${countNote}
      </div>
      <div class="density-zoom" aria-hidden="true">
        <span class="density-lens"></span>
        <strong>${zoomLabel}</strong>
      </div>
      <div class="density-panel density-panel-decimals">
        <div class="density-panel-head">
          <span>${insideLabel}</span>
          <strong>${decimalTitle}</strong>
        </div>
        <div class="decimal-window">
          <div class="decimal-ruler">
            <b>${startLabel}</b>
            ${decimalTicks.map((value) => `<i>${value}</i>`).join("")}
            <b>${endLabel}</b>
          </div>
          <div class="decimal-dots">
            ${Array.from({ length: 23 }, (_, index) => `<span class="dot-${index % 5}"></span>`).join("")}
          </div>
        </div>
        <p>Between any two shown points, another point can still be placed.</p>
      </div>
    </div>
  `;
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

function makeP5Sketch(host, factory) {
  if (!window.p5) {
    host.innerHTML = `
      <div class="sketch-fallback">
        Interactive visual is still loading. Refresh the page if it doesn't appear.
      </div>
    `;
    return;
  }
  if (activePatternSketch) {
    activePatternSketch.remove();
    activePatternSketch = null;
  }
  activePatternSketch = new window.p5(factory, host);
}

const RGB_LIGHTS = ["R", "G", "B"];
const RGB_NAMES = { R: "Red", G: "Green", B: "Blue" };
const RGB_COLORS = { R: "#f95877", G: "#06d6a0", B: "#4c7cff" };

function mountBinaryCountSketch(host, visual) {
  const theme = ctTheme();
  const totalLights = visual.lights || 5;
  const practiceMax = Math.max(1, Math.min(visual.practiceMax || totalLights, totalLights));
  const labels = visual.labels || ["A", "B", "C", "D", "E", "F"].slice(0, totalLights);

  makeP5Sketch(host, (p) => {
    let shownLights = Math.min(2, practiceMax);
    let controls = [];

    p.setup = () => {
      p.createCanvas(sketchWidth(), sketchHeight());
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
    };

    p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

    p.draw = () => {
      controls = [];
      p.clear();
      drawHeader();
      drawCards();
      drawNextStep();
    };

    p.mousePressed = () => handleClick();
    p.touchStarted = () => (handleClick() ? false : undefined);

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 760));
    }

    function sketchHeight() {
      return countLayout().height;
    }

    function handleClick() {
      const hit = controls.find((control) => pointIn(control, p.mouseX, p.mouseY));
      if (!hit || !hit.enabled) return false;
      const before = shownLights;
      if (hit.action === "down") shownLights = Math.max(1, shownLights - 1);
      if (hit.action === "up") shownLights = Math.min(practiceMax, shownLights + 1);
      if (shownLights !== before) {
        p.resizeCanvas(sketchWidth(), sketchHeight());
      }
      return true;
    }

    function countLayout() {
      const width = p.width > 0 ? p.width : sketchWidth();
      const compact = width < 560;
      const combos = Math.pow(2, shownLights);
      const columns = compact ? Math.min(2, combos) : Math.min(4, combos);
      const rows = Math.ceil(combos / columns);
      const gap = compact ? 8 : 12;
      const margin = compact ? 16 : 22;
      const maxCardW = compact ? 142 : 158;
      const cardW = Math.min(maxCardW, (width - margin * 2 - gap * (columns - 1)) / columns);
      const cardH = shownLights <= 2 ? 90 : 96;
      const gridW = columns * cardW + (columns - 1) * gap;
      const startX = (width - gridW) / 2;
      const startY = compact ? 130 : 98;
      const footerY = startY + rows * cardH + (rows - 1) * gap + 14;
      const footerH = 54;
      return { columns, rows, gap, cardW, cardH, startX, startY, footerY, footerH, height: footerY + footerH + 18 };
    }

    function drawHeader() {
      const y = 20;
      const compact = p.width < 560;
      p.noStroke();
      p.fill(theme.text);
      p.textStyle(p.BOLD);
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);
      p.text("ON/OFF choices", 22, y);

      p.fill(theme.soft);
      p.textSize(12);
      p.textStyle(p.BOLD);
      p.text(
        `Question asks about ${totalLights} lights. Explore up to ${practiceMax} first.`,
        22,
        y + 25,
        compact ? p.width - 44 : p.width - 286,
        34
      );

      drawStepper(compact ? 22 : p.width - 230, compact ? 72 : y + 7);
    }

    function drawButton(x, y, w, h, label, enabled, action) {
      controls.push({ x, y, w, h, action, enabled });
      p.stroke(enabled ? theme.blue : theme.border);
      p.strokeWeight(1.6);
      p.fill(enabled ? "#ffffff" : "#f4f6fa");
      p.rect(x, y, w, h, 10);
      p.noStroke();
      p.fill(enabled ? theme.blue : theme.soft);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.textStyle(p.BOLD);
      p.text(label, x + w / 2, y + h / 2 - 1);
    }

    function drawStepper(x, y) {
      const buttonW = 38;
      const labelW = 112;
      const h = 36;
      drawButton(x, y, buttonW, h, "-", shownLights > 1, "down");

      p.stroke("rgba(76, 124, 255, 0.22)");
      p.strokeWeight(1.4);
      p.fill("rgba(76, 124, 255, 0.08)");
      p.rect(x + buttonW + 8, y, labelW, h, 10);
      p.noStroke();
      p.fill(theme.blue);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(14);
      p.textStyle(p.BOLD);
      p.text(`${shownLights} light${shownLights === 1 ? "" : "s"}`, x + buttonW + 8 + labelW / 2, y + h / 2);

      drawButton(x + buttonW + labelW + 16, y, buttonW, h, "+", shownLights < practiceMax, "up");
    }

    function drawCards() {
      const combos = Math.pow(2, shownLights);
      const { columns, gap, cardW, cardH, startX, startY } = countLayout();

      for (let index = 0; index < combos; index += 1) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + col * (cardW + gap);
        const y = startY + row * (cardH + gap);
        drawBinaryCard(x, y, cardW, cardH, index);
      }
    }

    function drawBinaryCard(x, y, w, h, index) {
      const bits = index.toString(2).padStart(shownLights, "0").split("").map(Number);
      const code = bits.map((bit) => (bit ? "U" : "O")).join("");
      const singleOn = shownLights === 1 && bits[0] === 1;
      const singleOff = shownLights === 1 && bits[0] === 0;
      const activeColor = singleOn ? theme.teal : singleOff ? theme.soft : theme.blue;
      const cardFill = singleOn
        ? "rgba(6, 214, 160, 0.08)"
        : singleOff
          ? "rgba(100, 112, 134, 0.06)"
          : "#ffffff";

      p.stroke(singleOn ? theme.teal : theme.border);
      p.strokeWeight(singleOn ? 2 : 1.2);
      p.fill(cardFill);
      p.rect(x, y, w, h, 8);

      if (shownLights === 1) {
        const badgeText = singleOn ? "ON" : "OFF";
        const badgeW = Math.min(w - 28, 64);
        p.stroke(singleOn ? theme.teal : "#c9d3e0");
        p.strokeWeight(1.2);
        p.fill(singleOn ? "#f3fffb" : "#f7f9fc");
        p.rect(x + (w - badgeW) / 2, y + 10, badgeW, 24, 999);
        p.noStroke();
        p.fill(activeColor);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(badgeText, x + w / 2, y + 22);
      } else {
        p.noStroke();
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(11);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`Card ${index + 1}`, x + w / 2, y + 10);
      }

      const gap = Math.min(13, w / (shownLights + 1) * 0.18);
      const dotSize = Math.min(38, (w - 28 - gap * (shownLights - 1)) / shownLights);
      const totalW = dotSize * shownLights + gap * (shownLights - 1);
      let dotX = x + (w - totalW) / 2 + dotSize / 2;
      const dotY = shownLights === 1 ? y + h / 2 + 8 : y + h / 2 + 4;

      bits.forEach((bit, bitIndex) => {
        p.stroke(bit ? theme.teal : "#c9d3e0");
        p.strokeWeight(bit ? 2.4 : 1.5);
        p.fill(bit ? "rgba(6, 214, 160, 0.22)" : "#ffffff");
        p.circle(dotX, dotY, dotSize);
        p.noStroke();
        p.fill(bit ? theme.teal : theme.soft);
        p.textSize(Math.max(14, dotSize * 0.46));
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(bit ? "U" : "O", dotX, dotY + 0.5);
        p.fill(theme.soft);
        p.textSize(10);
        p.text(shownLights === 1 ? `Light ${labels[bitIndex] || bitIndex + 1}` : labels[bitIndex] || bitIndex + 1, dotX, y + h - 12);
        dotX += dotSize + gap;
      });
    }

    function drawNextStep() {
      const { footerY, footerH } = countLayout();
      const y = footerY;
      p.stroke("rgba(76, 124, 255, 0.25)");
      p.strokeWeight(1.4);
      p.fill("rgba(76, 124, 255, 0.06)");
      p.rect(20, y, p.width - 40, footerH, 10);
      p.noStroke();
      p.fill(theme.text);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.textAlign(p.LEFT, p.CENTER);
      const nextText = shownLights < totalLights
        ? "Adding one more light makes an ON copy and an OFF copy of every card."
        : "Every light adds one more ON/OFF choice.";
      p.text(nextText, 36, y + footerH / 2, p.width - 160, footerH - 14);

      p.fill("#ffffff");
      p.stroke(theme.blue);
      p.strokeWeight(1.4);
      p.rect(p.width - 112, y + 11, 76, 32, 999);
      p.noStroke();
      p.fill(theme.blue);
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.text(`${Math.pow(2, shownLights)} cards`, p.width - 74, y + 27);
    }
  });
}

function pointIn(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// Shared, hover-aware button used by the Module 7 (triangle) hint sketches.
function hintButton(p, theme, btn) {
  const accent = btn.accent || theme.blue;
  const active = btn.active;
  const hovered = btn.hovered;
  p.push();
  p.stroke(active || hovered ? accent : theme.border);
  p.strokeWeight(active ? 2.4 : 1.4);
  p.fill(active ? accent : hovered ? colorWithAlpha(accent, 0.12) : "#ffffff");
  p.rect(btn.x, btn.y, btn.w, btn.h, 9);
  p.noStroke();
  p.fill(active ? "#ffffff" : accent);
  p.textStyle(p.BOLD);
  p.textSize(btn.size || 12.5);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 0.5);
  p.pop();
}

function distanceTo(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function colorWithAlpha(hex, alpha) {
  const clean = String(hex).replace("#", "");
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mountMultiplierCompareSketch(host, visual) {
  const theme = ctTheme();
  const start = visual.start || 10;
  const minK = visual.minK ?? 0;
  const maxK = visual.maxK ?? 2;
  let currentK = visual.initialK ?? 1;
  let displayK = currentK;
  const baseMax = start * 1.4;
  let displayMax = baseMax;
  const anchorKs = Array.isArray(visual.cases) && visual.cases.length
    ? visual.cases
        .map((c) => (typeof c === "number" ? { k: c } : c))
        .filter((c) => typeof c.k === "number" && c.k >= minK && c.k <= maxK)
    : [{ k: 0.5 }, { k: 1 }, { k: 1.5 }, { k: 2 }].filter((c) => c.k >= minK && c.k <= maxK);

  makeP5Sketch(host, (p) => {
    let dragging = false;

    p.setup = () => {
      p.createCanvas(sketchWidth(), sketchHeight());
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
    };

    p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

    p.draw = () => {
      p.clear();
      displayK += (currentK - displayK) * 0.18;
      drawVector();
      drawSlider();
    };

    p.mousePressed = () => startDrag();
    p.mouseDragged = () => dragSlider();
    p.mouseReleased = () => { dragging = false; };
    p.touchStarted = () => (startDrag() ? false : undefined);
    p.touchMoved = () => (dragSlider() ? false : undefined);
    p.touchEnded = () => { dragging = false; };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 760));
    }

    function sketchHeight() {
      return p.width < 560 ? 314 : 292;
    }

    function relationColor(k) {
      if (k < 0.98) return theme.blue;
      if (k > 1.02) return theme.pink;
      return theme.teal;
    }

    function relationLabel(k) {
      if (k < 0.98) return "smaller";
      if (k > 1.02) return "bigger";
      return "equal";
    }

    function sliderLayout() {
      const maxW = p.width < 560 ? p.width - 120 : 420;
      const width = Math.min(maxW, p.width - 180);
      return {
        x: (p.width - width) / 2,
        y: p.height - 66,
        w: width
      };
    }

    function vectorLayout() {
      const maxW = p.width < 560 ? p.width - 92 : 560;
      const width = Math.min(maxW, p.width - 156);
      return {
        x: (p.width - width) / 2,
        y: p.width < 560 ? 118 : 112,
        w: width
      };
    }

    function kToX(k, layout) {
      return p.map(p.constrain(k, minK, maxK), minK, maxK, layout.x, layout.x + layout.w);
    }

    function startDrag() {
      const layout = sliderLayout();
      const knobX = kToX(currentK, layout);
      const nearKnob = distanceTo(p.mouseX, p.mouseY, knobX, layout.y) <= 24;
      const nearTrack = p.mouseX >= layout.x - 8 && p.mouseX <= layout.x + layout.w + 8 && Math.abs(p.mouseY - layout.y) <= 22;
      if (!nearKnob && !nearTrack) return false;
      dragging = true;
      updateKFromPointer();
      return true;
    }

    function dragSlider() {
      if (!dragging) return false;
      updateKFromPointer();
      return true;
    }

    function updateKFromPointer() {
      const layout = sliderLayout();
      currentK = p.map(p.constrain(p.mouseX, layout.x, layout.x + layout.w), layout.x, layout.x + layout.w, minK, maxK);
      if (Math.abs(currentK - 1) < 0.035) currentK = 1;
    }

    function drawVector() {
      const layout = vectorLayout();
      const x0 = layout.x;
      const y = layout.y;
      const xMax = layout.x + layout.w;
      const result = start * displayK;
      const targetMax = Math.max(baseMax, result * 1.1, start * 1.1);
      displayMax += (targetMax - displayMax) * 0.18;
      const maxValue = displayMax;
      const referenceX = p.map(start, 0, maxValue, x0, xMax);
      const vectorX = p.map(p.constrain(result, 0, maxValue), 0, maxValue, x0, xMax);
      const accent = relationColor(displayK);
      const growth = ((displayK - 1) * 100);
      const delta = result - start;

      const badges = badgeLayout();
      drawBadge(badges.x, badges.y, badges.w, badges.h, `k ${formatK(displayK)}`, accent, badges.fontSize);
      drawBadge(
        badges.x + badges.w + badges.gap,
        badges.y,
        badges.w,
        badges.h,
        formatNumber(result),
        accent,
        displayK > 1 ? badges.growFontSize : badges.shrinkFontSize
      );
      drawBadge(badges.x + (badges.w + badges.gap) * 2, badges.y, badges.w, badges.h, formatPercent(growth), accent, badges.fontSize);

      drawAnchorRail(x0, xMax, y, maxValue);

      p.stroke(colorWithAlpha(theme.soft, 0.22));
      p.strokeWeight(6);
      p.strokeCap(p.ROUND);
      p.line(x0, y, xMax, y);

      drawOutputScale(x0, xMax, y, maxValue);

      drawGhostArrow(x0, referenceX, y);

      const compareStart = Math.min(referenceX, vectorX);
      const compareEnd = Math.max(referenceX, vectorX);
      const bandWidth = Math.abs(compareEnd - compareStart);
      if (bandWidth > 1) {
        p.noStroke();
        p.fill(colorWithAlpha(accent, 0.18));
        p.rect(compareStart, y - 9, bandWidth, 18, 4);
        if (bandWidth > 28) {
          const sign = delta > 0 ? "+" : "";
          drawSmallLabel((compareStart + compareEnd) / 2, y + 26, `${sign}${formatNumber(delta)}`, accent);
        }
      }

      drawArrow(x0, y, vectorX, y, accent);

      drawEndpointMarker(referenceX, y);

      p.noStroke();
      p.fill(theme.soft);
      p.circle(x0, y, 10);

      if (Math.abs(delta) > 0.05) {
        const labelX = p.constrain(vectorX, x0 + 24, xMax - 24);
        drawSmallLabel(labelX, y - 22, formatNumber(result), accent);
      }
    }

    function drawGhostArrow(x0, refX, y) {
      p.stroke(colorWithAlpha(theme.teal, 0.32));
      p.strokeWeight(5);
      p.strokeCap(p.ROUND);
      p.line(x0, y, refX, y);
      p.noStroke();
      p.fill(colorWithAlpha(theme.teal, 0.5));
      p.triangle(refX + 7, y, refX - 5, y - 4, refX - 5, y + 4);
    }

    function drawEndpointMarker(refX, y) {
      p.noStroke();
      p.fill(theme.teal);
      p.triangle(refX, y - 7, refX - 3, y - 12, refX + 3, y - 12);
    }

    function drawAnchorRail(x0, xMax, y, maxValue) {
      const railY = y - 44;
      anchorKs.forEach(({ k, label }) => {
        const value = start * k;
        if (value < -0.001) return;
        const offScale = value > maxValue + 0.001;
        const x = offScale ? xMax : p.map(value, 0, maxValue, x0, xMax);
        const isRef = Math.abs(k - 1) < 0.001;
        const tone = isRef
          ? theme.teal
          : colorWithAlpha(theme.teal, offScale ? 0.35 : 0.55);
        p.stroke(tone);
        p.strokeWeight(isRef ? 2.2 : 1.4);
        if (offScale) {
          p.noFill();
          const cx = xMax - 4;
          p.beginShape();
          p.vertex(cx - 6, railY + 6);
          p.vertex(cx, railY + 11);
          p.vertex(cx - 6, railY + 16);
          p.endShape();
        } else {
          p.line(x, railY + 6, x, railY + 16);
          p.noStroke();
          p.fill(tone);
          p.circle(x, railY + 4, isRef ? 6 : 4);
        }
        const text = label || formatFactor(k);
        const labelX = offScale ? xMax - 14 : x;
        drawSmallLabel(labelX, railY - 6, offScale ? `${text} →` : text, tone);
      });
    }

    function formatFactor(k) {
      if (Math.abs(k - 1) < 0.001) return "1x";
      if (Math.abs(k - 0.5) < 0.001) return "½x";
      if (Math.abs(k - 1.5) < 0.001) return "1½x";
      if (Math.abs(k - 2) < 0.001) return "2x";
      return `${formatK(k)}x`;
    }

    function drawSlider() {
      const layout = sliderLayout();
      const oneX = kToX(1, layout);
      const knobX = kToX(currentK, layout);
      const y = layout.y;

      p.strokeWeight(6);
      p.strokeCap(p.ROUND);
      p.stroke(colorWithAlpha(theme.blue, 0.28));
      p.line(layout.x, y, oneX, y);
      p.stroke(colorWithAlpha(theme.pink, 0.28));
      p.line(oneX, y, layout.x + layout.w, y);

      const midTicks = [];
      for (let k = Math.ceil(minK * 2) / 2; k <= maxK + 0.0001; k += 0.5) {
        if (k > minK + 0.0001 && k < maxK - 0.0001 && Math.abs(k - 1) > 0.0001) {
          midTicks.push(k);
        }
      }
      midTicks.forEach((k) => {
        const x = kToX(k, layout);
        p.stroke(colorWithAlpha(theme.soft, 0.45));
        p.strokeWeight(1.2);
        p.line(x, y - 6, x, y + 6);
        drawSmallLabel(x, y + 18, formatK(k), colorWithAlpha(theme.soft, 0.85));
        drawSmallLabel(x, y + 30, formatPercent((k - 1) * 100), colorWithAlpha(theme.soft, 0.6));
      });

      p.stroke(theme.teal);
      p.strokeWeight(2.4);
      p.line(oneX, y - 12, oneX, y + 12);
      drawSmallLabel(layout.x + layout.w / 2, y - 22, "k", theme.soft);
      drawSmallLabel(layout.x, y + 18, formatK(minK), theme.soft);
      drawSmallLabel(layout.x, y + 30, formatPercent((minK - 1) * 100), colorWithAlpha(theme.soft, 0.6));
      drawSmallLabel(oneX, y + 18, "1", theme.teal);
      drawSmallLabel(oneX, y + 30, "0%", colorWithAlpha(theme.teal, 0.8));
      drawSmallLabel(layout.x + layout.w, y + 18, formatK(maxK), theme.soft);
      drawSmallLabel(layout.x + layout.w, y + 30, formatPercent((maxK - 1) * 100), colorWithAlpha(theme.soft, 0.6));

      const accent = relationColor(currentK);
      p.noStroke();
      p.fill(colorWithAlpha(accent, 0.16));
      p.circle(knobX, y, dragging ? 22 : 18);
      p.stroke("#ffffff");
      p.strokeWeight(2.5);
      p.fill(accent);
      p.circle(knobX, y, dragging ? 16 : 13);
    }

    function badgeLayout() {
      const gap = p.width < 420 ? 10 : 18;
      const available = Math.max(0, p.width - 32);
      const w = Math.min(p.width < 420 ? 104 : 118, Math.max(78, (available - gap * 2) / 3));
      const h = p.width < 420 ? 34 : 38;
      const totalW = w * 3 + gap * 2;
      return {
        x: (p.width - totalW) / 2,
        y: 16,
        w,
        h,
        gap,
        fontSize: p.width < 420 ? 13 : 15,
        growFontSize: p.width < 420 ? 17 : 20,
        shrinkFontSize: p.width < 420 ? 11 : 12
      };
    }

    function drawBadge(x, y, w, h, label, accent, fontSize) {
      p.stroke(colorWithAlpha(accent, 0.28));
      p.strokeWeight(1.7);
      p.fill(colorWithAlpha(accent, 0.08));
      p.rect(x, y, w, h, 999);
      p.noStroke();
      p.fill(accent);
      p.textStyle(p.BOLD);
      p.textSize(fontSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, x + w / 2, y + h / 2 + 0.5);
    }

    function drawOutputScale(x0, xMax, y, maxValue) {
      const labelStep = pickStep(maxValue);
      const minorStep = labelStep / 5;
      for (let value = 0; value <= maxValue + 0.001; value += minorStep) {
        const x = p.map(value, 0, maxValue, x0, xMax);
        const isLabel = Math.abs(value / labelStep - Math.round(value / labelStep)) < 0.01;
        const isReference = Math.abs(value - start) < 0.001;
        if (isReference) continue;
        p.stroke(colorWithAlpha(theme.soft, isLabel ? 0.55 : 0.28));
        p.strokeWeight(isLabel ? 1.4 : 0.9);
        p.line(x, y + 10, x, y + (isLabel ? 22 : 16));
        if (isLabel) {
          drawSmallLabel(x, y + 38, formatNumber(value), theme.soft);
        }
      }
      const refX = p.map(start, 0, maxValue, x0, xMax);
      p.stroke(theme.teal);
      p.strokeWeight(2.6);
      p.line(refX, y + 10, refX, y + 30);
      drawSmallLabel(refX, y + 42, formatNumber(start), theme.teal);
    }

    function pickStep(maxValue) {
      if (maxValue <= 6) return 1;
      if (maxValue <= 24) return 5;
      if (maxValue <= 60) return 10;
      return 20;
    }

    function drawSmallLabel(x, y, label, color) {
      p.noStroke();
      p.fill(color);
      p.textStyle(p.BOLD);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, x, y);
    }

    function drawArrow(x1, y1, x2, y2, color) {
      const len = Math.abs(x2 - x1);
      p.stroke(color);
      p.strokeWeight(7);
      p.strokeCap(p.ROUND);
      if (len < 14) {
        p.noStroke();
        p.fill(color);
        p.circle(x1, y1, 13);
        return;
      }
      p.line(x1, y1, x2, y2);
      p.noStroke();
      p.fill(color);
      p.triangle(x2 + 12, y2, x2 - 12, y2 - 8, x2 - 12, y2 + 8);
    }

    function formatNumber(value) {
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    }

    function formatK(value) {
      const rounded = Math.round(value * 100) / 100;
      if (Number.isInteger(rounded)) return String(rounded);
      const oneDecimal = Math.round(value * 10) / 10;
      if (Math.abs(oneDecimal - rounded) < 0.001) return oneDecimal.toFixed(1);
      return rounded.toFixed(2);
    }

    function formatPercent(value) {
      const rounded = Math.round(value);
      if (Math.abs(rounded) <= 1) return "0%";
      return `${rounded > 0 ? "+" : ""}${rounded}%`;
    }
  });
}

function mountOperatorSwapCirclesSketch(host, visual) {
  const theme = ctTheme();
  const numbers = Array.isArray(visual.numbers) && visual.numbers.length === 4
    ? visual.numbers
    : [8, 4, 2, 1];
  const operators = Array.isArray(visual.operators) && visual.operators.length === 3
    ? visual.operators
    : ["x", "+", "-"];

  makeP5Sketch(host, (p) => {
    p.setup = () => {
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.createCanvas(sketchWidth(), sketchHeight());
    };

    p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

    p.draw = () => {
      p.clear();
      p.background("#ffffff");
      drawScene();
    };

    function sketchWidth() {
      return Math.max(320, host.clientWidth || 700);
    }

    function sketchHeight() {
      return p.width < 520 ? 300 : 278;
    }

    function drawScene() {
      const layout = buildLayout();
      const pulse = (p.sin(p.frameCount * 0.045) + 1) / 2;

      drawTrack(layout.nodes);
      drawBigPairGlow(layout.nodes[0], layout.nodes[1], pulse);
      layout.nodes.forEach((node, index) => drawNumberCircle(node, index));
      layout.ops.forEach((op, index) => drawOperatorChip(op.x, op.y, operators[index], opColor(operators[index]), index === 0, 1));
      drawSwapMotion(layout.ops[0], layout.ops[2]);
    }

    function buildLayout() {
      const compact = p.width < 520;
      const margin = compact ? 40 : 70;
      const usable = p.width - margin * 2;
      const y = compact ? 128 : 126;
      const scale = compact ? 0.62 : p.width < 680 ? 0.82 : 1;
      const maxRoot = Math.sqrt(Math.max(...numbers));
      const nodes = numbers.map((value, index) => {
        const root = Math.sqrt(Math.max(1, value));
        const radius = p.map(root, 1, maxRoot, 24, 54) * scale;
        return {
          value,
          x: margin + (usable / (numbers.length - 1)) * index,
          y,
          r: radius
        };
      });
      const ops = operators.map((operator, index) => ({
        operator,
        x: (nodes[index].x + nodes[index + 1].x) / 2,
        y
      }));
      return { nodes, ops };
    }

    function drawTrack(nodes) {
      p.stroke(colorWithAlpha(theme.soft, 0.16));
      p.strokeWeight(5);
      p.strokeCap(p.ROUND);
      p.line(nodes[0].x, nodes[0].y, nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
    }

    function drawBigPairGlow(left, right, pulse) {
      const y = left.y + Math.max(left.r, right.r) + 14;
      p.stroke(colorWithAlpha(theme.pink, 0.2 + pulse * 0.16));
      p.strokeWeight(6);
      p.strokeCap(p.ROUND);
      p.line(left.x, y, right.x, y);
      p.noStroke();
      p.fill(colorWithAlpha(theme.pink, 0.08 + pulse * 0.06));
      p.rect(left.x - left.r * 0.72, left.y - left.r * 0.9, right.x - left.x + right.r * 1.44, left.r * 1.8, 28);
    }

    function drawNumberCircle(node, index) {
      const palette = [theme.yellow, theme.teal, theme.blue, theme.orange];
      const color = palette[index % palette.length];
      p.noStroke();
      p.fill(colorWithAlpha(theme.text, 0.08));
      p.circle(node.x + 2, node.y + 5, node.r * 2);
      p.stroke(colorWithAlpha(color, 0.78));
      p.strokeWeight(2.2);
      p.fill(colorWithAlpha(color, 0.16));
      p.circle(node.x, node.y, node.r * 2);
      p.noStroke();
      p.fill(theme.text);
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(Math.max(18, node.r * 0.72));
      p.text(String(node.value), node.x, node.y + 1);
    }

    function drawOperatorChip(x, y, label, color, emphasized, alpha) {
      const w = p.width < 520 ? 32 : 38;
      const h = p.width < 520 ? 30 : 34;
      p.push();
      p.drawingContext.globalAlpha = alpha;
      p.noStroke();
      if (emphasized) {
        const pulse = (p.sin(p.frameCount * 0.06) + 1) / 2;
        p.fill(colorWithAlpha(color, 0.12 + pulse * 0.1));
        p.circle(x, y, w + 22 + pulse * 8);
      }
      p.stroke(colorWithAlpha(color, 0.58));
      p.strokeWeight(emphasized ? 2.2 : 1.7);
      p.fill("#ffffff");
      p.rect(x - w / 2, y - h / 2, w, h, 999);
      p.noStroke();
      p.fill(color);
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(p.width < 520 ? 18 : 20);
      p.text(label, x, y + 0.5);
      p.pop();
      p.drawingContext.globalAlpha = 1;
    }

    function drawSwapMotion(firstOp, lastOp) {
      const t = (p.sin(p.frameCount * 0.026) + 1) / 2;
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
      const minusPoint = arcPoint(lastOp, firstOp, eased, 78);
      const xPoint = arcPoint(firstOp, lastOp, eased, -58);

      drawArc(lastOp, firstOp, 78, theme.blue);
      drawArc(firstOp, lastOp, -58, theme.pink);
      drawOperatorChip(minusPoint.x, minusPoint.y, "-", theme.blue, false, 0.86);
      drawOperatorChip(xPoint.x, xPoint.y, "x", theme.pink, false, 0.6);
    }

    function arcPoint(from, to, amount, lift) {
      return {
        x: p.lerp(from.x, to.x, amount),
        y: p.lerp(from.y, to.y, amount) - Math.sin(amount * Math.PI) * lift
      };
    }

    function drawArc(from, to, lift, color) {
      const midX = (from.x + to.x) / 2;
      p.push();
      p.noFill();
      p.stroke(colorWithAlpha(color, 0.22));
      p.strokeWeight(2);
      p.drawingContext.setLineDash([5, 9]);
      p.bezier(from.x, from.y, midX, from.y - lift, midX, to.y - lift, to.x, to.y);
      p.drawingContext.setLineDash([]);
      p.pop();
    }

    function opColor(operator) {
      if (operator === "x" || operator === "*") return theme.pink;
      if (operator === "+") return theme.teal;
      if (operator === "-") return theme.blue;
      return theme.orange;
    }
  });
}

function mountBinaryPlaceSketch(host, visual) {
  const theme = ctTheme();
  const places = (visual.places || [16, 8, 4, 2, 1]).slice();
  const target = typeof visual.target === "number" ? visual.target : null;
  const hasTarget = target !== null;
  const showTargetLabel = hasTarget && !visual.hideTargetLabel;
  const showHand = places.length === 5 && places.every((place, index) => place === [16, 8, 4, 2, 1][index]);
  const initialBits = Array.isArray(visual.initialBits)
    ? visual.initialBits.slice()
    : places.map(() => 0);

  makeP5Sketch(host, (p) => {
    const bits = initialBits.length === places.length
      ? initialBits.map((value) => (value ? 1 : 0))
      : places.map(() => 0);
    const anim = bits.map((value) => value);

    let cellW = 70;
    let cellH = 84;
    let gap = 12;
    let originX = 0;
    let originY = 186;
    let handTop = 64;
    let handScale = 1;
    let fingerTargets = [];

    p.setup = () => {
      p.createCanvas(sketchWidth(), sketchHeight());
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      layout();
    };

    p.draw = () => {
      p.clear();
      drawHeader();
      if (showHand) drawBinaryHand();
      drawColumns();
      drawTotals();
    };

    p.mousePressed = handleClick;
    p.touchStarted = () => (handleClick() ? false : undefined);

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), sketchHeight());
      layout();
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function sketchHeight() {
      return showHand ? (sketchWidth() < 520 ? 398 : 390) : 260;
    }

    function layout() {
      const w = p.width;
      const mobile = w < 520;
      gap = mobile ? 7 : 12;
      cellW = mobile ? Math.min(58, (w - 36 - gap * (places.length - 1)) / places.length) : 70;
      cellH = mobile ? 74 : 82;
      const totalW = places.length * cellW + (places.length - 1) * gap;
      originX = Math.max(18, (w - totalW) / 2);
      handTop = mobile ? 66 : 68;
      handScale = mobile ? 0.88 : 1;
      originY = showHand ? (mobile ? 226 : 222) : (mobile ? 70 : 78);
    }

    function drawHeader() {
      p.push();
      p.noStroke();
      p.fill(theme.text);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Place values", originX, 18);
      if (showTargetLabel) {
        p.fill(theme.soft);
        p.textStyle(p.NORMAL);
        p.textSize(12);
        p.text(`Target: ${target}`, originX, 40);
      }
      p.pop();
    }

    function drawBinaryHand() {
      const centerX = p.width / 2;
      const scale = handScale;
      const palmW = 114 * scale;
      const palmH = 48 * scale;
      const palmX = centerX - palmW / 2;
      const palmY = handTop + 68 * scale;
      const fingerW = 17 * scale;
      const fingerGap = 8 * scale;
      const fingerBaseY = palmY + 5 * scale;
      const offH = 38 * scale;
      const onH = 66 * scale;
      const startX = palmX + 10 * scale;
      const labelsY = palmY + palmH + 19 * scale;

      fingerTargets = [];

      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textSize(11);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.TOP);
      p.text("One hand: raised fingers count as 1", centerX, handTop - 12);

      p.stroke(theme.border);
      p.strokeWeight(1.2);
      p.fill("#d6e8f7");
      p.rect(palmX, palmY, palmW, palmH, 10 * scale);

      for (let index = 0; index < 4; index += 1) {
        drawFinger(index, startX + index * (fingerW + fingerGap), fingerBaseY, fingerW, offH, onH, labelsY, scale, false);
      }

      const thumbX = palmX + palmW - 2 * scale;
      const thumbY = palmY + 17 * scale;
      drawFinger(4, thumbX, thumbY, fingerW, 30 * scale, 46 * scale, labelsY, scale, true);
      p.pop();
    }

    function drawFinger(index, x, baseY, width, offHeight, onHeight, labelsY, scale, isThumb) {
      const t = anim[index];
      const height = p.lerp(offHeight, onHeight, t);
      const y = baseY - height;
      const cx = x + width / 2;
      const labelX = isThumb ? x + width * 0.8 : cx;
      const labelOffset = isThumb ? 12 * scale : 0;
      const fill = p.lerpColor(p.color("#eef3f8"), p.color("#118ab2"), t);
      const stroke = t > 0.5 ? p.color("#118ab2") : p.color(theme.border);

      p.push();
      p.stroke(stroke);
      p.strokeWeight(t > 0.5 ? 2 : 1.2);
      p.fill(fill);
      if (isThumb) {
        p.translate(x + width / 2, baseY);
        p.rotate(p.radians(28));
        p.rect(-width / 2, -height, width, height, 8 * scale);
        p.resetMatrix();
      } else {
        p.rect(x, y, width, height, 8 * scale);
      }
      p.noStroke();
      p.fill(t > 0.5 ? "#118ab2" : theme.soft);
      p.textSize(10);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.TOP);
      p.text(String(places[index]), labelX + labelOffset, labelsY);
      p.pop();

      fingerTargets.push({
        index,
        x: isThumb ? x - 4 * scale : x - 3 * scale,
        y: isThumb ? y - 2 * scale : y - 3 * scale,
        w: isThumb ? width + 24 * scale : width + 6 * scale,
        h: isThumb ? height + 20 * scale : height + 6 * scale
      });
    }

    function drawColumns() {
      const ease = 0.18;
      bits.forEach((value, index) => {
        anim[index] += (value - anim[index]) * ease;
        const x = originX + index * (cellW + gap);
        const y = originY;
        const on = anim[index] > 0.5;
        const t = anim[index];
        const fill = p.lerpColor(p.color(theme.card), p.color(theme.teal + "1A"), t);
        const stroke = on ? p.color(theme.teal) : p.color(theme.border);
        p.push();
        p.stroke(stroke);
        p.strokeWeight(on ? 2.5 : 1.5);
        p.fill(fill);
        p.rect(x, y, cellW, cellH, 12);
        p.noStroke();
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(11);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`2^${places.length - 1 - index}`, x + cellW / 2, y + 10);
        p.fill(theme.text);
        p.textSize(22);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(String(places[index]), x + cellW / 2, y + cellH / 2 + 2);
        p.textSize(13);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.fill(on ? theme.teal : theme.soft);
        p.text(bits[index], x + cellW / 2, y + cellH - 8);
        p.pop();
      });
    }

    function drawTotals() {
      const sum = bits.reduce((acc, b, i) => acc + (b ? places[i] : 0), 0);
      const binary = bits.join("");
      const targetReached = hasTarget && sum === target;
      const y = originY + cellH + 28;
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(12);
      p.textAlign(p.CENTER, p.BASELINE);
      p.text("Binary", p.width / 2 - 90, y);
      p.text("Decimal", p.width / 2 + 90, y);
      p.fill(theme.text);
      p.textSize(22);
      p.text(binary, p.width / 2 - 90, y + 28);
      p.fill(targetReached ? theme.teal : theme.text);
      p.text(String(sum), p.width / 2 + 90, y + 28);
      if (showTargetLabel) {
        p.textSize(11);
        p.fill(targetReached ? theme.teal : theme.soft);
        p.text(targetReached ? "Matches the target." : `Need ${target}`, p.width / 2 + 90, y + 48);
      }
      p.pop();
    }

    function handleClick() {
      const mx = p.mouseX;
      const my = p.mouseY;
      const finger = fingerTargets.find((targetArea) => (
        mx >= targetArea.x &&
        mx <= targetArea.x + targetArea.w &&
        my >= targetArea.y &&
        my <= targetArea.y + targetArea.h
      ));
      if (finger) {
        bits[finger.index] = bits[finger.index] ? 0 : 1;
        return true;
      }

      for (let i = 0; i < places.length; i += 1) {
        const x = originX + i * (cellW + gap);
        if (mx >= x && mx <= x + cellW && my >= originY && my <= originY + cellH) {
          bits[i] = bits[i] ? 0 : 1;
          return true;
        }
      }
      return false;
    }
  });
}

function mountDoublingTreeSketch(host, visual) {
  const theme = ctTheme();
  const base = visual.base || 2;
  const exponent = visual.exponent || 5;
  const labels = visual.labels || [];
  const hideFinalValue = Boolean(visual.hideFinalValue);

  makeP5Sketch(host, (p) => {
    let revealed = 0;
    let lastTick = 0;
    let cellSize = 72;

    p.setup = () => {
      p.createCanvas(sketchWidth(), 240);
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      lastTick = p.millis();
      layout();
    };

    p.draw = () => {
      p.clear();
      if (revealed < exponent + 1 && p.millis() - lastTick > 600) {
        revealed += 1;
        lastTick = p.millis();
      }
      drawTree();
    };

    p.mousePressed = () => {
      revealed = revealed >= exponent + 1 ? 1 : exponent + 1;
      lastTick = p.millis();
    };
    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), 240);
      layout();
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    let gap = 18;

    function layout() {
      const total = exponent + 1;
      const mobile = p.width < 520;
      gap = mobile ? 8 : 18;
      cellSize = Math.min(86, Math.max(40, (p.width - 36 - (total - 1) * gap) / total));
    }

    function drawTree() {
      const total = exponent + 1;
      const totalW = total * cellSize + (total - 1) * gap;
      const startX = (p.width - totalW) / 2;
      const y = 70;
      for (let i = 0; i < total; i += 1) {
        const value = Math.pow(base, i);
        const x = startX + i * (cellSize + gap);
        const visible = i < revealed;
        const hideValue = hideFinalValue && i === exponent;
        const fillColor = visible ? p.color(theme.teal + "1A") : p.color(theme.card);
        const strokeColor = visible ? p.color(theme.teal) : p.color(theme.border);
        p.push();
        p.stroke(strokeColor);
        p.strokeWeight(visible ? 2.5 : 1.5);
        p.fill(fillColor);
        p.rect(x, y, cellSize, cellSize, 14);
        p.noStroke();
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(10);
        p.textAlign(p.CENTER, p.TOP);
        p.text(labels[i] || `${i} hole${i === 1 ? "" : "s"}`, x + cellSize / 2, y + 8);
        p.fill(visible ? theme.text : theme.soft);
        p.textSize(cellSize > 70 ? 24 : 20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(visible && !hideValue ? String(value) : "?", x + cellSize / 2, y + cellSize / 2 + 4);
        p.pop();
        if (i < total - 1) {
          p.push();
          p.stroke(theme.soft);
          p.strokeWeight(1.4);
          const ax = x + cellSize;
          const ay = y + cellSize / 2;
          const bx = ax + gap;
          p.line(ax, ay, bx, ay);
          p.noStroke();
          p.fill(theme.soft);
          p.textStyle(p.BOLD);
          p.textSize(10);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text(`×${base}`, (ax + bx) / 2, ay - 4);
          p.pop();
        }
      }
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text(
        hideFinalValue
          ? "Double once more to finish the last box."
          : `${base} x ${base} x ... (${exponent} times) = ${Math.pow(base, exponent)}`,
        p.width / 2,
        y + cellSize + 22
      );
      p.pop();
    }
  });
}

function mountBinaryHolesSketch(host, visual) {
  const theme = ctTheme();
  const binary = String(visual.binary || "");
  const mapping = visual.mapping || { 0: "O", 1: "U" };
  const hideHoleAnswers = Boolean(visual.hideHoleAnswers);
  const shapeChoices = Array.isArray(visual.shapeChoices)
    ? visual.shapeChoices.slice()
    : Array.from(new Set(Object.values(mapping)));

  makeP5Sketch(host, (p) => {
    const digits = binary.split("");
    const choices = digits.map(() => "");
    let highlight = -1;
    let cellSize = 68;

    p.setup = () => {
      p.createCanvas(sketchWidth(), 220);
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      layout();
    };

    p.draw = () => {
      p.clear();
      drawHoles();
    };

    p.mousePressed = () => {
      const idx = hitIndex();
      if (idx >= 0) {
        highlight = idx;
        if (hideHoleAnswers) cycleChoice(idx);
      }
    };
    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), 220);
      layout();
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function layout() {
      cellSize = Math.min(76, Math.max(50, (p.width - 40 - (digits.length - 1) * 14) / digits.length));
    }

    function getColumns() {
      const gap = 14;
      const totalW = digits.length * cellSize + (digits.length - 1) * gap;
      const startX = (p.width - totalW) / 2;
      return digits.map((_, i) => startX + i * (cellSize + gap));
    }

    function hitIndex() {
      const xs = getColumns();
      for (let i = 0; i < xs.length; i += 1) {
        if (p.mouseX >= xs[i] && p.mouseX <= xs[i] + cellSize) return i;
      }
      return -1;
    }

    function cycleChoice(index) {
      const currentIndex = shapeChoices.indexOf(choices[index]);
      choices[index] = shapeChoices[(currentIndex + 1) % shapeChoices.length] || "";
    }

    function drawHoles() {
      const xs = getColumns();
      const digitY = 30;
      const holeY = digitY + cellSize + 16;
      const patternCorrect = hideHoleAnswers && choices.every(Boolean) && choices.every((choice, index) => choice === mapping[digits[index]]);

      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Digit", xs[0] - 4, digitY - 18);
      p.text(hideHoleAnswers ? "Your choice" : "Hole", xs[0] - 4, holeY - 18);
      p.pop();

      digits.forEach((digit, i) => {
        const x = xs[i];
        const chosen = hideHoleAnswers ? choices[i] : mapping[digit];
        const active = i === highlight || Boolean(choices[i]);
        const accent = patternCorrect
          ? theme.teal
          : hideHoleAnswers
          ? (chosen === shapeChoices[1] ? theme.pink : theme.blue)
          : (digit === "1" ? theme.pink : theme.blue);

        p.push();
        p.stroke(active ? accent : theme.border);
        p.strokeWeight(active ? 2.5 : 1.5);
        p.fill(active ? `${accent}1A` : theme.card);
        p.rect(x, digitY, cellSize, cellSize, 12);
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(26);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(digit, x + cellSize / 2, digitY + cellSize / 2 + 2);
        p.pop();

        p.push();
        p.stroke(active ? accent : theme.border);
        p.strokeWeight(active ? 2.5 : 1.5);
        p.fill(active ? `${accent}1A` : theme.card);
        p.rect(x, holeY, cellSize, cellSize, 12);
        const glyphColor = active ? accent : theme.text;
        drawHoleGlyph(chosen || "?", x + cellSize / 2, holeY + cellSize / 2, cellSize * 0.5, glyphColor);
        p.pop();
      });
    }

    function drawHoleGlyph(shape, cx, cy, size, color) {
      p.push();
      p.stroke(color);
      p.strokeWeight(4);
      p.noFill();
      if (shape === "O") {
        p.ellipse(cx, cy, size, size);
      } else if (shape === "U") {
        const w = size;
        const h = size;
        const left = cx - w / 2;
        const right = cx + w / 2;
        const top = cy - h / 2;
        const bottom = cy + h / 2;
        p.beginShape();
        p.vertex(left, top);
        p.vertex(left, bottom - w / 2);
        p.quadraticVertex(left, bottom, left + w / 2, bottom);
        p.quadraticVertex(right, bottom, right, bottom - w / 2);
        p.vertex(right, top);
        p.endShape();
      } else {
        p.noStroke();
        p.fill(color);
        p.textStyle(p.BOLD);
        p.textSize(size);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(shape || "?", cx, cy);
      }
      p.pop();
    }
  });
}

function mountDecimalShiftSketch(host, visual) {
  const theme = ctTheme();
  const startValue = parseFloat(visual.value);

  makeP5Sketch(host, (p) => {
    let shift = 0;
    let displayShift = 0;

    p.setup = () => {
      p.createCanvas(sketchWidth(), 240);
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
    };

    p.draw = () => {
      p.clear();
      displayShift += (shift - displayShift) * 0.2;
      drawNumber();
      drawControls();
      drawMultiplier();
    };

    p.mousePressed = () => {
      const w = p.width;
      const cy = 200;
      const leftBtn = { x: w / 2 - 80, y: cy, r: 22 };
      const rightBtn = { x: w / 2 + 80, y: cy, r: 22 };
      const resetBtn = { x: w / 2, y: cy, r: 18 };
      if (dist2(p.mouseX, p.mouseY, leftBtn) <= leftBtn.r * leftBtn.r) {
        shift = Math.max(shift - 1, -3);
      } else if (dist2(p.mouseX, p.mouseY, rightBtn) <= rightBtn.r * rightBtn.r) {
        shift = Math.min(shift + 1, 3);
      } else if (dist2(p.mouseX, p.mouseY, resetBtn) <= resetBtn.r * resetBtn.r) {
        shift = 0;
      }
    };
    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), 240);
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function dist2(x, y, c) {
      return (x - c.x) ** 2 + (y - c.y) ** 2;
    }

    function shiftedValue() {
      return startValue * Math.pow(10, shift);
    }

    function formatValue(value) {
      if (!isFinite(value)) return String(value);
      const abs = Math.abs(value);
      if (abs >= 1) {
        return Number.isInteger(value) ? value.toFixed(0) : value.toString();
      }
      const digits = Math.max(1, Math.ceil(-Math.log10(abs)) + 2);
      return Number(value.toFixed(digits)).toString();
    }

    function drawNumber() {
      const w = p.width;
      const cy = 90;
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(12);
      p.textAlign(p.CENTER, p.BASELINE);
      p.text("Original", w / 2 - 110, cy - 32);
      p.text("Shifted", w / 2 + 110, cy - 32);
      p.fill(theme.text);
      p.textSize(34);
      p.text(formatValue(startValue), w / 2 - 110, cy + 14);
      const target = formatValue(shiftedValue());
      const animatedColor = p.lerpColor(p.color(theme.text), p.color(theme.teal), Math.min(1, Math.abs(displayShift)));
      p.fill(animatedColor);
      p.text(target, w / 2 + 110, cy + 14);
      p.stroke(theme.border);
      p.strokeWeight(1);
      p.line(w / 2, cy - 36, w / 2, cy + 24);
      p.pop();
    }

    function drawControls() {
      const w = p.width;
      const cy = 200;
      const left = w / 2 - 80;
      const right = w / 2 + 80;
      const reset = w / 2;
      drawBtn(left, cy, "‹", theme.blue, "left");
      drawBtn(reset, cy, "⟲", theme.soft, "reset", 36);
      drawBtn(right, cy, "›", theme.pink, "right");
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.CENTER, p.TOP);
      p.text("÷10", left, cy + 26);
      p.text("reset", reset, cy + 26);
      p.text("×10", right, cy + 26);
      p.pop();
    }

    function drawBtn(x, y, label, color, _key, size = 44) {
      p.push();
      p.stroke(color);
      p.strokeWeight(2);
      p.fill(theme.card);
      p.rect(x - size / 2, y - size / 2, size, size, 12);
      p.noStroke();
      p.fill(color);
      p.textStyle(p.BOLD);
      p.textSize(22);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, x, y + 2);
      p.pop();
    }

    function drawMultiplier() {
      const w = p.width;
      if (shift === 0) return;
      const mult = Math.pow(10, shift);
      const text = shift > 0 ? `× ${mult}` : `÷ ${Math.pow(10, -shift)}`;
      p.push();
      p.noStroke();
      p.fill(shift > 0 ? theme.pink : theme.blue);
      p.textStyle(p.BOLD);
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(text, w / 2, 150);
      p.pop();
    }
  });
}

function mountNumberLineSketch(host, visual) {
  const theme = ctTheme();
  const start = visual.start ?? 0;
  const end = visual.end ?? 1;
  const step = visual.step || 0.1;
  const marks = visual.marks || [];
  const target = visual.target;
  const hasTarget = target !== undefined;
  const showTargetLabel = hasTarget && !visual.hideTargetLabel;

  makeP5Sketch(host, (p) => {
    let markerValue = marks.length ? marks[0] : start;
    let dragging = false;

    p.setup = () => {
      p.createCanvas(sketchWidth(), 200);
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
    };

    p.draw = () => {
      p.clear();
      drawLine();
      drawMarks();
      drawMarker();
      drawReadout();
    };

    p.mousePressed = () => {
      const m = markerPos();
      if (dist2(p.mouseX, p.mouseY, m) <= 24 * 24) {
        dragging = true;
      } else {
        markerValue = valueFromX(p.mouseX);
        snap();
      }
    };
    p.mouseDragged = () => {
      if (dragging) {
        markerValue = valueFromX(p.mouseX);
        snap();
      }
    };
    p.mouseReleased = () => {
      dragging = false;
    };
    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };
    p.touchMoved = () => {
      p.mouseDragged();
      return false;
    };
    p.touchEnded = () => {
      p.mouseReleased();
      return false;
    };

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), 200);
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function dist2(x, y, pos) {
      return (x - pos.x) ** 2 + (y - pos.y) ** 2;
    }

    function lineBounds() {
      return { left: 36, right: p.width - 36, y: 96 };
    }

    function xFromValue(value) {
      const { left, right } = lineBounds();
      const t = (value - start) / (end - start);
      return left + Math.max(0, Math.min(1, t)) * (right - left);
    }

    function valueFromX(x) {
      const { left, right } = lineBounds();
      const t = (x - left) / (right - left);
      return start + Math.max(0, Math.min(1, t)) * (end - start);
    }

    function snap() {
      const steps = Math.round((markerValue - start) / step);
      markerValue = Number((start + steps * step).toFixed(4));
    }

    function markerPos() {
      return { x: xFromValue(markerValue), y: lineBounds().y };
    }

    function drawLine() {
      const { left, right, y } = lineBounds();
      p.push();
      p.stroke(theme.border);
      p.strokeWeight(3);
      p.line(left, y, right, y);
      const ticks = Math.round((end - start) / step);
      for (let i = 0; i <= ticks; i += 1) {
        const x = left + ((right - left) * i) / ticks;
        const isWhole = Math.abs(((start + i * step) % 1)) < 0.0001;
        p.stroke(isWhole ? theme.soft : theme.border);
        p.strokeWeight(isWhole ? 2 : 1.4);
        p.line(x, y - (isWhole ? 12 : 7), x, y + (isWhole ? 12 : 7));
        if (isWhole) {
          p.noStroke();
          p.fill(theme.soft);
          p.textStyle(p.BOLD);
          p.textSize(12);
          p.textAlign(p.CENTER, p.TOP);
          p.text(formatValue(start + i * step), x, y + 16);
        }
      }
      p.pop();
    }

    function drawMarks() {
      if (!marks.length) return;
      const { y } = lineBounds();
      marks.forEach((value) => {
        const x = xFromValue(value);
        p.push();
        p.noStroke();
        p.fill(theme.teal);
        p.circle(x, y, 10);
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(11);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(formatValue(value), x, y - 12);
        p.pop();
      });
    }

    function drawMarker() {
      const m = markerPos();
      const onTarget = hasTarget && Math.abs(markerValue - target) < 0.001;
      p.push();
      p.noStroke();
      p.fill(onTarget ? theme.teal : theme.pink);
      p.circle(m.x, m.y, 22);
      p.fill("#ffffff");
      p.circle(m.x, m.y, 8);
      p.pop();
    }

    function drawReadout() {
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Marker", p.width / 2, 30);
      const onTarget = hasTarget && Math.abs(markerValue - target) < 0.001;
      p.fill(onTarget ? theme.teal : theme.text);
      p.textSize(28);
      p.text(formatValue(markerValue), p.width / 2, 48);
      if (showTargetLabel) {
        p.fill(onTarget ? theme.teal : theme.soft);
        p.textSize(11);
        p.textAlign(p.CENTER, p.TOP);
        p.text(onTarget ? "Matches the target." : `Target: ${formatValue(target)}`, p.width / 2, 150);
      }
      p.pop();
    }

    function formatValue(value) {
      const rounded = Number(value.toFixed(4));
      const str = rounded.toString();
      return str;
    }
  });
}

function mountDigitBalanceSketch(host, visual) {
  const theme = ctTheme();
  const splits = visual.splits || [];
  const rules = visual.rules || [];
  const hideBalanceFeedback = Boolean(visual.hideBalanceFeedback);
  const showRuleChecks = Boolean(visual.showRuleChecks);

  makeP5Sketch(host, (p) => {
    let active = 0;
    let cardW = 150;
    let cardH = 132;

    p.setup = () => {
      p.createCanvas(sketchWidth(), sketchHeight());
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      layout();
    };

    p.draw = () => {
      p.clear();
      drawTabs();
      drawScale();
      if (showRuleChecks) {
        drawRuleChecks();
      } else {
        drawRules();
      }
    };

    p.mousePressed = () => {
      const xs = tabPositions();
      const tabY = 16;
      const tabH = 30;
      xs.forEach((x, i) => {
        if (p.mouseX >= x && p.mouseX <= x + tabWidth() && p.mouseY >= tabY && p.mouseY <= tabY + tabH) {
          active = i;
        }
      });
    };
    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };

    p.windowResized = () => {
      p.resizeCanvas(sketchWidth(), sketchHeight());
      layout();
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function sketchHeight() {
      return showRuleChecks ? 232 : 260;
    }

    function layout() {
      cardW = Math.min(154, Math.max(112, (p.width - 92) / 2));
      cardH = showRuleChecks ? 82 : 132;
    }

    function tabWidth() {
      const gap = 8;
      const total = splits.length;
      const max = p.width - 40;
      return (max - (total - 1) * gap) / total;
    }

    function tabPositions() {
      const w = tabWidth();
      const gap = 8;
      const total = splits.length;
      const startX = (p.width - (total * w + (total - 1) * gap)) / 2;
      return splits.map((_, i) => startX + i * (w + gap));
    }

    function drawTabs() {
      const xs = tabPositions();
      const w = tabWidth();
      splits.forEach((split, i) => {
        const x = xs[i];
        const isActive = i === active;
        p.push();
        p.stroke(isActive ? theme.blue : theme.border);
        p.strokeWeight(isActive ? 2.2 : 1.4);
        p.fill(isActive ? `${theme.blue}12` : theme.card);
        p.rect(x, 16, w, 30, 14);
        p.noStroke();
        p.fill(isActive ? theme.blue : theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(split.label, x + w / 2, 31);
        p.pop();
      });
    }

    function drawScale() {
      const split = splits[active];
      if (!split) return;
      const sumLeft = split.left.reduce((a, b) => a + b, 0);
      const sumRight = split.right.reduce((a, b) => a + b, 0);
      const balanced = !hideBalanceFeedback && sumLeft === sumRight;

      const cy = showRuleChecks ? 112 : 150;
      const sideGap = showRuleChecks ? 18 : 30;
      const leftX = p.width / 2 - cardW - sideGap;
      const rightX = p.width / 2 + sideGap;
      drawPan(leftX, cy, split.left, sumLeft, "Left", balanced);
      drawPan(rightX, cy, split.right, sumRight, "Right", balanced);
      p.push();
      p.noStroke();
      p.fill(hideBalanceFeedback ? theme.soft : (balanced ? theme.teal : theme.pink));
      p.textStyle(p.BOLD);
      p.textSize(showRuleChecks ? 26 : 22);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(hideBalanceFeedback ? "?" : (balanced ? "=" : "≠"), p.width / 2, cy);
      if (!showRuleChecks) {
        p.fill(theme.soft);
        p.textSize(11);
        p.text(hideBalanceFeedback ? "add both sides" : (balanced ? "balanced" : "off-balance"), p.width / 2, cy + 22);
      }
      p.pop();
    }

    function drawPan(x, cy, digits, sum, label, balanced) {
      p.push();
      p.stroke(theme.border);
      p.strokeWeight(1.5);
      p.fill(theme.card);
      p.rect(x, cy - cardH / 2, cardW, cardH, 12);
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.CENTER, p.TOP);
      p.text(label, x + cardW / 2, cy - cardH / 2 + 9);
      const gap = 8;
      const tile = Math.min(showRuleChecks ? 32 : 34, (cardW - 28 - gap * (digits.length - 1)) / digits.length);
      const totalW = digits.length * tile + (digits.length - 1) * gap;
      const startX = x + (cardW - totalW) / 2;
      digits.forEach((digit, i) => {
        const dx = startX + i * (tile + gap);
        const dy = cy - tile / 2 + 8;
        p.stroke(theme.border);
        p.strokeWeight(1.5);
        p.fill(theme.page);
        p.rect(dx, dy, tile, tile, 8);
        p.noStroke();
        p.fill(theme.text);
        p.textSize(18);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(digit, dx + tile / 2, dy + tile / 2 + 2);
      });
      p.noStroke();
      p.fill(balanced ? theme.teal : theme.text);
      p.textStyle(p.BOLD);
      p.textSize(14);
      p.textAlign(p.CENTER, p.BASELINE);
      if (!showRuleChecks) {
        p.text(hideBalanceFeedback ? "add these digits" : `sum = ${sum}`, x + cardW / 2, cy + cardH / 2 - 12);
      }
      p.pop();
    }

    function drawRules() {
      if (!rules.length) return;
      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);
      p.text(rules.join("  ·  "), 24, p.height - 22);
      p.pop();
    }

    function drawRuleChecks() {
      const split = splits[active];
      if (!split) return;
      const checks = ruleChecks(split);
      const gap = 10;
      const chipH = 26;
      const maxW = p.width - 56;
      const chipW = Math.min(142, (maxW - gap * (checks.length - 1)) / checks.length);
      const totalW = checks.length * chipW + (checks.length - 1) * gap;
      const startX = (p.width - totalW) / 2;
      const y = p.height - 40;

      checks.forEach((check, index) => {
        const x = startX + index * (chipW + gap);
        p.push();
        p.stroke(check.passed ? theme.teal : theme.border);
        p.strokeWeight(check.passed ? 2 : 1.2);
        p.fill(check.passed ? `${theme.teal}1A` : theme.card);
        p.rect(x, y, chipW, chipH, 13);
        p.noStroke();
        p.fill(check.passed ? theme.teal : theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(10);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(check.passed ? `${check.label} ok` : check.label, x + chipW / 2, y + chipH / 2 + 1);
        p.pop();
      });
    }

    function ruleChecks(split) {
      const sumLeft = split.left.reduce((a, b) => a + b, 0);
      const sumRight = split.right.reduce((a, b) => a + b, 0);
      return [
        { label: "Left", passed: isStrictDescending(split.left) },
        { label: "Right", passed: isStrictAscending(split.right) },
        { label: "Sum", passed: sumLeft === sumRight }
      ];
    }

    function isStrictDescending(digits) {
      return digits.every((digit, index) => index === 0 || digits[index - 1] > digit);
    }

    function isStrictAscending(digits) {
      return digits.every((digit, index) => index === 0 || digits[index - 1] < digit);
    }
  });
}


window.CT7PatternHints = {
  destroyPatternVisual,
  preparePatternHint
};
