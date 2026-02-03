import { initSidebar } from './sidebar.js';
import { initContextMenu } from './contextMenu.js';
import { initSelection } from './selection.js';

// === КНОПКИ САЙДБАРА ===
document.getElementById('toggle-sidebar')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('sidebar')?.classList.add('collapsed');
  document.getElementById('open-sidebar-btn')?.classList.add('visible');
});

document.getElementById('open-sidebar-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('sidebar')?.classList.remove('collapsed');
  document.getElementById('open-sidebar-btn')?.classList.remove('visible');
});

// === ИНИЦИАЛИЗАЦИЯ МОДУЛЕЙ ===
initSidebar();
initContextMenu();
initSelection();

// dragDrop.js сам регистрирует обработчики при импорте
import './dragdrop.js';