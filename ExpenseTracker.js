// Global date and filter variables
const today = new Date().toISOString().split("T")[0];
let filterType = 'all';
let periodFilter = 'all'; // 'all' | 'weekly' | 'monthly'

// Bank details
let bankName = 'My Bank';
let bankLimit = 4645;

// Financials
let monthlyIncome = 0;
let monthlyExpenses = 0;
window.bankBalance = 10000;       // ← initialized here, once, clearly
let backendIncomePool = 0;        // ← starts at 0, grows when income added

// Transactions array
let transactions = [];

// ─── BANK EDIT MODAL ────────────────────────────────────────────────────────

function openBankEditModal() {
  document.getElementById('editBankName').value = bankName;
  document.getElementById('editBankLimit').value = bankLimit;
  document.getElementById('bankEditModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function saveBankEdit() {
  const newName = document.getElementById('editBankName').value.trim();
  const newLimit = parseFloat(document.getElementById('editBankLimit').value);
  if (!newName || isNaN(newLimit) || newLimit < 0) {
    alert('Please enter valid bank name and limit.');
    return;
  }
  bankName = newName;
  bankLimit = newLimit;
  document.getElementById('bankNameTitle').textContent = bankName;
  document.getElementById('bankNameHolder').textContent = bankName;
  document.getElementById('bankLimit').textContent = `₹${bankLimit.toLocaleString()}`;
  closeModal('bankEditModal');
  showNotification('Bank details updated!', 'success');
}

// ─── MODAL FUNCTIONS ─────────────────────────────────────────────────────────

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';

  if (modalId === 'incomeModal') {
    document.getElementById('incomeForm').reset();
    document.getElementById('incomeDate').value = today;
  } else if (modalId === 'expenseModal') {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = today;
  } else if (modalId === 'bankEditModal') {
    document.getElementById('bankEditForm').reset();
  }
}

