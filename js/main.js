import { initSidebar } from './sidebar.js';
import { initContextMenu } from './contextMenu.js';
import { initSelection } from './selection.js';
import { showItemDetails } from './markdown.js';

// Управление панелями
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

// === МУСОРНОЕ ВЕДРО ===
document.getElementById('trash-bin')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const worldObjects = document.querySelectorAll('.world-object:not(.in-cell)');
  const count = worldObjects.length;
  
  if (count === 0) return;
  
  if (count === 1) {
    worldObjects[0].remove();
    return;
  }
  
  let modal = document.getElementById('confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'hidden'; // ← ДОБАВЛЕНО
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="confirm-overlay"></div>
    <div class="confirm-content">
      <h3>Удалить все предметы?</h3>
      <p>Будет удалено <strong>${count}</strong> предметов с поля.</p>
      <div class="confirm-buttons">
        <button class="confirm-cancel">Отмена</button>
        <button class="confirm-delete">Удалить</button>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
  
  // Анимация появления
  setTimeout(() => {
    modal.classList.remove('hidden');
  }, 10);
  
  const closeConfirm = () => {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  };
  
  const cancelBtn = modal.querySelector('.confirm-cancel');
  const deleteBtn = modal.querySelector('.confirm-delete');
  
  cancelBtn?.addEventListener('click', closeConfirm);
  deleteBtn?.addEventListener('click', () => {
    worldObjects.forEach(obj => obj.remove());
    closeConfirm();
  });
});

// Обработчик показа описания
window.addEventListener('showItemDetails', (e) => {
  showItemDetails(e.detail.item);
});

// Инициализация
initSidebar();
initContextMenu();
initSelection();

import './dragDrop.js';