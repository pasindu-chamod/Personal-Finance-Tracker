const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  auth: {
    register: (data) => ipcRenderer.invoke('auth:register', data),
    login: (data) => ipcRenderer.invoke('auth:login', data),
    updateProfile: (data) => ipcRenderer.invoke('auth:updateProfile', data),
    changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data)
  },
  transactions: {
    create: (data) => ipcRenderer.invoke('transactions:create', data),
    getAll: (userId, filters) => ipcRenderer.invoke('transactions:getAll', { userId, filters }),
    getById: (id) => ipcRenderer.invoke('transactions:getById', { id }),
    update: (data) => ipcRenderer.invoke('transactions:update', data),
    delete: (id) => ipcRenderer.invoke('transactions:delete', { id }),
    getSummary: (userId, month, year) => ipcRenderer.invoke('transactions:getSummary', { userId, month, year })
  },
  categories: {
    getAll: (userId) => ipcRenderer.invoke('categories:getAll', { userId }),
    getByType: (userId, type) => ipcRenderer.invoke('categories:getByType', { userId, type }),
    create: (data) => ipcRenderer.invoke('categories:create', data),
    update: (data) => ipcRenderer.invoke('categories:update', data),
    delete: (id) => ipcRenderer.invoke('categories:delete', { id })
  },
  budget: {
    create: (data) => ipcRenderer.invoke('budget:create', data),
    getAll: (userId, month) => ipcRenderer.invoke('budget:getAll', { userId, month }),
    update: (data) => ipcRenderer.invoke('budget:update', data),
    delete: (id) => ipcRenderer.invoke('budget:delete', { id })
  },
  goals: {
    create: (data) => ipcRenderer.invoke('goals:create', data),
    getAll: (userId) => ipcRenderer.invoke('goals:getAll', { userId }),
    updateSaved: (data) => ipcRenderer.invoke('goals:updateSaved', data),
    delete: (id) => ipcRenderer.invoke('goals:delete', { id })
  },
  reports: {
    monthlyTotals: (userId, year) => ipcRenderer.invoke('reports:monthlyTotals', { userId, year }),
    categoryBreakdown: (userId, startDate, endDate, type) => ipcRenderer.invoke('reports:categoryBreakdown', { userId, startDate, endDate, type }),
    dailyTrend: (userId, month, year) => ipcRenderer.invoke('reports:dailyTrend', { userId, month, year }),
    getTransactionsForExport: (userId, startDate, endDate) => ipcRenderer.invoke('reports:getTransactionsForExport', { userId, startDate, endDate })
  },
  settings: {
    getUser: (userId) => ipcRenderer.invoke('settings:getUser', { userId }),
    update: (userId, settings) => ipcRenderer.invoke('settings:update', { userId, settings }),
    testMysql: (config) => ipcRenderer.invoke('mysql:test', config),
    saveMysqlConfig: (config) => ipcRenderer.invoke('mysql:saveConfig', config),
    getMysqlConfig: () => ipcRenderer.invoke('mysql:getConfig')
  },
  backup: {
    export: (userId) => ipcRenderer.invoke('backup:export', { userId }),
    import: () => ipcRenderer.invoke('backup:import')
  },
  dialog: {
    save: (filters, defaultPath) => ipcRenderer.invoke('dialog:save', { filters, defaultPath }),
    open: (filters) => ipcRenderer.invoke('dialog:open', { filters })
  },
  file: {
    write: (filePath, data) => ipcRenderer.invoke('file:write', { filePath, data }),
    writeBuffer: (filePath, data) => ipcRenderer.invoke('file:writeBuffer', { filePath, data })
  }
});