function openIncomeModal() {
  document.getElementById('incomeDate').value = today;
  document.getElementById('incomeModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
window.openIncomeModal = openIncomeModal;

function openExpenseModal() {
  document.getElementById('expenseDate').value = today;
  document.getElementById('expenseModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
window.openExpenseModal = openExpenseModal;

// Close modal when clicking outside
window.onclick = function (event) {
  ['incomeModal', 'expenseModal', 'filterModal', 'bankEditModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal && event.target === modal) closeModal(id);
  });
};

// ─── ADD INCOME ───────────────────────────────────────────────────────────────

function addIncome() {
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  const category = document.getElementById('incomeCategory').value;
  const description = document.getElementById('incomeDescription').value;
  const date = document.getElementById('incomeDate').value;

  if (!amount || !category || !date) {
    alert('Please fill in all required fields');
    return;
  }

  transactions.unshift({
    id: transactions.length + 1,
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: amount,
    status: 'Success',
    type: 'income',
    description: description,
  });

  backendIncomePool += amount;   // income goes into the pool first

  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();
  closeModal('incomeModal');
  showNotification('Income added successfully!', 'success');
}

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────

function addExpense() {
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const description = document.getElementById('expenseDescription').value;
  const date = document.getElementById('expenseDate').value;

  if (!amount || !category || !date) {
    alert('Please fill in all required fields');
    return;
  }

  // Spend from income pool first; overflow comes from bank savings
  if (backendIncomePool >= amount) {
    backendIncomePool -= amount;
  } else {
    const deductedFromBank = amount - backendIncomePool;
    backendIncomePool = 0;
    window.bankBalance = Math.max(0, window.bankBalance - deductedFromBank);
    showNotification(`₹${deductedFromBank.toLocaleString()} deducted from bank savings!`, 'success');
  }

  transactions.unshift({
    id: transactions.length + 1,
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: -amount,
    status: 'Success',
    type: 'expense',
    description: description,
  });

  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();
  closeModal('expenseModal');
  showNotification('Expense added successfully!', 'success');
}

// ─── RESET ────────────────────────────────────────────────────────────────────

function resetAllTransactions() {
  transactions.length = 0;
  window.bankBalance = 10000;
  backendIncomePool = 0;
  const incomeDate = document.getElementById('incomeDate');
  const expenseDate = document.getElementById('expenseDate');
  if (incomeDate) incomeDate.value = today;
  if (expenseDate) expenseDate.value = today;
  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();
  showNotification('All transactions reset. Bank savings set to ₹10,000.', 'success');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function getDateRange() {
  const now = new Date();
  if (periodFilter === 'weekly') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    return { from: weekStart, to: now };
  } else if (periodFilter === 'monthly') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: monthStart, to: now };
  }
  return null; // all time
}

function inRange(dateStr) {
  const range = getDateRange();
  if (!range) return true;
  const d = new Date(dateStr);
  return d >= range.from && d <= range.to;
}

// Always current-month (cards are labelled "Monthly" — never affected by period filter)
function recalculateMonthly() {
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  let income = 0, expenses = 0;
  transactions.forEach(tr => {
    const d = new Date(tr.date);
    if (d.getMonth() === cm && d.getFullYear() === cy) {
      if (tr.type === 'income') income += tr.amount;
      else expenses += Math.abs(tr.amount);
    }
  });
  return { income, expenses };
}

// Used for All-Expenses section & period-aware table (respects period filter)
function recalculateSummaries() {
  let income = 0, expenses = 0;
  transactions.forEach(tr => {
    if (!inRange(tr.date)) return;
    if (tr.type === 'income') income += tr.amount;
    else expenses += Math.abs(tr.amount);
  });
  return { income, expenses };
}

function updateDashboard() {
  // Cards: always current month
  const { income, expenses } = recalculateMonthly();
  const rupee = (amt) => `₹${Math.max(0, amt).toLocaleString()}`;

  document.querySelector('.income-amount').textContent = rupee(income);
  document.querySelector('.expense-amount').textContent = rupee(expenses);

  // Bank savings bar
  const percentage = Math.max(0, Math.min(100, (window.bankBalance / 10000) * 100));
  document.querySelector('.spending-limit').textContent = rupee(window.bankBalance);
  document.querySelector('.spending-used').textContent = `of ₹10,000 savings left`;
  document.querySelector('.progress-fill').style.width = `${percentage}%`;

  updateOverviewChart();
}

// ─── TRANSACTIONS TABLE ───────────────────────────────────────────────────────

let showMinimized = false;
let lastDeleted = null; // store last deleted transaction for undo

function deleteTransaction(id) {
  const idx = transactions.findIndex(tr => tr.id === id);
  if (idx === -1) return;

  const tr = transactions[idx];
  lastDeleted = { transaction: { ...tr }, index: idx };

  // Reverse the financial effect
  if (tr.type === 'income') {
    // Reverse: remove from income pool (or bank if pool is empty)
    if (backendIncomePool >= tr.amount) {
      backendIncomePool -= tr.amount;
    } else {
      const diff = tr.amount - backendIncomePool;
      backendIncomePool = 0;
      window.bankBalance = Math.min(10000, window.bankBalance + diff);
    }
  } else {
    // Reverse expense: refund back to income pool first, then bank if needed
    const expenseAmt = Math.abs(tr.amount);
    backendIncomePool += expenseAmt;
    // if bank was previously deducted, we can't perfectly know how much
    // so we just restore to income pool (safe approach)
  }

  transactions.splice(idx, 1);
  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();

  // Show undo notification
  showUndoNotification(`Transaction deleted.`);
}

function undoDelete() {
  if (!lastDeleted) return;
  const { transaction, index } = lastDeleted;

  // Re-apply financial effect
  if (transaction.type === 'income') {
    backendIncomePool += transaction.amount;
  } else {
    const expenseAmt = Math.abs(transaction.amount);
    if (backendIncomePool >= expenseAmt) {
      backendIncomePool -= expenseAmt;
    } else {
      const fromBank = expenseAmt - backendIncomePool;
      backendIncomePool = 0;
      window.bankBalance = Math.max(0, window.bankBalance - fromBank);
    }
  }

  transactions.splice(index, 0, transaction);
  lastDeleted = null;
  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();

  // Remove undo toast if still visible
  const toast = document.getElementById('undoToast');
  if (toast) toast.remove();
  showNotification('Transaction restored!', 'success');
}

function showUndoNotification(message) {
  // Remove existing undo toast
  const existing = document.getElementById('undoToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'undoToast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 0.85rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 1002;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    font-size: 0.9rem;
    animation: slideInRight 0.3s ease;
  `;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="undoDelete()" style="
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.35rem 0.85rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
    ">↩ Undo</button>
  `;
  document.body.appendChild(toast);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (document.getElementById('undoToast')) {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => { if (toast.parentNode) toast.remove(); lastDeleted = null; }, 300);
    }
  }, 5000);
}

