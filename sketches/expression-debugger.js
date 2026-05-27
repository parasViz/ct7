(function () {
  const widgets = new Set();

  const OPERATORS = [
    { key: "+", name: "Add" },
    { key: "-", name: "Subtract" },
    { key: "×", name: "Multiply" },
    { key: "÷", name: "Divide" }
  ];

  const LIMITS = { aMin: 0, aMax: 99, bMin: 1, bMax: 20 };

  function mountAll(root = document) {
    if (!root) {
      return;
    }
    root.querySelectorAll("[data-expression-debugger]").forEach((host) => {
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
    const state = { a: 24, b: 6, op: "÷" };

    host.innerHTML = `
      <div class="ed-card">
        <div class="ed-equation" data-role="equation" data-key="÷">
          <span class="ed-num" data-role="eq-a">24</span>
          <span class="ed-op" data-role="eq-op">÷</span>
          <span class="ed-num" data-role="eq-b">6</span>
          <span class="ed-eq">=</span>
          <span class="ed-result" data-role="result">4</span>
        </div>

        <div class="ed-operands">
          ${stepperMarkup("a", "First number", state.a)}
          ${stepperMarkup("b", "Second number", state.b)}
        </div>

        <div class="ed-operators" role="group" aria-label="Choose an operation">
          ${OPERATORS.map((op) => `
            <button
              type="button"
              class="ed-operator${op.key === state.op ? " is-active" : ""}"
              data-operator="${op.key}"
              data-key="${op.key}"
              aria-pressed="${op.key === state.op}"
            >
              <span class="ed-operator-sign">${op.key}</span>
              <span class="ed-operator-name">${op.name}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;

    const refs = {
      equation: host.querySelector('[data-role="equation"]'),
      eqA: host.querySelector('[data-role="eq-a"]'),
      eqOp: host.querySelector('[data-role="eq-op"]'),
      eqB: host.querySelector('[data-role="eq-b"]'),
      result: host.querySelector('[data-role="result"]'),
      valueA: host.querySelector('[data-role="value-a"]'),
      valueB: host.querySelector('[data-role="value-b"]'),
      operators: Array.from(host.querySelectorAll(".ed-operator"))
    };

    function render(popResult) {
      refs.eqA.textContent = state.a;
      refs.eqB.textContent = state.b;
      refs.eqOp.textContent = state.op;
      refs.valueA.textContent = state.a;
      refs.valueB.textContent = state.b;
      refs.equation.dataset.key = state.op;
      refs.result.textContent = compute(state.a, state.b, state.op);

      refs.operators.forEach((button) => {
        const isActive = button.dataset.operator === state.op;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      if (popResult && typeof refs.result.animate === "function") {
        refs.result.animate(
          [{ transform: "scale(1.18)" }, { transform: "scale(1)" }],
          { duration: 220, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
        );
      }
    }

    function stepOperand(which, delta) {
      if (which === "a") {
        state.a = clamp(state.a + delta, LIMITS.aMin, LIMITS.aMax);
      } else {
        state.b = clamp(state.b + delta, LIMITS.bMin, LIMITS.bMax);
      }
      render(true);
    }

    const onClick = (event) => {
      const stepButton = event.target.closest("[data-step]");
      if (stepButton) {
        stepOperand(stepButton.dataset.operand, Number(stepButton.dataset.step));
        return;
      }
      const opButton = event.target.closest(".ed-operator");
      if (opButton && opButton.dataset.operator !== state.op) {
        state.op = opButton.dataset.operator;
        render(true);
      }
    };

    host.addEventListener("click", onClick);
    render(false);

    return {
      destroy() {
        host.removeEventListener("click", onClick);
        host.dataset.mounted = "";
        host.innerHTML = "";
      }
    };
  }

  function stepperMarkup(operand, label, value) {
    return `
      <div class="ed-stepper">
        <span class="ed-stepper-label">${label}</span>
        <div class="ed-stepper-controls">
          <button type="button" class="ed-step" data-step="-1" data-operand="${operand}" aria-label="Decrease ${label.toLowerCase()}">−</button>
          <strong data-role="value-${operand}">${value}</strong>
          <button type="button" class="ed-step" data-step="1" data-operand="${operand}" aria-label="Increase ${label.toLowerCase()}">+</button>
        </div>
      </div>
    `;
  }

  function compute(a, b, op) {
    if (op === "+") return String(a + b);
    if (op === "-") return String(a - b);
    if (op === "×") return String(a * b);
    if (b === 0) return "—";
    const quotient = Math.trunc(a / b);
    const remainder = a % b;
    return remainder === 0 ? String(quotient) : `${quotient} r ${remainder}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.CT7ExpressionDebugger = { mountAll, cleanup };
})();
