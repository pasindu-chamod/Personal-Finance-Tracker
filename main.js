const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { initDatabase, getDb, saveDatabase, getIsMysqlActive } = require('./database/db');
const { testConnection, initMysql } = require('./database/mysql-db');
const queries = require('./database/queries');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 950,
    minHeight: 650,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    ...(fs.existsSync(path.join(__dirname, 'src', 'assets', 'images', 'login_hero_bg.jpg')) ? {} : {})
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.setMenuBarVisibility(false);
}

function setupIpcHandlers() {
  // Auth Channels
  ipcMain.handle('auth:register', async (event, { username, password, fullName, email, currency }) => {
    try {
      const db = getDb();
      const existingUser = await queries.getUserByUsername(db, username);
      if (existingUser) throw new Error('Username already exists');

      const hashedPassword = bcrypt.hashSync(password, 10);
      const userId = await queries.createUser(db, { username, password: hashedPassword, fullName, email, currency });
      saveDatabase();
      const user = await queries.getUserById(db, userId);
      delete user.password;
      return user;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      const db = getDb();
      const user = await queries.getUserByUsername(db, username);
      if (!user) return null;
      const isValid = bcrypt.compareSync(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('auth:updateProfile', async (event, { userId, fullName, email, currency }) => {
    try {
      const db = getDb();
      await queries.updateUserProfile(db, { userId, fullName, email, currency });
      saveDatabase();
      const user = await queries.getUserById(db, userId);
      delete user.password;
      return user;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('auth:changePassword', async (event, { userId, oldPassword, newPassword }) => {
    try {
      const db = getDb();
      const user = await queries.getUserById(db, userId);
      if (!user) throw new Error('User not found');
      
      const isValid = bcrypt.compareSync(oldPassword, user.password);
      if (!isValid) throw new Error('Incorrect old password');
      
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      await queries.updateUserPassword(db, { userId, password: hashedNewPassword });
      saveDatabase();
      return true;
    } catch (error) {
      throw error;
    }
  });

  // Transaction Channels
  ipcMain.handle('transactions:create', async (event, data) => {
    const db = getDb();
    const result = await queries.createTransaction(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('transactions:getAll', async (event, { userId, filters }) => {
    const db = getDb();
    return await queries.getTransactions(db, { userId, ...filters });
  });

  ipcMain.handle('transactions:getById', async (event, { id }) => {
    const db = getDb();
    return await queries.getTransactionById(db, id);
  });

  ipcMain.handle('transactions:update', async (event, data) => {
    const db = getDb();
    const result = await queries.updateTransaction(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('transactions:delete', async (event, { id }) => {
    const db = getDb();
    await queries.deleteTransaction(db, id);
    saveDatabase();
    return true;
  });

  ipcMain.handle('transactions:getSummary', async (event, { userId, month, year }) => {
    const db = getDb();
    return await queries.getTransactionSummary(db, { userId, month, year });
  });

  // Category Channels
  ipcMain.handle('categories:getAll', async (event, { userId }) => {
    const db = getDb();
    return await queries.getCategories(db, userId);
  });

  ipcMain.handle('categories:getByType', async (event, { userId, type }) => {
    const db = getDb();
    return await queries.getCategoriesByType(db, { userId, type });
  });

  ipcMain.handle('categories:create', async (event, data) => {
    const db = getDb();
    const result = await queries.createCategory(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('categories:update', async (event, data) => {
    const db = getDb();
    const result = await queries.updateCategory(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('categories:delete', async (event, { id }) => {
    const db = getDb();
    await queries.deleteCategory(db, id);
    saveDatabase();
    return true;
  });

  // Budget Channels
  ipcMain.handle('budget:create', async (event, data) => {
    const db = getDb();
    const result = await queries.createBudget(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('budget:getAll', async (event, { userId, month }) => {
    const db = getDb();
    return await queries.getBudgets(db, { userId, month });
  });

  ipcMain.handle('budget:update', async (event, data) => {
    const db = getDb();
    await queries.updateBudget(db, data);
    saveDatabase();
    return true;
  });

  ipcMain.handle('budget:delete', async (event, { id }) => {
    const db = getDb();
    await queries.deleteBudget(db, id);
    saveDatabase();
    return true;
  });

  // Goals Channels (NEW)
  ipcMain.handle('goals:create', async (event, data) => {
    const db = getDb();
    const result = await queries.createGoal(db, data);
    saveDatabase();
    return result;
  });

  ipcMain.handle('goals:getAll', async (event, { userId }) => {
    const db = getDb();
    return await queries.getGoals(db, userId);
  });

  ipcMain.handle('goals:updateSaved', async (event, data) => {
    const db = getDb();
    await queries.updateGoalSavedAmount(db, data);
    saveDatabase();
    return true;
  });

  ipcMain.handle('goals:delete', async (event, { id }) => {
    const db = getDb();
    await queries.deleteGoal(db, id);
    saveDatabase();
    return true;
  });

  // Report Channels
  ipcMain.handle('reports:monthlyTotals', async (event, { userId, year }) => {
    const db = getDb();
    return await queries.getMonthlyTotals(db, { userId, year });
  });

  ipcMain.handle('reports:categoryBreakdown', async (event, { userId, startDate, endDate, type }) => {
    const db = getDb();
    return await queries.getCategoryBreakdown(db, { userId, startDate, endDate, type });
  });

  ipcMain.handle('reports:dailyTrend', async (event, { userId, month, year }) => {
    const db = getDb();
    return await queries.getDailyTrend(db, { userId, month, year });
  });

  ipcMain.handle('reports:getTransactionsForExport', async (event, { userId, startDate, endDate }) => {
    const db = getDb();
    return await queries.getTransactionsForExport(db, { userId, startDate, endDate });
  });

  // Settings & MySQL Channels
  ipcMain.handle('settings:getUser', async (event, { userId }) => {
    const db = getDb();
    const user = await queries.getUserById(db, userId);
    return { theme: user ? user.theme || 'dark' : 'dark' };
  });

  ipcMain.handle('settings:update', async (event, { userId, settings }) => {
    const db = getDb();
    if (settings.theme) {
      await queries.updateUserTheme(db, { userId, theme: settings.theme });
      saveDatabase();
    }
    return true;
  });

  ipcMain.handle('mysql:test', async (event, config) => {
    return await testConnection(config);
  });

  ipcMain.handle('mysql:saveConfig', async (event, config) => {
    try {
      const configPath = path.join(app.getPath('userData'), 'mysql-config.json');
      await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2));
      return { success: true, message: 'MySQL Config Saved! Please restart app to switch DB.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  });

  ipcMain.handle('mysql:getConfig', async (event) => {
    try {
      const configPath = path.join(app.getPath('userData'), 'mysql-config.json');
      if (fs.existsSync(configPath)) {
        const data = await fsPromises.readFile(configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {}
    return { enabled: false, host: 'localhost', port: 3306, user: 'root', password: '', database: 'smartfinance' };
  });

  // Backup Channels
  ipcMain.handle('backup:export', async (event, { userId }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Data Backup',
      defaultPath: 'smartfinance_backup.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!filePath) return { success: false };

    const db = getDb();
    const user = await queries.getUserById(db, userId);
    if (user) delete user.password;
    const categories = await queries.getCategories(db, userId);
    const transactionsResult = await queries.getTransactions(db, { userId, limit: 1000000 });
    const goals = await queries.getGoals(db, userId);

    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user,
      categories,
      transactions: transactionsResult.transactions,
      goals
    };

    await fsPromises.writeFile(filePath, JSON.stringify(backupData, null, 2));
    return { success: true, filePath };
  });

  ipcMain.handle('backup:import', async (event) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Data Backup',
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!filePaths || filePaths.length === 0) return { success: false, message: 'No file selected' };

    const content = await fsPromises.readFile(filePaths[0], 'utf-8');
    const data = JSON.parse(content);

    if (!data.version || !data.transactions) {
      return { success: false, message: 'Invalid backup file format' };
    }

    const db = getDb();
    if (data.transactions && data.transactions.length > 0) {
      for (const t of data.transactions) {
        try {
          await queries.createTransaction(db, {
            userId: t.user_id,
            categoryId: t.category_id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date
          });
        } catch (e) {}
      }
      saveDatabase();
    }

    return { success: true, message: 'Data imported successfully' };
  });

  // Dialog & File Channels
  ipcMain.handle('dialog:save', async (event, { filters, defaultPath }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, { filters, defaultPath });
    return filePath;
  });

  ipcMain.handle('dialog:open', async (event, { filters }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters
    });
    return filePaths && filePaths.length > 0 ? filePaths[0] : null;
  });

  ipcMain.handle('file:write', async (event, { filePath, data }) => {
    await fsPromises.writeFile(filePath, data);
    return true;
  });

  ipcMain.handle('file:writeBuffer', async (event, { filePath, data }) => {
    await fsPromises.writeFile(filePath, Buffer.from(data));
    return true;
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  try { saveDatabase(); } catch(e) {}
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  try { saveDatabase(); } catch(e) {}
});
