const STORAGE_KEY = "control-gastos-transactions";
const CARD_SETTINGS_KEY = "control-gastos-credit-card";
const CREDIT_CARDS_KEY = "control-gastos-credit-cards";
const CARD_PAYMENTS_KEY = "control-gastos-credit-payments";
const GOALS_KEY = "control-gastos-monthly-goals";
const CLOUD_SAVE_DELAY = 500;

const formatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const DESCRIPTION_OPTIONS = {
  income: ["Sueldo", "Abono extra", "Transferencias", "Devoluciones", "Otros"],
  expense: [
    "Comida",
    "Transporte",
    "Transferencia",
    "Ropa",
    "Pago internet Hogar",
    "Futbol",
    "Gym",
    "Deporte",
    "Suscripciones",
    "Otros",
  ],
  saving: ["Fondo emergencia", "Ahorro empresa", "Ahorro deportes", "Ahorro hogar", "Ahorro varios"],
  savingWithdrawal: ["Fondo emergencia", "Ahorro empresa", "Ahorro deportes", "Ahorro hogar", "Ahorro varios"],
};

const SAVING_FUNDS = DESCRIPTION_OPTIONS.saving;
const PAYMENT_METHOD_OPTIONS = {
  income: [
    { value: "cash", label: "Efectivo" },
    { value: "debit", label: "Debito" },
  ],
  expense: [
    { value: "cash", label: "Efectivo" },
    { value: "debit", label: "Debito" },
    { value: "transfer", label: "Transferencia" },
    { value: "credit", label: "Tarjeta de credito" },
  ],
};

const form = document.querySelector("#transactionForm");
const typeInput = document.querySelector("#typeInput");
const descriptionInput = document.querySelector("#descriptionInput");
const amountInput = document.querySelector("#amountInput");
const categoryField = document.querySelector("#categoryField");
const categoryInput = document.querySelector("#categoryInput");
const paymentMethodField = document.querySelector("#paymentMethodField");
const paymentMethodInput = document.querySelector("#paymentMethodInput");
const installmentsField = document.querySelector("#installmentsField");
const installmentsInput = document.querySelector("#installmentsInput");
const creditCardField = document.querySelector("#creditCardField");
const creditCardInput = document.querySelector("#creditCardInput");
const installmentAmountField = document.querySelector("#installmentAmountField");
const installmentAmountInput = document.querySelector("#installmentAmountInput");
const dateInput = document.querySelector("#dateInput");
const filterInput = document.querySelector("#filterInput");
const filterMonthInput = document.querySelector("#filterMonthInput");
const filterYearInput = document.querySelector("#filterYearInput");
const filterDescriptionInput = document.querySelector("#filterDescriptionInput");
const filterCategoryInput = document.querySelector("#filterCategoryInput");
const resetFiltersButton = document.querySelector("#resetFiltersButton");
const monthlyExpenseChart = document.querySelector("#monthlyExpenseChart");
const monthlyAverageLabel = document.querySelector("#monthlyAverageLabel");
const goalsForm = document.querySelector("#goalsForm");
const goalMonthInput = document.querySelector("#goalMonthInput");
const goalYearInput = document.querySelector("#goalYearInput");
const savingGoalInput = document.querySelector("#savingGoalInput");
const expenseLimitInput = document.querySelector("#expenseLimitInput");
const savingGoalActual = document.querySelector("#savingGoalActual");
const expenseGoalActual = document.querySelector("#expenseGoalActual");
const savingGoalRemaining = document.querySelector("#savingGoalRemaining");
const expenseGoalMargin = document.querySelector("#expenseGoalMargin");
const savingGoalLabel = document.querySelector("#savingGoalLabel");
const savingGoalStatus = document.querySelector("#savingGoalStatus");
const savingGoalBar = document.querySelector("#savingGoalBar");
const expenseGoalLabel = document.querySelector("#expenseGoalLabel");
const expenseGoalStatus = document.querySelector("#expenseGoalStatus");
const expenseGoalBar = document.querySelector("#expenseGoalBar");
const savingsFundsGrid = document.querySelector("#savingsFundsGrid");
const tableBody = document.querySelector("#transactionTable");
const rowTemplate = document.querySelector("#transactionRowTemplate");
const creditTable = document.querySelector("#creditTable");
const creditRowTemplate = document.querySelector("#creditRowTemplate");
const creditCardsTable = document.querySelector("#creditCardsTable");
const creditPaymentTable = document.querySelector("#creditPaymentTable");
const creditPaymentRowTemplate = document.querySelector("#creditPaymentRowTemplate");
const emptyState = document.querySelector("#emptyState");
const creditEmptyState = document.querySelector("#creditEmptyState");
const creditPaymentEmptyState = document.querySelector("#creditPaymentEmptyState");
const incomeTotal = document.querySelector("#incomeTotal");
const expenseTotal = document.querySelector("#expenseTotal");
const savingTotal = document.querySelector("#savingTotal");
const balanceTotal = document.querySelector("#balanceTotal");
const usageLabel = document.querySelector("#usageLabel");
const usageBar = document.querySelector("#usageBar");
const clearDataButton = document.querySelector("#clearDataButton");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const userStatus = document.querySelector("#userStatus");
const syncStatus = document.querySelector("#syncStatus");
const authForm = document.querySelector("#authForm");
const authEmailInput = document.querySelector("#authEmailInput");
const authPasswordInput = document.querySelector("#authPasswordInput");
const loginButton = document.querySelector("#loginButton");
const signupButton = document.querySelector("#signupButton");
const logoutButton = document.querySelector("#logoutButton");
const creditCardForm = document.querySelector("#creditCardForm");
const cardNameInput = document.querySelector("#cardNameInput");
const cardLimitInput = document.querySelector("#cardLimitInput");
const billingDayInput = document.querySelector("#billingDayInput");
const paymentDayInput = document.querySelector("#paymentDayInput");
const cardLimitTotal = document.querySelector("#cardLimitTotal");
const cardUsedTotal = document.querySelector("#cardUsedTotal");
const cardAvailableTotal = document.querySelector("#cardAvailableTotal");
const cardMonthlyTotal = document.querySelector("#cardMonthlyTotal");
const cardStatusLabel = document.querySelector("#cardStatusLabel");
const cardUsageLabel = document.querySelector("#cardUsageLabel");
const cardUsageBar = document.querySelector("#cardUsageBar");
const creditPaymentForm = document.querySelector("#creditPaymentForm");
const creditPaymentCardInput = document.querySelector("#creditPaymentCardInput");
const creditPaymentAmountInput = document.querySelector("#creditPaymentAmountInput");
const creditPaymentDateInput = document.querySelector("#creditPaymentDateInput");
const creditPaymentNoteInput = document.querySelector("#creditPaymentNoteInput");

