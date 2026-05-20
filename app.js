const modules = window.CT7_MODULES || [];
const patternHints = window.CT7PatternHints || {};
const questionUI = window.CT7QuestionUI || {};
const binaryFingers = window.CT7BinaryFingers || {};
const noop = () => {};
const destroyActivePatternVisual = patternHints.destroyPatternVisual || noop;
const prepareQuestionPatternHint = patternHints.preparePatternHint || noop;
const renderQuizQuestionBrief = questionUI.renderQuestionBrief || noop;
const renderQuizQuestionImage = questionUI.renderQuestionImage || noop;
const renderQuizQuestionTable = questionUI.renderQuestionTable || noop;
const mountBinaryFingerPages = binaryFingers.mountAll || noop;
const cleanupBinaryFingerPages = binaryFingers.cleanup || noop;
const moduleIds = new Set(modules.map((module) => module.id));
const STORAGE_KEY = "ct7-completed-modules";
const moduleNav = document.querySelector("#module-nav");
const moduleGrid = document.querySelector("#module-grid");
const completedCount = document.querySelector("#completed-count");
const moduleTotal = document.querySelector("#module-total");
const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menuToggle");

let currentModuleIndex = 0;
let activeModuleExtraPageIndex = null;
let quizIndex = 0;
let quizScore = 0;
let answered = false;
let completedModules = readCompleted();

function readCompleted() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? new Set(JSON.parse(value).filter((id) => moduleIds.has(id))) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedModules]));
}

function showSection(sectionId) {
  if (sectionId !== "section-quiz") {
    destroyActivePatternVisual();
  }
  if (sectionId !== "section-module") {
    cleanupBinaryFingerPages();
  }

  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveNav(target) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    const isActive = button.dataset.navTarget === target;
    button.classList.toggle("active", isActive);
  });
}

function closeSidebarOnMobile() {
  if (window.matchMedia("(max-width: 760px)").matches) {
    sidebar.classList.remove("open");
  }
}

function renderNav() {
  moduleNav.innerHTML = "";

  const welcomeButton = document.createElement("button");
  welcomeButton.className = "nav-item active";
  welcomeButton.type = "button";
  welcomeButton.dataset.navTarget = "welcome";
  welcomeButton.textContent = "Introduction";
  welcomeButton.addEventListener("click", () => {
    showSection("section-welcome");
    setActiveNav("welcome");
    closeSidebarOnMobile();
  });
  moduleNav.appendChild(welcomeButton);

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
    moduleNav.appendChild(button);
  });

  updateCompletedView();
}

function renderModuleGrid() {
  moduleGrid.innerHTML = "";
  modules.forEach((module, index) => {
    const button = document.createElement("button");
    button.className = "module-card";
    button.type = "button";
    button.dataset.theme = module.theme;
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
    moduleGrid.appendChild(button);
  });
}

function updateCompletedView() {
  completedCount.textContent = completedModules.size;
  if (moduleTotal) {
    moduleTotal.textContent = modules.length;
  }
  document.querySelectorAll(".nav-item[data-nav-target]").forEach((button) => {
    const module = modules[Number(button.dataset.navTarget)];
    if (module) {
      button.classList.toggle("completed", completedModules.has(module.id));
    }
  });
}

function openModule(index) {
  currentModuleIndex = index;
  activeModuleExtraPageIndex = null;
  renderModule(index);
  showSection("section-module");
  setActiveNav(String(index));
}

