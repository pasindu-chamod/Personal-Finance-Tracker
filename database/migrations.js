function runMigrations(db) {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      currency TEXT DEFAULT 'LKR',
      theme TEXT DEFAULT 'dark',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Savings Goals table (NEW)
  db.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL,
      saved_amount REAL DEFAULT 0.0,
      target_date TEXT,
      category TEXT DEFAULT 'General',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  seedDefaultCategories(db);
}

function seedDefaultCategories(db) {
  const result = db.exec('SELECT COUNT(*) as count FROM categories WHERE user_id IS NULL');
  const defaultCount = result.length > 0 ? result[0].values[0][0] : 0;

  if (defaultCount === 0) {
    const defaultCategories = [
      { name: 'Salary', type: 'income', icon: '💰', color: '#4CAF50' },
      { name: 'Freelance', type: 'income', icon: '💻', color: '#2196F3' },
      { name: 'Investment', type: 'income', icon: '📈', color: '#9C27B0' },
      { name: 'Gift', type: 'income', icon: '🎁', color: '#FF9800' },
      { name: 'Other Income', type: 'income', icon: '💵', color: '#607D8B' },
      { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#F44336' },
      { name: 'Transport', type: 'expense', icon: '🚗', color: '#FF5722' },
      { name: 'Housing', type: 'expense', icon: '🏠', color: '#795548' },
      { name: 'Utilities', type: 'expense', icon: '💡', color: '#FFC107' },
      { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#E91E63' },
      { name: 'Education', type: 'expense', icon: '📚', color: '#3F51B5' },
      { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#00BCD4' },
      { name: 'Shopping', type: 'expense', icon: '🛒', color: '#8BC34A' },
      { name: 'Other Expense', type: 'expense', icon: '📦', color: '#9E9E9E' }
    ];

    const stmt = db.prepare('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)');
    for (const cat of defaultCategories) {
      stmt.run([cat.name, cat.type, cat.icon, cat.color]);
    }
    stmt.free();
  }
}

module.exports = {
  runMigrations
};