let transactions = loadTransactions();
let creditCards = loadCreditCards();
let cardPayments = loadCardPayments();
let monthlyGoals = loadMonthlyGoals();
let supabaseClient = createSupabaseClient();
let currentUser = null;
let cloudSaveTimer = null;
let isLoadingCloudState = false;

dateInput.valueAsDate = new Date();
creditPaymentDateInput.valueAsDate = new Date();
hydrateGoalsPeriod();
hydrateGoalsForm();
populateDescriptionOptions(typeInput.value);
populatePaymentMethodOptions(typeInput.value);
renderCreditCardOptions();
togglePaymentControls();
render();
initializeCloudSync();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const installments = getInstallmentsValue();
  const installmentAmount = getInstallmentAmountValue();
  const enteredAmount = Number(amountInput.value);
  const amount = isCreditExpense() && installmentAmount > 0 ? installments * installmentAmount : enteredAmount;
  const transaction = {
    id: createId(),
    type: typeInput.value,
    description: descriptionInput.value.trim(),
    amount,
    originalAmount: enteredAmount,
    category: typeInput.value === "expense" ? categoryInput.value.trim() : "Sin categoria",
    paymentMethod: typeInput.value === "income" || typeInput.value === "expense" ? paymentMethodInput.value : "none",
    cardId: isCreditExpense() ? creditCardInput.value : null,
    installments,
    installmentAmount: isCreditExpense() ? installmentAmount : null,
    date: dateInput.value,
  };

  if (!transaction.description || !transaction.category || transaction.amount <= 0 || !transaction.date) {
    return;
  }

  if (isCreditExpense() && (!transaction.cardId || transaction.installmentAmount <= 0)) {
    return;
  }

  transactions = [transaction, ...transactions];
  saveTransactions();
  form.reset();
  dateInput.valueAsDate = new Date();
  typeInput.value = "expense";
  populateDescriptionOptions(typeInput.value);
  populatePaymentMethodOptions(typeInput.value);
  categoryInput.value = "";
  paymentMethodInput.value = "cash";
  installmentsInput.value = "1";
  installmentAmountInput.value = "";
  togglePaymentControls();
  descriptionInput.focus();
  render();
});

typeInput.addEventListener("change", () => {
  populateDescriptionOptions(typeInput.value);
  populatePaymentMethodOptions(typeInput.value);
  togglePaymentControls();
});
paymentMethodInput.addEventListener("change", togglePaymentControls);
filterInput.addEventListener("change", render);
filterMonthInput.addEventListener("change", render);
filterYearInput.addEventListener("change", render);
filterDescriptionInput.addEventListener("change", render);
filterCategoryInput.addEventListener("change", render);
resetFiltersButton.addEventListener("click", () => {
  filterInput.value = "all";
  filterMonthInput.value = "all";
  filterYearInput.value = "all";
  filterDescriptionInput.value = "all";
  filterCategoryInput.value = "all";
  render();
});

loginButton.addEventListener("click", () => {
  signInWithSupabase();
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  signInWithSupabase();
});

signupButton.addEventListener("click", () => {
  signUpWithSupabase();
});

logoutButton.addEventListener("click", () => {
  signOutFromSupabase();
});

goalsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  monthlyGoals[getGoalKey()] = {
    savingGoalPercent: Number(savingGoalInput.value) || 0,
    expenseLimitPercent: Number(expenseLimitInput.value) || 0,
  };

  saveMonthlyGoals();
  render();
});

goalMonthInput.addEventListener("change", () => {
  hydrateGoalsForm();
  render();
});

goalYearInput.addEventListener("change", () => {
  hydrateGoalsForm();
  render();
});

creditCardForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const card = {
    id: createId(),
    name: cardNameInput.value.trim(),
    limit: Number(cardLimitInput.value) || 0,
    billingDay: Number(billingDayInput.value) || "",
    paymentDay: Number(paymentDayInput.value) || "",
  };

  if (!card.name || card.limit <= 0) {
    return;
  }

  creditCards = [...creditCards, card];
  saveCreditCards();
  creditCardForm.reset();
  renderCreditCardOptions();
  render();
});

creditPaymentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const payment = {
    id: createId(),
    cardId: creditPaymentCardInput.value,
    amount: Number(creditPaymentAmountInput.value),
    date: creditPaymentDateInput.value,
    note: creditPaymentNoteInput.value.trim() || "Pago credito",
  };

  if (!payment.cardId || payment.amount <= 0 || !payment.date) {
    return;
  }

  cardPayments = [payment, ...cardPayments];
  saveCardPayments();
  creditPaymentForm.reset();
  creditPaymentDateInput.valueAsDate = new Date();
  render();
});

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='delete']");
  if (!button) return;

  transactions = transactions.filter((transaction) => transaction.id !== button.dataset.id);
  saveTransactions();
  render();
});

creditPaymentTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='delete-card-payment']");
  if (!button) return;

  cardPayments = cardPayments.filter((payment) => payment.id !== button.dataset.id);
  saveCardPayments();
  render();
});

creditCardsTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='delete-card']");
  if (!button) return;

  const cardId = button.dataset.id;
  const hasTransactions = transactions.some((transaction) => getTransactionCardId(transaction) === cardId);
  const hasPayments = cardPayments.some((payment) => getPaymentCardId(payment) === cardId);

  if (hasTransactions || hasPayments) {
    alert("No puedes eliminar una tarjeta que ya tiene compras o pagos registrados.");
    return;
  }

  const shouldDelete = confirm("Quieres eliminar esta tarjeta?");
  if (!shouldDelete) return;

  creditCards = creditCards.filter((card) => card.id !== cardId);
  saveCreditCards();
  renderCreditCardOptions();
  render();
});

clearDataButton.addEventListener("click", () => {
  if (!transactions.length && !cardPayments.length) return;

  const shouldClear = confirm("Quieres borrar todos los movimientos y pagos guardados?");
  if (!shouldClear) return;

  transactions = [];
  cardPayments = [];
  saveTransactions();
  saveCardPayments();
  render();
});

function render() {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      if (accumulator[transaction.type] !== undefined) {
        accumulator[transaction.type] += transaction.amount;
      }

      return accumulator;
    },
    { income: 0, expense: 0, saving: 0, savingWithdrawal: 0 },
  );

  const netSavings = totals.saving - totals.savingWithdrawal;
  const balance = totals.income - totals.expense - totals.saving + totals.savingWithdrawal;
  const usage = totals.income > 0 ? Math.min((totals.expense / totals.income) * 100, 100) : 0;

  incomeTotal.textContent = formatter.format(totals.income);
  expenseTotal.textContent = formatter.format(totals.expense);
  savingTotal.textContent = formatter.format(netSavings);
  balanceTotal.textContent = formatter.format(balance);
  usageLabel.textContent = `${Math.round(usage)}%`;
  usageBar.style.width = `${usage}%`;
  usageBar.style.backgroundColor = usage > 85 ? "var(--expense)" : "var(--accent)";

  renderTable();
  renderGoals();
  renderSavingsFunds();
  renderCreditCard();
  renderMonthlyExpenseChart();
}

function renderTable() {
  const visibleTransactions = getFilteredTransactions().sort((a, b) => b.date.localeCompare(a.date));

  tableBody.replaceChildren();
  emptyState.classList.toggle("visible", visibleTransactions.length === 0);

  visibleTransactions.forEach((transaction) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    const typeLabel = getTypeLabel(transaction.type);
    const sign = transaction.type === "income" || transaction.type === "savingWithdrawal" ? "+" : "-";

    row.querySelector("[data-cell='date']").textContent = formatDate(transaction.date);
    row.querySelector("[data-cell='description']").textContent = transaction.description;
    row.querySelector("[data-cell='category']").textContent = transaction.category;
    row.querySelector("[data-cell='paymentMethod']").textContent = getPaymentMethodLabel(transaction.paymentMethod);

    const badge = row.querySelector("[data-cell='type']");
    badge.textContent = typeLabel;
    badge.className = `badge ${transaction.type}`;

    const amountCell = row.querySelector("[data-cell='amount']");
    amountCell.textContent = `${sign} ${formatter.format(transaction.amount)}`;
    amountCell.className = transaction.type === "income" ? "amount-income" : `amount-${transaction.type}`;

    row.querySelector("[data-action='delete']").dataset.id = transaction.id;
    tableBody.append(row);
  });
}

