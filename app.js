(function () {
  "use strict";

  const modules = window.CT7_MODULES || [];

  // ---------- lazy-loaded sketches ----------
  //
  // p5.js and the per-module sketch scripts are NOT included in the initial
  // page load (see index.html). They are fetched on demand the first time the
  // user opens a module or starts a quiz. Until they finish loading the
  // dynamic-lookup helpers below act as no-ops, then a second mount pass
  // hydrates the already-rendered DOM.

  const SKETCH_SCRIPTS = [
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.min.js",
    "sketches/pattern-hints.js",
    "sketches/pattern-hints-shapes.js",
    "sketches/binary-fingers.js",
    "sketches/place-value.js",
    "sketches/expression-debugger.js",
    "sketches/module-labs.js",
    "sketches/solid-visuals.js",
    "scripts/question-ui.js"
  ];

  let sketchesPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-lazy-src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
        return;
      }
      const tag = document.createElement("script");
      tag.src = src;
      tag.async = false;
      tag.dataset.lazySrc = src;
      tag.addEventListener("load", () => {
        tag.dataset.loaded = "true";
        resolve();
      });
      tag.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      document.head.appendChild(tag);
    });
  }

  function loadSketches() {
    if (!sketchesPromise) {
      sketchesPromise = SKETCH_SCRIPTS.reduce(
        (p, src) => p.then(() => loadScript(src)),
        Promise.resolve()
      ).catch((err) => {
        console.error(err);
        // Don't cache failure — allow retry on next interaction.
        sketchesPromise = null;
        throw err;
      });
    }
    return sketchesPromise;
  }

  function ensureSketchesAndHydrate() {
    loadSketches()
      .then(() => {
        const active = document.querySelector(".content-section.active");
        if (active?.id === "section-module") {
          mountAllWidgets(els.moduleBody);
        } else if (active?.id === "section-quiz") {
          // Re-render with newly available questionUI / patternHints helpers.
          renderQuestion();
        }
      })
      .catch(() => { /* error already logged */ });
  }

  // Dynamic lookups (re-evaluated on each call). Before scripts load these are
  // no-ops; afterwards they delegate to the loaded sketch module.

  function mountAllWidgets(root) {
    [
      window.CT7BinaryFingers,
      window.CT7PlaceValue,
      window.CT7ExpressionDebugger,
      window.CT7ModuleLabs
    ].forEach((mod) => mod && mod.mountAll && mod.mountAll(root));
    mountInfinityNumberLines(root);
  }

  function cleanupAllWidgets() {
    [
      window.CT7BinaryFingers,
      window.CT7PlaceValue,
      window.CT7ExpressionDebugger,
      window.CT7ModuleLabs
    ].forEach((mod) => mod && mod.cleanup && mod.cleanup());
  }

  function destroyActivePatternVisual() {
    window.CT7PatternHints && window.CT7PatternHints.destroyPatternVisual && window.CT7PatternHints.destroyPatternVisual();
  }

  function prepareQuestionPatternHint(module, question) {
    window.CT7PatternHints && window.CT7PatternHints.preparePatternHint && window.CT7PatternHints.preparePatternHint(module, question);
  }

  function renderQuizQuestionBrief(question) {
    window.CT7QuestionUI && window.CT7QuestionUI.renderQuestionBrief && window.CT7QuestionUI.renderQuestionBrief(question);
  }

  function renderQuizQuestionModel(question) {
    window.CT7QuestionUI && window.CT7QuestionUI.renderQuestionModel && window.CT7QuestionUI.renderQuestionModel(question);
  }

  function renderQuizQuestionImage(question) {
    window.CT7QuestionUI && window.CT7QuestionUI.renderQuestionImage && window.CT7QuestionUI.renderQuestionImage(question);
  }

  function renderQuizQuestionTable(question) {
    window.CT7QuestionUI && window.CT7QuestionUI.renderQuestionTable && window.CT7QuestionUI.renderQuestionTable(question);
  }

  // ---------- state ----------

  const STORAGE_KEY = "ct7-completed-modules";
  const MODULE_LAB_TYPES = new Set([
    "letterMachine",
    "angleInspector",
    "lightFilter",
    "triangleLab",
    "fractionModel"
  ]);
  const ACTIVITY_FIRST_INDICES = new Set([1, 3, 4, 5, 6, 7]);
  const moduleIds = new Set(modules.map((m) => m.id));

  let currentModuleIndex = 0;
  let activeModuleExtraPageIndex = null;
  let quizIndex = 0;
  let quizScore = 0;
  let answered = false;
  let completedModules = readCompleted();

  // ---------- cached DOM ----------

  const $ = (selector) => document.querySelector(selector);

  const els = {
    moduleNav: $("#module-nav"),
    moduleGrid: $("#module-grid"),
    completedCount: $("#completed-count"),
    moduleTotal: $("#module-total"),
    sidebar: $("#sidebar"),
    menuToggle: $("#menuToggle"),
    moduleKicker: $("#module-kicker"),
    moduleTitle: $("#module-title"),
    moduleBody: $("#module-body"),
    previousModule: $("#previous-module"),
    startQuiz: $("#start-quiz"),
    nextModule: $("#next-module"),
    backHome: $("#back-to-home"),
    backModule: $("#back-to-module"),
    chooseAnother: $("#choose-another"),
    retryModule: $("#retry-module"),
    resultChooseAnother: $("#result-choose-another"),
    quizModuleKicker: $("#quiz-module-kicker"),
    quizTitle: $("#quiz-title"),
    quizScore: $("#quiz-score"),
    quizTotal: $("#quiz-total"),
    questionCount: $("#question-count"),
    questionText: $("#question-text"),
    questionClue: $("#question-clue"),
    answerOptions: $("#answer-options"),
    feedback: $("#feedback"),
    nextQuestion: $("#next-question"),
    progressBar: $("#progress-bar"),
    progressTrack: $(".progress-track"),
    mainContent: $("#mainContent"),
    resultModule: $("#result-module"),
    resultTitle: $("#result-title"),
    resultMessage: $("#result-message"),
    finalScore: $("#final-score"),
    finalTotal: $("#final-total")
  };

  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

  // ---------- storage ----------

  function readCompleted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw).filter((id) => moduleIds.has(id))) : new Set();
    } catch {
      return new Set();
    }
  }

  function saveCompleted() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedModules]));
    } catch {
      /* private mode / quota — non-fatal */
    }
  }

  // ---------- section + nav ----------

  const sections = document.querySelectorAll(".content-section");

  function showSection(sectionId, { focus = true } = {}) {
    if (sectionId !== "section-quiz") {
      destroyActivePatternVisual();
    }
    if (sectionId !== "section-module") {
      cleanupAllWidgets();
    }

    let activeSection = null;
    sections.forEach((section) => {
      const isActive = section.id === sectionId;
      section.classList.toggle("active", isActive);
      if (isActive) activeSection = section;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (focus && activeSection) {
      const heading = activeSection.querySelector("h1, h2");
      if (heading) {
        // Defer to next frame so the section is visible before focusing.
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    }
  }

  function setActiveNav(target) {
    document.querySelectorAll(".nav-item").forEach((button) => {
      const isActive = button.dataset.navTarget === target;
      button.classList.toggle("active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function setSidebarOpen(open) {
    els.sidebar.classList.toggle("open", open);
    els.sidebar.setAttribute("aria-hidden", isMobile() ? String(!open) : "false");
    els.menuToggle.setAttribute("aria-expanded", String(open));
    els.menuToggle.setAttribute("aria-label", open ? "Close lesson menu" : "Open lesson menu");
  }

  function closeSidebarOnMobile() {
    if (isMobile()) setSidebarOpen(false);
  }

  // ---------- nav + grid ----------

  function renderNav() {
    els.moduleNav.innerHTML = "";

    const welcome = document.createElement("button");
    welcome.className = "nav-item active";
    welcome.type = "button";
    welcome.dataset.navTarget = "welcome";
    welcome.setAttribute("aria-current", "page");
    welcome.textContent = "Introduction";
    welcome.addEventListener("click", () => {
      showSection("section-welcome");
      setActiveNav("welcome");
      closeSidebarOnMobile();
    });
    els.moduleNav.appendChild(welcome);

    const fragment = document.createDocumentFragment();
    modules.forEach((module, index) => {
      const button = document.createElement("button");
      button.className = "nav-item";
      button.type = "button";
      button.dataset.navTarget = String(index);
      button.textContent = `${index + 1}. ${module.shortTitle}`;
      button.addEventListener("click", () => {
        openModule(index);
        closeSidebarOnMobile();
      });
      fragment.appendChild(button);
    });
    els.moduleNav.appendChild(fragment);

    updateCompletedView();
  }

  function renderModuleGrid() {
    const fragment = document.createDocumentFragment();
    modules.forEach((module, index) => {
      const button = document.createElement("button");
      button.className = "module-card";
      button.type = "button";
      button.dataset.theme = module.theme;
      button.setAttribute("aria-label", `Open module ${index + 1}: ${module.title}`);
      button.innerHTML = `
        <p class="eyebrow">Module ${index + 1}</p>
        <h3>${module.title}</h3>
        <p>${module.intro}</p>
        <div class="module-meta">
          <span>${module.skill}</span>
          <span>${module.quiz.length} questions</span>
        </div>
      `;
      button.addEventListener("click", () => openModule(index));
      fragment.appendChild(button);
    });
    els.moduleGrid.replaceChildren(fragment);
  }

  function updateCompletedView() {
    els.completedCount.textContent = completedModules.size;
    if (els.moduleTotal) els.moduleTotal.textContent = modules.length;
    document.querySelectorAll(".nav-item[data-nav-target]").forEach((button) => {
      const target = button.dataset.navTarget;
      const module = modules[Number(target)];
      if (module) {
        button.classList.toggle("completed", completedModules.has(module.id));
      }
    });
  }

  // ---------- module rendering ----------

  function openModule(index) {
    currentModuleIndex = index;
    activeModuleExtraPageIndex = null;
    renderModule(index);
    showSection("section-module");
    setActiveNav(String(index));
    ensureSketchesAndHydrate();
  }

  function shouldShowActivityBeforeLessons(index, module) {
    return Boolean(module.interactive) || ACTIVITY_FIRST_INDICES.has(index);
  }

  function renderModule(index) {
    const module = modules[index];
    const extraPage = activeModuleExtraPageIndex === null ? null : module.extraPages?.[activeModuleExtraPageIndex];

    cleanupAllWidgets();
    els.moduleKicker.textContent = `Module ${index + 1} - ${module.skill}`;
    els.moduleTitle.textContent = module.title;

    const lessonGrid = renderModuleLessons(module);
    const activity = renderModuleActivity(module);
    const activityFirst = shouldShowActivityBeforeLessons(index, module);

    els.moduleBody.innerHTML = extraPage ? renderModuleExtraPage(extraPage) : `
      <div class="story-card">
        <div class="story-text">
          <p class="story-highlight">Learn</p>
          <p>${module.intro}</p>
        </div>
      </div>

      ${renderVideoCard(module.video)}

      ${activityFirst ? activity : lessonGrid}
      ${activityFirst ? lessonGrid : activity}

      <div class="story-card">
        <div class="story-text">
          <p class="story-highlight">Remember</p>
        </div>
        <div class="mini-checks">
          ${module.checks.map((item) => `
            <div class="mini-check">
              <strong>${item.title}</strong>
              <p>${item.text}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    mountAllWidgets(els.moduleBody);
    bindActivityChips(module);
    updateModuleButtons(module, index, Boolean(extraPage));
  }

  function renderVideoCard(video) {
    if (!video) return "";
    return `
      <div class="story-card module-video-card">
        <div class="story-text">
          <p class="story-highlight">Watch</p>
          <h3>${video.title}</h3>
        </div>
        <div class="module-video-frame">
          <iframe
            src="${video.url}"
            title="${video.title}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  function renderModuleLessons(module) {
    return `
      <div class="lesson-grid">
        ${module.lessons.map((item, lessonIndex) => `
          <article class="lesson-card">
            <span class="lesson-badge">Idea ${lessonIndex + 1}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>
        `).join("")}
      </div>
    `;
  }

  // ---------- activity dispatch ----------
  //
  // One small registry instead of a long if/else chain. Each renderer takes the
  // module.interactive object and returns the HTML for that activity card.

  const ACTIVITY_RENDERERS = {
    placeValueBuilder: renderHostedLab("place-value-lab", "place-value-host", "data-place-value", (i) => ` data-start="${i.start ?? 0}"`),
    expressionDebugger: renderHostedLab("expression-debugger-lab", "expression-debugger-host", "data-expression-debugger"),
    infinityNumberLine: renderInfinityNumberLineLab,
    quoteCard: renderQuoteCard
  };

  function renderModuleActivity(module) {
    const interactive = module.interactive;
    if (interactive) {
      const renderer = ACTIVITY_RENDERERS[interactive.type];
      if (renderer) return renderer(interactive);
      if (MODULE_LAB_TYPES.has(interactive.type)) return renderModuleLab(interactive);
    }

    if (module.hideActivity || !module.activity) return "";

    return `
      <div class="story-card activity-lab">
        <div class="activity-visual visual-${module.visual}" aria-hidden="true"></div>
        <div class="activity-card">
          <p class="story-highlight">Try this</p>
          <h3>${module.activity.title}</h3>
          <p>${module.activity.prompt}</p>
          <div class="activity-chips">
            ${module.activity.chips
              .map((item, chipIndex) => `<button class="activity-chip" type="button" data-chip="${chipIndex}">${item.title}</button>`)
              .join("")}
          </div>
          <div id="activity-detail" class="activity-detail"></div>
        </div>
      </div>
    `;
  }

  // Returns a renderer fn that builds the standard "story-card + host element" shell
  // used by place-value, expression-debugger, and the generic module labs.
  function renderHostedLab(cardClass, hostClass, hostAttr, hostExtraAttrs = () => "") {
    return (interactive) => `
      <div class="story-card ${cardClass}">
        <div class="story-text">
          <p class="story-highlight">Try this</p>
          <h3>${interactive.title}</h3>
          <p>${interactive.prompt}</p>
        </div>
        <div
          class="${hostClass}"
          ${hostAttr}
          ${hostExtraAttrs(interactive)}
          aria-label="${interactive.title} interactive sketch"
        ></div>
      </div>
    `;
  }

  function renderModuleLab(interactive) {
    return `
      <div class="story-card module-lab">
        <div class="story-text">
          <p class="story-highlight">Try this</p>
          <h3>${interactive.title}</h3>
          <p>${interactive.prompt}</p>
        </div>
        <div
          class="module-lab-host"
          data-module-lab
          data-lab="${interactive.type}"
          aria-label="${interactive.title} interactive sketch"
        ></div>
      </div>
    `;
  }

  function renderQuoteCard(interactive) {
    const quote = String(interactive.quote || "").replace(
      /\b([xy])\b/g,
      '<span class="quote-variable quote-variable-$1">$1</span>'
    );
    return `
      <div class="story-card quote-card">
        <div class="story-text">
          <p class="story-highlight">Think about it</p>
          <h3>${interactive.title}</h3>
          <blockquote>${quote}</blockquote>
          ${interactive.note ? `<p class="quote-note">${interactive.note}</p>` : ""}
        </div>
      </div>
    `;
  }

  function renderInfinityNumberLineLab(interactive) {
    return `
      <div class="story-card infinity-line-lab">
        <div class="story-text">
          <p class="story-highlight">Try this</p>
          <h3>${interactive.title}</h3>
          <p>${interactive.prompt}</p>
        </div>
        <div class="infinity-line-widget" data-infinity-line>
          <div class="infinity-readout" data-infinity-readout>0</div>
          <div class="infinity-scale" aria-hidden="true">
            <span>-∞</span><span>-100</span><span>-50</span><strong>0</strong><span>50</span><span>100</span><span>∞</span>
          </div>
          <div class="infinity-track" aria-hidden="true"><i></i></div>
          <input
            class="infinity-slider"
            data-infinity-slider
            type="range"
            min="-100"
            max="100"
            value="0"
            step="1"
            aria-label="Move along the endless number line"
          />
          <div class="infinity-caption" data-infinity-caption>Start at zero.</div>
        </div>
      </div>
    `;
  }

  function mountInfinityNumberLines(root) {
    root.querySelectorAll("[data-infinity-line]").forEach((widget) => {
      const slider = widget.querySelector("[data-infinity-slider]");
      const readout = widget.querySelector("[data-infinity-readout]");
      const caption = widget.querySelector("[data-infinity-caption]");
      if (!slider || !readout || !caption) return;

      const update = () => {
        const value = Number(slider.value);
        widget.style.setProperty("--infinity-position", `${(value + 100) / 2}%`);

        if (value === 0) {
          readout.textContent = "0";
          caption.textContent = "Start at zero.";
          widget.dataset.direction = "zero";
        } else if (value < 0) {
          readout.textContent = value <= -100 ? "-∞" : String(value);
          caption.textContent = value <= -100
            ? "The number line keeps going left forever."
            : `${Math.abs(value)} steps left of zero.`;
          widget.dataset.direction = "negative";
        } else {
          readout.textContent = value >= 100 ? "∞" : String(value);
          caption.textContent = value >= 100
            ? "The number line keeps going right forever."
            : `${value} steps right of zero.`;
          widget.dataset.direction = "positive";
        }
      };

      slider.addEventListener("input", update);
      update();
    });
  }

  function renderModuleExtraPage(page) {
    if (page.type !== "binaryFingers") return "";
    return `
      <div class="binary-fingers-page">
        <section class="binary-challenge-card">
          <div class="binary-question-card">
            <p class="story-highlight">${page.kicker}</p>
            <h3>${page.title}</h3>
            <p>${page.prompt}</p>
          </div>
          <div class="binary-answer-card">
            <span>Answer</span>
            <strong>${page.answer}</strong>
          </div>
          <div class="binary-explain-card">
            <p>${page.explanation}</p>
          </div>
        </section>
        <section class="binary-lab-grid">
          <div class="binary-fingers-widget" data-binary-fingers aria-label="Interactive binary finger counting animation"></div>
          ${page.referenceImage ? `
            <aside class="binary-reference-image">
              ${page.referenceImage.caption ? `<p class="binary-reference-caption">${page.referenceImage.caption}</p>` : ""}
              <img src="${page.referenceImage.src}" alt="${page.referenceImage.alt}" loading="lazy" decoding="async">
            </aside>
          ` : ""}
        </section>
      </div>
    `;
  }

  function updateModuleButtons(module, index, showingExtraPage) {
    const firstExtra = module.extraPages?.[0];

    els.previousModule.hidden = false;
    els.nextModule.hidden = showingExtraPage;

    if (showingExtraPage) {
      els.previousModule.textContent = "Back to intro";
      els.previousModule.disabled = false;
      els.startQuiz.textContent = "Start quiz";
      els.nextModule.disabled = true;
      return;
    }

    els.previousModule.textContent = "Previous";
    els.previousModule.disabled = index === 0;
    els.startQuiz.textContent = firstExtra?.buttonLabel || "Start quiz";
    els.nextModule.textContent = "Next";
    els.nextModule.disabled = index === modules.length - 1;
  }

  function showModuleExtraPage(pageIndex = 0) {
    activeModuleExtraPageIndex = pageIndex;
    renderModule(currentModuleIndex);
    showSection("section-module");
    setActiveNav(String(currentModuleIndex));
  }

  function handleModulePrimaryAction() {
    const module = modules[currentModuleIndex];
    if (activeModuleExtraPageIndex === null && module.extraPages?.length) {
      showModuleExtraPage(0);
      return;
    }
    startQuiz();
  }

  function bindActivityChips(module) {
    const chips = document.querySelectorAll(".activity-chip");
    const detail = $("#activity-detail");
    if (module.hideActivity || !module.activity || !chips.length || !detail) return;

    const activate = (chipIndex) => {
      detail.textContent = module.activity.chips[chipIndex].text;
      chips.forEach((btn) => {
        btn.classList.toggle("active", Number(btn.dataset.chip) === chipIndex);
      });
    };

    chips.forEach((btn) => btn.addEventListener("click", () => activate(Number(btn.dataset.chip))));
    activate(0);
  }

  // ---------- quiz ----------

  function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    answered = false;
    renderQuestion();
    showSection("section-quiz");
    setActiveNav(String(currentModuleIndex));
    ensureSketchesAndHydrate();
  }

  function renderQuestion() {
    const module = modules[currentModuleIndex];
    const question = module.quiz[quizIndex];
    answered = false;

    els.quizModuleKicker.textContent = `Module ${currentModuleIndex + 1}`;
    els.quizTitle.textContent = module.title;
    els.quizScore.textContent = quizScore;
    els.quizTotal.textContent = module.quiz.length;
    els.questionCount.textContent = `${question.countLabel || `Question ${quizIndex + 1}`} of ${module.quiz.length}`;
    els.questionText.textContent = question.text;

    renderQuizQuestionImage(question);
    renderQuizQuestionTable(question);
    renderQuizQuestionBrief(question);
    renderQuizQuestionModel(question);

    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    els.nextQuestion.disabled = true;

    els.questionClue.textContent = question.clue || "Think about the rule, then test each option.";
    els.questionClue.classList.remove("show");

    prepareQuestionPatternHint(module, question);

    const progress = ((quizIndex + 1) / module.quiz.length) * 100;
    els.progressBar.style.width = `${progress}%`;
    if (els.progressTrack) {
      els.progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));
    }

    renderAnswerOptions(question);
  }

  function renderAnswerOptions(question) {
    const wrap = els.answerOptions;
    wrap.classList.toggle("stacked", question.optionsLayout === "stacked");
    wrap.classList.toggle("hand-options", question.optionsLayout === "hand-grid");
    wrap.classList.toggle("operator-options", question.optionsLayout === "operator-grid");

    const fragment = document.createDocumentFragment();
    question.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "answer-option";
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");

      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + optionIndex);

      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = option;

      const visual = question.optionVisuals?.[optionIndex];
      if (visual) {
        button.classList.add("has-visual");
        const content = document.createElement("span");
        content.className = "option-content";
        content.append(createOptionVisual(visual), text);
        button.append(letter, content);
      } else {
        button.append(letter, text);
      }

      button.addEventListener("click", () => chooseAnswer(optionIndex));
      fragment.appendChild(button);
    });
    wrap.replaceChildren(fragment);
  }

  function createOptionVisual(visual) {
    if (visual.type === "binaryHand") return createBinaryHandOption(visual.bits);
    const fallback = document.createElement("span");
    fallback.className = "option-visual";
    return fallback;
  }

  function createBinaryHandOption(bits) {
    const values = [16, 8, 4, 2, 1];
    const hand = document.createElement("span");
    hand.className = "option-hand";
    hand.setAttribute("aria-hidden", "true");

    const palm = document.createElement("span");
    palm.className = "option-hand-palm";
    hand.appendChild(palm);

    values.forEach((value, index) => {
      const finger = document.createElement("span");
      finger.className = `option-hand-finger finger-${index}${bits[index] ? " raised" : ""}`;
      finger.title = String(value);
      hand.appendChild(finger);
    });

    const labels = document.createElement("span");
    labels.className = "option-hand-labels";
    values.forEach((value) => {
      const label = document.createElement("span");
      label.textContent = value;
      labels.appendChild(label);
    });
    hand.appendChild(labels);
    return hand;
  }

  function chooseAnswer(optionIndex) {
    if (answered) return;
    answered = true;

    const module = modules[currentModuleIndex];
    const question = module.quiz[quizIndex];
    const buttons = els.answerOptions.querySelectorAll(".answer-option");

    buttons.forEach((button, index) => {
      button.disabled = true;
      button.setAttribute("aria-checked", String(index === optionIndex));
      if (index === question.answer) button.classList.add("correct");
      if (index === optionIndex && optionIndex !== question.answer) button.classList.add("wrong");
    });

    if (optionIndex === question.answer) {
      quizScore += 1;
      els.feedback.textContent = "Correct. Nice reasoning.";
      els.feedback.classList.add("good");
    } else {
      els.feedback.textContent = `Not quite. The answer is ${question.answerText || question.options[question.answer]}.`;
      els.feedback.classList.add("try");
      els.questionClue.classList.add("show");
    }

    els.quizScore.textContent = quizScore;
    els.nextQuestion.disabled = false;
    els.nextQuestion.focus({ preventScroll: true });
  }

  function goToNextQuestion() {
    const module = modules[currentModuleIndex];
    if (quizIndex < module.quiz.length - 1) {
      quizIndex += 1;
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const module = modules[currentModuleIndex];
    completedModules.add(module.id);
    saveCompleted();
    updateCompletedView();

    els.resultModule.textContent = module.title;
    els.finalScore.textContent = quizScore;
    els.finalTotal.textContent = module.quiz.length;

    if (quizScore === module.quiz.length) {
      els.resultTitle.textContent = "Perfect score!";
      els.resultMessage.textContent = "You used the ideas carefully and checked the rules like a real CT explorer.";
    } else if (quizScore >= Math.ceil(module.quiz.length * 0.6)) {
      els.resultTitle.textContent = "Module complete";
      els.resultMessage.textContent = "Good work. Review the missed ideas once and your reasoning will get sharper.";
    } else {
      els.resultTitle.textContent = "Keep practicing";
      els.resultMessage.textContent = "The module is marked complete, but try again to strengthen the main ideas.";
    }

    showSection("section-result");
    setActiveNav(String(currentModuleIndex));
  }

  // ---------- controls ----------

  function bindControls() {
    els.menuToggle.addEventListener("click", () => {
      setSidebarOpen(!els.sidebar.classList.contains("open"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMobile() && els.sidebar.classList.contains("open")) {
        setSidebarOpen(false);
        els.menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      // Keep ARIA in sync when crossing the mobile/desktop breakpoint.
      els.sidebar.setAttribute("aria-hidden", isMobile() ? String(!els.sidebar.classList.contains("open")) : "false");
    });

    els.backHome.addEventListener("click", () => {
      showSection("section-welcome");
      setActiveNav("welcome");
    });

    els.backModule.addEventListener("click", () => {
      renderModule(currentModuleIndex);
      showSection("section-module");
      setActiveNav(String(currentModuleIndex));
    });

    els.previousModule.addEventListener("click", () => {
      if (activeModuleExtraPageIndex !== null) {
        activeModuleExtraPageIndex = null;
        renderModule(currentModuleIndex);
        showSection("section-module");
        return;
      }
      if (currentModuleIndex > 0) openModule(currentModuleIndex - 1);
    });

    els.nextModule.addEventListener("click", () => {
      if (currentModuleIndex < modules.length - 1) openModule(currentModuleIndex + 1);
    });

    els.startQuiz.addEventListener("click", handleModulePrimaryAction);
    els.nextQuestion.addEventListener("click", goToNextQuestion);

    els.chooseAnother.addEventListener("click", () => {
      showSection("section-welcome");
      setActiveNav("welcome");
    });

    els.retryModule.addEventListener("click", startQuiz);
    els.resultChooseAnother.addEventListener("click", () => {
      showSection("section-welcome");
      setActiveNav("welcome");
    });
  }

  // ---------- boot ----------

  renderNav();
  renderModuleGrid();
  bindControls();
  updateCompletedView();
  setSidebarOpen(false);
})();
