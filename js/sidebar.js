import { ITEMS } from './items.js';

// Инициализация левой панели
export function initSidebar() {
  const container = document.querySelector('.items-container');
  if (!container) return;

  container.innerHTML = '';
  ITEMS.forEach(item => {
    const preview = document.createElement('div');
    preview.className = 'item-preview';
    preview.dataset.id = item.id;
    
    if (item.id !== 'white') {
      const img = document.createElement('img');
      img.src = `items/${item.id}`;
      preview.appendChild(img);
    } else {
      preview.style.background = 'rgba(255,255,255,0.85)';
    }
    
    // Генерируем событие для dragDrop.js
    preview.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Только ЛКМ
      e.preventDefault();
      
      window.dispatchEvent(new CustomEvent('spawnObject', {
        detail: { item, clientX: e.clientX, clientY: e.clientY }
      }));
    });
    
    container.appendChild(preview);
  });
}