function renderGoals() {
  const goal = getCurrentGoal();
  const monthTransactions = transactions.filter((transaction) => getMonthKey(transaction.date) === getGoalKey());
  const totals = monthTransactions.reduce(
    (accumulator, transaction) => {
      if (accumulator[transaction.type] !== undefined) {
        accumulator[transaction.type] += transaction.amount;
      }

      return accumulator;
    },
    { income: 0, expense: 0, saving: 0, savingWithdrawal: 0 },
  );
  const netSavings = totals.saving - totals.savingWithdrawal;
  const savingPercent = totals.income > 0 ? (netSavings / totals.income) * 100 : 0;
  const expensePercent = totals.income > 0 ? (totals.expense / totals.income) * 100 : 0;
  const savingTarget = totals.income * (goal.savingGoalPercent / 100);
  const expenseLimit = totals.income * (goal.expenseLimitPercent / 100);
  const savingMissing = Math.max(savingTarget - netSavings, 0);
  const expenseMargin = Math.max(expenseLimit - totals.expense, 0);
  const savingProgress = goal.savingGoalPercent > 0 ? Math.min((savingPercent / goal.savingGoalPercent) * 100, 100) : 0;
  const expenseProgress = goal.expenseLimitPercent > 0 ? Math.min((expensePercent / goal.expenseLimitPercent) * 100, 100) : 0;

  savingGoalActual.textContent = `${Math.round(savingPercent)}%`;
  expenseGoalActual.textContent = `${Math.round(expensePercent)}%`;
  savingGoalRemaining.textContent = formatter.format(savingMissing);
  expenseGoalMargin.textContent = formatter.format(expenseMargin);
  savingGoalLabel.textContent = `Ahorro ${Math.round(savingPercent)}% / meta ${goal.savingGoalPercent}%`;
  savingGoalStatus.textContent = `${Math.round(savingProgress)}%`;
  savingGoalBar.style.width = `${savingProgress}%`;
  savingGoalBar.style.backgroundColor = savingPercent >= goal.savingGoalPercent && goal.savingGoalPercent > 0 ? "var(--income)" : "var(--saving)";
  expenseGoalLabel.textContent = `Gasto ${Math.round(expensePercent)}% / limite ${goal.expenseLimitPercent}%`;
  expenseGoalStatus.textContent = `${Math.round(expenseProgress)}%`;
  expenseGoalBar.style.width = `${expenseProgress}%`;
  expenseGoalBar.style.backgroundColor = expensePercent > goal.expenseLimitPercent && goal.expenseLimitPercent > 0 ? "var(--expense)" : "var(--accent)";
}

function renderSavingsFunds() {
  savingsFundsGrid.replaceChildren();

  SAVING_FUNDS.forEach((fund) => {
    const saved = transactions
      .filter((transaction) => transaction.type === "saving" && transaction.description === fund)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const withdrawn = transactions
      .filter((transaction) => transaction.type === "savingWithdrawal" && transaction.description === fund)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const balance = saved - withdrawn;
    const card = document.createElement("article");

    card.className = "summary-card saving";
    card.innerHTML = `<span>${fund}</span><strong>${formatter.format(balance)}</strong>`;
    savingsFundsGrid.append(card);
  });
}

function renderCreditCard() {
  const cardMetrics = creditCards.map((card) => getCardMetrics(card.id));
  const totalLimit = cardMetrics.reduce((sum, metric) => sum + metric.limit, 0);
  const cardUsed = cardMetrics.reduce((sum, metric) => sum + metric.used, 0);
  const available = Math.max(totalLimit - cardUsed, 0);
  const currentMonthPending = cardMetrics.reduce((sum, metric) => sum + metric.monthlyPending, 0);
  const usage = totalLimit > 0 ? Math.min((cardUsed / totalLimit) * 100, 100) : 0;
  const creditTransactions = transactions
    .filter((transaction) => transaction.type === "expense" && transaction.paymentMethod === "credit")
    .sort((a, b) => b.date.localeCompare(a.date));

  cardLimitTotal.textContent = formatter.format(totalLimit);
  cardUsedTotal.textContent = formatter.format(cardUsed);
  cardAvailableTotal.textContent = formatter.format(available);
  cardMonthlyTotal.textContent = formatter.format(currentMonthPending);
  cardStatusLabel.textContent = creditCards.length ? "Uso de cupo total" : "Agrega una tarjeta";
  cardUsageLabel.textContent = `${Math.round(usage)}%`;
  cardUsageBar.style.width = `${usage}%`;
  cardUsageBar.style.backgroundColor = usage > 85 ? "var(--expense)" : "var(--accent)";

  renderCreditCardsTable(cardMetrics);

  creditTable.replaceChildren();
  creditEmptyState.classList.toggle("visible", creditTransactions.length === 0);

  creditTransactions.forEach((transaction) => {
    const row = creditRowTemplate.content.firstElementChild.cloneNode(true);

    row.querySelector("[data-cell='date']").textContent = formatDate(transaction.date);
    row.querySelector("[data-cell='description']").textContent = transaction.description;
    row.querySelector("[data-cell='card']").textContent = getCardName(getTransactionCardId(transaction));
    row.querySelector("[data-cell='category']").textContent = transaction.category;
    row.querySelector("[data-cell='installments']").textContent = formatInstallments(transaction);

    const amountCell = row.querySelector("[data-cell='amount']");
    amountCell.textContent = formatter.format(getCreditTransactionAmount(transaction));
    amountCell.className = "amount-expense";

    creditTable.append(row);
  });

  renderCreditPayments();
}

function renderCreditCardsTable(cardMetrics) {
  creditCardsTable.replaceChildren();

  cardMetrics.forEach((metric) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const meta = document.createElement("span");

    nameCell.append(metric.name, document.createElement("br"));
    meta.className = "muted-cell";
    meta.textContent = `factura dia ${metric.billingDay || "-"} - pago dia ${metric.paymentDay || "-"}`;
    nameCell.append(meta);
    const actionsCell = createTableCell("");
    const deleteButton = document.createElement("button");

    deleteButton.className = "icon-button";
    deleteButton.type = "button";
    deleteButton.title = "Eliminar tarjeta";
    deleteButton.dataset.action = "delete-card";
    deleteButton.dataset.id = metric.id;
    deleteButton.innerHTML = "&times;";
    actionsCell.append(deleteButton);
    row.append(
      nameCell,
      createTableCell(formatter.format(metric.limit)),
      createTableCell(formatter.format(metric.used), "amount-expense"),
      createTableCell(formatter.format(metric.available), "amount-income"),
      createTableCell(formatter.format(metric.monthlyPending)),
      actionsCell,
    );
    creditCardsTable.append(row);
  });
}

