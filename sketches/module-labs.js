(function () {
  const instances = new Set();
  const FONT = "Roboto, Segoe UI, Arial, sans-serif";

  const BUILDERS = {
    letterMachine: buildLetterMachine,
    angleInspector: buildAngleInspector,
    lightFilter: buildLightFilter,
    triangleLab: buildTriangleLab,
    fractionModel: buildFractionModel
  };

  function mountAll(root = document) {
    if (!root) {
      return;
    }
    root.querySelectorAll("[data-module-lab]").forEach((host) => {
      if (host.dataset.mounted === "true") {
        return;
      }
      const builder = BUILDERS[host.dataset.lab];
      if (!builder) {
        return;
      }
      host.dataset.mounted = "true";

      if (!window.p5) {
        host.innerHTML = `<div class="sketch-fallback">Interactive visual is still loading. Refresh the page if it doesn't appear.</div>`;
        instances.add({ destroy() { host.dataset.mounted = ""; host.innerHTML = ""; } });
        return;
      }

      const sketch = new window.p5(builder(host), host);
      let observer = null;
      if (window.ResizeObserver) {
        observer = new ResizeObserver(() => {
          if (typeof sketch.windowResized === "function") {
            sketch.windowResized();
          }
        });
        observer.observe(host);
      }

      instances.add({
        destroy() {
          if (observer) {
            observer.disconnect();
          }
          sketch.remove();
          host.dataset.mounted = "";
          host.innerHTML = "";
        }
      });
    });
  }

  function cleanup() {
    instances.forEach((instance) => instance.destroy());
    instances.clear();
  }

  // ----- shared helpers -----

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

  function widthOf(host) {
    return Math.max(300, Math.floor(host.clientWidth || 680));
  }

  function makeSliders(p, theme, defs) {
    let active = -1;
    const marginX = 30;
    const bounds = () => ({ left: marginX + 10, right: p.width - marginX });
    const handleX = (d) => {
      const { left, right } = bounds();
      return left + ((d.value - d.min) / (d.max - d.min)) * (right - left);
    };
    const setFromX = (d, mx) => {
      const { left, right } = bounds();
      const t = p.constrain((mx - left) / (right - left), 0, 1);
      const raw = d.min + t * (d.max - d.min);
      d.value = p.constrain(Math.round(raw / d.step) * d.step, d.min, d.max);
    };

    return {
      defs,
      value: (id) => defs.find((d) => d.id === id).value,
      setValue: (id, v) => { const d = defs.find((x) => x.id === id); d.value = p.constrain(v, d.min, d.max); },
      setMax: (id, max) => { const d = defs.find((x) => x.id === id); d.max = max; if (d.value > max) d.value = max; },
      active: () => active >= 0,
      draw() {
        defs.forEach((d) => {
          const { left, right } = bounds();
          p.noStroke();
          p.fill(theme.text);
          p.textStyle(p.BOLD);
          p.textSize(13);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(d.label, left, d.y - 20);
          p.fill(d.color);
          p.textAlign(p.RIGHT, p.CENTER);
          p.textSize(18);
          p.text(d.display ? d.display(d.value) : d.value, right, d.y - 20);

          p.stroke(theme.border);
          p.strokeWeight(4);
          p.line(left, d.y, right, d.y);
          const hx = handleX(d);
          p.stroke(d.color);
          p.line(left, d.y, hx, d.y);
          p.noStroke();
          p.fill(d.color);
          p.circle(hx, d.y, 21);
          p.fill("#ffffff");
          p.circle(hx, d.y, 8);
        });
      },
      pressed(mx, my) {
        for (let i = 0; i < defs.length; i += 1) {
          if (Math.abs(my - defs[i].y) <= 20) {
            active = i;
            setFromX(defs[i], mx);
            return true;
          }
        }
        return false;
      },
      dragged(mx) {
        if (active >= 0) {
          setFromX(defs[active], mx);
          return true;
        }
        return false;
      },
      released() { active = -1; }
    };
  }

  function wireTouch(p, isActive) {
    p.touchStarted = () => {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        p.mousePressed();
        return false;
      }
      return true;
    };
    p.touchMoved = () => {
      if (isActive()) {
        p.mouseDragged();
        return false;
      }
      return true;
    };
    p.touchEnded = () => {
      p.mouseReleased();
      return true;
    };
  }

  // ----- Module 4: Letter Machine -----

  function buildLetterMachine(host) {
    const theme = ctTheme();
    return (p) => {
      let sliders;
      const heightOf = () => (widthOf(host) < 480 ? 300 : 282);

      p.setup = () => {
        p.createCanvas(widthOf(host), heightOf());
        p.textFont(FONT);
        sliders = makeSliders(p, theme, [
          { id: "A", min: 0, max: 9, step: 1, value: 5, color: theme.blue, label: "A", y: 112 },
          { id: "B", min: 0, max: 9, step: 1, value: 3, color: theme.teal, label: "B", y: 160 }
        ]);
      };

      p.windowResized = () => p.resizeCanvas(widthOf(host), heightOf());

      p.draw = () => {
        p.clear();
        const a = sliders.value("A");
        const b = sliders.value("B");
        drawEquation(a, b);
        sliders.draw();
        drawTiles(a, b);
      };

      function drawEquation(a, b) {
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.text("C = A + 2 × B", p.width / 2, 24);

        const result = a + 2 * b;
        const parts = [String(a), "+", "2 ×", String(b), "=", String(result)];
        const colors = [theme.blue, theme.soft, theme.soft, theme.teal, theme.soft, theme.text];
        const size = p.width < 480 ? 26 : 30;
        p.textSize(size);
        const gap = 9;
        const widths = parts.map((part) => p.textWidth(part));
        const total = widths.reduce((s, w) => s + w, 0) + gap * (parts.length - 1);
        let x = p.width / 2 - total / 2;
        p.textAlign(p.LEFT, p.CENTER);
        parts.forEach((part, i) => {
          p.fill(colors[i]);
          p.text(part, x, 58);
          x += widths[i] + gap;
        });
      }

      function drawTiles(a, b) {
        const total = a + 2 * b;
        const top = 198;
        const labelY = p.width < 480 ? 252 : 246;
        if (total === 0) {
          p.noStroke();
          p.fill(theme.soft);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text("Slide A or B above zero to build the value.", p.width / 2, top + 16);
          return;
        }
        const inner = p.width - 60;
        const groupGap = 14;
        const tile = p.constrain((inner - groupGap) / total, 7, 22);
        const totalW = total * tile + (b > 0 && a > 0 ? groupGap : 0);
        let x = p.width / 2 - totalW / 2;
        const y = top;

        for (let i = 0; i < a; i += 1) {
          tileRect(x, y, tile, theme.blue);
          x += tile;
        }
        if (a > 0 && b > 0) {
          x += groupGap;
        }
        for (let i = 0; i < 2 * b; i += 1) {
          tileRect(x, y, tile, theme.teal);
          x += tile;
        }

        p.noStroke();
        p.textStyle(p.BOLD);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(theme.blue);
        p.text(`A = ${a}`, p.width * 0.32, labelY);
        p.fill(theme.teal);
        p.text(`2 × B = ${2 * b}`, p.width * 0.68, labelY);
      }

      function tileRect(x, y, size, color) {
        p.noStroke();
        p.fill(color);
        p.rect(x + 1, y, size - 2, Math.min(size, 26), 4);
      }

      p.mousePressed = () => { sliders.pressed(p.mouseX, p.mouseY); };
      p.mouseDragged = () => { sliders.dragged(p.mouseX); };
      p.mouseReleased = () => { sliders.released(); };
      wireTouch(p, () => sliders.active());
    };
  }

  // ----- Module 5: Angle Inspector -----

  function buildAngleInspector(host) {
    const theme = ctTheme();
    return (p) => {
      let phi = 55; // transversal angle from horizontal, degrees
      let gap = 86; // distance between the two parallel lines, px
      let mode = null; // "rotate" | "gapA" | "gapB"
      const gMax = 112;
      const heightOf = () => (widthOf(host) < 480 ? 348 : 322);
      const cx0 = () => p.width / 2;
      const midY = () => (widthOf(host) < 480 ? 142 : 134);
      const r = () => (p.width < 480 ? 30 : 38);
      const handleDist = () => (p.width < 480 ? 82 : 98);
      const lineLeft = () => 24;
      const lineRight = () => p.width - 24;
      const gripX = () => lineRight() - 4;

      p.setup = () => {
        p.createCanvas(widthOf(host), heightOf());
        p.textFont(FONT);
      };
      p.windowResized = () => p.resizeCanvas(widthOf(host), heightOf());

      const dir = () => { const a = p.radians(phi); return { x: Math.cos(a), y: Math.sin(a) }; };
      const lineYs = () => { const m = midY(); return { yA: m - gap / 2, yB: m + gap / 2 }; };

      function intersections() {
        const a = p.radians(phi);
        const s = Math.sin(a);
        const c = Math.cos(a);
        const m = midY();
        const { yA, yB } = lineYs();
        return [
          { x: cx0() + ((yA - m) / s) * c, y: yA },
          { x: cx0() + ((yB - m) / s) * c, y: yB }
        ];
      }

      function handlePos() {
        const d = dir();
        return { x: cx0() - handleDist() * d.x, y: midY() - handleDist() * d.y };
      }

      p.draw = () => {
        p.clear();
        const parallel = gap > 12;
        const a = p.radians(phi);
        const pts = intersections();

        pts.forEach((pt) => drawSectors(pt, a));
        drawLines();
        if (parallel) {
          const { yA, yB } = lineYs();
          drawParallelMark(cx0() - 64, yA);
          drawParallelMark(cx0() - 64, yB);
        }
        pts.forEach((pt) => drawLabels(pt, a));
        drawHandle();
        drawGrip();
        drawBadge(parallel);
        drawReadout(parallel);
      };

      function drawSectors(pt, a) {
        const d = r() * 2;
        const wedge = (color, s1, s2) => {
          p.noStroke();
          p.fill(color + "26");
          p.arc(pt.x, pt.y, d, d, s1, s2, p.PIE);
        };
        wedge(theme.teal, 0, a);
        wedge(theme.teal, Math.PI, Math.PI + a);
        wedge(theme.pink, a, Math.PI);
        wedge(theme.pink, Math.PI + a, Math.PI * 2);
      }

      function drawLines() {
        const { yA, yB } = lineYs();
        const d = dir();
        const L = 800;
        p.push();
        p.stroke(theme.text);
        p.strokeWeight(3);
        p.strokeCap(p.ROUND);
        p.line(lineLeft(), yA, lineRight(), yA);
        p.line(lineLeft(), yB, lineRight(), yB);
        p.line(cx0() - L * d.x, midY() - L * d.y, cx0() + L * d.x, midY() + L * d.y);
        p.pop();
      }

      function drawParallelMark(x, y) {
        p.push();
        p.stroke(theme.blue);
        p.strokeWeight(2.4);
        p.strokeCap(p.ROUND);
        p.noFill();
        p.line(x - 5, y - 6, x + 4, y);
        p.line(x - 5, y + 6, x + 4, y);
        p.pop();
      }

      function drawLabels(pt, a) {
        const aDeg = Math.round(phi);
        const bDeg = 180 - aDeg;
        const rr = r() * 0.62;
        const put = (ang, value, color) => {
          p.noStroke();
          p.fill(color);
          p.textStyle(p.BOLD);
          p.textSize(p.width < 480 ? 11 : 12);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${value}°`, pt.x + rr * Math.cos(ang), pt.y + rr * Math.sin(ang));
        };
        put(a / 2, aDeg, theme.teal);
        put((a + Math.PI) / 2, bDeg, theme.pink);
      }

      function drawHandle() {
        const h = handlePos();
        p.noStroke();
        p.fill(theme.text);
        p.circle(h.x, h.y, 18);
        p.fill("#ffffff");
        p.circle(h.x, h.y, 7);
      }

      function drawGrip() {
        const { yB } = lineYs();
        const x = gripX();
        p.push();
        p.noStroke();
        p.fill(theme.blue);
        p.circle(x, yB, 19);
        p.stroke("#ffffff");
        p.strokeWeight(2);
        p.strokeCap(p.ROUND);
        p.line(x, yB - 5, x, yB + 5);
        p.line(x - 3, yB - 2, x, yB - 5);
        p.line(x + 3, yB - 2, x, yB - 5);
        p.line(x - 3, yB + 2, x, yB + 5);
        p.line(x + 3, yB + 2, x, yB + 5);
        p.pop();
      }

      function drawBadge(parallel) {
        const label = parallel ? "Parallel lines + transversal" : "Intersecting lines";
        const accent = parallel ? theme.blue : theme.text;
        p.textStyle(p.BOLD);
        p.textSize(12);
        const w = p.textWidth(label) + 24;
        const x = cx0() - w / 2;
        const y = 8;
        const h = 22;
        p.noStroke();
        p.fill(accent + "16");
        p.rect(x, y, w, h, 11);
        p.fill(accent);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(label, cx0(), y + h / 2 + 1);
      }

      function drawReadout(parallel) {
        const a = Math.round(phi);
        const b = 180 - a;
        const y = p.height - 42;
        p.noStroke();
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(theme.teal);
        p.text(`a = ${a}°`, cx0() - 52, y);
        p.fill(theme.pink);
        p.text(`b = ${b}°`, cx0() + 52, y);
        p.fill(theme.soft);
        p.textStyle(p.NORMAL);
        p.textSize(12);
        p.text(
          parallel ? "Corresponding angles equal · co-interior add to 180°" : "Vertically opposite equal · a + b = 180°",
          cx0(),
          y + 22
        );
      }

      function setRotate() {
        let deg = p.degrees(Math.atan2(p.mouseY - midY(), p.mouseX - cx0()));
        deg = ((deg % 180) + 180) % 180;
        phi = p.constrain(deg, 30, 150);
      }
      const setGapFromB = () => { gap = p.constrain(2 * (p.mouseY - midY()), 0, gMax); };
      const setGapFromA = () => { gap = p.constrain(2 * (midY() - p.mouseY), 0, gMax); };

      p.mousePressed = () => {
        const h = handlePos();
        if ((p.mouseX - h.x) ** 2 + (p.mouseY - h.y) ** 2 <= 24 * 24) {
          mode = "rotate";
          return;
        }
        const { yA, yB } = lineYs();
        if ((p.mouseX - gripX()) ** 2 + (p.mouseY - yB) ** 2 <= 22 * 22) {
          mode = "gapB";
          setGapFromB();
          return;
        }
        const inX = p.mouseX >= lineLeft() - 6 && p.mouseX <= lineRight() + 6;
        if (inX && Math.abs(p.mouseY - yB) <= 12) {
          mode = "gapB";
          setGapFromB();
        } else if (inX && Math.abs(p.mouseY - yA) <= 12) {
          mode = "gapA";
          setGapFromA();
        }
      };
      p.mouseDragged = () => {
        if (mode === "rotate") setRotate();
        else if (mode === "gapB") setGapFromB();
        else if (mode === "gapA") setGapFromA();
      };
      p.mouseReleased = () => { mode = null; };
      wireTouch(p, () => mode !== null);
    };
  }

  // ----- Module 6: Light Card Filter -----

  function buildLightFilter(host) {
    const theme = ctTheme();
    return (p) => {
      const names = ["R", "G", "B"];
      const colors = [theme.pink, theme.teal, theme.blue];
      const states = ["Any", "ON", "OFF"];
      const filters = [0, 0, 0];
      const cards = [];
      for (let i = 0; i < 8; i += 1) {
        cards.push([(i >> 2) & 1, (i >> 1) & 1, i & 1]);
      }
      let filterRects = [];
      const heightOf = () => (widthOf(host) < 520 ? 372 : 322);

      p.setup = () => {
        p.createCanvas(widthOf(host), heightOf());
        p.textFont(FONT);
      };
      p.windowResized = () => p.resizeCanvas(widthOf(host), heightOf());

      const matches = (card) => filters.every((f, i) => f === 0 || (f === 1 ? card[i] === 1 : card[i] === 0));

      p.draw = () => {
        p.clear();
        drawTitle();
        drawFilters();
        const remaining = drawCards();
        drawCount(remaining);
      };

      function drawTitle() {
        p.noStroke();
        p.fill(theme.soft);
        p.textStyle(p.BOLD);
        p.textSize(13);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("3 lights → 2 × 2 × 2 = 8 cards", p.width / 2, 20);
      }

      function drawFilters() {
        filterRects = [];
        const gap = 10;
        const bw = Math.min(150, (p.width - 60 - gap * 2) / 3);
        const total = bw * 3 + gap * 2;
        let x = (p.width - total) / 2;
        const y = 38;
        const bh = 50;
        for (let i = 0; i < 3; i += 1) {
          p.push();
          p.stroke(theme.border);
          p.strokeWeight(1.4);
          p.fill(filters[i] === 0 ? theme.card : colors[i] + "1A");
          p.rect(x, y, bw, bh, 10);
          p.noStroke();
          p.fill(colors[i]);
          p.textStyle(p.BOLD);
          p.textSize(12);
          p.textAlign(p.CENTER, p.TOP);
          p.text(names[i], x + bw / 2, y + 7);
          p.fill(filters[i] === 0 ? theme.soft : colors[i]);
          p.textSize(17);
          p.textAlign(p.CENTER, p.BOTTOM);
          p.text(states[filters[i]], x + bw / 2, y + bh - 7);
          p.pop();
          filterRects.push({ i, x, y, w: bw, h: bh });
          x += bw + gap;
        }
      }

      function drawCards() {
        const cols = p.width < 520 ? 2 : 4;
        const rows = Math.ceil(8 / cols);
        const top = 104;
        const bottom = p.height - 40;
        const areaW = p.width - 36;
        const cellW = areaW / cols;
        const cellH = (bottom - top) / rows;
        let remaining = 0;

        cards.forEach((card, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = 18 + col * cellW + 6;
          const y = top + row * cellH + 6;
          const w = cellW - 12;
          const h = cellH - 12;
          const ok = matches(card);
          if (ok) remaining += 1;

          p.push();
          if (!ok) p.drawingContext.globalAlpha = 0.28;
          p.stroke(ok ? theme.teal : theme.border);
          p.strokeWeight(ok ? 2 : 1.2);
          p.fill(theme.card);
          p.rect(x, y, w, h, 10);

          const bulbR = Math.min(w / 5, h / 3.2, 15);
          const spacing = bulbR * 2.6;
          let bx = x + w / 2 - spacing;
          const by = y + h / 2;
          for (let l = 0; l < 3; l += 1) {
            p.noStroke();
            if (card[l]) {
              p.fill(colors[l]);
            } else {
              p.fill("#e6eaf1");
            }
            p.circle(bx, by, bulbR * 2);
            bx += spacing;
          }
          p.pop();
        });
        return remaining;
      }

      function drawCount(remaining) {
        p.noStroke();
        p.textStyle(p.BOLD);
        p.textSize(15);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(theme.text);
        p.text(`${remaining} of 8 cards match`, p.width / 2, p.height - 20);
      }

      p.mousePressed = () => {
        const hit = filterRects.find((r) => p.mouseX >= r.x && p.mouseX <= r.x + r.w && p.mouseY >= r.y && p.mouseY <= r.y + r.h);
        if (hit) {
          filters[hit.i] = (filters[hit.i] + 1) % 3;
        }
      };
      p.mouseDragged = () => {};
      p.mouseReleased = () => {};
      wireTouch(p, () => false);
    };
  }

  // ----- Module 7: Triangle Lab -----

  function buildTriangleLab(host) {
    const theme = ctTheme();
    return (p) => {
      const pts = [
        { x: 0.5, y: 0.08 },
        { x: 0.16, y: 0.8 },
        { x: 0.84, y: 0.8 }
      ];
      let drag = -1;
      let activePreset = null;
      let hoverBtn = -1;
      let buttonRects = [];
      const PRESET_LABELS = ["Equilateral", "Isosceles", "Right", "Scalene"];
      const heightOf = () => (widthOf(host) < 480 ? 398 : 374);
      const pad = 34;
      const topPad = 24;
      const drawBottom = () => p.height - 122;

      p.setup = () => {
        p.createCanvas(widthOf(host), heightOf());
        p.textFont(FONT);
      };
      p.windowResized = () => p.resizeCanvas(widthOf(host), heightOf());

      const toPx = (pt) => ({ x: pad + pt.x * (p.width - pad * 2), y: topPad + pt.y * (drawBottom() - topPad) });
      const toFrac = (mx, my) => ({
        x: p.constrain((mx - pad) / (p.width - pad * 2), 0, 1),
        y: p.constrain((my - topPad) / (drawBottom() - topPad), 0, 1)
      });

      function area() {
        const w = p.width - pad * 2;
        const h = drawBottom() - topPad;
        return { w, h, cx: pad + w / 2, cy: topPad + h / 2 };
      }

      function presetPoints(name) {
        const A = area();
        // Uniform scale keeps each preset's true shape regardless of canvas aspect.
        const S = Math.min(A.w, A.h) * 0.5;
        const at = (ox, oy) => ({ x: A.cx + S * ox, y: A.cy + S * oy });
        if (name === "Equilateral") {
          const R = S * 0.92;
          return [90, 210, 330].map((deg) => {
            const r = p.radians(deg);
            return { x: A.cx + R * Math.cos(r), y: A.cy - R * Math.sin(r) };
          });
        }
        if (name === "Isosceles") {
          return [at(0, -1), at(-0.72, 0.72), at(0.72, 0.72)];
        }
        if (name === "Right") {
          return [at(-0.6, -0.82), at(-0.6, 0.62), at(0.96, 0.62)];
        }
        // Scalene: three clearly different side lengths
        return [at(-0.9, 0.55), at(0.05, -0.95), at(1, 0.4)];
      }

      function setPreset(name) {
        const px = presetPoints(name);
        const w = p.width - pad * 2;
        const h = drawBottom() - topPad;
        for (let i = 0; i < 3; i += 1) {
          pts[i] = { x: (px[i].x - pad) / w, y: (px[i].y - topPad) / h };
        }
        activePreset = name;
      }

      function angleAt(i, px) {
        const a = px[i];
        const b = px[(i + 1) % 3];
        const c = px[(i + 2) % 3];
        const u = { x: b.x - a.x, y: b.y - a.y };
        const v = { x: c.x - a.x, y: c.y - a.y };
        const dot = u.x * v.x + u.y * v.y;
        const mag = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y) || 1;
        return p.degrees(Math.acos(p.constrain(dot / mag, -1, 1)));
      }

      function classify(px) {
        const s = [
          Math.hypot(px[1].x - px[2].x, px[1].y - px[2].y),
          Math.hypot(px[0].x - px[2].x, px[0].y - px[2].y),
          Math.hypot(px[0].x - px[1].x, px[0].y - px[1].y)
        ];
        const tol = 0.06 * Math.max(...s);
        const eq = (m, n) => Math.abs(m - n) <= tol;
        let bySide = "Scalene";
        if (eq(s[0], s[1]) && eq(s[1], s[2])) bySide = "Equilateral";
        else if (eq(s[0], s[1]) || eq(s[1], s[2]) || eq(s[0], s[2])) bySide = "Isosceles";

        const angles = [angleAt(0, px), angleAt(1, px), angleAt(2, px)];
        const maxA = Math.max(...angles);
        let byAngle = "Acute";
        if (maxA > 92) byAngle = "Obtuse";
        else if (maxA >= 88) byAngle = "Right";
        return `${bySide} · ${byAngle}`;
      }

      // Round three angles to whole degrees keeping the total at 180 (largest-remainder),
      // so equal angles in symmetric triangles stay equal.
      function roundAngles(a0, a1, a2) {
        const raw = [a0, a1, a2];
        const res = raw.map(Math.floor);
        let remaining = 180 - (res[0] + res[1] + res[2]);
        const order = [0, 1, 2].sort((i, j) => (raw[j] - res[j]) - (raw[i] - res[i]));
        for (let k = 0; k < remaining; k += 1) {
          res[order[k % 3]] += 1;
        }
        return res;
      }

      p.draw = () => {
        p.clear();
        const px = pts.map(toPx);

        p.push();
        p.noStroke();
        p.fill(theme.teal + "1F");
        p.beginShape();
        px.forEach((q) => p.vertex(q.x, q.y));
        p.endShape(p.CLOSE);
        p.stroke(theme.teal);
        p.strokeWeight(2.4);
        p.noFill();
        p.beginShape();
        px.forEach((q) => p.vertex(q.x, q.y));
        p.endShape(p.CLOSE);
        p.pop();

        const centroid = {
          x: (px[0].x + px[1].x + px[2].x) / 3,
          y: (px[0].y + px[1].y + px[2].y) / 3
        };
        const labels = roundAngles(angleAt(0, px), angleAt(1, px), angleAt(2, px));

        px.forEach((q, i) => {
          const dx = centroid.x - q.x;
          const dy = centroid.y - q.y;
          const len = Math.hypot(dx, dy) || 1;
          const lx = q.x + (dx / len) * 30;
          const ly = q.y + (dy / len) * 30;
          p.noStroke();
          p.fill(theme.text);
          p.textStyle(p.BOLD);
          p.textSize(14);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${labels[i]}°`, lx, ly);

          const hovered = drag === i;
          p.fill(hovered ? theme.orange : theme.pink);
          p.circle(q.x, q.y, 19);
          p.fill("#ffffff");
          p.circle(q.x, q.y, 7);
        });

        const a2 = labels[0];
        const b2 = labels[1];
        const c2 = labels[2];
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textStyle(p.BOLD);
        p.textSize(16);
        p.fill(theme.text);
        p.text(`${a2}° + ${b2}° + ${c2}° = 180°`, p.width / 2, p.height - 100);
        p.fill(theme.teal);
        p.textSize(15);
        p.text(classify(px), p.width / 2, p.height - 78);

        drawButtons();
      };

      function drawButtons() {
        buttonRects = [];
        const gap = 8;
        const margin = 16;
        const bw = (p.width - margin * 2 - gap * 3) / 4;
        const bh = 38;
        const y = p.height - bh - 14;
        let x = margin;
        PRESET_LABELS.forEach((label, i) => {
          const active = activePreset === label;
          const hovered = hoverBtn === i;
          p.push();
          p.stroke(active ? theme.teal : theme.border);
          p.strokeWeight(active ? 2.4 : 1.4);
          p.fill(active ? theme.teal : (hovered ? theme.page : theme.card));
          p.rect(x, y, bw, bh, 9);
          p.noStroke();
          p.fill(active ? "#ffffff" : theme.text);
          p.textStyle(p.BOLD);
          p.textSize(p.width < 480 ? 10.5 : 12.5);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(label, x + bw / 2, y + bh / 2);
          p.pop();
          buttonRects.push({ i, label, x, y, w: bw, h: bh });
          x += bw + gap;
        });
      }

      p.mouseMoved = () => {
        hoverBtn = -1;
        buttonRects.forEach((b) => {
          if (p.mouseX >= b.x && p.mouseX <= b.x + b.w && p.mouseY >= b.y && p.mouseY <= b.y + b.h) {
            hoverBtn = b.i;
          }
        });
      };

      p.mousePressed = () => {
        const hit = buttonRects.find((b) => p.mouseX >= b.x && p.mouseX <= b.x + b.w && p.mouseY >= b.y && p.mouseY <= b.y + b.h);
        if (hit) {
          setPreset(hit.label);
          return;
        }
        const px = pts.map(toPx);
        for (let i = 0; i < 3; i += 1) {
          if ((p.mouseX - px[i].x) ** 2 + (p.mouseY - px[i].y) ** 2 <= 24 * 24) {
            drag = i;
            activePreset = null;
            return;
          }
        }
      };
      p.mouseDragged = () => {
        if (drag >= 0) {
          pts[drag] = toFrac(p.mouseX, p.mouseY);
        }
      };
      p.mouseReleased = () => { drag = -1; };
      wireTouch(p, () => drag >= 0);
    };
  }

  // ----- Module 8: Fraction Area Model -----

  function buildFractionModel(host) {
    const theme = ctTheme();
    return (p) => {
      let sliders;
      const heightOf = () => (widthOf(host) < 480 ? 300 : 280);

      p.setup = () => {
        p.createCanvas(widthOf(host), heightOf());
        p.textFont(FONT);
        sliders = makeSliders(p, theme, [
          { id: "n", min: 0, max: 4, step: 1, value: 3, color: theme.blue, label: "Shaded parts (numerator)", y: 190 },
          { id: "d", min: 1, max: 12, step: 1, value: 4, color: theme.orange, label: "Equal parts (denominator)", y: 242 }
        ]);
      };
      p.windowResized = () => p.resizeCanvas(widthOf(host), heightOf());

      p.draw = () => {
        p.clear();
        const d = sliders.value("d");
        sliders.setMax("n", d);
        const n = sliders.value("n");
        drawBar(n, d);
        drawReadout(n, d);
        sliders.draw();
      };

      function drawBar(n, d) {
        const x = 30;
        const w = p.width - 60;
        const y = 30;
        const h = 56;
        const cell = w / d;
        for (let i = 0; i < d; i += 1) {
          p.stroke("#ffffff");
          p.strokeWeight(2);
          p.fill(i < n ? theme.blue : "#eef1f7");
          p.rect(x + i * cell, y, cell, h, i === 0 ? 8 : 0, i === d - 1 ? 8 : 0, i === d - 1 ? 8 : 0, i === 0 ? 8 : 0);
        }
        p.noFill();
        p.stroke(theme.border);
        p.strokeWeight(1.4);
        p.rect(x, y, w, h, 8);
      }

      function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
      }

      function drawReadout(n, d) {
        const decimal = d === 0 ? 0 : n / d;
        const pct = Math.round(decimal * 100);
        const g = n > 0 ? gcd(n, d) : 1;
        p.noStroke();

        // big fraction with colour-matched numerator / denominator
        p.textStyle(p.BOLD);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(38);
        const parts = [String(n), "/", String(d)];
        const colors = [theme.blue, theme.soft, theme.orange];
        const widths = parts.map((s) => p.textWidth(s));
        const totalW = widths.reduce((a, b) => a + b, 0);
        let x = p.width / 2 - totalW / 2;
        parts.forEach((s, i) => {
          p.fill(colors[i]);
          p.text(s, x, 118);
          x += widths[i];
        });

        // decimal, percentage and simplest form: larger and dark for clarity
        let extra = `= ${Number(decimal.toFixed(2))}  =  ${pct}%`;
        if (g > 1) {
          extra = `= ${n / g}/${d / g}    ` + extra;
        }
        p.fill(theme.text);
        p.textStyle(p.BOLD);
        p.textSize(17);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(extra, p.width / 2, 150);
      }

      p.mousePressed = () => { sliders.pressed(p.mouseX, p.mouseY); };
      p.mouseDragged = () => { sliders.dragged(p.mouseX); };
      p.mouseReleased = () => { sliders.released(); };
      wireTouch(p, () => sliders.active());
    };
  }

  window.CT7ModuleLabs = { mountAll, cleanup };
})();
