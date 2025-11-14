import { Window } from './tauri-api/window.js';
import { openPSADTModal } from './psadt.js';
const appWindow = Window.getCurrent();

// Application State
const appState = {
  sidebarOpen: true,
  currentView: 'packager-tasks',
  selectedTask: null,
  selectedOption: null,
  isDarkMode: false,
  isMaximized: false,
  modalOpen: false,
  packageWrapperOpen: false,
};

// DOM Elements
const menuButton = document.getElementById('menuButton');
const themeToggle = document.getElementById('themeToggle');
const navigationSidebar = document.getElementById('navigationSidebar');
const currentView = document.getElementById('currentView');
const taskBreadcrumb = document.getElementById('taskBreadcrumb');
const optionBreadcrumb = document.getElementById('optionBreadcrumb');
const taskName = document.getElementById('taskName');
const optionName = document.getElementById('optionName');
const comingSoonText = document.getElementById('comingSoonText');
const emptyStateText = document.getElementById('emptyStateText');

// Window Controls
const minimizeButton = document.getElementById('minimizeButton');
const maximizeButton = document.getElementById('maximizeButton');
const closeButton = document.getElementById('closeButton');

// Views and Options
const packagerTasksView = document.getElementById('packagerTasksView');
const otherTasksView = document.getElementById('otherTasksView');
const createPackageOptions = document.getElementById('createPackageOptions');
const editPackageOptions = document.getElementById('editPackageOptions');
const testPackageOptions = document.getElementById('testPackageOptions');
const emptyOptions = document.getElementById('emptyOptions');

// Utility Functions
function getViewDisplayName(view) {
  return view.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getTaskDisplayName(task) {
  if (!task) return null;
  return task.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getOptionDisplayName(option) {
  if (!option) return null;
  const optionNames = {
    'ps1': 'PS1',
    'intunewin': 'IntuneWin',
    'psadt': 'PSAppDeployToolkit',
    'edit-ps1': 'PS1',
    'edit-psadt': 'PSAppDeployToolkit',
    'test-ps1': 'PS1',
    'test-psadt': 'PSAppDeployToolkit'
  };
  return optionNames[option] || option;
}

// Window Controls Functions
function minimizeWindow() {
  appWindow.minimize();
}

function toggleMaximizeWindow() {
  appWindow.toggleMaximize();
}

function closeWindow() {
  appWindow.close();
}

// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  appState.isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  document.documentElement.classList.toggle('dark', appState.isDarkMode);
}

function toggleTheme() {
  appState.isDarkMode = !appState.isDarkMode;
  document.documentElement.classList.toggle('dark', appState.isDarkMode);
  localStorage.setItem('theme', appState.isDarkMode ? 'dark' : 'light');
}

// Sidebar Management
function toggleSidebar() {
  appState.sidebarOpen = !appState.sidebarOpen;
  navigationSidebar.classList.toggle('hidden', !appState.sidebarOpen);
}

// Navigation Management
function updateBreadcrumb() {
  currentView.textContent = getViewDisplayName(appState.currentView);
  
  taskBreadcrumb.classList.toggle('hidden', !appState.selectedTask);
  if (appState.selectedTask) {
    taskName.textContent = getTaskDisplayName(appState.selectedTask);
  }
  
  optionBreadcrumb.classList.toggle('hidden', !appState.selectedOption);
  if (appState.selectedOption) {
    optionName.textContent = getOptionDisplayName(appState.selectedOption);
  }
}

function setCurrentView(view) {
  appState.currentView = view;
  appState.selectedTask = null;
  appState.selectedOption = null;
  
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === view);
  });
  
  const isPackager = view === 'packager-tasks';
  packagerTasksView.classList.toggle('hidden', !isPackager);
  otherTasksView.classList.toggle('hidden', isPackager);
  
  if (!isPackager) {
    comingSoonText.textContent = `${getViewDisplayName(view)} coming soon...`;
  }
  
  updateOptionsView();
  updateBreadcrumb();
}

function setSelectedTask(taskId) {
  appState.selectedTask = taskId;
  appState.selectedOption = null;
  
  document.querySelectorAll('.task-item').forEach(item => {
    item.classList.toggle('selected', item.getAttribute('data-task') === taskId);
  });
  
  updateOptionsView();
  updateBreadcrumb();
}

function setSelectedOption(optionId) {
  appState.selectedOption = optionId;
  
  document.querySelectorAll('.option-item').forEach(item => {
    item.classList.toggle('selected', item.getAttribute('data-option') === optionId);
  });
  
  if (optionId && optionId.includes('psadt')) {
      openPSADTModal();
  }
  
  updateBreadcrumb();
}

function updateOptionsView() {
  const views = ['createPackageOptions', 'editPackageOptions', 'testPackageOptions', 'emptyOptions'];
  views.forEach(v => document.getElementById(v).classList.add('hidden'));

  if (appState.currentView === 'packager-tasks') {
    const viewMap = {
      'create-package': 'createPackageOptions',
      'edit-package': 'editPackageOptions',
      'test-package': 'testPackageOptions'
    };
    const viewToShow = viewMap[appState.selectedTask] || 'emptyOptions';
    document.getElementById(viewToShow).classList.remove('hidden');
    
    if (viewToShow === 'emptyOptions') {
      emptyStateText.textContent = appState.selectedTask ? 'Select an option' : 'Select a task';
    }
  } else {
    document.getElementById('emptyOptions').classList.remove('hidden');
    emptyStateText.textContent = 'Select a task';
  }
}

// Tab Management
function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('hidden', content.id !== `${tabName}Tab`);
  });
}

// Event Listeners
function initializeEventListeners() {
  menuButton.addEventListener('click', toggleSidebar);
  themeToggle.addEventListener('click', toggleTheme);
  
  minimizeButton.addEventListener('click', minimizeWindow);
  maximizeButton.addEventListener('click', toggleMaximizeWindow);
  closeButton.addEventListener('click', closeWindow);
  
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => setCurrentView(item.dataset.view));
  });
  
  document.querySelectorAll('.task-item[data-task]').forEach(item => {
    item.addEventListener('click', () => setSelectedTask(item.dataset.task));
  });
  
  document.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => setSelectedOption(item.dataset.option));
  });
  
  document.querySelectorAll('.tab-button[data-tab]').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // PSADT script will handle its own escape logic
      if (!appState.packageWrapperOpen && appState.modalOpen) {
          // If a non-PSADT modal were open, it would be closed here
      }
    }
    if (e.altKey && (e.key === 'a' || e.key === 'F4')) {
      e.preventDefault();
      closeWindow();
    }
    if (e.key === 'F11') {
      e.preventDefault();
      toggleMaximizeWindow();
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && appState.sidebarOpen) {
      navigationSidebar.classList.remove('hidden');
    }
  });
  
  document.querySelector('.title-bar').addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    toggleMaximizeWindow();
  });
}

// Initialization
function initializeApp() {
  initializeTheme();
  initializeEventListeners();
  updateBreadcrumb();
  updateOptionsView();
  switchTab('tasks');
  console.log('Main Launcher App Initialized.');
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    appState.isDarkMode = e.matches;
    document.documentElement.classList.toggle('dark', e.matches);
  }
});