function renderCreditPayments() {
  const visiblePayments = [...cardPayments].sort((a, b) => b.date.localeCompare(a.date));

  creditPaymentTable.replaceChildren();
  creditPaymentEmptyState.classList.toggle("visible", visiblePayments.length === 0);

  visiblePayments.forEach((payment) => {
    const row = creditPaymentRowTemplate.content.firstElementChild.cloneNode(true);

    row.querySelector("[data-cell='date']").textContent = formatDate(payment.date);
    row.querySelector("[data-cell='note']").textContent = payment.note;
    row.querySelector("[data-cell='card']").textContent = getCardName(getPaymentCardId(payment));

    const amountCell = row.querySelector("[data-cell='amount']");
    amountCell.textContent = formatter.format(payment.amount);
    amountCell.className = "amount-income";

    row.querySelector("[data-action='delete-card-payment']").dataset.id = payment.id;
    creditPaymentTable.append(row);
  });
}

function renderMonthlyExpenseChart() {
  const context = monthlyExpenseChart.getContext("2d");
  const months = getRecentMonths(6);
  const values = months.map((month) => {
    return transactions
      .filter((transaction) => transaction.type === "expense" && getMonthKey(transaction.date) === month.key)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  });
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const maxValue = Math.max(...values, average, 1);
  const ratio = window.devicePixelRatio || 1;
  const width = monthlyExpenseChart.clientWidth || 640;
  const height = 220;

  monthlyExpenseChart.width = width * ratio;
  monthlyExpenseChart.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = { top: 22, right: 18, bottom: 42, left: 58 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGap = 12;
  const barWidth = Math.max((chartWidth - barGap * (months.length - 1)) / months.length, 18);
  const averageY = padding.top + chartHeight - (average / maxValue) * chartHeight;

  context.strokeStyle = "#dce4dc";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, padding.top);
  context.lineTo(padding.left, padding.top + chartHeight);
  context.lineTo(width - padding.right, padding.top + chartHeight);
  context.stroke();

  context.strokeStyle = "#8a5b12";
  context.setLineDash([6, 5]);
  context.beginPath();
  context.moveTo(padding.left, averageY);
  context.lineTo(width - padding.right, averageY);
  context.stroke();
  context.setLineDash([]);

  context.font = "700 12px Segoe UI, Arial";
  context.fillStyle = "#627064";
  context.fillText("Prom.", 10, averageY + 4);

  const trendPoints = getTrendPoints(values);
  context.strokeStyle = "#147a5c";
  context.lineWidth = 2;
  context.beginPath();
  trendPoints.forEach((value, index) => {
    const x = padding.left + index * (barWidth + barGap) + barWidth / 2;
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();

  values.forEach((value, index) => {
    const x = padding.left + index * (barWidth + barGap);
    const barHeight = (value / maxValue) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    const isCurrentMonth = months[index].key === getMonthKey(new Date().toISOString().slice(0, 10));

    context.fillStyle = isCurrentMonth ? "#b64242" : "#285e8f";
    context.fillRect(x, y, barWidth, barHeight || 2);

    context.fillStyle = "#17211b";
    context.textAlign = "center";
    context.fillText(months[index].label, x + barWidth / 2, height - 18);
  });

  context.textAlign = "left";
  monthlyAverageLabel.textContent = `${formatter.format(average)} promedio`;
}

function createSupabaseClient() {
  const config = window.CONTROL_GASTOS_SUPABASE ?? {};
  const hasConfig = config.url && config.anonKey && !config.url.includes("TU-PROYECTO");

  if (!hasConfig || !window.supabase) {
    return null;
  }

  return window.supabase.createClient(config.url, config.anonKey);
}

async function initializeCloudSync() {
  if (!supabaseClient) {
    updateSyncStatus("Modo local: configura Supabase para sincronizar.");
    updateAuthUi();
    return;
  }

  updateSyncStatus("Supabase configurado. Inicia sesion para sincronizar.");

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    updateSyncStatus(`Error de sesion: ${error.message}`);
    return;
  }

  currentUser = data.session?.user ?? null;
  updateAuthUi();

  if (currentUser) {
    await loadCloudState();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user ?? null;
    updateAuthUi();

    if (currentUser) {
      await loadCloudState();
    } else {
      updateSyncStatus("Sesion cerrada. Inicia sesion para abrir la app.");
    }
  });
}

async function signInWithSupabase() {
  if (!ensureSupabaseReady()) return;

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (!email || !password) {
    updateSyncStatus("Ingresa email y password.");
    return;
  }

  updateSyncStatus("Iniciando sesion...");
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    updateSyncStatus(`No se pudo iniciar sesion: ${error.message}`);
  }
}

async function signUpWithSupabase() {
  if (!ensureSupabaseReady()) return;

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (!email || !password) {
    updateSyncStatus("Ingresa email y password.");
    return;
  }

  updateSyncStatus("Creando cuenta...");
  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    updateSyncStatus(`No se pudo crear la cuenta: ${error.message}`);
    return;
  }

  updateSyncStatus("Cuenta creada. Si Supabase pide confirmacion, revisa tu email.");
}

