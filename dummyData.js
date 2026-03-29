// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
// Loads realistic transactions across the past 12 months.
// Include this BEFORE ExpenseTracker.js in your HTML:
//   <script src="dummyData.js"></script>
//   <script src="ExpenseTracker.js"></script>

function loadDummyData() {
  const now = new Date();

  // Helper: random int between min and max
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper: date string YYYY-MM-DD for a given months-ago offset and day
  function dateFor(monthsAgo, day) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
    return d.toISOString().split('T')[0];
  }

  const raw = [
    // ── Current month ──────────────────────────────────────────────
    { date: dateFor(0,  1),  category: 'Salary',        amount:  55000, type: 'income',  description: 'March salary' },
    { date: dateFor(0,  3),  category: 'Food & Health', amount:  -1200, type: 'expense', description: 'Grocery run' },
    { date: dateFor(0,  5),  category: 'Transport',     amount:   -450, type: 'expense', description: 'Metro recharge' },
    { date: dateFor(0,  7),  category: 'Subscription',  amount:   -649, type: 'expense', description: 'Netflix + Spotify' },
    { date: dateFor(0, 10),  category: 'Freelance',     amount:  12000, type: 'income',  description: 'UI project payment' },
    { date: dateFor(0, 12),  category: 'Shopping',      amount:  -3500, type: 'expense', description: 'Clothes' },
    { date: dateFor(0, 15),  category: 'Food & Health', amount:   -800, type: 'expense', description: 'Restaurant dinner' },
    { date: dateFor(0, 18),  category: 'Utilities',     amount:  -1100, type: 'expense', description: 'Electricity bill' },
    { date: dateFor(0, 20),  category: 'Investment',    amount:  -5000, type: 'expense', description: 'Mutual fund SIP' },
    { date: dateFor(0, 22),  category: 'Entertainment', amount:   -600, type: 'expense', description: 'Movie + snacks' },
    { date: dateFor(0, 25),  category: 'Transport',     amount:   -350, type: 'expense', description: 'Cab rides' },
    { date: dateFor(0, 27),  category: 'Food & Health', amount:   -950, type: 'expense', description: 'Weekly groceries' },

    // ── 1 month ago ────────────────────────────────────────────────
    { date: dateFor(1,  1),  category: 'Salary',        amount:  55000, type: 'income',  description: 'Feb salary' },
    { date: dateFor(1,  4),  category: 'Food & Health', amount:  -1350, type: 'expense', description: 'Grocery' },
    { date: dateFor(1,  6),  category: 'Shopping',      amount:  -2200, type: 'expense', description: 'Amazon order' },
    { date: dateFor(1,  9),  category: 'Utilities',     amount:   -980, type: 'expense', description: 'Water + gas' },
    { date: dateFor(1, 11),  category: 'Freelance',     amount:   8500, type: 'income',  description: 'Logo design' },
    { date: dateFor(1, 14),  category: 'Entertainment', amount:   -750, type: 'expense', description: 'Concert tickets' },
    { date: dateFor(1, 16),  category: 'Transport',     amount:   -400, type: 'expense', description: 'Petrol' },
    { date: dateFor(1, 19),  category: 'Investment',    amount:  -5000, type: 'expense', description: 'SIP' },
    { date: dateFor(1, 21),  category: 'Food & Health', amount:   -700, type: 'expense', description: 'Pharmacy' },
    { date: dateFor(1, 24),  category: 'Subscription',  amount:   -199, type: 'expense', description: 'Cloud storage' },
    { date: dateFor(1, 26),  category: 'Business',      amount:  15000, type: 'income',  description: 'Client retainer' },
    { date: dateFor(1, 28),  category: 'Food & Health', amount:  -1100, type: 'expense', description: 'Weekend dining' },

    // ── 2 months ago ───────────────────────────────────────────────
    { date: dateFor(2,  1),  category: 'Salary',        amount:  55000, type: 'income',  description: 'Jan salary' },
    { date: dateFor(2,  3),  category: 'Shopping',      amount:  -4800, type: 'expense', description: 'Electronics' },
    { date: dateFor(2,  5),  category: 'Transport',     amount:   -500, type: 'expense', description: 'Train tickets' },
    { date: dateFor(2,  8),  category: 'Food & Health', amount:  -1500, type: 'expense', description: 'Monthly grocery' },
    { date: dateFor(2, 10),  category: 'Investment',    amount: -10000, type: 'expense', description: 'Stocks purchase' },
    { date: dateFor(2, 13),  category: 'Freelance',     amount:  20000, type: 'income',  description: 'App development' },
    { date: dateFor(2, 15),  category: 'Utilities',     amount:  -1200, type: 'expense', description: 'Internet + electricity' },
    { date: dateFor(2, 18),  category: 'Entertainment', amount:   -900, type: 'expense', description: 'OTT subscriptions' },
    { date: dateFor(2, 20),  category: 'Food & Health', amount:   -650, type: 'expense', description: 'Gym fee' },
    { date: dateFor(2, 23),  category: 'Subscription',  amount:   -649, type: 'expense', description: 'Adobe CC' },
    { date: dateFor(2, 25),  category: 'Shopping',      amount:  -1800, type: 'expense', description: 'Books & stationery' },

    // ── 3 months ago ───────────────────────────────────────────────
    { date: dateFor(3,  1),  category: 'Salary',        amount:  52000, type: 'income',  description: 'Dec salary' },
    { date: dateFor(3,  4),  category: 'Shopping',      amount:  -6500, type: 'expense', description: 'Holiday gifts' },
    { date: dateFor(3,  7),  category: 'Food & Health', amount:  -2100, type: 'expense', description: 'Party catering' },
    { date: dateFor(3, 10),  category: 'Transport',     amount:   -800, type: 'expense', description: 'Flight tickets' },
    { date: dateFor(3, 13),  category: 'Investment',    amount:  -5000, type: 'expense', description: 'SIP Dec' },
    { date: dateFor(3, 15),  category: 'Business',      amount:  25000, type: 'income',  description: 'Year-end bonus' },
    { date: dateFor(3, 18),  category: 'Entertainment', amount:  -1200, type: 'expense', description: 'New Year eve party' },
    { date: dateFor(3, 22),  category: 'Utilities',     amount:  -1050, type: 'expense', description: 'Bills' },
    { date: dateFor(3, 27),  category: 'Freelance',     amount:  11000, type: 'income',  description: 'Dec freelance' },

    // ── 4 months ago ───────────────────────────────────────────────
    { date: dateFor(4,  1),  category: 'Salary',        amount:  52000, type: 'income',  description: 'Nov salary' },
    { date: dateFor(4,  5),  category: 'Food & Health', amount:  -1300, type: 'expense', description: 'Grocery' },
    { date: dateFor(4,  8),  category: 'Shopping',      amount:  -3200, type: 'expense', description: 'Winter clothes' },
    { date: dateFor(4, 12),  category: 'Transport',     amount:   -450, type: 'expense', description: 'Commute' },
    { date: dateFor(4, 15),  category: 'Investment',    amount:  -5000, type: 'expense', description: 'SIP Nov' },
    { date: dateFor(4, 18),  category: 'Utilities',     amount:   -900, type: 'expense', description: 'Bills' },
    { date: dateFor(4, 22),  category: 'Freelance',     amount:   9500, type: 'income',  description: 'Consulting' },
    { date: dateFor(4, 25),  category: 'Entertainment', amount:   -700, type: 'expense', description: 'Movies' },

    // ── 5 months ago ───────────────────────────────────────────────
    { date: dateFor(5,  1),  category: 'Salary',        amount:  52000, type: 'income',  description: 'Oct salary' },
    { date: dateFor(5,  4),  category: 'Food & Health', amount:  -1400, type: 'expense', description: 'Grocery' },
    { date: dateFor(5,  9),  category: 'Shopping',      amount:  -2700, type: 'expense', description: 'Diwali shopping' },
    { date: dateFor(5, 12),  category: 'Investment',    amount: -15000, type: 'expense', description: 'Gold purchase' },
    { date: dateFor(5, 15),  category: 'Business',      amount:  30000, type: 'income',  description: 'Diwali bonus' },
    { date: dateFor(5, 18),  category: 'Transport',     amount:   -600, type: 'expense', description: 'Travel' },
    { date: dateFor(5, 22),  category: 'Entertainment', amount:  -1500, type: 'expense', description: 'Diwali celebrations' },
    { date: dateFor(5, 26),  category: 'Utilities',     amount:   -850, type: 'expense', description: 'Bills' },

    // ── 6 months ago ───────────────────────────────────────────────
    { date: dateFor(6,  1),  category: 'Salary',        amount:  50000, type: 'income',  description: 'Sep salary' },
    { date: dateFor(6,  5),  category: 'Food & Health', amount:  -1200, type: 'expense', description: 'Grocery' },
    { date: dateFor(6,  8),  category: 'Transport',     amount:   -500, type: 'expense', description: 'Fuel' },
    { date: dateFor(6, 11),  category: 'Freelance',     amount:  13000, type: 'income',  description: 'Web project' },
    { date: dateFor(6, 14),  category: 'Investment',    amount:  -5000, type: 'expense', description: 'SIP' },
    { date: dateFor(6, 18),  category: 'Shopping',      amount:  -2500, type: 'expense', description: 'Home decor' },
    { date: dateFor(6, 22),  category: 'Utilities',     amount:   -950, type: 'expense', description: 'Bills' },
    { date: dateFor(6, 26),  category: 'Entertainment', amount:   -800, type: 'expense', description: 'Weekend outing' },
  ];

  // Assign IDs and load into transactions array
  raw.forEach((item, i) => {
    transactions.push({
      id: i + 1,
      date: item.date,
      category: item.category,
      amount: item.amount,
      status: 'Success',
      type: item.type,
      description: item.description || '',
    });
  });

  // Recalculate pool and bank from dummy data
  backendIncomePool = 0;
  window.bankBalance = 10000;
  transactions.forEach(tr => {
    if (tr.type === 'income') {
      backendIncomePool += tr.amount;
    } else {
      const amt = Math.abs(tr.amount);
      if (backendIncomePool >= amt) {
        backendIncomePool -= amt;
      } else {
        const fromBank = amt - backendIncomePool;
        backendIncomePool = 0;
        window.bankBalance = Math.max(0, window.bankBalance - fromBank);
      }
    }
  });

  console.log(`✅ Loaded ${transactions.length} dummy transactions`);
}
