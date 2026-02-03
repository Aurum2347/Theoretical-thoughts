import { ITEMS } from './items.js';
import { stopDragging } from './dragdrop.js';

let contextMenu = null;

export function initContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    
    if (contextMenu) {
      contextMenu.classList.remove('visible');
      setTimeout(() => {
        if (contextMenu && contextMenu.parentNode) contextMenu.remove();
        contextMenu = null;
      }, 250);
    }
    
    const target = e.target.closest('.world-object');
    if (!target) return;
    
    stopDragging();
    
    const id = target.dataset.id;
    const item = ITEMS.find(i => i.id === id);
    const name = item ? item.name : 'Item';
    
    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-title">${name}</div>
      <div class="context-menu-item" data-action="delete">Удалить</div>
    `;
    document.body.appendChild(contextMenu);
    contextMenu.style.left = `${e.clientX + 8}px`;
    contextMenu.style.top = `${e.clientY + 6}px`;
    
    setTimeout(() => {
      if (contextMenu) contextMenu.classList.add('visible');
    }, 10);
    
    const menuClickHandler = (ev) => {
      if (ev.target.dataset.action === 'delete') {
        // Просто добавляем класс для анимации
        target.classList.add('deleting');
        
        setTimeout(() => {
          if (target.parentNode) {
            target.remove();
          }
        }, 250);
      }
      closeMenu();
      document.removeEventListener('click', documentClickHandler);
    };
    
    const documentClickHandler = (ev) => {
      if (!contextMenu || contextMenu.contains(ev.target)) return;
      closeMenu();
      document.removeEventListener('click', documentClickHandler);
    };
    
    const closeMenu = () => {
      if (contextMenu) {
        contextMenu.classList.remove('visible');
        setTimeout(() => {
          if (contextMenu && contextMenu.parentNode) contextMenu.remove();
          contextMenu = null;
        }, 250);
      }
    };
    
    contextMenu.addEventListener('click', menuClickHandler);
    document.addEventListener('click', documentClickHandler);
    
    window.addEventListener('scroll', closeMenu, { once: true });
  });
}