async function signOutFromSupabase() {
  if (!supabaseClient) return;

  await supabaseClient.auth.signOut();
}

function ensureSupabaseReady() {
  if (supabaseClient) {
    return true;
  }

  updateSyncStatus("Falta configurar Supabase en supabase-config.js.");
  return false;
}

function updateAuthUi() {
  const isConfigured = Boolean(supabaseClient);
  const isLoggedIn = Boolean(currentUser);
  const shouldRequireLogin = isConfigured;

  authEmailInput.disabled = !isConfigured || isLoggedIn;
  authPasswordInput.disabled = !isConfigured || isLoggedIn;
  loginButton.disabled = !isConfigured || isLoggedIn;
  signupButton.disabled = !isConfigured || isLoggedIn;
  logoutButton.disabled = !isConfigured || !isLoggedIn;
  authScreen.classList.toggle("is-hidden", !shouldRequireLogin || isLoggedIn);
  appShell.classList.toggle("is-hidden", shouldRequireLogin && !isLoggedIn);
  userStatus.textContent = isLoggedIn ? `Cuenta: ${currentUser.email ?? ""}` : "Sesion local";

  if (isLoggedIn) {
    authEmailInput.value = currentUser.email ?? "";
    authPasswordInput.value = "";
  }
}

function updateSyncStatus(message) {
  syncStatus.textContent = message;
  if (!appShell.classList.contains("is-hidden")) {
    userStatus.textContent = message;
  }
}

async function loadCloudState() {
  if (!currentUser || !supabaseClient) return;

  isLoadingCloudState = true;
  updateSyncStatus("Cargando datos desde Supabase...");

  const { data, error } = await supabaseClient
    .from("app_state")
    .select("data")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    updateSyncStatus(`Error al cargar nube: ${error.message}`);
    isLoadingCloudState = false;
    return;
  }

  if (data?.data) {
    applyAppState(data.data);
    saveAllLocal();
    renderCreditCardOptions();
    hydrateGoalsForm();
    togglePaymentControls();
    render();
    updateSyncStatus(`Sincronizado como ${currentUser.email}`);
  } else {
    await saveCloudState();
    updateSyncStatus(`Datos locales subidos a Supabase para ${currentUser.email}`);
  }

  isLoadingCloudState = false;
}

function queueCloudSave() {
  if (!currentUser || !supabaseClient || isLoadingCloudState) return;

  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveCloudState();
  }, CLOUD_SAVE_DELAY);
}

