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

  const hasVisualHint = Boolean(question.visual);
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

function createPatternSketch(host, visual) {
  host.innerHTML = patternHintMarkup(visual);
  if (visual.type === "digitBuild") {
    const buildHost = host.querySelector(".digit-build");
    if (buildHost) mountDigitBuild(buildHost, visual);
  } else if (visual.type === "binaryPlace") {
    const sketchHost = host.querySelector(".binary-place-host");
    if (sketchHost) mountBinaryPlaceSketch(sketchHost, visual);
  } else if (visual.type === "doublingTree") {
    const sketchHost = host.querySelector(".doubling-tree-host");
    if (sketchHost) mountDoublingTreeSketch(sketchHost, visual);
  } else if (visual.type === "binaryHoles") {
    const sketchHost = host.querySelector(".binary-holes-host");
    if (sketchHost) mountBinaryHolesSketch(sketchHost, visual);
  } else if (visual.type === "decimalShift") {
    const sketchHost = host.querySelector(".decimal-shift-host");
    if (sketchHost) mountDecimalShiftSketch(sketchHost, visual);
  } else if (visual.type === "numberLine") {
    const sketchHost = host.querySelector(".number-line-host");
    if (sketchHost) mountNumberLineSketch(sketchHost, visual);
  } else if (visual.type === "digitBalance") {
    const sketchHost = host.querySelector(".digit-balance-host");
    if (sketchHost) mountDigitBalanceSketch(sketchHost, visual);
  }
}

function patternHintMarkup(visual) {
  return `
    <article class="hint-card hint-${visual.type}">
      <header class="hint-card-header">
        <span>Hint</span>
        <h4>${visual.title}</h4>
      </header>
      <div class="hint-card-body">
        ${patternHintBody(visual)}
      </div>
      <footer class="hint-takeaway">
        <strong>Try this:</strong>
        <span>${visual.hint}</span>
      </footer>
    </article>
  `;
}

function patternHintBody(visual) {
  switch (visual.type) {
    case "differences":
      return sequenceHint(visual.values, visual.diffs, "Look at the gap between each pair.");
    case "wrongDiff":
      return sequenceHint(visual.values, visual.diffs, "One jump does not fit the expected gap pattern.", visual.expected);
    case "doubling":
      return pairHint(visual.pairs, "x2", "Letters move forward. Numbers double.");
    case "alphabet":
      return sequenceHint(visual.letters, visual.jumps, "Use alphabet positions and compare jumps.");
    case "digitBuild":
      return digitBuildHint(visual);
    case "binaryPlace":
      return binaryPlaceHint(visual);
    case "doublingTree":
      return doublingTreeHint(visual);
    case "binaryHoles":
      return binaryHolesHint(visual);
    case "decimalShift":
      return decimalShiftHint(visual);
    case "numberLine":
      return numberLineHint(visual);
    case "digitBalance":
      return digitBalanceHint(visual);
    case "split":
      return splitHint(visual);
    case "table":
      return tableHint(visual);
    case "stacks":
      return stackHint(visual);
    case "linear":
      return linearHint(visual);
    case "cycle":
      return cycleHint(visual);
    case "stair":
      return stairHint(visual);
    default:
      return "";
  }
}

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

function mountBinaryPlaceSketch(host, visual) {
  const theme = ctTheme();
  const places = (visual.places || [16, 8, 4, 2, 1]).slice();
  const target = typeof visual.target === "number" ? visual.target : null;
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
      if (target !== null) {
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
      const targetReached = target !== null && sum === target;
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
      if (target !== null) {
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
        p.text(visible ? String(value) : "?", x + cellSize / 2, y + cellSize / 2 + 4);
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
      p.text(`${base} × ${base} × … (${exponent} times) = ${Math.pow(base, exponent)}`, p.width / 2, y + cellSize + 22);
      p.pop();
    }
  });
}

