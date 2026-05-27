(function () {
  "use strict";

  // pattern-hints-shapes.js
  // Extracted from pattern-hints.js. Contains the RGB-light and triangle/shape
  // pattern-hint visuals (~1500 lines). Loaded by app.js *after* pattern-hints.js,
  // which sets up the shared registries that this file populates at the bottom.

  const HINT_RENDERERS = window.__ct7HintRenderers || (window.__ct7HintRenderers = {});
  const SKETCH_MOUNTERS = window.__ct7HintMounters || (window.__ct7HintMounters = {});

  function rgbFilterHint(visual) {
    return `
      <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
      ${p5SketchHost("rgb-filter-host", "RGB card filtering interactive")}
    `;
  }

  function rgbNeighbourHint(visual) {
    return `
      <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
      ${p5SketchHost("rgb-neighbour-host", "RGB neighbour rule interactive")}
    `;
  }

  function rectanglePatternHint(visual) {
    return `
      <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
      ${p5SketchHost("rectangle-pattern-host", "Rectangle pattern interactive")}
    `;
  }

  function triangleAnglesHint(visual) {
    return `
      <p class="hint-focus"><span>Try it</span><strong>${visual.instruction}</strong></p>
      ${p5SketchHost("triangle-angles-host", "Triangle angle sum interactive")}
    `;
  }

  function threeTriangleBuildHint(visual) {
    return `
      ${p5SketchHost("three-triangle-build-host", "Three equilateral triangles build interactive")}
    `;
  }

  function isoscelesCasesHint(visual) {
    return `
      ${p5SketchHost("isosceles-cases-host", "Isosceles triangle cases interactive")}
    `;
  }

  function triangleCountTraceHint(visual) {
    return `
      ${p5SketchHost("triangle-count-trace-host", "Triangle counting trace interactive")}
    `;
  }

  function equilateralRingHint(visual) {
    return `
      ${p5SketchHost("equilateral-ring-host", "Six equilateral triangles around a point interactive")}
    `;
  }

  function gridNoThreeHint(visual) {
    return `
      ${p5SketchHost("grid-no-three-host", "3 by 3 no three in a line interactive")}
    `;
  }

  function createRgbFilterState(visual) {
    const startState = normalizeState(visual.startState || "any");
    const filters = RGB_LIGHTS.reduce((state, light) => {
      state[light] = startState;
      return state;
    }, {});
    const locked = {};

    (visual.filters || []).forEach((filter) => {
      const light = filter.light || filter.label;
      if (!RGB_LIGHTS.includes(light)) return;
      filters[light] = normalizeState(filter.state);
      locked[light] = filter.locked === true;
    });

    return { filters, locked };
  }

  function rgbMatches(pattern, filters) {
    return RGB_LIGHTS.every((light) => filters[light] === "any" || pattern[light] === filters[light]);
  }

  function rgbStateColor(light, state, theme) {
    if (state === "on") return RGB_COLORS[light];
    if (state === "off") return theme.soft;
    return theme.border;
  }

  function rgbStateFill(light, state) {
    if (state === "on") return colorWithAlpha(RGB_COLORS[light], 0.12);
    if (state === "off") return "rgba(100, 112, 134, 0.08)";
    return "#ffffff";
  }

  function mountRgbFilterSketch(host, visual) {
    const theme = ctTheme();
    const { filters, locked } = createRgbFilterState(visual);

    makeP5Sketch(host, (p) => {
      let buttons = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };

      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

      p.draw = () => {
        buttons = [];
        p.clear();
        drawControls();
        drawCardGrid();
        drawFooter();
      };

      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);

      function sketchWidth() {
        return Math.max(320, Math.floor(host.clientWidth || 760));
      }

      function sketchHeight() {
        return p.width < 560 ? 404 : 330;
      }

      function handleClick() {
        const hit = buttons.find((button) => pointIn(button, p.mouseX, p.mouseY));
        if (!hit || locked[hit.light]) return false;
        filters[hit.light] = nextState(filters[hit.light]);
        return true;
      }

      function drawControls() {
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Choose clues", 22, 18);

        const startX = 22;
        const y = 52;
        const w = p.width < 480 ? (p.width - 58) / 3 : 132;
        const gap = p.width < 480 ? 7 : 12;
        RGB_LIGHTS.forEach((light, index) => {
          const x = startX + index * (w + gap);
          buttons.push({ x, y, w, h: 58, light });
          const state = filters[light];
          p.stroke(rgbStateColor(light, state, theme));
          p.strokeWeight(state === "any" ? 1.3 : 2.3);
          p.fill(rgbStateFill(light, state));
          p.rect(x, y, w, 58, 10);

          p.noStroke();
          p.fill(RGB_COLORS[light]);
          p.textStyle(p.BOLD);
          p.textSize(13);
          p.textAlign(p.LEFT, p.TOP);
          p.text(RGB_NAMES[light], x + 12, y + 10);
          p.fill(theme.text);
          p.textSize(18);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(stateText(state), x + 12, y + 48);
          if (locked[light]) {
            p.fill(theme.soft);
            p.textSize(10);
            p.textAlign(p.RIGHT, p.TOP);
            p.text("LOCKED", x + w - 10, y + 11);
          } else {
            p.fill(theme.blue);
            p.textSize(10);
            p.textAlign(p.RIGHT, p.TOP);
            p.text("TAP", x + w - 10, y + 11);
          }
        });
      }

      function drawCardGrid() {
        const patterns = allRgbPatterns();
        const columns = p.width < 560 ? 4 : 8;
        const gap = 8;
        const margin = 22;
        const y0 = 138;
        const cardW = (p.width - margin * 2 - gap * (columns - 1)) / columns;
        const cardH = p.width < 560 ? 66 : 82;
        patterns.forEach((pattern, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);
          drawRgbCard(margin + col * (cardW + gap), y0 + row * (cardH + gap), cardW, cardH, pattern, rgbMatches(pattern, filters));
        });
      }

      function drawRgbCard(x, y, w, h, pattern, isMatch) {
        p.stroke(isMatch ? theme.teal : theme.border);
        p.strokeWeight(isMatch ? 2.4 : 1.1);
        p.fill(isMatch ? "rgba(6, 214, 160, 0.08)" : "rgba(244, 246, 250, 0.72)");
        p.rect(x, y, w, h, 9);

        const dotSize = Math.min(20, (w - 18) / 3);
        const gap = (w - dotSize * 3) / 4;
        RGB_LIGHTS.forEach((light, index) => {
          const on = pattern[light] === "on";
          const cx = x + gap + dotSize / 2 + index * (dotSize + gap);
          const cy = y + h / 2 - 6;
          p.stroke(on ? RGB_COLORS[light] : "#cbd4df");
          p.strokeWeight(on ? 2 : 1.2);
          p.fill(on ? RGB_COLORS[light] : "#ffffff");
          p.circle(cx, cy, dotSize);
          p.noStroke();
          p.fill(on ? "#ffffff" : theme.soft);
          p.textSize(10);
          p.textStyle(p.BOLD);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(on ? "U" : "O", cx, cy + 0.5);
          p.fill(theme.soft);
          p.textSize(9);
          p.text(light, cx, y + h - 12);
        });
      }

      function drawFooter() {
        const matchCount = allRgbPatterns().filter((pattern) => rgbMatches(pattern, filters)).length;
        p.noStroke();
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.LEFT, p.CENTER);
        p.text("Tap colour boxes to change clues. Bright cards match every current choice.", 22, p.height - 24);
        p.fill(theme.teal);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(`${matchCount} bright`, p.width - 22, p.height - 24);
      }
    });
  }

  function mountRgbNeighbourSketch(host, visual) {
    const theme = ctTheme();
    const startState = normalizeState(visual.startState || "off");
    const states = RGB_LIGHTS.reduce((current, light) => {
      current[light] = startState === "on" ? "on" : "off";
      return current;
    }, {});
    const currentStates = () => RGB_LIGHTS.map((light) => states[light]);

    makeP5Sketch(host, (p) => {
      let bulbHits = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };

      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

      p.draw = () => {
        p.clear();
        drawTitle();
        drawBulbs();
        drawRuleChecks();
      };

      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);

      function sketchWidth() {
        return Math.max(320, Math.floor(host.clientWidth || 760));
      }

      function sketchHeight() {
        return p.width < 560 ? 392 : 336;
      }

      function handleClick() {
        const hit = bulbHits.find((target) => distanceTo(p.mouseX, p.mouseY, target.x, target.y) <= target.r);
        if (hit) {
          states[hit.light] = states[hit.light] === "on" ? "off" : "on";
          return true;
        }
        return false;
      }

      function drawTitle() {
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.textAlign(p.LEFT, p.TOP);
        p.text("RGB order check", 22, 18);
        p.fill(theme.soft);
        p.textSize(12);
        p.text("Read left to right: Red, Green, Blue. Tap the lights to build and test a pattern.", 22, 43, p.width - 44, 34);
        drawOrderStrip();
      }

      function drawOrderStrip() {
        const compact = p.width < 560;
        const chipW = compact ? Math.min(92, (p.width - 68) / 3) : 112;
        const chipH = 30;
        const gap = compact ? 6 : 10;
        const totalW = chipW * 3 + gap * 2;
        const startX = (p.width - totalW) / 2;
        const y = compact ? 82 : 78;

        RGB_LIGHTS.forEach((light, index) => {
          const x = startX + index * (chipW + gap);
          p.stroke(colorWithAlpha(RGB_COLORS[light], 0.32));
          p.strokeWeight(1.4);
          p.fill(colorWithAlpha(RGB_COLORS[light], 0.09));
          p.rect(x, y, chipW, chipH, 999);
          p.noStroke();
          p.fill(RGB_COLORS[light]);
          p.textStyle(p.BOLD);
          p.textSize(12);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${index + 1}. ${light} = ${RGB_NAMES[light]}`, x + chipW / 2, y + chipH / 2);
        });
      }

      function drawBulbs() {
        const cx = p.width / 2;
        const gap = p.width < 520 ? 94 : 136;
        const y = p.width < 560 ? 178 : 162;
        const r = p.width < 520 ? 32 : 40;
        const xs = [cx - gap, cx, cx + gap];
        const current = currentStates();
        const colors = RGB_LIGHTS.map((light) => RGB_COLORS[light]);
        bulbHits = [];

        p.stroke(theme.border);
        p.strokeWeight(5);
        p.line(xs[0] + r, y, xs[1] - r, y);
        p.line(xs[1] + r, y, xs[2] - r, y);

        xs.forEach((x, index) => {
          const on = current[index] === "on";
          const light = RGB_LIGHTS[index];
          bulbHits.push({ x, y, r: r + 16, light });
          p.stroke(on ? colors[index] : "#cbd4df");
          p.strokeWeight(on ? 4 : 2);
          p.fill(on ? colorWithAlpha(colors[index], 0.22) : "#ffffff");
          p.circle(x, y, r * 2);

          p.noStroke();
          p.fill(on ? colors[index] : theme.soft);
          p.textStyle(p.BOLD);
          p.textSize(23);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(on ? "U" : "O", x, y - 3);
          p.fill(theme.text);
          p.textSize(12);
          p.text(`${RGB_LIGHTS[index]} - ${RGB_NAMES[RGB_LIGHTS[index]]}`, x, y + r + 19);
          p.fill(theme.blue);
          p.textSize(10);
          p.text("tap", x, y + r + 37);
        });

        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(`RGB pattern: ${current.map((state) => (state === "on" ? "U" : "O")).join(" ")}`, cx, y + r + 66);
      }

      function drawRuleChecks() {
        const current = currentStates();
        const hasOnLight = current.some((state) => state === "on");
        const checks = [
          { label: "Red ON", ok: current[0] === "on" },
          { label: "Blue OFF", ok: current[2] === "off" },
          { label: "ON touches OFF", ok: hasOnLight && allOnLightsHaveOffNeighbour(current) }
        ];
        const chipW = p.width < 560 ? p.width - 44 : Math.min(190, (p.width - 64) / 3);
        const gap = 10;
        const cols = p.width < 560 ? 1 : 3;
        const totalW = cols * chipW + (cols - 1) * gap;
        const startX = (p.width - totalW) / 2;
        const y = p.height - (p.width < 560 ? 112 : 58);

        checks.forEach((check, index) => {
          const x = startX + (index % cols) * (chipW + gap);
          const yy = y + Math.floor(index / cols) * 42;
          p.stroke(check.ok ? theme.teal : theme.border);
          p.strokeWeight(check.ok ? 2 : 1.2);
          p.fill(check.ok ? "rgba(6, 214, 160, 0.12)" : "#ffffff");
          p.rect(x, yy, chipW, 34, 999);
          p.noStroke();
          p.fill(check.ok ? theme.teal : theme.soft);
          p.textStyle(p.BOLD);
          p.textSize(12);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${check.ok ? "yes" : "try"}: ${check.label}`, x + chipW / 2, yy + 17);
        });
      }
    });
  }

  function mountRectanglePatternSketch(host, visual) {
    const theme = ctTheme();
    const dimensions = visual.dimensions || [[3, 5], [5, 8], [8, 13], [13, 21]];
    const sideSequence = dimensions.reduce((list, pair, index) => {
      if (index === 0) return pair.slice();
      list.push(pair[1]);
      return list;
    }, []);

    makeP5Sketch(host, (p) => {
      let selected = dimensions.length - 1;
      let chips = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };

      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());

      p.draw = () => {
        chips = [];
        p.clear();
        drawSequence();
        drawRectangles();
        drawSelectedHint();
      };

      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);

      function sketchWidth() {
        return Math.max(320, Math.floor(host.clientWidth || 760));
      }

      function sketchHeight() {
        return p.width < 560 ? 390 : 340;
      }

      function handleClick() {
        const hit = chips.find((chip) => pointIn(chip, p.mouseX, p.mouseY));
        if (!hit) return false;
        selected = hit.index;
        return true;
      }

      function drawSequence() {
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Side numbers", 22, 18);

        const values = sideSequence.concat(["?"]);
        const chipW = p.width < 480 ? 40 : 48;
        const gap = p.width < 480 ? 6 : 9;
        const totalW = values.length * chipW + (values.length - 1) * gap;
        const startX = Math.max(22, (p.width - totalW) / 2);
        values.forEach((value, index) => {
          const x = startX + index * (chipW + gap);
          p.stroke(index === values.length - 1 ? theme.blue : theme.border);
          p.strokeWeight(index === values.length - 1 ? 2 : 1.2);
          p.fill(index === values.length - 1 ? "rgba(76, 124, 255, 0.08)" : "#ffffff");
          p.rect(x, 52, chipW, 36, 9);
          p.noStroke();
          p.fill(index === values.length - 1 ? theme.blue : theme.text);
          p.textStyle(p.BOLD);
          p.textSize(16);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(String(value), x + chipW / 2, 70);
        });
      }

      function drawRectangles() {
        const mobile = p.width < 560;
        const gap = mobile ? 10 : 14;
        const count = dimensions.length + 1;
        const margin = 22;
        const cardW = (p.width - margin * 2 - gap * (count - 1)) / count;
        const cardH = mobile ? 122 : 138;
        const y = mobile ? 116 : 122;

        dimensions.forEach((pair, index) => {
          drawRectangleCard(margin + index * (cardW + gap), y, cardW, cardH, pair, index, false);
        });
        drawRectangleCard(margin + dimensions.length * (cardW + gap), y, cardW, cardH, [sideSequence[sideSequence.length - 1], "?"], dimensions.length, true);
      }

      function drawRectangleCard(x, y, w, h, pair, index, isNext) {
        const active = index === selected && !isNext;
        if (!isNext) chips.push({ x, y, w, h, index });

        p.stroke(isNext ? theme.blue : active ? theme.teal : theme.border);
        p.strokeWeight(active || isNext ? 2.4 : 1.2);
        p.fill(isNext ? "rgba(76, 124, 255, 0.07)" : active ? "rgba(6, 214, 160, 0.08)" : "#ffffff");
        if (isNext) {
          p.drawingContext.setLineDash([6, 5]);
        }
        p.rect(x, y, w, h, 9);
        p.drawingContext.setLineDash([]);

        const maxSide = Math.max(...sideSequence, 21);
        const rectW = Math.max(26, (Number(pair[1]) || 21) / maxSide * (w - 22));
        const rectH = Math.max(20, (Number(pair[0]) || 13) / maxSide * (h - 52));
        const rx = x + (w - rectW) / 2;
        const ry = y + 24 + (h - 58 - rectH) / 2;
        p.noStroke();
        p.fill(isNext ? "rgba(76, 124, 255, 0.18)" : "rgba(249, 88, 119, 0.18)");
        p.rect(rx, ry, rectW, rectH, 5);

        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`${pair[0]} x ${pair[1]}`, x + w / 2, y + 9);

        p.fill(isNext ? theme.blue : active ? theme.teal : theme.soft);
        p.textSize(11);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(isNext ? "next" : `step ${index + 1}`, x + w / 2, y + h - 10);
      }

      function drawSelectedHint() {
        const pair = dimensions[selected];
        const y = p.height - 58;
        p.stroke("rgba(6, 214, 160, 0.25)");
        p.strokeWeight(1.4);
        p.fill("rgba(6, 214, 160, 0.08)");
        p.rect(22, y, p.width - 44, 38, 10);
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(`Selected rectangle uses neighbouring side numbers: ${pair[0]} and ${pair[1]}.`, 38, y + 19);
      }
    });
  }

  function mountThreeTriangleBuildSketch(host) {
    const theme = ctTheme();
    const fills = ["#fff0f4", "#f3fffb", "#eef3ff"];
    const strokes = ["#f95877", "#06d6a0", "#4c7cff"];

    makeP5Sketch(host, (p) => {
      let startedAt = 0;
      let button = null;

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
        startedAt = p.millis();
      };
      p.windowResized = () => {
        p.resizeCanvas(sketchWidth(), sketchHeight());
        startedAt = p.millis();
      };
      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);
      p.draw = () => {
        p.clear();
        drawBuild();
        drawButton();
        p.cursor(button && pointIn(button, p.mouseX, p.mouseY) ? p.HAND : p.ARROW);
      };

      function sketchWidth() { return Math.max(320, Math.floor(host.clientWidth || 760)); }
      function sketchHeight() { return p.width < 560 ? 306 : 286; }
      function handleClick() {
        if (!button || !pointIn(button, p.mouseX, p.mouseY)) return false;
        startedAt = p.millis();
        return true;
      }

      function buildGeometry() {
        const s = Math.min(116, Math.max(64, (p.width - 126) / 3));
        const h = s * Math.sqrt(3) / 2;
        const x = p.width / 2 - s;
        const y = p.height - 92;
        const target = [
          [[x, y], [x + s, y], [x + s / 2, y - h]],
          [[x + s, y], [x + 2 * s, y], [x + 1.5 * s, y - h]],
          [[x + s / 2, y - h], [x + 1.5 * s, y - h], [x + s, y]]
        ];
        const spread = p.width < 560 ? 0.92 : 1.15;
        const start = [
          moveTriangle(target[0], -s * spread, 24),
          moveTriangle(target[1], s * spread, 24),
          moveTriangle(target[2], 0, -h * 0.62)
        ];
        return { target, start, hull: convexHull(target.flat()), y };
      }

      function drawBuild() {
        const { target, start, hull, y } = buildGeometry();
        const progress = p.constrain((p.millis() - startedAt) / 2600, 0, 1);
        const eased = easeInOut(progress);
        const labelAlpha = p.constrain((progress - 0.68) / 0.32, 0, 1);
        const triangles = target.map((triangle, triangleIndex) =>
          triangle.map((point, pointIndex) => lerpPoint(start[triangleIndex][pointIndex], point, eased))
        );

        drawTargetOutline(hull, 0.22 + labelAlpha * 0.28);

        triangles.forEach((triangle, index) => {
          p.stroke(strokes[index]);
          p.strokeWeight(2.6);
          p.fill(fills[index]);
          p.triangle(...triangle.flat());
        });

        p.push();
        p.drawingContext.globalAlpha = labelAlpha;
        p.stroke(theme.text);
        p.strokeWeight(3.4);
        p.noFill();
        p.beginShape();
        hull.forEach((pt) => p.vertex(pt[0], pt[1]));
        p.endShape(p.CLOSE);
        p.pop();

        p.push();
        p.drawingContext.globalAlpha = labelAlpha;
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(18);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("Trapezium", p.width / 2, y + 38);
        p.pop();
      }

      function drawButton() {
        button = { x: p.width - 106, y: p.height - 46, w: 82, h: 32 };
        hintButton(p, theme, { ...button, label: "Replay", accent: theme.blue, hovered: pointIn(button, p.mouseX, p.mouseY) });
      }

      function drawTargetOutline(hull, alpha) {
        p.push();
        p.drawingContext.setLineDash([8, 7]);
        p.stroke(colorWithAlpha(theme.soft, alpha));
        p.strokeWeight(2);
        p.fill(colorWithAlpha(theme.yellow, 0.08));
        p.beginShape();
        hull.forEach((pt) => p.vertex(pt[0], pt[1]));
        p.endShape(p.CLOSE);
        p.drawingContext.setLineDash([]);
        p.pop();
      }

      function moveTriangle(triangle, dx, dy) {
        return triangle.map(([x, y]) => [x + dx, y + dy]);
      }

      function lerpPoint(from, to, amount) {
        return [
          p.lerp(from[0], to[0], amount),
          p.lerp(from[1], to[1], amount)
        ];
      }

      function easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
    });
  }

  // Andrew's monotone-chain convex hull for an array of [x, y] points.
  function convexHull(points) {
    const pts = points.map((p) => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (pts.length <= 2) return pts;
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const pt of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) lower.pop();
      lower.push(pt);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i -= 1) {
      const pt = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) upper.pop();
      upper.push(pt);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function mountIsoscelesCasesSketch(host) {
    const theme = ctTheme();
    const equalSides = [4, 8, 12];
    const thirdFor = (equal) => 25 - 2 * equal;
    const isValid = (equal) => {
      const third = thirdFor(equal);
      return third > 0 && third < 2 * equal;
    };
    makeP5Sketch(host, (p) => {
      let index = 1;
      let chips = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };
      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());
      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);
      p.draw = () => {
        chips = [];
        p.clear();
        drawCase();
        drawChips();
        p.cursor(chips.some((c) => pointIn(c, p.mouseX, p.mouseY)) ? p.HAND : p.ARROW);
      };

      function sketchWidth() { return Math.max(320, Math.floor(host.clientWidth || 760)); }
      function sketchHeight() { return p.width < 560 ? 294 : 268; }
      function handleClick() {
        const hit = chips.find((c) => pointIn(c, p.mouseX, p.mouseY));
        if (!hit) return false;
        index = hit.index;
        return true;
      }
      function drawCase() {
        const equal = equalSides[index];
        const third = thirdFor(equal);
        const canClose = isValid(equal);
        const accent = canClose ? theme.teal : theme.pink;
        const stageW = Math.min(520, p.width - 48);
        const stageX = (p.width - stageW) / 2;
        const cx = p.width / 2;
        const baseY = p.height - 92;
        const scale = Math.min(11, stageW / 44);
        const baseLength = canClose
          ? Math.max(20, (third > 0 ? third : 1) * scale)
          : Math.min(stageW * 0.38, 178);
        const halfBase = baseLength / 2;
        const sideLength = canClose ? equal * scale : Math.min(76, baseLength * 0.38);
        const height = canClose ? Math.sqrt(Math.max(sideLength * sideLength - halfBase * halfBase, 0)) : 0;
        const left = { x: cx - halfBase, y: baseY };
        const right = { x: cx + halfBase, y: baseY };
        const top = { x: cx, y: baseY - height };

        drawPill(stageX, 22, 86, 30, "P = 25", theme.blue, false);
        drawPill(stageX + stageW - 94, 22, 94, 30, canClose ? "Works" : "Too flat", accent, canClose);

        p.stroke(accent);
        p.strokeWeight(canClose ? 3.6 : 3);
        if (canClose) {
          p.push();
          p.drawingContext.shadowColor = colorWithAlpha(accent, 0.18);
          p.drawingContext.shadowBlur = 16;
          p.fill(colorWithAlpha(accent, 0.08));
          p.triangle(left.x, left.y, right.x, right.y, top.x, top.y);
          p.pop();

          p.push();
          p.stroke(accent);
          p.strokeWeight(3.6);
          p.strokeCap(p.ROUND);
          p.noFill();
          p.line(left.x, left.y, top.x, top.y);
          p.line(top.x, top.y, right.x, right.y);
          p.line(right.x, right.y, left.x, left.y);
          p.pop();

          drawSideLabel((left.x + top.x) / 2 - 18, (left.y + top.y) / 2, equal);
          drawSideLabel((right.x + top.x) / 2 + 18, (right.y + top.y) / 2, equal);
        } else {
          const armAngle = p.radians(50);
          const armRun = Math.cos(armAngle) * sideLength;
          const armHeight = Math.sin(armAngle) * sideLength;
          const leftArm = { x: left.x + armRun, y: baseY - armHeight };
          const rightArm = { x: right.x - armRun, y: baseY - armHeight };

          p.push();
          p.noFill();
          p.strokeCap(p.ROUND);
          p.strokeJoin(p.ROUND);

          p.stroke(colorWithAlpha(accent, 0.18));
          p.strokeWeight(12);
          p.line(left.x, left.y, right.x, right.y);

          p.stroke(accent);
          p.strokeWeight(3.4);
          p.line(left.x, left.y, leftArm.x, leftArm.y);
          p.line(right.x, right.y, rightArm.x, rightArm.y);

          p.stroke(colorWithAlpha(accent, 0.35));
          p.strokeWeight(3);
          p.line(left.x, left.y, right.x, right.y);

          p.stroke(colorWithAlpha(theme.soft, 0.5));
          p.strokeWeight(2);
          p.drawingContext.setLineDash([6, 8]);
          p.line(leftArm.x, leftArm.y, rightArm.x, rightArm.y);
          p.drawingContext.setLineDash([]);

          p.noStroke();
          p.fill(accent);
          p.circle(leftArm.x, leftArm.y, 8);
          p.circle(rightArm.x, rightArm.y, 8);
          p.pop();

          drawSideLabel((left.x + leftArm.x) / 2 - 18, (left.y + leftArm.y) / 2 - 6, equal);
          drawSideLabel((right.x + rightArm.x) / 2 + 18, (right.y + rightArm.y) / 2 - 6, equal);
        }
        drawSideLabel(cx, baseY + 22, third);
      }
      function drawSideLabel(x, y, label) {
        p.stroke(theme.border);
        p.strokeWeight(1);
        p.fill("#ffffff");
        p.rect(x - 20, y - 13, 40, 26, 999);
        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(String(label), x, y);
      }
      function drawChips() {
        const gap = 12;
        const w = Math.min(90, (p.width - 48 - gap * 2) / 3);
        const total = w * 3 + gap * 2;
        let x = (p.width - total) / 2;
        const y = p.height - 50;
        equalSides.forEach((equal, i) => {
          const chip = { x, y, w, h: 36, index: i };
          chips.push(chip);
          hintButton(p, theme, {
            ...chip,
            label: `${equal} cm`,
            accent: isValid(equal) ? theme.teal : theme.pink,
            active: i === index,
            hovered: pointIn(chip, p.mouseX, p.mouseY)
          });
          x += w + gap;
        });
      }
      function drawPill(x, y, w, h, label, accent, active) {
        p.stroke(colorWithAlpha(accent, active ? 0.42 : 0.24));
        p.strokeWeight(active ? 2 : 1.2);
        p.fill(colorWithAlpha(accent, active ? 0.14 : 0.08));
        p.rect(x, y, w, h, 999);
        p.noStroke();
        p.fill(accent);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x + w / 2, y + h / 2 + 0.5);
      }
    });
  }

  function mountTriangleCountTraceSketch(host) {
    const theme = ctTheme();
    const groups = ["small", "medium", "large"];
    const groupCounts = { small: 8, medium: 6, large: 2 };
    const groupColors = { small: theme.teal, medium: theme.blue, large: theme.orange };
    const highlights = {
      small: [
        ["B", "Q", "R"],
        ["E", "P", "Q"],
        ["B", "C", "R"],
        ["D", "E", "P"],
        ["B", "C", "Q"],
        ["D", "E", "Q"],
        ["A", "D", "P"],
        ["C", "F", "R"]
      ],
      medium: [
        ["A", "B", "E"],
        ["A", "D", "E"],
        ["B", "C", "F"],
        ["B", "E", "F"],
        ["A", "C", "P"],
        ["D", "F", "R"]
      ],
      large: [
        ["A", "C", "D"],
        ["C", "D", "F"]
      ]
    };

    makeP5Sketch(host, (p) => {
      let groupIndex = 0;
      let sampleIndex = 0;
      let buttons = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };
      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());
      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);
      p.draw = () => {
        buttons = [];
        p.clear();
        drawFigure();
        drawButtons();
        p.cursor(buttons.some((b) => pointIn(b, p.mouseX, p.mouseY)) ? p.HAND : p.ARROW);
      };

      function sketchWidth() { return Math.max(320, Math.floor(host.clientWidth || 760)); }
      function sketchHeight() { return p.width < 560 ? 320 : 296; }
      function handleClick() {
        const hit = buttons.find((item) => pointIn(item, p.mouseX, p.mouseY));
        if (!hit) return false;
        if (hit.action === "group") {
          groupIndex = hit.group;
          sampleIndex = 0;
        } else {
          sampleIndex = (sampleIndex + 1) % highlights[groups[groupIndex]].length;
        }
        return true;
      }
      function points() {
        const w = Math.min(p.width - 90, 440);
        const h = w * 0.32;
        const x = (p.width - w) / 2;
        const y = p.width < 560 ? 72 : 68;
        return {
          A: { x, y }, B: { x: x + w / 2, y }, C: { x: x + w, y },
          D: { x, y: y + h }, E: { x: x + w / 2, y: y + h }, F: { x: x + w, y: y + h },
          P: { x: x + w / 3, y: y + h * 2 / 3 }, Q: { x: x + w / 2, y: y + h / 2 }, R: { x: x + w * 2 / 3, y: y + h / 3 }
        };
      }
      function drawFigure() {
        const pts = points();
        const group = groups[groupIndex];
        const accent = groupColors[group];
        const tri = highlights[group][sampleIndex].map((name) => pts[name]);

        drawBadge(p.width / 2 - 52, 20, 104, 30, "16 total", theme.teal);

        p.noStroke();
        p.fill(colorWithAlpha(accent, 0.16));
        p.triangle(tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y);

        p.strokeCap(p.ROUND);
        p.stroke(theme.text);
        p.strokeWeight(3.2);
        p.noFill();
        p.rect(pts.A.x, pts.A.y, pts.C.x - pts.A.x, pts.D.y - pts.A.y);
        p.line(pts.B.x, pts.B.y, pts.E.x, pts.E.y);
        p.line(pts.A.x, pts.A.y, pts.E.x, pts.E.y);
        p.line(pts.B.x, pts.B.y, pts.F.x, pts.F.y);
        p.line(pts.D.x, pts.D.y, pts.C.x, pts.C.y);

        p.stroke(accent);
        p.strokeWeight(5.2);
        p.line(tri[0].x, tri[0].y, tri[1].x, tri[1].y);
        p.line(tri[1].x, tri[1].y, tri[2].x, tri[2].y);
        p.line(tri[2].x, tri[2].y, tri[0].x, tri[0].y);
      }
      function drawButtons() {
        const gap = 10;
        const compact = p.width < 520;
        const cw = compact ? Math.min(92, (p.width - 48 - gap * 2) / 3) : 104;
        const total = cw * 3 + gap * 2;
        const nextW = 76;
        let x = compact ? (p.width - total) / 2 : (p.width - (total + 14 + nextW)) / 2;
        const chipY = compact ? p.height - 78 : p.height - 52;
        groups.forEach((group, i) => {
          const chip = { x, y: chipY, w: cw, h: 36, action: "group", group: i };
          buttons.push(chip);
          hintButton(p, theme, {
            ...chip,
            label: `${group} ${groupCounts[group]}`,
            active: i === groupIndex,
            accent: groupColors[group],
            hovered: pointIn(chip, p.mouseX, p.mouseY)
          });
          x += cw + gap;
        });

        const next = compact
          ? { x: p.width / 2 - nextW / 2, y: p.height - 36, w: nextW, h: 28, action: "sample" }
          : { x: x + 4, y: chipY + 3, w: nextW, h: 30, action: "sample" };
        buttons.push(next);
        hintButton(p, theme, { ...next, label: "Next", accent: theme.blue, hovered: pointIn(next, p.mouseX, p.mouseY) });
      }
      function drawBadge(x, y, w, h, label, accent) {
        p.stroke(colorWithAlpha(accent, 0.28));
        p.strokeWeight(1.4);
        p.fill(colorWithAlpha(accent, 0.09));
        p.rect(x, y, w, h, 999);
        p.noStroke();
        p.fill(accent);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x + w / 2, y + h / 2 + 0.5);
      }
    });
  }

  function mountEquilateralRingSketch(host) {
    const theme = ctTheme();

    makeP5Sketch(host, (p) => {
      let count = 1;
      let buttons = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };
      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());
      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);
      p.draw = () => {
        buttons = [];
        p.clear();
        drawRing();
        drawReadout();
        drawControls();
        p.cursor(buttons.some((b) => pointIn(b, p.mouseX, p.mouseY)) ? p.HAND : p.ARROW);
      };

      function sketchWidth() { return Math.max(320, Math.floor(host.clientWidth || 760)); }
      function sketchHeight() { return p.width < 560 ? 314 : 292; }
      function handleClick() {
        const hit = buttons.find((item) => pointIn(item, p.mouseX, p.mouseY));
        if (!hit) return false;
        count = p.constrain(count + hit.dir, 1, 6);
        return true;
      }
      function drawRing() {
        const cx = p.width / 2;
        const cy = p.width < 560 ? 138 : 128;
        const r = Math.min(100, p.width / 2 - 70, p.height * 0.34);
        const full = count === 6;
        const accent = full ? theme.teal : theme.blue;
        p.noStroke();
        p.fill(colorWithAlpha(accent, 0.06));
        p.circle(cx, cy, r * 2.08);
        for (let i = 0; i < count; i += 1) {
          const a1 = -Math.PI / 2 + (i * Math.PI) / 3;
          const a2 = a1 + Math.PI / 3;
          p.stroke(accent);
          p.strokeWeight(2.6);
          p.fill(i % 2 ? colorWithAlpha(theme.teal, 0.16) : colorWithAlpha(theme.blue, 0.14));
          p.triangle(cx, cy, cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
        }
        p.stroke(colorWithAlpha(theme.text, 0.12));
        p.strokeWeight(2);
        p.noFill();
        p.circle(cx, cy, r * 2);
        if (full) {
          p.noFill();
          p.stroke(theme.teal);
          p.strokeWeight(4);
          p.beginShape();
          for (let i = 0; i <= 6; i += 1) {
            const a = -Math.PI / 2 + (i * Math.PI) / 3;
            p.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          p.endShape();
        }
        p.fill("#ffffff");
        p.stroke(theme.border);
        p.strokeWeight(2);
        p.circle(cx, cy, 32);
        p.noStroke();
        p.fill(accent);
        p.circle(cx, cy, 8);
        drawBadge(cx - 128, 22, 92, 30, `${count} x 60`, accent);
        drawBadge(cx + 36, 22, 92, 30, `${count * 60} deg`, full ? theme.teal : theme.orange);
      }
      function drawReadout() {
        const total = count * 60;
        const full = total === 360;
        drawBadge(p.width / 2 - 62, p.height - 76, 124, 32, full ? "Hexagon" : `${360 - total} deg open`, full ? theme.teal : theme.soft);
      }
      function drawControls() {
        const controlY = p.height - 38;
        const gap = 12;
        const btnW = 42;
        const labelW = 108;
        const totalW = btnW * 2 + labelW + gap * 2;
        const x0 = p.width / 2 - totalW / 2;
        const minusBtn = { x: x0, y: controlY, w: btnW, h: 32, dir: -1 };
        const plusBtn = { x: x0 + btnW + gap + labelW + gap, y: controlY, w: btnW, h: 32, dir: 1 };
        buttons.push(minusBtn, plusBtn);
        hintButton(p, theme, { ...minusBtn, label: "-", size: 22, accent: theme.blue, hovered: pointIn(minusBtn, p.mouseX, p.mouseY) });
        hintButton(p, theme, { ...plusBtn, label: "+", size: 22, accent: theme.blue, hovered: pointIn(plusBtn, p.mouseX, p.mouseY) });

        p.stroke(colorWithAlpha(theme.blue, 0.22));
        p.strokeWeight(1.4);
        p.fill(colorWithAlpha(theme.blue, 0.07));
        p.rect(x0 + btnW + gap, controlY, labelW, 32, 999);
        p.noStroke();
        p.fill(theme.blue);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(`${count}/6`, x0 + btnW + gap + labelW / 2, controlY + 16);
      }
      function drawBadge(x, y, w, h, label, accent) {
        p.stroke(colorWithAlpha(accent, 0.26));
        p.strokeWeight(1.3);
        p.fill(colorWithAlpha(accent, 0.08));
        p.rect(x, y, w, h, 999);
        p.noStroke();
        p.fill(accent);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x + w / 2, y + h / 2 + 0.5);
      }
    });
  }

  function mountGridNoThreeSketch(host) {
    const theme = ctTheme();

    makeP5Sketch(host, (p) => {
      const selected = Array(9).fill(false);
      let cells = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
      };
      p.windowResized = () => p.resizeCanvas(sketchWidth(), sketchHeight());
      p.mousePressed = () => handleClick();
      p.touchStarted = () => (handleClick() ? false : undefined);
      p.draw = () => {
        cells = [];
        p.clear();
        drawGrid();
        drawStatus();
      };

      function sketchWidth() { return Math.max(320, Math.floor(host.clientWidth || 760)); }
      function sketchHeight() { return p.width < 560 ? 300 : 276; }
      function handleClick() {
        const hit = cells.find((cell) => pointIn(cell, p.mouseX, p.mouseY));
        if (!hit) return false;
        selected[hit.index] = !selected[hit.index];
        return true;
      }
      function drawGrid() {
        const size = Math.min(222, p.height - 76, p.width - 120);
        const x0 = (p.width - size) / 2;
        const y0 = p.width < 560 ? 26 : 22;
        const cell = size / 3;
        const badLines = completeLines();

        p.stroke(colorWithAlpha(theme.text, 0.06));
        p.strokeWeight(1.4);
        p.fill("rgba(255, 255, 255, 0.72)");
        p.rect(x0 - 8, y0 - 8, size + 16, size + 16, 12);

        p.stroke(theme.border);
        p.strokeWeight(2);
        for (let i = 0; i <= 3; i += 1) {
          p.line(x0 + i * cell, y0, x0 + i * cell, y0 + size);
          p.line(x0, y0 + i * cell, x0 + size, y0 + i * cell);
        }
        for (let r = 0; r < 3; r += 1) {
          for (let c = 0; c < 3; c += 1) {
            const index = r * 3 + c;
            cells.push({ x: x0 + c * cell, y: y0 + r * cell, w: cell, h: cell, index });
            if (selected[index]) {
              p.fill(colorWithAlpha(theme.teal, 0.18));
              p.stroke(theme.teal);
              p.strokeWeight(3);
              p.circle(x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, cell * 0.5);
            }
          }
        }
        badLines.forEach((line) => {
          const first = cellCenter(line[0], x0, y0, cell);
          const last = cellCenter(line[2], x0, y0, cell);
          p.stroke(theme.pink);
          p.strokeWeight(6);
          p.strokeCap(p.ROUND);
          p.line(first.x, first.y, last.x, last.y);
        });
      }
      function drawStatus() {
        const bad = completeLines().length > 0;
        drawBadge(p.width / 2 - 38, p.height - 36, 76, 28, `${selected.filter(Boolean).length}/6`, bad ? theme.pink : theme.teal);
      }
      function completeLines() {
        return [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ].filter((line) => line.every((index) => selected[index]));
      }
      function cellCenter(index, x0, y0, cell) {
        return { x: x0 + (index % 3) * cell + cell / 2, y: y0 + Math.floor(index / 3) * cell + cell / 2 };
      }
      function drawBadge(x, y, w, h, label, accent) {
        p.stroke(colorWithAlpha(accent, 0.26));
        p.strokeWeight(1.3);
        p.fill(colorWithAlpha(accent, 0.08));
        p.rect(x, y, w, h, 999);
        p.noStroke();
        p.fill(accent);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x + w / 2, y + h / 2 + 0.5);
      }
      function drawDots(cx, y, count, bad) {
        const gap = 14;
        const total = 5 * gap;
        for (let i = 0; i < 6; i += 1) {
          p.noStroke();
          if (i < count) {
            p.fill(bad ? theme.pink : theme.teal);
          } else {
            p.fill(colorWithAlpha(theme.soft, 0.18));
          }
          p.circle(cx - total / 2 + i * gap, y, i < count ? 8 : 6);
        }
      }
    });
  }

  function mountTriangleAnglesSketch(host) {
    const theme = ctTheme();
    const red = "#f95877";
    const green = "#06d6a0";
    const blue = "#4c7cff";

    makeP5Sketch(host, (p) => {
      let points = [];
      let dragIndex = -1;
      let controls = [];

      p.setup = () => {
        p.createCanvas(sketchWidth(), sketchHeight());
        p.textFont("Roboto, Segoe UI, Arial, sans-serif");
        resetPoints();
      };

      p.windowResized = () => {
        p.resizeCanvas(sketchWidth(), sketchHeight());
        resetPoints();
      };

      p.draw = () => {
        controls = [];
        p.clear();
        drawPanel();
        drawProof();
        drawControls();
        const overControl = controls.some((c) => pointIn(c, p.mouseX, p.mouseY));
        const overPoint = points.some((pt) => distanceTo(p.mouseX, p.mouseY, pt.x, pt.y) <= 22);
        p.cursor(overControl ? p.HAND : overPoint ? p.MOVE : p.ARROW);
      };

      p.mousePressed = () => startDrag();
      p.mouseDragged = () => dragPoint();
      p.mouseReleased = () => { dragIndex = -1; };
      p.touchStarted = () => (startDrag() ? false : undefined);
      p.touchMoved = () => (dragIndex >= 0 && dragPoint() ? false : undefined);
      p.touchEnded = () => { dragIndex = -1; return true; };

      function sketchWidth() {
        return Math.max(320, Math.floor(host.clientWidth || 760));
      }

      function sketchHeight() {
        return p.width < 560 ? 390 : 352;
      }

      function resetPoints() {
        const compact = p.width < 560;
        points = [
          { x: p.width * 0.22, y: compact ? p.height - 112 : p.height - 96 },
          { x: p.width * 0.78, y: compact ? p.height - 116 : p.height - 100 },
          { x: p.width * 0.52, y: compact ? 136 : 112 }
        ];
      }

      function startDrag() {
        const control = controls.find((item) => pointIn(item, p.mouseX, p.mouseY));
        if (control) {
          resetPoints();
          return true;
        }

        dragIndex = points.findIndex((point) => distanceTo(p.mouseX, p.mouseY, point.x, point.y) <= 20);
        return dragIndex >= 0;
      }

      function dragPoint() {
        if (dragIndex < 0) return false;
        points[dragIndex].x = p.constrain(p.mouseX, 42, p.width - 42);
        points[dragIndex].y = p.constrain(p.mouseY, 92, p.height - 78);
        return true;
      }

      function drawPanel() {
        p.stroke(theme.border);
        p.strokeWeight(1);
        p.fill("#ffffff");
        p.rect(18, 18, p.width - 36, p.height - 36, 14);

        p.noStroke();
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.textAlign(p.LEFT, p.CENTER);
        p.text("Parallel-line proof", 34, 42);

        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.text("Drag a corner. The dashed line through C stays parallel to base AB.", 34, 66, p.width - 150, 28);
      }

      function drawControls() {
        const w = 72;
        const h = 32;
        const x = p.width - w - 34;
        const y = 31;
        const btn = { x, y, w, h };
        controls.push(btn);
        hintButton(p, theme, { ...btn, label: "Reset", accent: theme.soft, hovered: pointIn(btn, p.mouseX, p.mouseY) });
      }

      function drawProof() {
        const [a, b, c] = points;
        const theta = Math.atan2(b.y - a.y, b.x - a.x);
        const unit = { x: Math.cos(theta), y: Math.sin(theta) };
        const lineLength = Math.max(p.width, p.height);

        drawDashedLine(c.x - unit.x * lineLength, c.y - unit.y * lineLength, c.x + unit.x * lineLength, c.y + unit.y * lineLength);

        p.stroke(colorWithAlpha(theme.blue, 0.35));
        p.strokeWeight(2);
        p.fill(colorWithAlpha(theme.blue, 0.06));
        p.triangle(a.x, a.y, b.x, b.y, c.x, c.y);

        p.stroke(theme.text);
        p.strokeWeight(2.4);
        p.line(a.x, a.y, b.x, b.y);
        p.line(a.x, a.y, c.x, c.y);
        p.line(b.x, b.y, c.x, c.y);

        drawMatchingAngles(theta);
        drawPoint(a, "A", red);
        drawPoint(b, "B", blue);
        drawPoint(c, "C", green);

        drawLineLabel(c.x + unit.x * 94, c.y + unit.y * 94 - 14, "parallel to AB");

        const vals = roundedAngles();
        drawAngleValues(vals);
        drawAngleSum(vals);
      }

      function interiorAngles() {
        const angleAt = (v, p1, p2) => {
          const u1 = { x: p1.x - v.x, y: p1.y - v.y };
          const u2 = { x: p2.x - v.x, y: p2.y - v.y };
          const dot = u1.x * u2.x + u1.y * u2.y;
          const mag = Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y) || 1;
          return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
        };
        const [a, b, c] = points;
        return [angleAt(a, b, c), angleAt(b, a, c), angleAt(c, a, b)];
      }

      function roundedAngles() {
        const raw = interiorAngles();
        const res = raw.map(Math.floor);
        const remaining = 180 - (res[0] + res[1] + res[2]);
        const order = [0, 1, 2].sort((i, j) => (raw[j] - res[j]) - (raw[i] - res[i]));
        for (let k = 0; k < remaining; k += 1) res[order[k % 3]] += 1;
        return res;
      }

      function drawAngleValues(vals) {
        const [a, b, c] = points;
        const colors = [red, blue, green];
        const smallLabelRadius = p.width < 480 ? 54 : 60;
        const topLabelRadius = p.width < 480 ? 88 : 98;
        const labels = [
          { vertex: a, start: angleBetween(a, b), end: angleBetween(a, c), radius: smallLabelRadius },
          { vertex: b, start: angleBetween(b, c), end: angleBetween(b, a), radius: smallLabelRadius },
          { vertex: c, start: angleBetween(c, a), end: angleBetween(c, b), radius: topLabelRadius }
        ];
        labels.forEach(({ vertex, start, end, radius }, i) => {
          const arc = shortArc(start, end);
          const mid = arc.start + (arc.end - arc.start) / 2;
          p.noStroke();
          p.fill(colors[i]);
          p.textStyle(p.BOLD);
          p.textSize(13);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${vals[i]}°`, vertex.x + Math.cos(mid) * radius, vertex.y + Math.sin(mid) * radius);
        });
      }

      function drawAngleSum(vals) {
        const y = p.height - 38;
        const parts = [`${vals[0]}°`, "+", `${vals[1]}°`, "+", `${vals[2]}°`, "= 180°"];
        const colors = [red, theme.soft, blue, theme.soft, green, theme.text];
        p.textStyle(p.BOLD);
        p.textSize(15);
        const widths = parts.map((s) => p.textWidth(s));
        const gap = 7;
        const total = widths.reduce((sum, w) => sum + w, 0) + gap * (parts.length - 1);
        let x = p.width / 2 - total / 2;
        p.textAlign(p.LEFT, p.CENTER);
        parts.forEach((s, i) => {
          p.noStroke();
          p.fill(colors[i]);
          p.text(s, x, y);
          x += widths[i] + gap;
        });
      }

      function drawDashedLine(x1, y1, x2, y2) {
        p.push();
        p.drawingContext.setLineDash([9, 7]);
        p.stroke(colorWithAlpha(theme.orange, 0.75));
        p.strokeWeight(3);
        p.line(x1, y1, x2, y2);
        p.drawingContext.setLineDash([]);
        p.pop();
      }

      function drawMatchingAngles(theta) {
        const [a, b, c] = points;
        const aToB = angleBetween(a, b);
        const aToC = angleBetween(a, c);
        const bToA = angleBetween(b, a);
        const bToC = angleBetween(b, c);
        const cToA = angleBetween(c, a);
        const cToB = angleBetween(c, b);

        drawArcBetween(a, aToB, aToC, 38, red, 5);
        drawArcBetween(c, theta + Math.PI, cToA, 54, red, 5);

        drawArcBetween(c, cToA, cToB, 72, green, 6);

        drawArcBetween(b, bToC, bToA, 38, blue, 5);
        drawArcBetween(c, cToB, theta, 90, blue, 5);
      }

      function drawPoint(point, label, color) {
        p.stroke(color);
        p.strokeWeight(3);
        p.fill("#ffffff");
        p.circle(point.x, point.y, 22);
        p.noStroke();
        p.fill(color);
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, point.x, point.y + 0.5);
      }

      function drawLineLabel(x, y, label) {
        p.textStyle(p.BOLD);
        p.textSize(11);
        const w = p.textWidth(label) + 18;
        p.stroke(colorWithAlpha(theme.orange, 0.22));
        p.fill("#fff9ef");
        p.rect(x - w / 2, y - 13, w, 26, 999);
        p.noStroke();
        p.fill(theme.orange);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, x, y);
      }

      function drawArcBetween(vertex, angleA, angleB, radius, color, weight) {
        const arc = shortArc(angleA, angleB);
        p.noFill();
        p.stroke(color);
        p.strokeWeight(weight);
        p.arc(vertex.x, vertex.y, radius * 2, radius * 2, arc.start, arc.end);
      }

      function shortArc(angleA, angleB) {
        let start = normalizeRadians(angleA);
        let end = normalizeRadians(angleB);
        let diff = end - start;
        if (diff < 0) diff += Math.PI * 2;
        if (diff > Math.PI) {
          const temp = start;
          start = end;
          end = temp;
          diff = end - start;
          if (diff < 0) diff += Math.PI * 2;
        }
        return { start, end: start + diff };
      }

      function normalizeRadians(angle) {
        let value = angle % (Math.PI * 2);
        if (value < 0) value += Math.PI * 2;
        return value;
      }

      function angleBetween(from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x);
      }
    });
  }

  function normalizeState(state) {
    const value = String(state || "any").toLowerCase();
    if (value === "u" || value === "on" || value === "1") return "on";
    if (value === "o" || value === "off" || value === "0") return "off";
    return "any";
  }

  function nextState(state) {
    if (state === "off") return "on";
    if (state === "on") return "any";
    return "off";
  }

  function stateText(state) {
    if (state === "on") return "ON / U";
    if (state === "off") return "OFF / O";
    return "Any";
  }

  function allRgbPatterns() {
    return Array.from({ length: 8 }, (_, index) => {
      const bits = index.toString(2).padStart(3, "0");
      return RGB_LIGHTS.reduce((pattern, light, bitIndex) => {
        pattern[light] = bits[bitIndex] === "1" ? "on" : "off";
        return pattern;
      }, {});
    });
  }

  function allOnLightsHaveOffNeighbour(states) {
    return states.every((state, index) => {
      if (state !== "on") return true;
      const left = index > 0 ? states[index - 1] : null;
      const right = index < states.length - 1 ? states[index + 1] : null;
      return left === "off" || right === "off";
    });
  }


  Object.assign(HINT_RENDERERS, {
    rgbFilter: rgbFilterHint,
    rgbNeighbour: rgbNeighbourHint,
    rectanglePattern: rectanglePatternHint,
    triangleAngles: triangleAnglesHint,
    threeTriangleBuild: threeTriangleBuildHint,
    isoscelesCases: isoscelesCasesHint,
    triangleCountTrace: triangleCountTraceHint,
    equilateralRing: equilateralRingHint,
    gridNoThree: gridNoThreeHint
  });

  Object.assign(SKETCH_MOUNTERS, {
    rgbFilter:          { selector: ".rgb-filter-host",          mount: mountRgbFilterSketch },
    rgbNeighbour:       { selector: ".rgb-neighbour-host",       mount: mountRgbNeighbourSketch },
    rectanglePattern:   { selector: ".rectangle-pattern-host",   mount: mountRectanglePatternSketch },
    triangleAngles:     { selector: ".triangle-angles-host",     mount: mountTriangleAnglesSketch },
    threeTriangleBuild: { selector: ".three-triangle-build-host", mount: mountThreeTriangleBuildSketch },
    isoscelesCases:     { selector: ".isosceles-cases-host",     mount: mountIsoscelesCasesSketch },
    triangleCountTrace: { selector: ".triangle-count-trace-host", mount: mountTriangleCountTraceSketch },
    equilateralRing:    { selector: ".equilateral-ring-host",    mount: mountEquilateralRingSketch },
    gridNoThree:        { selector: ".grid-no-three-host",       mount: mountGridNoThreeSketch }
  });
})();