async function saveCloudState() {
  if (!currentUser || !supabaseClient) return;

  const { error } = await supabaseClient.from("app_state").upsert({
    user_id: currentUser.id,
    data: getAppState(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    updateSyncStatus(`Error al guardar nube: ${error.message}`);
    return;
  }

  updateSyncStatus(`Sincronizado como ${currentUser.email}`);
}

function getAppState() {
  return {
    transactions,
    creditCards,
    cardPayments,
    monthlyGoals,
  };
}

function applyAppState(state) {
  transactions = Array.isArray(state.transactions) ? state.transactions : [];
  creditCards = Array.isArray(state.creditCards) ? state.creditCards : [];
  cardPayments = Array.isArray(state.cardPayments) ? state.cardPayments : [];
  monthlyGoals = state.monthlyGoals && typeof state.monthlyGoals === "object" ? state.monthlyGoals : {};
}

function saveAllLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(CREDIT_CARDS_KEY, JSON.stringify(creditCards));
  localStorage.setItem(CARD_PAYMENTS_KEY, JSON.stringify(cardPayments));
  localStorage.setItem(GOALS_KEY, JSON.stringify(monthlyGoals));
}

function getTypeLabel(type) {
  const labels = {
    income: "Ingreso",
    expense: "Gasto",
    saving: "Ahorro",
    savingWithdrawal: "Retiro de ahorro",
  };

  return labels[type] ?? "Movimiento";
}

function getPaymentMethodLabel(paymentMethod) {
  const labels = {
    none: "Sin metodo",
    cash: "Efectivo",
    debit: "Debito",
    transfer: "Transferencia",
    credit: "Tarjeta de credito",
  };

  return labels[paymentMethod] ?? "Sin metodo";
}

function createTableCell(text, className = "") {
  const cell = document.createElement("td");

  cell.textContent = text;
  if (className) {
    cell.className = className;
  }

  return cell;
}

function renderCreditCardOptions() {
  const selectedPurchaseCard = creditCardInput.value;
  const selectedPaymentCard = creditPaymentCardInput.value;

  creditCardInput.replaceChildren();
  creditPaymentCardInput.replaceChildren();

  if (!creditCards.length) {
    creditCardInput.append(new Option("Agrega una tarjeta", ""));
    creditPaymentCardInput.append(new Option("Agrega una tarjeta", ""));
    creditPaymentCardInput.disabled = true;
    return;
  }

  creditPaymentCardInput.disabled = false;

  creditCards.forEach((card) => {
    creditCardInput.append(new Option(card.name, card.id));
    creditPaymentCardInput.append(new Option(card.name, card.id));
  });

  if (selectedPurchaseCard && creditCards.some((card) => card.id === selectedPurchaseCard)) {
    creditCardInput.value = selectedPurchaseCard;
  }

  if (selectedPaymentCard && creditCards.some((card) => card.id === selectedPaymentCard)) {
    creditPaymentCardInput.value = selectedPaymentCard;
  }
}

function getCardMetrics(cardId) {
  const card = getCardById(cardId);
  const cardTransactions = transactions.filter((transaction) => {
    return transaction.type === "expense" && transaction.paymentMethod === "credit" && getTransactionCardId(transaction) === cardId;
  });
  const cardPaymentItems = cardPayments.filter((payment) => getPaymentCardId(payment) === cardId);
  const outstandingPurchases = cardTransactions.reduce((sum, transaction) => sum + getOutstandingAmount(transaction, new Date()), 0);
  const totalPayments = cardPaymentItems.reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonthPayments = cardPaymentItems.reduce((sum, payment) => {
    return isSameMonth(payment.date, new Date()) ? sum + payment.amount : sum;
  }, 0);
  const currentMonthPayment = cardTransactions.reduce(
    (sum, transaction) => sum + getMonthlyInstallmentAmount(transaction, new Date()),
    0,
  );
  const used = Math.max(outstandingPurchases - totalPayments, 0);

  return {
    id: cardId,
    name: card?.name ?? "Sin tarjeta",
    limit: Number(card?.limit) || 0,
    billingDay: card?.billingDay ?? "",
    paymentDay: card?.paymentDay ?? "",
    used,
    available: Math.max((Number(card?.limit) || 0) - used, 0),
    monthlyPending: Math.max(currentMonthPayment - currentMonthPayments, 0),
  };
}

function getTransactionCardId(transaction) {
  return transaction.cardId || getDefaultCardId();
}

function getPaymentCardId(payment) {
  return payment.cardId || getDefaultCardId();
}

function getDefaultCardId() {
  return creditCards[0]?.id ?? "";
}

function getCardById(cardId) {
  return creditCards.find((card) => card.id === cardId);
}

function getCardName(cardId) {
  return getCardById(cardId)?.name ?? "Sin tarjeta";
}

function populateDescriptionOptions(type, selectedValue = "") {
  const options = DESCRIPTION_OPTIONS[type] ?? [];

  descriptionInput.replaceChildren();
  descriptionInput.append(new Option("Selecciona descripcion", ""));

  options.forEach((option) => {
    descriptionInput.append(new Option(option, option));
  });

  if (selectedValue && options.includes(selectedValue)) {
    descriptionInput.value = selectedValue;
  }
}

function populatePaymentMethodOptions(type, selectedValue = "") {
  const options = PAYMENT_METHOD_OPTIONS[type] ?? [];

  paymentMethodInput.replaceChildren();

  if (!options.length) {
    paymentMethodInput.append(new Option("Sin metodo", "none"));
    paymentMethodInput.value = "none";
    return;
  }

  options.forEach((option) => {
    paymentMethodInput.append(new Option(option.label, option.value));
  });

  if (selectedValue && options.some((option) => option.value === selectedValue)) {
    paymentMethodInput.value = selectedValue;
  }
}

function getFilteredTransactions() {
  const selectedFilter = filterInput.value;
  const selectedMonth = filterMonthInput.value;
  const selectedYear = filterYearInput.value;
  const selectedDescription = filterDescriptionInput.value;
  const selectedCategory = filterCategoryInput.value;

  return transactions.filter((transaction) => {
    const [transactionYear, transactionMonth] = transaction.date.split("-");
    const matchesType = selectedFilter === "all" || transaction.type === selectedFilter;
    const matchesMonth = selectedMonth === "all" || transactionMonth === selectedMonth;
    const matchesYear = selectedYear === "all" || transactionYear === selectedYear;
    const matchesDescription = selectedDescription === "all" || transaction.description === selectedDescription;
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;

    return matchesType && matchesMonth && matchesYear && matchesDescription && matchesCategory;
  });
}

function getCurrentGoal() {
  return monthlyGoals[getGoalKey()] ?? {
    savingGoalPercent: 20,
    expenseLimitPercent: 70,
  };
}

function getGoalKey() {
  return `${goalYearInput.value}-${goalMonthInput.value}`;
}

function hydrateGoalsPeriod() {
  const today = new Date();

  goalMonthInput.value = String(today.getMonth() + 1).padStart(2, "0");
  goalYearInput.value = String(Math.max(today.getFullYear(), 2026));
}

function hydrateGoalsForm() {
  const goal = getCurrentGoal();

  savingGoalInput.value = goal.savingGoalPercent || "";
  expenseLimitInput.value = goal.expenseLimitPercent || "";
}

function getInstallmentsValue() {
  if (!isCreditExpense()) {
    return 1;
  }

  return Math.max(Number(installmentsInput.value) || 1, 1);
}

function getInstallmentAmountValue() {
  if (!isCreditExpense()) {
    return 0;
  }

  return Math.max(Number(installmentAmountInput.value) || 0, 0);
}

function isCreditExpense() {
  return typeInput.value === "expense" && paymentMethodInput.value === "credit";
}

function toggleInstallmentsField() {
  const shouldShow = isCreditExpense();
  installmentsField.classList.toggle("visible", shouldShow);
  creditCardField.classList.toggle("visible", shouldShow);
  installmentAmountField.classList.toggle("visible", shouldShow);
  installmentsInput.required = shouldShow;
  creditCardInput.required = shouldShow;
  creditCardInput.disabled = !shouldShow;
  installmentAmountInput.required = shouldShow;
}

function togglePaymentControls() {
  const shouldShowPaymentMethod = typeInput.value === "income" || typeInput.value === "expense";
  const shouldShowCategory = typeInput.value === "expense";

  categoryField.classList.toggle("visible", shouldShowCategory);
  categoryInput.disabled = !shouldShowCategory;
  categoryInput.required = shouldShowCategory;
  paymentMethodField.classList.toggle("visible", shouldShowPaymentMethod);
  paymentMethodInput.disabled = !shouldShowPaymentMethod;
  paymentMethodInput.required = shouldShowPaymentMethod;

  if (!shouldShowPaymentMethod) {
    paymentMethodInput.value = "none";
  }

  toggleInstallmentsField();
}

function formatInstallments(transaction) {
  const count = Math.max(Number(transaction.installments) || 1, 1);
  const installmentAmount = Number(transaction.installmentAmount) || 0;

  if (installmentAmount > 0) {
    return `${count} x ${formatter.format(installmentAmount)}`;
  }

  return count === 1 ? "1 cuota" : `${count} cuotas`;
}

function getMonthlyInstallmentAmount(transaction, referenceDate) {
  const installments = Math.max(Number(transaction.installments) || 1, 1);
  const installmentAmount = getInstallmentAmount(transaction);
  const [year, month] = transaction.date.split("-").map(Number);
  const startIndex = year * 12 + month - 1;
  const referenceIndex = referenceDate.getFullYear() * 12 + referenceDate.getMonth();
  const elapsedMonths = referenceIndex - startIndex;

  if (elapsedMonths < 0 || elapsedMonths >= installments) {
    return 0;
  }

  return installmentAmount;
}

function getOutstandingAmount(transaction, referenceDate) {
  const installments = Math.max(Number(transaction.installments) || 1, 1);
  const installmentAmount = getInstallmentAmount(transaction);
  const [year, month] = transaction.date.split("-").map(Number);
  const startIndex = year * 12 + month - 1;
  const referenceIndex = referenceDate.getFullYear() * 12 + referenceDate.getMonth();
  const elapsedMonths = referenceIndex - startIndex;

  if (elapsedMonths >= installments) {
    return 0;
  }

  const remainingInstallments = installments - Math.max(elapsedMonths, 0);
  return installmentAmount * remainingInstallments;
}

function getInstallmentAmount(transaction) {
  const installments = Math.max(Number(transaction.installments) || 1, 1);
  const installmentAmount = Number(transaction.installmentAmount) || 0;

  if (installmentAmount > 0) {
    return installmentAmount;
  }

  return getCreditTransactionAmount(transaction) / installments;
}

function getCreditTransactionAmount(transaction) {
  const installments = Math.max(Number(transaction.installments) || 1, 1);
  const installmentAmount = Number(transaction.installmentAmount) || 0;

  if (installmentAmount > 0) {
    return installments * installmentAmount;
  }

  return transaction.amount;
}

function isSameMonth(dateValue, referenceDate) {
  return getMonthKey(dateValue) === `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthKey(dateValue) {
  return dateValue.slice(0, 7);
}

function getRecentMonths(count) {
  const months = [];
  const now = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-CL", { month: "short" }).format(date).replace(".", "");

    months.push({ key, label });
  }

  return months;
}

function getTrendPoints(values) {
  const count = values.length;
  const sumX = values.reduce((sum, _, index) => sum + index, 0);
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = values.reduce((sum, value, index) => sum + index * value, 0);
  const sumXX = values.reduce((sum, _, index) => sum + index * index, 0);
  const denominator = count * sumXX - sumX * sumX;

  if (!denominator) {
    return values;
  }

  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;

  return values.map((_, index) => Math.max(intercept + slope * index, 0));
}

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  queueCloudSave();
}

function loadCardPayments() {
  try {
    return JSON.parse(localStorage.getItem(CARD_PAYMENTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCardPayments() {
  localStorage.setItem(CARD_PAYMENTS_KEY, JSON.stringify(cardPayments));
  queueCloudSave();
}

function loadMonthlyGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveMonthlyGoals() {
  localStorage.setItem(GOALS_KEY, JSON.stringify(monthlyGoals));
  queueCloudSave();
}

function loadCreditCards() {
  try {
    const savedCards = JSON.parse(localStorage.getItem(CREDIT_CARDS_KEY));

    if (Array.isArray(savedCards)) {
      return savedCards;
    }

    const legacySettings = JSON.parse(localStorage.getItem(CARD_SETTINGS_KEY)) ?? {};

    if (legacySettings.name || Number(legacySettings.limit) > 0) {
      const migratedCards = [
        {
          id: createId(),
          name: legacySettings.name || "Tarjeta principal",
          limit: Number(legacySettings.limit) || 0,
          billingDay: legacySettings.billingDay ?? "",
          paymentDay: legacySettings.paymentDay ?? "",
        },
      ];

      localStorage.setItem(CREDIT_CARDS_KEY, JSON.stringify(migratedCards));
      return migratedCards;
    }

    return [];
  } catch {
    return [];
  }
}

function saveCreditCards() {
  localStorage.setItem(CREDIT_CARDS_KEY, JSON.stringify(creditCards));
  queueCloudSave();
}

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