function mountBinaryHolesSketch(host, visual) {
  const theme = ctTheme();
  const binary = String(visual.binary || "");
  const mapping = visual.mapping || { 0: "O", 1: "U" };

  makeP5Sketch(host, (p) => {
    const digits = binary.split("");
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
      if (idx >= 0) highlight = idx;
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

    function drawHoles() {
      const xs = getColumns();
      const digitY = 30;
      const holeY = digitY + cellSize + 16;

      p.push();
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Digit", xs[0] - 4, digitY - 18);
      p.text("Hole", xs[0] - 4, holeY - 18);
      p.pop();

      digits.forEach((digit, i) => {
        const x = xs[i];
        const active = i === highlight;
        const accent = digit === "1" ? theme.pink : theme.blue;

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
        drawHoleGlyph(mapping[digit], x + cellSize / 2, holeY + cellSize / 2, cellSize * 0.5, glyphColor);
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
      const onTarget = target !== undefined && Math.abs(markerValue - target) < 0.001;
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
      const onTarget = target !== undefined && Math.abs(markerValue - target) < 0.001;
      p.fill(onTarget ? theme.teal : theme.text);
      p.textSize(28);
      p.text(formatValue(markerValue), p.width / 2, 48);
      if (target !== undefined) {
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

  makeP5Sketch(host, (p) => {
    let active = 0;
    let cardW = 150;
    let cardH = 132;

    p.setup = () => {
      p.createCanvas(sketchWidth(), 260);
      p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      layout();
    };

    p.draw = () => {
      p.clear();
      drawTabs();
      drawScale();
      drawRules();
    };

    p.mousePressed = () => {
      const xs = tabPositions();
      const tabY = 20;
      const tabH = 32;
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
      p.resizeCanvas(sketchWidth(), 260);
      layout();
    };

    function sketchWidth() {
      return Math.max(320, Math.floor(host.clientWidth || 720));
    }

    function layout() {
      cardW = Math.min(190, Math.max(120, (p.width - 80) / 2));
      cardH = 132;
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
        p.stroke(isActive ? theme.pink : theme.border);
        p.strokeWeight(isActive ? 2.5 : 1.5);
        p.fill(isActive ? `${theme.pink}1A` : theme.card);
        p.rect(x, 20, w, 32, 12);
        p.noStroke();
        p.fill(isActive ? theme.pink : theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(split.label, x + w / 2, 38);
        p.pop();
      });
    }

    function drawScale() {
      const split = splits[active];
      if (!split) return;
      const sumLeft = split.left.reduce((a, b) => a + b, 0);
      const sumRight = split.right.reduce((a, b) => a + b, 0);
      const balanced = sumLeft === sumRight;

      const cy = 150;
      const leftX = p.width / 2 - cardW / 2 - 30 - cardW / 2;
      const rightX = p.width / 2 + cardW / 2 + 30 - cardW / 2;
      drawPan(leftX, cy, split.left, sumLeft, "Left of point", balanced);
      drawPan(rightX, cy, split.right, sumRight, "Right of point", balanced);
      p.push();
      p.stroke(theme.border);
      p.strokeWeight(2);
      p.line(p.width / 2, cy - 50, p.width / 2, cy + 60);
      p.noStroke();
      p.fill(balanced ? theme.teal : theme.pink);
      p.textStyle(p.BOLD);
      p.textSize(22);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(balanced ? "=" : "≠", p.width / 2, cy);
      p.fill(theme.soft);
      p.textSize(11);
      p.text(balanced ? "balanced" : "off-balance", p.width / 2, cy + 22);
      p.pop();
    }

    function drawPan(x, cy, digits, sum, label, balanced) {
      p.push();
      p.stroke(theme.border);
      p.strokeWeight(1.5);
      p.fill(theme.card);
      p.rect(x, cy - cardH / 2, cardW, cardH, 14);
      p.noStroke();
      p.fill(theme.soft);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.textAlign(p.CENTER, p.TOP);
      p.text(label, x + cardW / 2, cy - cardH / 2 + 10);
      const gap = 8;
      const tile = Math.min(34, (cardW - 20 - gap * (digits.length - 1)) / digits.length);
      const totalW = digits.length * tile + (digits.length - 1) * gap;
      const startX = x + (cardW - totalW) / 2;
      digits.forEach((digit, i) => {
        const dx = startX + i * (tile + gap);
        const dy = cy - 16;
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
      p.text(`sum = ${sum}`, x + cardW / 2, cy + cardH / 2 - 12);
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
  });
}

function sequenceHint(items, gaps, label, expected = []) {
  const showEquation =
    items[items.length - 1] === "?" &&
    isNumericValue(items[items.length - 2]) &&
    /^[+-]\d+$/.test(String(gaps[gaps.length - 1]));

  return `
    <p class="hint-focus"><span>Step 1</span><strong>${label}</strong></p>
    <div class="hint-scroll" aria-hidden="true">
      <div class="hint-sequence">
        ${items
          .map((item, index) => {
            const hasGap = index < gaps.length;
            const isTarget = item === "?";
            const isMismatch = expected[index] && expected[index] !== gaps[index];
            return `
              <div class="hint-sequence-item">
                <div class="hint-tile ${isTarget ? "target" : ""}">${item}</div>
                ${
                  hasGap
                    ? `<div class="hint-gap ${isMismatch ? "mismatch" : ""}">
                        <span>${gaps[index]}</span>
                        <b>${isMismatch ? "check" : "gap"}</b>
                      </div>`
                    : ""
                }
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
    ${ruleRow(expected.length ? "Actual gaps" : "Gap pattern", gaps, expected)}
    ${expected.length ? ruleRow("Expected gaps", expected) : ""}
    ${
      showEquation
        ? `<div class="hint-equation"><span>Step 2</span><strong>${items[items.length - 2]} ${formatGapForEquation(gaps[gaps.length - 1])} = ?</strong></div>`
        : ""
    }
  `;
}

function pairHint(pairs, rule, label) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>${label}</strong></p>
    <div class="hint-scroll" aria-hidden="true">
      <div class="hint-sequence pair-sequence">
        ${pairs
          .map(
            (pair, index) => `
            <div class="hint-sequence-item">
              <div class="hint-pair ${pair[1] === "?" ? "target" : ""}">
                <strong>${pair[0]}</strong>
                <span>${pair[1]}</span>
              </div>
              ${index < pairs.length - 1 ? `<div class="hint-gap"><span>${rule}</span><b>number</b></div>` : ""}
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    <div class="hint-equation"><span>Step 2</span><strong>${pairs.map((pair) => pair[1]).join(" -> ")}</strong></div>
  `;
}

function splitHint(visual) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>Separate odd-position terms and even-position terms.</strong></p>
    <div class="lane-board">
      ${laneMarkup(visual.topLabel, visual.top, visual.topRule)}
      ${laneMarkup(visual.bottomLabel, visual.bottom, visual.bottomRule, true)}
    </div>
  `;
}

function laneMarkup(label, items, rule, accent = false) {
  return `
    <div class="hint-lane ${accent ? "accent" : ""}">
      <span>${label}</span>
      <div>
        ${items.map((item) => `<b class="${item === "?" ? "target" : ""}">${item}</b>`).join(`<em>${rule}</em>`)}
      </div>
    </div>
  `;
}

function tableHint(visual) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>Fill the last row using the same rule as the first rows.</strong></p>
    <table class="hint-table">
      <thead><tr>${visual.columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>
        ${visual.rows
          .map((row) => `<tr>${row.map((cell) => `<td class="${cell === "?" ? "target" : ""}">${cell}</td>`).join("")}</tr>`)
          .join("")}
      </tbody>
    </table>
  `;
}

function stackHint(visual) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>The number of copies increases by one each time.</strong></p>
    <div class="stack-hint">
      ${visual.stacks
        .map((stack) => {
          const isTarget = Boolean(stack.target);
          return `
          <div class="${stack.target ? "target" : ""}">
            <div class="stack-dots">${isTarget ? "<i class=\"mystery-dot\">?</i>" : Array.from({ length: stack.count }, () => "<i></i>").join("")}</div>
            <strong>${stack.label}</strong>
            <span>${isTarget ? "? copies" : `${stack.count} copies`}</span>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function linearHint(visual) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>Every new term adds 3 chairs. Count how many jumps are needed.</strong></p>
    <div class="linear-hint">
      ${visual.terms
        .map(
          ([term, value]) => `
          <div class="${value === "?" ? "target" : ""}">
            <span>Term ${term}</span>
            <strong>${value}</strong>
          </div>
        `
        )
        .join("")}
    </div>
    <div class="hint-equation"><span>Step 2</span><strong>4 + 14 jumps of 3 = ?</strong></div>
  `;
}

function cycleHint(visual) {
  const colors = { red: "#f95877", blue: "#118ab2", green: "#06d6a0", yellow: "#ffd166" };
  return `
    <p class="hint-focus"><span>Step 1</span><strong>One full cycle has 4 colours. Count complete cycles, then the leftover spot.</strong></p>
    <div class="cycle-key">
      ${visual.colors.map((color, index) => `<span style="--dot:${colors[color]}"><b>${index + 1}</b>${color}</span>`).join("")}
    </div>
    <div class="cycle-hint">
      ${Array.from({ length: visual.target }, (_, index) => {
        const number = index + 1;
        const colorName = visual.colors[index % visual.colors.length];
        const isTarget = number === visual.target;
        return `<span class="${isTarget ? "target mystery-cycle" : ""}" style="--dot:${isTarget ? "#f95877" : colors[colorName]}">${number}</span>`;
      }).join("")}
    </div>
  `;
}

function stairHint(visual) {
  return `
    <p class="hint-focus"><span>Step 1</span><strong>Each row has one more block than the row above it.</strong></p>
    <div class="stair-hint">
      ${Array.from({ length: visual.rows }, (_, rowIndex) => {
        const blocks = rowIndex + 1;
        return `<div>${Array.from({ length: blocks }, () => "<span></span>").join("")}<b>${blocks}</b></div>`;
      }).join("")}
    </div>
    <div class="hint-equation"><span>Step 2</span><strong>1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 = ?</strong></div>
  `;
}

function ruleRow(label, values, expected = []) {
  return `
    <div class="hint-rule-row">
      <span>${label}</span>
      ${values
        .map((value, index) => `<b class="${expected[index] && expected[index] !== value ? "mismatch" : ""}">${value}</b>`)
        .join("")}
    </div>
  `;
}

function isNumericValue(value) {
  return /^-?\d+$/.test(String(value));
}

function formatGapForEquation(gap) {
  return String(gap).replace("+", "+ ").replace("-", "- ");
}

function drawPatternVisual(ctx, visual, width, height, frame = 0) {
  ctx.clearRect(0, 0, width, height);
  drawRoundedRect(ctx, 0, 0, width, height, 8, "#ffffff", "rgba(23, 32, 52, 0.1)");
  drawRoundedRect(ctx, 14, 14, width - 28, 40, 8, "#f5f9ff", "rgba(17, 138, 178, 0.16)");
  drawLabel(ctx, "Visual hint", 28, 39, 12, "#118ab2", 900);
  drawLabel(ctx, visual.title, 112, 40, 16, "#172034", 900);
  ctx.__noteY = height - 30;
  ctx.__noteWidth = width - 64;

  switch (visual.type) {
    case "differences":
      drawDifferenceVisual(ctx, visual, width, frame);
      break;
    case "stacks":
      drawStackVisual(ctx, visual, width, frame);
      break;
    case "doubling":
      drawDoublingVisual(ctx, visual, width, frame);
      break;
    case "split":
      drawSplitVisual(ctx, visual, width, frame);
      break;
    case "table":
      drawTableVisual(ctx, visual, width, frame);
      break;
    case "wrongDiff":
      drawWrongDifferenceVisual(ctx, visual, width);
      break;
    case "linear":
      drawLinearVisual(ctx, visual, width, frame);
      break;
    case "cycle":
      drawCycleVisual(ctx, visual, width, frame);
      break;
    case "stair":
      drawStairVisual(ctx, visual, width);
      break;
    case "alphabet":
      drawAlphabetVisual(ctx, visual, width, frame);
      break;
  }
}

function drawDifferenceVisual(ctx, visual, width, frame) {
  const cards = layoutCards(width, visual.values.length, 62, 18, 34);
  visual.values.forEach((value, index) => {
    drawCard(ctx, { ...cards[index], h: 54 }, 86, String(value), index === visual.values.length - 1, frame);
    if (index < visual.diffs.length) {
      drawArrow(ctx, cards[index].x + cards[index].w + 4, 113, cards[index + 1].x - 4, 113, "", index === visual.diffs.length - 1, frame);
      const chipX = (cards[index].x + cards[index].w + cards[index + 1].x) / 2;
      drawGapChip(ctx, chipX, 158, visual.diffs[index], index === visual.diffs.length - 1, frame);
    }
  });
  drawLabel(ctx, "Numbers", 34, 78, 12, "#647086", 900);
  drawLabel(ctx, "Gaps", 34, 164, 12, "#647086", 900);
  drawNote(ctx, "The gaps grow by 3 each time: +3, +6, +9, +12, then +15.");
}

function drawStackVisual(ctx, visual, width, frame) {
  const cards = layoutCards(width, visual.stacks.length, 70, 24);
  visual.stacks.forEach((stack, index) => {
    const x = cards[index].x + cards[index].w / 2;
    const pulse = stack.target ? 1 + Math.sin(frame / 18) * 0.08 : 1;
    for (let dot = 0; dot < stack.count; dot += 1) {
      drawCircle(ctx, x, 150 - dot * 18, 7 * pulse, stack.target ? "#f95877" : "#06d6a0");
    }
    drawCard(ctx, { x: cards[index].x, y: 166, w: cards[index].w, h: 42 }, stack.label, stack.target, frame);
    drawLabel(ctx, `${stack.count} copies`, cards[index].x + cards[index].w / 2, 218, 12, "#506070", 800, "center");
  });
}

function drawDoublingVisual(ctx, visual, width, frame) {
  const cards = layoutCards(width, visual.pairs.length, 64, 22);
  visual.pairs.forEach((pair, index) => {
    drawCard(ctx, { x: cards[index].x, y: 76, w: cards[index].w, h: 92 }, `${pair[0]}\n${pair[1]}`, index === visual.pairs.length - 1, frame);
    if (index < visual.pairs.length - 1) {
      drawArrow(ctx, cards[index].x + cards[index].w, 122, cards[index + 1].x, 122, "x2", false, frame);
    }
  });
  drawNote(ctx, "Letters move one step; numbers double.", 18, 210);
}

function drawSplitVisual(ctx, visual, width, frame) {
  drawLane(ctx, visual.topLabel, visual.top, 64, visual.topRule, width, "#118ab2", frame);
  drawLane(ctx, visual.bottomLabel, visual.bottom, 145, visual.bottomRule, width, "#f95877", frame);
}

function drawTableVisual(ctx, visual, width, frame) {
  const tableWidth = Math.min(width - 36, 560);
  const startX = (width - tableWidth) / 2;
  const rowH = 32;
  const colW = tableWidth / visual.columns.length;
  const startY = 58;

  visual.columns.forEach((column, index) => {
    drawRoundedRect(ctx, startX + index * colW, startY, colW - 3, rowH, 8, "#172034");
    drawLabel(ctx, column, startX + index * colW + colW / 2, startY + 21, 12, "white", 900, "center");
  });

  visual.rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const target = rowIndex === visual.rows.length - 1;
      drawRoundedRect(ctx, startX + colIndex * colW, startY + 38 + rowIndex * rowH, colW - 3, rowH - 3, 8, target ? pulseColor(frame) : "white", "rgba(23, 32, 52, 0.08)");
      drawLabel(ctx, cell, startX + colIndex * colW + colW / 2, startY + 59 + rowIndex * rowH, 14, "#172034", 900, "center");
    });
  });
  drawNote(ctx, "Total = black squares + white squares.", 18, 218);
}

function drawWrongDifferenceVisual(ctx, visual, width) {
  const cards = layoutCards(width, visual.values.length, 46, 14);
  visual.values.forEach((value, index) => {
    drawCard(ctx, cards[index], 88, String(value), false, 0);
    if (index < visual.diffs.length) {
      const mismatch = visual.diffs[index] !== visual.expected[index];
      drawArrow(ctx, cards[index].x + cards[index].w + 1, 120, cards[index + 1].x - 1, 120, visual.diffs[index], mismatch, 0);
      if (mismatch) {
        drawLabel(ctx, "check", (cards[index].x + cards[index + 1].x + cards[index].w) / 2, 150, 11, "#f95877", 900, "center");
      }
    }
  });
  drawNote(ctx, "Expected gaps: +2, +4, +6, +8, +10, +12.", 18, 210);
}

function drawLinearVisual(ctx, visual, width, frame) {
  const cards = layoutCards(width, visual.terms.length, 74, 18);
  visual.terms.forEach((term, index) => {
    drawRoundedRect(ctx, cards[index].x, 78, cards[index].w, 82, 14, index === visual.terms.length - 1 ? pulseColor(frame) : "white", "rgba(23, 32, 52, 0.08)");
    drawLabel(ctx, `Term ${term[0]}`, cards[index].x + cards[index].w / 2, 104, 12, "#506070", 900, "center");
    drawLabel(ctx, term[1], cards[index].x + cards[index].w / 2, 140, 24, "#172034", 900, "center");
    if (index < visual.terms.length - 2) {
      drawArrow(ctx, cards[index].x + cards[index].w + 2, 119, cards[index + 1].x - 2, 119, "+3", false, frame);
    }
  });
  drawNote(ctx, "From term 1 to term 15, there are 14 jumps of +3.", 18, 214);
}

function drawCycleVisual(ctx, visual, width, frame) {
  const colors = { red: "#f95877", blue: "#118ab2", green: "#06d6a0", yellow: "#ffd166" };
  const startX = 28;
  const gap = Math.min(34, (width - 56) / 10);
  for (let index = 1; index <= visual.target; index += 1) {
    const row = index > 9 ? 1 : 0;
    const col = (index - 1) % 9;
    const colourName = visual.colors[(index - 1) % visual.colors.length];
    const x = startX + col * gap;
    const y = 76 + row * 70;
    const target = index === visual.target;
    drawCircle(ctx, x, y, target ? 15 + Math.sin(frame / 16) * 2 : 13, colors[colourName], target ? "#172034" : "white");
    drawLabel(ctx, String(index), x, y + 36, 11, "#506070", 800, "center");
  }
  drawNote(ctx, "Count in groups of 4: red, blue, green, yellow.", 18, 214);
}

function drawStairVisual(ctx, visual, width) {
  const size = Math.min(20, (width - 80) / visual.rows);
  const baseX = Math.max(22, width / 2 - (visual.rows * size) / 2);
  const baseY = 184;
  let total = 0;
  for (let row = 1; row <= visual.rows; row += 1) {
    total += row;
    for (let col = 0; col < row; col += 1) {
      drawRoundedRect(ctx, baseX + col * size, baseY - row * size, size - 2, size - 2, 4, row % 2 ? "#06d6a0" : "#118ab2");
    }
    drawLabel(ctx, String(row), baseX - 16, baseY - row * size + size / 2 + 4, 11, "#506070", 800, "center");
  }
  drawNote(ctx, `Rows 1 to 8 make ${total} blocks in all.`, 18, 218);
}

function drawAlphabetVisual(ctx, visual, width, frame) {
  const cards = layoutCards(width, visual.letters.length, 52, 18);
  visual.letters.forEach((letter, index) => {
    drawCard(ctx, cards[index], 88, letter, index === visual.letters.length - 1, frame);
    if (index < visual.jumps.length) {
      drawArrow(ctx, cards[index].x + cards[index].w + 3, 120, cards[index + 1].x - 3, 120, visual.jumps[index], index === visual.jumps.length - 1, frame);
    }
  });
  drawNote(ctx, "Use alphabet positions: A=1, C=3, F=6, J=10, O=15.", 18, 210);
}

function drawLane(ctx, label, items, y, rule, width, colour, frame) {
  drawLabel(ctx, label, 18, y + 6, 12, "#506070", 900);
  const cards = layoutCards(width - 104, items.length, 52, 18, 104);
  items.forEach((item, index) => {
    drawCard(ctx, { x: cards[index].x, y: y + 22, w: cards[index].w, h: 46 }, item, item === "?", frame);
    if (index < items.length - 1) {
      drawArrow(ctx, cards[index].x + cards[index].w + 4, y + 45, cards[index + 1].x - 4, y + 45, rule, item === "?", frame, colour);
    }
  });
}

function layoutCards(width, count, cardWidth, gap, offset = 18) {
  const available = width - offset * 2;
  const actualGap = count > 1 ? Math.min(gap, Math.max(8, (available - count * cardWidth) / (count - 1))) : 0;
  const actualWidth = Math.min(cardWidth, (available - actualGap * (count - 1)) / count);
  const total = count * actualWidth + (count - 1) * actualGap;
  const start = offset + (available - total) / 2;
  return Array.from({ length: count }, (_, index) => ({ x: start + index * (actualWidth + actualGap), y: 0, w: actualWidth, h: 52 }));
}

function drawCard(ctx, rect, yOrText, maybeText, maybeHighlight, frame = 0) {
  const rectWithY = typeof yOrText === "number" ? { ...rect, y: yOrText } : rect;
  const text = typeof yOrText === "number" ? maybeText : yOrText;
  const highlight = typeof yOrText === "number" ? maybeHighlight : maybeText;
  const fill = highlight ? pulseColor(frame) : "white";
  drawRoundedRect(ctx, rectWithY.x, rectWithY.y, rectWithY.w, rectWithY.h, 10, fill, "rgba(23, 32, 52, 0.12)");
  String(text)
    .split("\n")
    .forEach((line, index, lines) => {
      const y = rectWithY.y + rectWithY.h / 2 + (index - (lines.length - 1) / 2) * 24 + 8;
      drawLabel(ctx, line, rectWithY.x + rectWithY.w / 2, y, lines.length > 1 ? 20 : 23, "#172034", 900, "center");
    });
}

function drawArrow(ctx, x1, y1, x2, y2, label, highlight = false, frame = 0, colour = "#118ab2") {
  const stroke = highlight ? "#f95877" : colour;
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = highlight ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 7, y2 - 5);
  ctx.lineTo(x2 - 7, y2 + 5);
  ctx.closePath();
  ctx.fill();
  if (label) {
    const midX = (x1 + x2) / 2;
    drawRoundedRect(ctx, midX - 18, y1 - 25, 36, 20, 10, highlight ? pulseColor(frame) : "#eff7ff");
    drawLabel(ctx, label, midX, y1 - 10, 11, stroke, 900, "center");
  }
  ctx.restore();
}

function drawGapChip(ctx, x, y, label, highlight = false, frame = 0) {
  const fill = highlight ? pulseColor(frame) : "#eef7ff";
  const color = highlight ? "#f95877" : "#118ab2";
  drawRoundedRect(ctx, x - 21, y - 15, 42, 28, 14, fill, highlight ? "rgba(249, 88, 119, 0.24)" : "rgba(17, 138, 178, 0.16)");
  drawLabel(ctx, label, x, y + 5, 13, color, 900, "center");
}

function drawNote(ctx, text) {
  const x = 18;
  const y = ctx.__noteY || 226;
  const maxWidth = ctx.__noteWidth || 390;
  drawRoundedRect(ctx, 14, y - 24, maxWidth + 28, 38, 8, "#f8fafc", "rgba(23, 32, 52, 0.08)");
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  ctx.save();
  ctx.font = "800 12px Inter, Arial, sans-serif";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      drawLabel(ctx, line, x, lineY, 12, "#506070", 800);
      line = word;
      lineY += 16;
    } else {
      line = testLine;
    }
  });
  if (line) {
    drawLabel(ctx, line, x, lineY, 12, "#506070", 800);
  }
  ctx.restore();
}

function drawLabel(ctx, text, x, y, size, color, weight = 700, align = "left") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawCircle(ctx, x, y, radius, fill, stroke = "white") {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke = "") {
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
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function pulseColor(frame) {
  const opacity = 0.22 + Math.sin(frame / 18) * 0.08;
  return `rgba(249, 88, 119, ${opacity})`;
}

window.CT7PatternHints = {
  destroyPatternVisual,
  preparePatternHint
};