function updateTransactionsTable() {
  updateOverviewChart();
  const tbody = document.querySelector('.transactions-table tbody');
  tbody.innerHTML = '';

  let filtered = transactions.filter(tr => {
    const typeOk = filterType === 'all' || tr.type.toLowerCase() === filterType.toLowerCase();
    const dateOk = inRange(tr.date);
    return typeOk && dateOk;
  });

  const maxRows = showMinimized ? 5 : 20;
  const toShow = filtered.slice(0, maxRows);

  // Update table title with count
  const tableTitle = document.querySelector('.transactions-section .card-title');
  if (tableTitle) {
    const rangeLabel = periodFilter === 'weekly' ? 'This Week' : periodFilter === 'monthly' ? 'This Month' : 'All Time';
    tableTitle.textContent = `Transactions (${filtered.length} — ${rangeLabel})`;
  }

  if (toShow.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5" style="text-align:center;color:#9ca3af;padding:2rem;">No transactions yet</td>`;
    tbody.appendChild(row);
    return;
  }

  toShow.forEach(transaction => {
    const row = document.createElement('tr');
    const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    const amountDisplay = transaction.amount > 0
      ? `+₹${transaction.amount.toLocaleString()}`
      : `-₹${Math.abs(transaction.amount).toLocaleString()}`;

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${transaction.category}</td>
      <td style="color:${transaction.amount > 0 ? '#10b981' : '#ef4444'}">${amountDisplay}</td>
      <td><span class="status-success">${transaction.status}</span></td>
      <td style="position:relative;">
        <button class="action-btn" onclick="toggleActionMenu(event, ${transaction.id})">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <div id="menu-${transaction.id}" style="
          display:none;
          position:absolute;
          right:0; top:100%;
          background:white;
          border:1px solid #e5e7eb;
          border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
          z-index:100;
          min-width:140px;
          overflow:hidden;
        ">
          ${inRange(transaction.date) ? `
          <button onclick="deleteTransaction(${transaction.id})" style="
            display:flex; align-items:center; gap:0.5rem;
            width:100%; padding:0.65rem 1rem;
            background:none; border:none; cursor:pointer;
            color:#ef4444; font-size:0.85rem;
          " onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
            <i class="fas fa-trash-alt"></i> Delete
          </button>` : `
          <div style="padding:0.65rem 1rem;font-size:0.8rem;color:#9ca3af;">
            Outside current range
          </div>`}
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function toggleActionMenu(event, id) {
  event.stopPropagation();
  // Close all other open menus first
  document.querySelectorAll('[id^="menu-"]').forEach(m => {
    if (m.id !== 'menu-' + id) m.style.display = 'none';
  });
  const menu = document.getElementById('menu-' + id);
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Close menus when clicking anywhere else
document.addEventListener('click', () => {
  document.querySelectorAll('[id^="menu-"]').forEach(m => m.style.display = 'none');
});

// ─── FILTER ───────────────────────────────────────────────────────────────────

function applyFilter() {
  const radios = document.getElementsByName('filterType');
  for (let r of radios) {
    if (r.checked) { filterType = r.value; break; }
  }
  closeModal('filterModal');
  updateTransactionsTable();
}

// ─── ALL EXPENSES SECTION ─────────────────────────────────────────────────────

function updateAllExpenses() {
  const list = document.querySelector('.expenses-breakdown ul.expense-categories');
  const totalDiv = document.querySelector('.expenses-breakdown .total-expenses');
  const periodValues = document.querySelectorAll('.expenses-breakdown .period-values span');
  const colorBar = document.querySelector('.expenses-breakdown .color-bar');
  if (!list || !totalDiv || !periodValues.length || !colorBar) return;

  const categoryTotals = {};
  let total = 0, weekly = 0, monthly = 0, yearly = 0;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  transactions.forEach(tr => {
    if (tr.type === 'expense') {
      const cat = tr.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(tr.amount);
      const d = new Date(tr.date);
      total += Math.abs(tr.amount);
      if (d.getFullYear() === now.getFullYear()) yearly += Math.abs(tr.amount);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthly += Math.abs(tr.amount);
      if (d >= weekStart && d <= now) weekly += Math.abs(tr.amount);
    }
  });

  const colorMap = {
    'Food': '#10b981', 'Food & Health': '#10b981',
    'Entertainment': '#a16207', 'Shopping': '#ef4444',
    'Investment': '#6366f1', 'Transport': '#ea580c',
    'Utilities': '#eab308', 'Other': '#6b7280',
    'Transfer': '#f59e0b', 'Subscription': '#22d3ee',
  };

  totalDiv.textContent = `₹${total.toLocaleString()}`;
  if (periodValues.length >= 2) {
    periodValues[0].textContent = `₹${weekly.toLocaleString()}`;
    periodValues[1].textContent = `₹${monthly.toLocaleString()}`;
    if (periodValues[2]) periodValues[2].textContent = `₹${yearly.toLocaleString()}`;
  }

  const entries = Object.entries(categoryTotals);
  if (entries.length === 0) {
    colorBar.style.background = '#e5e7eb';
    list.innerHTML = '<li class="expense-category"><span style="opacity:0.7;">No expenses</span></li>';
  } else {
    let gradient = 'linear-gradient(to right,', acc = 0;
    entries.forEach(([cat, val], idx) => {
      const color = colorMap[cat] || '#6b7280';
      const pct = total > 0 ? (val / total) * 100 : 0;
      gradient += ` ${color} ${acc.toFixed(1)}%, ${color} ${(acc + pct).toFixed(1)}%`;
      acc += pct;
      if (idx < entries.length - 1) gradient += ',';
    });
    colorBar.style.background = gradient + ')';

    list.innerHTML = '';
    entries.forEach(([cat, val]) => {
      const li = document.createElement('li');
      li.className = 'expense-category';
      li.innerHTML = `
        <div class="category-info">
          <div class="category-dot" style="background:${colorMap[cat] || '#6b7280'}"></div>
          <span>${cat}</span>
        </div>
        <span>₹${val.toLocaleString()}</span>`;
      list.appendChild(li);
    });
  }
}

// ─── OVERVIEW CHART ───────────────────────────────────────────────────────────

function updateOverviewChart() {
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthNums   = [0,1,2,3,4,5,6,7,8,9,10,11];

  // Accumulate income & expense per month (0-based month index)
  let incomeMap = {}, expenseMap = {};
  transactions.forEach(tr => {
    const m = new Date(tr.date).getMonth();
    incomeMap[m]  = (incomeMap[m]  || 0);
    expenseMap[m] = (expenseMap[m] || 0);
    if (tr.type === 'income') incomeMap[m]  += tr.amount;
    else                      expenseMap[m] += Math.abs(tr.amount);
  });

  const maxVal = Math.max(
    ...Object.values(incomeMap),
    ...Object.values(expenseMap),
    1
  );
  const MAX_H = 300; // px

  const container = document.querySelector('.chart-container');
  if (!container) return;

  container.innerHTML = '';
  container.style.cssText = `
    height: 360px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    padding: 0 0.5rem;
    background: #f8fafc;
    border-radius: 8px;
    margin-top: 1rem;
    position: relative;
  `;

  monthLabels.forEach((label, idx) => {
    const m       = monthNums[idx];
    const income  = incomeMap[m]  || 0;
    const expense = expenseMap[m] || 0;
    const total   = income + expense;

    // Heights are proportional slices of a single bar
    const totalH  = maxVal > 0 ? Math.round((total  / (maxVal * 2)) * MAX_H) : 0;
    const incH    = total > 0  ? Math.round((income  / total) * totalH) : 0;
    const expH    = total > 0  ? Math.round((expense / total) * totalH) : 0;

    // Column wrapper
    const col = document.createElement('div');
    col.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      position: relative;
      cursor: pointer;
    `;

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      display: none;
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 0.4rem 0.7rem;
      font-size: 0.72rem;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      z-index: 10;
      pointer-events: none;
    `;
    tooltip.innerHTML = `
      <div style="font-weight:700;margin-bottom:3px;">${label}</div>
      <div style="color:#10b981;">▲ Income &nbsp;₹${income.toLocaleString()}</div>
      <div style="color:#ef4444;">▼ Expense ₹${expense.toLocaleString()}</div>
    `;

    // Single stacked bar wrapper
    const bar = document.createElement('div');
    bar.style.cssText = `
      width: 14px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      min-height: ${total > 0 ? 4 : 0}px;
    `;

    // Red (expense) sits on TOP
    if (expense > 0) {
      const expSeg = document.createElement('div');
      expSeg.style.cssText = `
        height: ${Math.max(expH, 4)}px;
        background: linear-gradient(to bottom, #f87171, #dc2626);
        transition: height 0.3s ease;
      `;
      bar.appendChild(expSeg);
    }

    // Green (income) sits on BOTTOM
    if (income > 0) {
      const incSeg = document.createElement('div');
      incSeg.style.cssText = `
        height: ${Math.max(incH, 4)}px;
        background: linear-gradient(to bottom, #34d399, #059669);
        transition: height 0.3s ease;
      `;
      bar.appendChild(incSeg);
    }

    // Empty grey bar when no data
    if (total === 0) {
      bar.style.height = '6px';
      bar.style.background = '#e5e7eb';
    }

    // Month label
    const lbl = document.createElement('div');
    lbl.textContent = label;
    lbl.style.cssText = `
      font-size: 0.62rem;
      color: #9ca3af;
      margin-top: 4px;
      user-select: none;
    `;

    col.appendChild(tooltip);
    col.appendChild(bar);
    col.appendChild(lbl);

    col.addEventListener('mouseenter', () => tooltip.style.display = 'block');
    col.addEventListener('mouseleave', () => tooltip.style.display = 'none');

    container.appendChild(col);
  });

  // Legend (injected once, right after container)
  if (!document.querySelector('.chart-legend')) {
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.style.cssText = `
      display: flex;
      gap: 1.2rem;
      font-size: 0.78rem;
      color: #6b7280;
      margin-top: 0.5rem;
      padding-left: 0.25rem;
    `;
    legend.innerHTML = `
      <span style="display:flex;align-items:center;gap:5px;">
        <span style="width:10px;height:10px;border-radius:2px;background:#34d399;display:inline-block;"></span>Income
      </span>
      <span style="display:flex;align-items:center;gap:5px;">
        <span style="width:10px;height:10px;border-radius:2px;background:#f87171;display:inline-block;"></span>Expense
      </span>
    `;
    container.insertAdjacentElement('afterend', legend);
  }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function showNotification(message, type = 'success') {
  const n = document.createElement('div');
  n.style.cssText = `
    position:fixed; top:2rem; right:2rem;
    background:${type === 'success' ? '#10b981' : '#ef4444'};
    color:white; padding:1rem 1.5rem; border-radius:8px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:1001;
    animation:slideInRight 0.3s ease;`;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => document.body.removeChild(n), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes slideOutRight { from { transform:translateX(0); opacity:1; } to { transform:translateX(100%); opacity:0; } }
`;
document.head.appendChild(style);

// ─── HEADER DATE ──────────────────────────────────────────────────────────────

function setHeaderDate() {
  const el = document.getElementById('header-date');
  if (!el) return;
  const d = new Date();
  el.textContent = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
setHeaderDate();

function setGreeting() {
  const el = document.getElementById('greeting-text');
  if (!el) return;
  const h = new Date().getHours();
  let greeting = 'Good Night';
  if      (h >= 5  && h < 12) greeting = 'Good Morning';
  else if (h >= 12 && h < 17) greeting = 'Good Afternoon';
  else if (h >= 17 && h < 21) greeting = 'Good Evening';
  el.textContent = greeting + '!';
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    ['incomeModal','expenseModal','filterModal','bankEditModal'].forEach(closeModal);
  }
  if (e.ctrlKey && e.key === 'i') { e.preventDefault(); openIncomeModal(); }
  if (e.ctrlKey && e.key === 'e') { e.preventDefault(); openExpenseModal(); }
});

// ─── PERIOD FILTER ───────────────────────────────────────────────────────────

function setPeriod(period) {
  periodFilter = period;

  // Update button styles
  ['btn-all','btn-weekly','btn-monthly'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.style.background = '#f3f4f6';
    btn.style.color = '#374151';
    btn.style.fontWeight = '500';
  });
  const active = document.getElementById('btn-' + period);
  if (active) {
    active.style.background = '#3b82f6';
    active.style.color = 'white';
    active.style.fontWeight = '600';
  }

  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();
}

// ─── DOM READY ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  // Set default dates
  const incomeDate = document.getElementById('incomeDate');
  const expenseDate = document.getElementById('expenseDate');
  if (incomeDate) incomeDate.value = today;
  if (expenseDate) expenseDate.value = today;

  // Load dummy data if transactions are empty
  if (typeof loadDummyData === 'function' && transactions.length === 0) {
    loadDummyData();
  }

  updateDashboard();
  updateTransactionsTable();
  updateAllExpenses();
  setHeaderDate();
  setGreeting();

  // Sort / Filter buttons on transactions table
  const sortBtn = document.querySelector('.filters .filter-btn:nth-child(1)');
  const filterBtn = document.querySelector('.filters .filter-btn:nth-child(2)');
  if (sortBtn) sortBtn.addEventListener('click', () => { showMinimized = !showMinimized; updateTransactionsTable(); });
  if (filterBtn) filterBtn.addEventListener('click', () => {
    document.getElementById('filterModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  // Export CSV
  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      // Export only what is currently visible (respects period + type filter)
      const exportData = transactions.filter(tr => {
        const typeOk = filterType === 'all' || tr.type.toLowerCase() === filterType.toLowerCase();
        const dateOk = inRange(tr.date);
        return typeOk && dateOk;
      });
      const periodLabel = periodFilter === 'weekly' ? 'Weekly' : periodFilter === 'monthly' ? 'Monthly' : 'All';
      let csv = 'Period:,' + periodLabel + '\n';
      csv += 'Date,Category,Amount,Status,Type,Description\n';
      exportData.forEach(tr => {
        const [y, m, d] = tr.date.split('-');
        const dateText  = d + '/' + m + '/' + y;
        const safeDesc  = tr.description ? tr.description.replace(/,/g, ' ') : '';
        csv += '"' + dateText + '","' + tr.category + '",' + tr.amount + ',"' + tr.status + '","' + tr.type + '","' + safeDesc + '"\n';
      });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
        download: 'transactions_' + periodFilter + '.csv'
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // Card hover effects
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      this.style.transition = 'all 0.2s ease';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    });
  });
});
