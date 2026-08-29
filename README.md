<div align="center">

  # 💰 SmartFinance
  ### Premium Personal Income & Expense Tracker Desktop Application

  [![Electron](https://img.shields.io/badge/Electron-v28.3.3-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](LICENSE)

  <p align="center">
    An offline-first, feature-rich <b>Cross-Platform Desktop Application</b> built with Electron.js for complete control over your personal finances. Designed with a sleek <b>Glassmorphism UI</b>, interactive <b>Chart.js analytics</b>, <b>Financial Health Scoring</b>, and <b>Savings Goals tracking</b>.
  </p>

</div>

---

## 🌟 Key Features

- **🔒 User Authentication**: Secure Login & Registration system with password hashing (`bcryptjs`).
- **🏠 Executive Dashboard**:
  - Live **Total Income**, **Total Expense**, and **Net Balance** summary metrics with count-up animations.
  - **⭐ Financial Health Score**: Dynamic rating (0-100) based on savings ratio and spending trends.
  - Interactive **Doughnut & Bar charts** powered by Chart.js.
- **📋 Transaction Management**: Full CRUD operations for income and expenses with search filter, type filter, and date ordering.
- **🎯 Savings Goals Tracker**: Set dedicated financial targets (e.g. *Emergency Fund*, *New Tech*) and track deposit progress visually.
- **💰 Budget Planner**: Set category-wise monthly spending limits with progress indicators and visual over-budget alerts.
- **🏷️ Category Management**: Default income/expense categories + option to create custom categories with custom icons.
- **📊 Reports & Exports**: Instant data exports to **JSON Backup / Restore** for complete data safety.
- **🎨 Glassmorphism Design System**: Modern dark & light mode UI styling with 3D financial graphic artwork assets.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Electron.js](https://www.electronjs.org/) (Cross-platform Desktop) |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design System), Modern JS (ES6+) |
| **Database** | Offline SQLite via `sql.js` (WebAssembly) |
| **Data Visuals** | [Chart.js](https://www.chartjs.org/) |
| **Security** | `bcryptjs` (Password Hashing) |

---

## 📸 Screenshots Overview

<div align="center">
  <img src="src/assets/images/login_hero_bg.jpg" alt="SmartFinance Hero Visual" width="90%" style="border-radius: 12px; margin-bottom: 12px;" />
  <br/>
  <i>3D Glassmorphism Interface Artwork & Hero Banner</i>
</div>

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v16 or higher).

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pasindu-chamod/Personal-Finance-Tracker.git
   cd Personal-Finance-Tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```text
Personal-Finance-Tracker/
├── main.js                  # Electron main process & IPC handlers
├── preload.js               # Secure IPC bridge (window.api)
├── package.json             # App metadata & dependencies
├── database/
│   ├── db.js                # Database connection & persistence manager
│   ├── queries.js           # Parameterized SQL query functions
│   └── migrations.js        # Schema creation & default seeding
└── src/
    ├── index.html           # SPA Application Shell
    ├── assets/images/       # 3D Visual Artworks
    ├── css/                 # Modern CSS Design Tokens & Layouts
    ├── js/                  # SPA Controllers & Feature Modules
    └── pages/               # HTML Page Templates
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">
  <sub>Built with ❤️ by Pasindu Chamod</sub>
</div>
