// js/selection.js
import { isDraggingActive } from './dragDrop.js';

let isSelecting = false;
let selectionStartX = 0;
let selectionStartY = 0;
let selectionRect = null;
let externalDragActive = false; // ← Флаг для внешнего drag (например, игрушки)

// Слушаем события от других модулей
window.addEventListener('dragStart', () => {
  externalDragActive = true;
});

window.addEventListener('dragEnd', () => {
  externalDragActive = false;
});

function createSelectionRect() {
  if (!selectionRect) {
    selectionRect = document.createElement('div');
    selectionRect.className = 'selection-rect';
    document.body.appendChild(selectionRect);
  }
}

export function initSelection() {
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    // Блокируем выделение, если активен любой drag
    if (isDraggingActive() || externalDragActive) return;
    
    window.dispatchEvent(new CustomEvent('closeContextMenu'));
    
    const clickedOnObject = e.target.closest('.world-object');
    const clickedOnUI = e.target.closest('#sidebar') || 
                         e.target.closest('#open-sidebar-btn') ||
                         e.target.closest('#crafting-panel') ||
                         e.target.closest('#open-crafting-btn') ||
                         e.target.closest('.plush-toy'); // ← Игнорируем клик по игрушке
    
    if (!clickedOnObject && !clickedOnUI) {
      e.preventDefault();
      isSelecting = true;
      selectionStartX = e.clientX;
      selectionStartY = e.clientY;
      createSelectionRect();
    }
  }, { capture: true });
  
  document.addEventListener('mousemove', (e) => {
    if (!isSelecting || !selectionRect) return;
    const x = e.clientX;
    const y = e.clientY;
    const left = Math.min(selectionStartX, x);
    const top = Math.min(selectionStartY, y);
    const width = Math.abs(x - selectionStartX);
    const height = Math.abs(y - selectionStartY);
    selectionRect.style.left = `${left}px`;
    selectionRect.style.top = `${top}px`;
    selectionRect.style.width = `${width}px`;
    selectionRect.style.height = `${height}px`;
    selectionRect.classList.add('visible');
  });
  
  document.addEventListener('mouseup', () => {
    if (isSelecting) {
      isSelecting = false;
      if (selectionRect) {
        selectionRect.classList.remove('visible');
      }
    }
  });
}