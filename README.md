# 💰 SmartFinance - Personal Finance Tracker

An offline-first, feature-packed **Desktop Application** built with **Electron.js** for personal income, expense, and budget management. Designed with modern **Glassmorphism UI**, interactive **Chart.js** analytics, **Savings Goals**, and dual **MySQL / SQLite** database support.

---

## ✨ Features

- **🔒 User Authentication**: Secure login and registration with encrypted passwords (`bcryptjs`).
- **🏠 Interactive Dashboard**:
  - Live Total Income, Total Expense, and Net Balance summary metrics.
  - **Financial Health Score** gauge (0-100) based on savings ratio.
  - Doughnut chart for category breakdown & 6-month comparative bar chart.
- **📋 Transaction Management**: Full CRUD operations for income and expenses with search, filtering, and pagination.
- **🏷️ Custom Categories**: Pre-seeded default categories + ability to add custom income/expense categories with custom icons.
- **🎯 Savings Goals Tracker**: Create dedicated savings targets (e.g. Emergency Fund, Laptop Purchase) and track deposit progress with visual progress bars.
- **💰 Monthly Budget Limits**: Set category-wise spending limits with visual over-budget alerts.
- **📊 Reports & Exports**: Export transaction logs to **PDF** and **Excel (.xlsx)** formats, or backup data as **JSON**.
- **🛢️ Dual Database Engine (MySQL & Offline SQLite)**:
  - Supports direct connection to **MySQL Server** (XAMPP / MySQL Workbench / Remote MySQL).
  - Automatic fallback to offline WebAssembly-based **SQLite (`sql.js`)** if MySQL is not configured.
- **🎨 Modern Glassmorphism Aesthetic**: Seamless Dark / Light mode support with 3D financial graphic banners.

---

## 🛠️ Tech Stack

- **Framework**: [Electron.js](https://www.electronjs.org/) (Cross-platform Desktop)
- **Frontend**: HTML5, Vanilla CSS3 (Custom Tokens), JavaScript (ES6+)
- **Database**: MySQL (`mysql2`) / SQLite (`sql.js` WASM)
- **Charts & Reports**: Chart.js, jsPDF, ExcelJS
- **Security**: bcryptjs

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/pasindu-chamod/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
npm install
```

### 2. Run Application
```bash
npm start
```

---

## 🛢️ MySQL Database Setup (Optional)

SmartFinance works out-of-the-box in **Offline Mode** using built-in SQLite (`smartfinance.db`). If you want to connect to a **MySQL Server** (such as XAMPP or MySQL Workbench):

1. Start your local MySQL Server (e.g. XAMPP Control Panel -> MySQL Start).
2. Create the database schema by importing `database/schema.sql` into phpMyAdmin or MySQL Workbench.
3. Open **SmartFinance** -> Go to **Settings** -> **MySQL Database Configuration**.
4. Check **Enable MySQL Database Mode**, enter your credentials (Host: `localhost`, Port: `3306`, User: `root`, Password: ``), and click **🔌 Test Connection**.
5. Save settings and restart the app to switch database engine!

---

## 📁 Project Structure

```text
Personal-Finance-Tracker/
├── main.js                  # Electron main process & IPC handlers
├── preload.js               # Secure IPC bridge (window.api)
├── package.json             # App metadata & dependencies
├── database/
│   ├── db.js                # Database wrapper (MySQL / sql.js manager)
│   ├── mysql-db.js          # MySQL connection pool
│   ├── queries.js           # Database queries & logic
│   ├── migrations.js        # SQLite schema & seeding
│   └── schema.sql           # MySQL DDL setup script
└── src/
    ├── index.html           # SPA Application Shell
    ├── assets/images/       # 3D Visual Artworks
    ├── css/                 # CSS Design Tokens & Styles
    ├── js/                  # SPA Controllers & Utilities
    └── pages/               # HTML Page Templates
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
