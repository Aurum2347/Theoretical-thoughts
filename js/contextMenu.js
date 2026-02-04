import { ITEMS } from './items.js';
import { stopDragging } from './dragDrop.js';

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
    if (!item) return;
    
    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    
    let menuHTML = `<div class="context-menu-title">${item.name}</div>`;
    
    // Кнопка "Подробнее" только если есть описание
    if (item.descriptionFile) {
      menuHTML += `<div class="context-menu-item" data-action="details">Подробнее</div>`;
    }
    
    menuHTML += `<div class="context-menu-item" data-action="delete">Удалить</div>`;
    contextMenu.innerHTML = menuHTML;
    
    document.body.appendChild(contextMenu);
    contextMenu.style.left = `${e.clientX + 8}px`;
    contextMenu.style.top = `${e.clientY + 6}px`;
    
    setTimeout(() => {
      if (contextMenu) contextMenu.classList.add('visible');
    }, 10);
    
    const menuClickHandler = (ev) => {
      const action = ev.target.dataset.action;
      
      if (action === 'delete') {
        target.classList.add('deleting');
        setTimeout(() => {
          if (target.parentNode) {
            target.remove();
          }
        }, 250);
      }
      
      if (action === 'details' && item.descriptionFile) {
        // Открываем модальное окно с описанием
        window.dispatchEvent(new CustomEvent('showItemDetails', {
          detail: { item }
        }));
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