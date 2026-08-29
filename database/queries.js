const { getIsMysqlActive } = require('./db');
const { getPool } = require('./mysql-db');

// Helper: Convert sql.js result to array of objects
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

function resultToObject(result) {
  const objects = resultToObjects(result);
  return objects.length > 0 ? objects[0] : null;
}

module.exports = {
  // User Queries
  async createUser(db, { username, password, fullName, email, currency }) {
    if (getIsMysqlActive()) {
      const [res] = await getPool().execute(
        'INSERT INTO users (username, password, full_name, email, currency) VALUES (?, ?, ?, ?, ?)',
        [username, password, fullName, email, currency || 'LKR']
      );
      return res.insertId;
    }
    db.run(
      'INSERT INTO users (username, password, full_name, email, currency) VALUES (?, ?, ?, ?, ?)',
      [username, password, fullName, email, currency || 'LKR']
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result && result[0] && result[0].values ? result[0].values[0][0] : 1;
  },

  async getUserByUsername(db, username) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    }
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    return resultToObject(result);
  },

  async getUserById(db, userId) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ?', [userId]);
      return rows[0] || null;
    }
    const result = db.exec('SELECT * FROM users WHERE id = ?', [userId]);
    return resultToObject(result);
  },

  async updateUserProfile(db, { userId, fullName, email, currency }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE users SET full_name = ?, email = ?, currency = ? WHERE id = ?',
        [fullName, email, currency, userId]);
      return;
    }
    db.run('UPDATE users SET full_name = ?, email = ?, currency = ? WHERE id = ?',
      [fullName, email, currency, userId]);
  },

  async updateUserPassword(db, { userId, password }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
      return;
    }
    db.run('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
  },

  async updateUserTheme(db, { userId, theme }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE users SET theme = ? WHERE id = ?', [theme, userId]);
      return;
    }
    db.run('UPDATE users SET theme = ? WHERE id = ?', [theme, userId]);
  },

  // Transaction Queries
  async createTransaction(db, { userId, categoryId, type, amount, description, date }) {
    if (getIsMysqlActive()) {
      const [res] = await getPool().execute(
        'INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, categoryId, type, amount, description || '', date]
      );
      return res.insertId;
    }
    db.run(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, type, amount, description || '', date]
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result && result[0] && result[0].values ? result[0].values[0][0] : 1;
  },

  async getTransactions(db, { userId, type, categoryId, startDate, endDate, search, page = 1, limit = 50 }) {
    if (getIsMysqlActive()) {
      let query = `
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = ?
      `;
      const params = [userId];

      if (type) { query += ` AND t.type = ?`; params.push(type); }
      if (categoryId) { query += ` AND t.category_id = ?`; params.push(categoryId); }
      if (startDate) { query += ` AND t.date >= ?`; params.push(startDate); }
      if (endDate) { query += ` AND t.date <= ?`; params.push(endDate); }
      if (search) {
        query += ` AND (t.description LIKE ? OR c.name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      const [countRows] = await getPool().execute(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit);

      query += ` ORDER BY t.date DESC, t.id DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number((page - 1) * limit));

      const [rows] = await getPool().execute(query, params);
      return { transactions: rows, total, page, totalPages };
    }

    // SQLite fallback
    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (type) { query += ` AND t.type = ?`; params.push(type); }
    if (categoryId) { query += ` AND t.category_id = ?`; params.push(categoryId); }
    if (startDate) { query += ` AND t.date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND t.date <= ?`; params.push(endDate); }
    if (search) {
      query += ` AND (t.description LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.date DESC, t.id DESC`;
    const result = db.exec(query, params);
    const allTransactions = resultToObjects(result);
    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const transactions = allTransactions.slice(offset, offset + limit);

    return { transactions, total, page, totalPages };
  },

  async getTransactionById(db, id) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(`
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.id = ?
      `, [id]);
      return rows[0] || null;
    }
    const result = db.exec(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `, [id]);
    return resultToObject(result);
  },

  async updateTransaction(db, { id, categoryId, type, amount, description, date }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE transactions SET category_id = ?, type = ?, amount = ?, description = ?, date = ? WHERE id = ?',
        [categoryId, type, amount, description, date, id]);
      return id;
    }
    db.run('UPDATE transactions SET category_id = ?, type = ?, amount = ?, description = ?, date = ? WHERE id = ?',
      [categoryId, type, amount, description, date, id]);
    return id;
  },

  async deleteTransaction(db, id) {
    if (getIsMysqlActive()) {
      await getPool().execute('DELETE FROM transactions WHERE id = ?', [id]);
      return;
    }
    db.run('DELETE FROM transactions WHERE id = ?', [id]);
  },

  async getTransactionSummary(db, { userId, month, year }) {
    let query = `SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ?`;
    const params = [userId];

    if (month && year) {
      query += ` AND substr(date, 1, 7) = ?`;
      const formattedMonth = month.toString().padStart(2, '0');
      params.push(`${year}-${formattedMonth}`);
    }
    query += ` GROUP BY type`;

    let rows = [];
    if (getIsMysqlActive()) {
      const [sqlRows] = await getPool().execute(query, params);
      rows = sqlRows;
    } else {
      const result = db.exec(query, params);
      rows = resultToObjects(result);
    }

    let totalIncome = 0;
    let totalExpense = 0;
    rows.forEach(row => {
      if (row.type === 'income') totalIncome = Number(row.total);
      if (row.type === 'expense') totalExpense = Number(row.total);
    });

    // Fallback: If specified month has no transactions, compute all-time totals so dashboard is informative
    if (totalIncome === 0 && totalExpense === 0 && month && year) {
      const allTimeQuery = `SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ? GROUP BY type`;
      let allRows = [];
      if (getIsMysqlActive()) {
        const [sqlRows] = await getPool().execute(allTimeQuery, [userId]);
        allRows = sqlRows;
      } else {
        const result = db.exec(allTimeQuery, [userId]);
        allRows = resultToObjects(result);
      }
      allRows.forEach(row => {
        if (row.type === 'income') totalIncome = Number(row.total);
        if (row.type === 'expense') totalExpense = Number(row.total);
      });
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  },

  // Category Queries
  async getCategories(db, userId) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(
        'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY type, name',
        [userId]
      );
      return rows;
    }
    const result = db.exec(
      'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY type, name',
      [userId]
    );
    return resultToObjects(result);
  },

  async getCategoriesByType(db, { userId, type }) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(
        'SELECT * FROM categories WHERE (user_id IS NULL OR user_id = ?) AND type = ? ORDER BY name',
        [userId, type]
      );
      return rows;
    }
    const result = db.exec(
      'SELECT * FROM categories WHERE (user_id IS NULL OR user_id = ?) AND type = ? ORDER BY name',
      [userId, type]
    );
    return resultToObjects(result);
  },

  async createCategory(db, { userId, name, type, icon, color }) {
    if (getIsMysqlActive()) {
      const [res] = await getPool().execute(
        'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
        [userId, name, type, icon, color]
      );
      return res.insertId;
    }
    db.run(
      'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
      [userId, name, type, icon, color]
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result && result[0] && result[0].values ? result[0].values[0][0] : 1;
  },

  async updateCategory(db, { id, name, icon, color }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?',
        [name, icon, color, id]);
      return id;
    }
    db.run('UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?',
      [name, icon, color, id]);
    return id;
  },

  async deleteCategory(db, id) {
    if (getIsMysqlActive()) {
      await getPool().execute('DELETE FROM categories WHERE id = ? AND user_id IS NOT NULL', [id]);
      return;
    }
    db.run('DELETE FROM categories WHERE id = ? AND user_id IS NOT NULL', [id]);
  },

  // Budget Queries
  async createBudget(db, { userId, categoryId, amount, month }) {
    if (getIsMysqlActive()) {
      const [res] = await getPool().execute(
        'INSERT INTO budgets (user_id, category_id, amount, month) VALUES (?, ?, ?, ?)',
        [userId, categoryId, amount, month]
      );
      return res.insertId;
    }
    db.run(
      'INSERT INTO budgets (user_id, category_id, amount, month) VALUES (?, ?, ?, ?)',
      [userId, categoryId, amount, month]
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result && result[0] && result[0].values ? result[0].values[0][0] : 1;
  },

  async getBudgets(db, { userId, month }) {
    const query = `
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
             COALESCE((SELECT SUM(amount) FROM transactions t 
              WHERE t.category_id = b.category_id AND t.user_id = b.user_id 
              AND substr(t.date, 1, 7) = b.month AND t.type = 'expense'), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.month = ?
    `;
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(query, [userId, month]);
      return rows;
    }
    const result = db.exec(query, [userId, month]);
    return resultToObjects(result);
  },

  async updateBudget(db, { id, amount }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE budgets SET amount = ? WHERE id = ?', [amount, id]);
      return;
    }
    db.run('UPDATE budgets SET amount = ? WHERE id = ?', [amount, id]);
  },

  async deleteBudget(db, id) {
    if (getIsMysqlActive()) {
      await getPool().execute('DELETE FROM budgets WHERE id = ?', [id]);
      return;
    }
    db.run('DELETE FROM budgets WHERE id = ?', [id]);
  },

  // Savings Goals Queries
  async createGoal(db, { userId, title, targetAmount, savedAmount, targetDate, category }) {
    if (getIsMysqlActive()) {
      const [res] = await getPool().execute(
        'INSERT INTO goals (user_id, title, target_amount, saved_amount, target_date, category) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, targetAmount, savedAmount || 0, targetDate, category || 'General']
      );
      return res.insertId;
    }
    db.run(
      'INSERT INTO goals (user_id, title, target_amount, saved_amount, target_date, category) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, targetAmount, savedAmount || 0, targetDate, category || 'General']
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result && result[0] && result[0].values ? result[0].values[0][0] : 1;
  },

  async getGoals(db, userId) {
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute('SELECT * FROM goals WHERE user_id = ? ORDER BY target_date ASC', [userId]);
      return rows;
    }
    const result = db.exec('SELECT * FROM goals WHERE user_id = ? ORDER BY target_date ASC', [userId]);
    return resultToObjects(result);
  },

  async updateGoalSavedAmount(db, { id, amount }) {
    if (getIsMysqlActive()) {
      await getPool().execute('UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ?', [amount, id]);
      return;
    }
    db.run('UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ?', [amount, id]);
  },

  async deleteGoal(db, id) {
    if (getIsMysqlActive()) {
      await getPool().execute('DELETE FROM goals WHERE id = ?', [id]);
      return;
    }
    db.run('DELETE FROM goals WHERE id = ?', [id]);
  },

  // Report Queries
  async getMonthlyTotals(db, { userId, year }) {
    const query = `
      SELECT substr(date, 6, 2) as month, type, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND substr(date, 1, 4) = ?
      GROUP BY month, type
      ORDER BY month
    `;
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(query, [userId, year.toString()]);
      return rows;
    }
    const result = db.exec(query, [userId, year.toString()]);
    return resultToObjects(result);
  },

  async getCategoryBreakdown(db, { userId, startDate, endDate, type }) {
    let query = `
      SELECT c.id, COALESCE(c.name, 'General') as categoryName, COALESCE(c.icon, '💵') as categoryIcon, COALESCE(c.color, '#6366f1') as categoryColor, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];
    if (type) { query += ` AND t.type = ?`; params.push(type); }
    if (startDate) { query += ` AND t.date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND t.date <= ?`; params.push(endDate); }
    query += ` GROUP BY c.id, categoryName, categoryIcon, categoryColor ORDER BY total DESC`;

    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(query, params);
      return rows;
    }
    const result = db.exec(query, params);
    return resultToObjects(result);
  },

  async getDailyTrend(db, { userId, month, year }) {
    const formattedMonth = month.toString().padStart(2, '0');
    const monthPrefix = `${year}-${formattedMonth}`;
    const query = `
      SELECT date, type, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND substr(date, 1, 7) = ?
      GROUP BY date, type
      ORDER BY date
    `;
    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(query, [userId, monthPrefix]);
      return rows;
    }
    const result = db.exec(query, [userId, monthPrefix]);
    return resultToObjects(result);
  },

  async getTransactionsForExport(db, { userId, startDate, endDate }) {
    let query = `
      SELECT t.id, t.date, t.type, t.amount, t.description, c.name as category_name, c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];
    if (startDate) { query += ` AND t.date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND t.date <= ?`; params.push(endDate); }
    query += ` ORDER BY t.date DESC`;

    if (getIsMysqlActive()) {
      const [rows] = await getPool().execute(query, params);
      return rows;
    }
    const result = db.exec(query, params);
    return resultToObjects(result);
  }
};
