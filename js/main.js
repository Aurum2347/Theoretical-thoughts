import { initSidebar } from './sidebar.js';
import { initContextMenu } from './contextMenu.js';
import { initSelection } from './selection.js';

// Управление левой панелью
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

// Управление правой панелью
document.getElementById('toggle-crafting')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('crafting-panel')?.classList.add('collapsed');
  document.getElementById('open-crafting-btn')?.classList.add('visible');
});

document.getElementById('open-crafting-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('crafting-panel')?.classList.remove('collapsed');
  document.getElementById('open-crafting-btn')?.classList.remove('visible');
});

// Инициализация
initSidebar();
initContextMenu();
initSelection();

// Подключаем dragDrop (он сам регистрирует обработчики)
import './dragdrop.js';