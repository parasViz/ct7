function renderQuestionImage(question) {
  const questionImageWrap = document.querySelector("#question-image-wrap");
  const questionImage = document.querySelector("#question-image");

  if (!questionImageWrap || !questionImage) {
    return;
  }

  if (question.image) {
    questionImage.src = question.image.src;
    questionImage.alt = question.image.alt || "";
    questionImageWrap.classList.toggle("wide", question.image.size === "wide");
    questionImageWrap.classList.toggle("small", question.image.size === "small");
    questionImageWrap.hidden = false;
    return;
  }

  questionImage.removeAttribute("src");
  questionImage.alt = "";
  questionImageWrap.classList.remove("wide");
  questionImageWrap.classList.remove("small");
  questionImageWrap.hidden = true;
}

function renderQuestionTable(question) {
  const tableWrap = document.querySelector("#question-table-wrap");
  if (!tableWrap) {
    return;
  }

  tableWrap.innerHTML = "";
  if (!question.table) {
    tableWrap.hidden = true;
    return;
  }

  const table = document.createElement("table");
  table.className = "question-table";

  const thead = document.createElement("thead");
  const headingRow = document.createElement("tr");
  question.table.columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headingRow.appendChild(th);
  });
  thead.appendChild(headingRow);

  const tbody = document.createElement("tbody");
  question.table.rows.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  tableWrap.appendChild(table);
  tableWrap.hidden = false;
}

function renderQuestionBrief(question) {
  const briefWrap = document.querySelector("#question-brief-wrap");
  if (!briefWrap) {
    return;
  }

  briefWrap.innerHTML = "";
  if (!question.brief) {
    briefWrap.hidden = true;
    return;
  }

  const article = document.createElement("article");
  article.className = "question-brief";
  if (question.brief.compact) {
    article.classList.add("compact");
  }
  if (question.brief.variant === "expression") {
    article.classList.add("expression-focus");
  }
  if (question.brief.variant) {
    article.classList.add(question.brief.variant);
  }

  const title = document.createElement("p");
  title.className = "question-brief-title";
  title.textContent = question.brief.title;
  article.appendChild(title);

  if (question.brief.text) {
    const text = document.createElement("p");
    text.className = "question-brief-line";
    text.textContent = question.brief.text;
    article.appendChild(text);
  } else if (question.brief.items?.length) {
    article.appendChild(createBriefGrid(question.brief));
  }

  if (question.brief.note) {
    const note = document.createElement("p");
    note.className = "question-brief-note";
    note.textContent = question.brief.note;
    article.appendChild(note);
  }

  briefWrap.appendChild(article);
  briefWrap.hidden = false;
}

function renderQuestionModel(question) {
  const modelWrap = document.querySelector("#question-model-wrap");
  if (!modelWrap) {
    return;
  }

  if (window.CT7SolidVisuals?.destroy) {
    window.CT7SolidVisuals.destroy();
  }

  modelWrap.innerHTML = "";
  if (!question.model) {
    modelWrap.hidden = true;
    return;
  }

  const card = document.createElement("article");
  card.className = "question-model-card";

  const stage = document.createElement("div");
  stage.className = "question-model-stage";
  stage.setAttribute("aria-label", question.model.alt || "Interactive 3D model");
  stage.setAttribute("role", "img");

  card.appendChild(stage);
  modelWrap.appendChild(card);
  modelWrap.hidden = false;

  if (window.CT7SolidVisuals?.mount) {
    window.CT7SolidVisuals.mount(stage, question.model);
  } else {
    stage.textContent = "Loading interactive model...";
  }
}

function createBriefGrid(brief) {
  const list = document.createElement("div");
  list.className = "question-brief-grid";
  if (brief.items.length === 1) {
    list.classList.add("one");
  } else if (brief.items.length === 3) {
    list.classList.add("three");
  }

  brief.items.forEach((item) => {
    const card = document.createElement("section");
    card.className = "question-brief-card";

    if (item.sentence) {
      const sentence = document.createElement("p");
      sentence.className = "question-brief-card-sentence";
      sentence.textContent = item.sentence;
      card.appendChild(sentence);
      list.appendChild(card);
      return;
    }

    const label = document.createElement("span");
    label.textContent = item.label;

    const value = document.createElement("strong");
    value.textContent = item.value;

    const detail = document.createElement("small");
    detail.textContent = item.detail;

    card.append(label, value, detail);
    list.appendChild(card);
  });

  return list;
}

window.CT7QuestionUI = {
  renderQuestionBrief,
  renderQuestionImage,
  renderQuestionModel,
  renderQuestionTable
};