function renderModule(index) {
  const module = modules[index];
  const extraPage = activeModuleExtraPageIndex === null ? null : module.extraPages?.[activeModuleExtraPageIndex];
  cleanupBinaryFingerPages();
  document.querySelector("#module-kicker").textContent = `Module ${index + 1} - ${module.skill}`;
  document.querySelector("#module-title").textContent = module.title;

  const body = document.querySelector("#module-body");
  body.innerHTML = extraPage ? renderModuleExtraPage(extraPage) : `
    <div class="story-card">
      <div class="story-text">
        <p class="story-highlight">Learn</p>
        <p>${module.intro}</p>
      </div>
    </div>

    ${module.video ? `
      <div class="story-card module-video-card">
        <div class="story-text">
          <p class="story-highlight">Watch</p>
          <h3>${module.video.title}</h3>
        </div>
        <div class="module-video-frame">
          <iframe
            src="${module.video.url}"
            title="${module.video.title}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    ` : ""}

    <div class="lesson-grid">
      ${module.lessons
        .map(
          (item, lessonIndex) => `
          <article class="lesson-card">
            <span class="lesson-badge">Idea ${lessonIndex + 1}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>
        `
        )
        .join("")}
    </div>

    ${renderModuleActivity(module)}

    <div class="story-card">
      <div class="story-text">
        <p class="story-highlight">Remember</p>
      </div>
      <div class="mini-checks">
        ${module.checks
          .map(
            (item) => `
            <div class="mini-check">
              <strong>${item.title}</strong>
              <p>${item.text}</p>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;

  mountBinaryFingerPages(body);
  bindActivityChips(module);
  updateModuleButtons(module, index, Boolean(extraPage));
}

function renderModuleActivity(module) {
  if (module.hideActivity || !module.activity) {
    return "";
  }

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

function renderModuleExtraPage(page) {
  if (page.type === "binaryFingers") {
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
              <img src="${page.referenceImage.src}" alt="${page.referenceImage.alt}">
            </aside>
          ` : ""}
        </section>
      </div>
    `;
  }

  return "";
}

function updateModuleButtons(module, index, showingExtraPage) {
  const previousButton = document.querySelector("#previous-module");
  const primaryButton = document.querySelector("#start-quiz");
  const nextButton = document.querySelector("#next-module");
  const firstExtraPage = module.extraPages?.[0];

  previousButton.hidden = false;
  nextButton.hidden = showingExtraPage;

  if (showingExtraPage) {
    previousButton.textContent = "Back to intro";
    previousButton.disabled = false;
    primaryButton.textContent = "Start quiz";
    nextButton.disabled = true;
    return;
  }

  previousButton.textContent = "Previous";
  previousButton.disabled = index === 0;
  primaryButton.textContent = firstExtraPage?.buttonLabel || "Start quiz";
  nextButton.textContent = "Next";
  nextButton.disabled = index === modules.length - 1;
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
  const detail = document.querySelector("#activity-detail");

  if (module.hideActivity || !module.activity || !chips.length || !detail) {
    return;
  }

  function activate(chipIndex) {
    const item = module.activity.chips[chipIndex];
    detail.textContent = item.text;
    chips.forEach((chipButton) => {
      chipButton.classList.toggle("active", Number(chipButton.dataset.chip) === chipIndex);
    });
  }

  chips.forEach((chipButton) => {
    chipButton.addEventListener("click", () => activate(Number(chipButton.dataset.chip)));
  });

  activate(0);
}

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  answered = false;
  renderQuestion();
  showSection("section-quiz");
  setActiveNav(String(currentModuleIndex));
}

function renderQuestion() {
  const module = modules[currentModuleIndex];
  const question = module.quiz[quizIndex];
  answered = false;

  document.querySelector("#quiz-module-kicker").textContent = `Module ${currentModuleIndex + 1}`;
  document.querySelector("#quiz-title").textContent = module.title;
  document.querySelector("#quiz-score").textContent = quizScore;
  document.querySelector("#quiz-total").textContent = module.quiz.length;
  document.querySelector("#question-count").textContent = `${question.countLabel || `Question ${quizIndex + 1}`} of ${module.quiz.length}`;
  document.querySelector("#question-text").textContent = question.text;
  renderQuizQuestionImage(question);
  renderQuizQuestionTable(question);
  renderQuizQuestionBrief(question);
  document.querySelector("#feedback").textContent = "";
  document.querySelector("#feedback").className = "feedback";
  document.querySelector("#next-question").disabled = true;

  const clue = document.querySelector("#question-clue");
  clue.textContent = question.clue || "Think about the rule, then test each option.";
  clue.classList.remove("show");
  prepareQuestionPatternHint(module, question);

  const progress = ((quizIndex + 1) / module.quiz.length) * 100;
  document.querySelector("#progress-bar").style.width = `${progress}%`;

  const answerOptions = document.querySelector("#answer-options");
  answerOptions.innerHTML = "";
  answerOptions.classList.toggle("stacked", question.optionsLayout === "stacked");
  answerOptions.classList.toggle("hand-options", question.optionsLayout === "hand-grid");
  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.type = "button";

    const optionLetter = document.createElement("span");
    optionLetter.className = "option-letter";
    optionLetter.textContent = String.fromCharCode(65 + optionIndex);

    const optionText = document.createElement("span");
    optionText.className = "option-text";
    optionText.textContent = option;

    const optionVisual = question.optionVisuals?.[optionIndex];
    if (optionVisual) {
      button.classList.add("has-visual");
      const optionContent = document.createElement("span");
      optionContent.className = "option-content";
      optionContent.append(createOptionVisual(optionVisual), optionText);
      button.append(optionLetter, optionContent);
    } else {
      button.append(optionLetter, optionText);
    }

    button.addEventListener("click", () => chooseAnswer(optionIndex));
    answerOptions.appendChild(button);
  });

}

function createOptionVisual(visual) {
  if (visual.type === "binaryHand") {
    return createBinaryHandOption(visual.bits);
  }

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
  if (answered) {
    return;
  }
  answered = true;

  const module = modules[currentModuleIndex];
  const question = module.quiz[quizIndex];
  const buttons = document.querySelectorAll(".answer-option");
  const feedback = document.querySelector("#feedback");

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) {
      button.classList.add("correct");
    }
    if (index === optionIndex && optionIndex !== question.answer) {
      button.classList.add("wrong");
    }
  });

  if (optionIndex === question.answer) {
    quizScore += 1;
    feedback.textContent = "Correct. Nice reasoning.";
    feedback.classList.add("good");
  } else {
    feedback.textContent = `Not quite. The answer is ${question.answerText || question.options[question.answer]}.`;
    feedback.classList.add("try");
    document.querySelector("#question-clue").classList.add("show");
  }

  document.querySelector("#quiz-score").textContent = quizScore;
  document.querySelector("#next-question").disabled = false;
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

  document.querySelector("#result-module").textContent = module.title;
  document.querySelector("#final-score").textContent = quizScore;
  document.querySelector("#final-total").textContent = module.quiz.length;

  const title = document.querySelector("#result-title");
  const message = document.querySelector("#result-message");
  if (quizScore === module.quiz.length) {
    title.textContent = "Perfect score!";
    message.textContent = "You used the ideas carefully and checked the rules like a real CT explorer.";
  } else if (quizScore >= Math.ceil(module.quiz.length * 0.6)) {
    title.textContent = "Module complete";
    message.textContent = "Good work. Review the missed ideas once and your reasoning will get sharper.";
  } else {
    title.textContent = "Keep practicing";
    message.textContent = "The module is marked complete, but try again to strengthen the main ideas.";
  }

  showSection("section-result");
  setActiveNav(String(currentModuleIndex));
}

function bindControls() {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.querySelector("#back-to-home").addEventListener("click", () => {
    showSection("section-welcome");
    setActiveNav("welcome");
  });

  document.querySelector("#back-to-module").addEventListener("click", () => {
    renderModule(currentModuleIndex);
    showSection("section-module");
    setActiveNav(String(currentModuleIndex));
  });

  document.querySelector("#previous-module").addEventListener("click", () => {
    if (activeModuleExtraPageIndex !== null) {
      activeModuleExtraPageIndex = null;
      renderModule(currentModuleIndex);
      showSection("section-module");
      return;
    }

    if (currentModuleIndex > 0) {
      openModule(currentModuleIndex - 1);
    }
  });

  document.querySelector("#next-module").addEventListener("click", () => {
    if (currentModuleIndex < modules.length - 1) {
      openModule(currentModuleIndex + 1);
    }
  });

  document.querySelector("#start-quiz").addEventListener("click", handleModulePrimaryAction);
  document.querySelector("#next-question").addEventListener("click", goToNextQuestion);

  document.querySelector("#choose-another").addEventListener("click", () => {
    showSection("section-welcome");
    setActiveNav("welcome");
  });

  document.querySelector("#retry-module").addEventListener("click", startQuiz);

  document.querySelector("#result-choose-another").addEventListener("click", () => {
    showSection("section-welcome");
    setActiveNav("welcome");
  });
}

renderNav();
renderModuleGrid();
bindControls();
updateCompletedView();
