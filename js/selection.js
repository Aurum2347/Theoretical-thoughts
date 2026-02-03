import { isDraggingActive } from './dragdrop.js';

let isSelecting = false;
let selectionStartX = 0;
let selectionStartY = 0;
let selectionRect = null;

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
    if (isDraggingActive()) return;
    window.dispatchEvent(new CustomEvent('closeContextMenu'));
    
    const clickedOnObject = e.target.closest('.world-object');
    const clickedOnUI = e.target.closest('#sidebar') || 
                         e.target.closest('#open-sidebar-btn') ||
                         e.target.closest('#crafting-panel') ||
                         e.target.closest('#open-crafting-btn');
    
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