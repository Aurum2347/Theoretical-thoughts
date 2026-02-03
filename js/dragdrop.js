import { ITEMS } from './items.js';

let draggingObject = null;
let isDragging = false;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let lastTime = 0;
let animationRunning = false;
const FRICTION = 0.92;

// === Создание объекта ===
window.addEventListener('spawnObject', (e) => {
  const { item, clientX, clientY } = e.detail;
  createAndStartDragging(item, clientX, clientY);
});

function createAndStartDragging(item, clientX, clientY) {
  const obj = document.createElement('div');
  obj.className = 'world-object';
  obj.dataset.id = item.id;
  
  if (item.id !== 'white') {
    const img = document.createElement('img');
    img.src = `items/${item.id}`;
    obj.appendChild(img);
  } else {
    obj.style.background = 'rgba(255,255,255,0.85)';
    obj.style.borderRadius = '4px';
  }
  
  document.body.appendChild(obj);
  
  const startX = clientX - 30;
  const startY = clientY - 30;
  
  currentX = startX;
  currentY = startY;
  targetX = startX;
  targetY = startY;
  velocityX = 0;
  velocityY = 0;
  
  isDragging = true;
  draggingObject = obj;
  obj.style.zIndex = '30';
  obj.style.cursor = 'grabbing';
  obj.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

// === Перетаскивание существующих объектов ===
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || isDragging) return;
  
  const target = e.target.closest('.world-object');
  if (!target) return;
  
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('closeContextMenu'));
  
  // Если объект в ячейке — вытаскиваем
  if (target.parentElement?.classList.contains('crafting-cell')) {
    const cell = target.parentElement;
    
    // Получаем АБСОЛЮТНЫЕ координаты центра объекта
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Возвращаем в body
    document.body.appendChild(target);
    
    // Устанавливаем позицию под курсором (но начиная с центра объекта)
    const startX = centerX - 30;
    const startY = centerY - 30;
    
    // Сбрасываем стили
    target.style.position = '';
    target.style.top = '';
    target.style.left = '';
    target.style.width = '60px';
    target.style.height = '60px';
    target.classList.remove('in-cell');
    delete target.dataset.inCell;
    
    // Начинаем drag с текущей позиции
    currentX = startX;
    currentY = startY;
    targetX = e.clientX - 30;
    targetY = e.clientY - 30;
    velocityX = 0;
    velocityY = 0;
    
    isDragging = true;
    draggingObject = target;
    target.style.zIndex = '30';
    target.style.cursor = 'grabbing';
    target.style.transform = `translate(${startX}px, ${startY}px)`;
    
    return;
  }
  
  // Обычный drag из мира
  const rect = target.getBoundingClientRect();
  currentX = rect.left;
  currentY = rect.top;
  targetX = e.clientX - 30;
  targetY = e.clientY - 30;
  velocityX = 0;
  velocityY = 0;
  
  isDragging = true;
  draggingObject = target;
  target.style.zIndex = '30';
  target.style.cursor = 'grabbing';
  target.style.transform = `translate(${currentX}px, ${currentY}px)`;
});

// === MOUSEMOVE ===
document.addEventListener('mousemove', (e) => {
  if (!isDragging || !draggingObject) return;
  targetX = e.clientX - 30;
  targetY = e.clientY - 30;
  draggingObject.style.transform = `translate(${targetX}px, ${targetY}px)`;
});

// === MOUSEUP ===
// === MOUSEUP ===
document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  
  isDragging = false;
  if (!draggingObject) return;
  
  draggingObject.style.cursor = 'grab';
  draggingObject.style.zIndex = '5';
  
  const objCenterX = targetX + 30;
  const objCenterY = targetY + 30;
  
  // === ПРОВЕРКА ЛЕВОГО МЕНЮ ===
  const sidebar = document.getElementById('sidebar');
  let inSidebar = false;
  
  if (sidebar && !sidebar.classList.contains('collapsed')) {
    const sbRect = sidebar.getBoundingClientRect();
    inSidebar = (
      objCenterX >= sbRect.left && objCenterX <= sbRect.right &&
      objCenterY >= sbRect.top && objCenterY <= sbRect.bottom
    );
  }
  
  // Если попал в левое меню — удаляем
  if (inSidebar) {
    if (draggingObject.parentNode) {
      draggingObject.remove();
    }
    draggingObject = null;
    return;
  }
  
  // === ПРОВЕРКА КРАФТ-ПАНЕЛИ ===
  const cells = document.querySelectorAll('#crafting-panel .crafting-cell');
  let targetCell = null;
  let minDist = Infinity;
  
  cells.forEach(cell => {
    if (cell.querySelector('.world-object')) return;
    
    const rect = cell.getBoundingClientRect();
    const cellCenterX = rect.left + rect.width / 2;
    const cellCenterY = rect.top + rect.height / 2;
    
    const dist = Math.hypot(objCenterX - cellCenterX, objCenterY - cellCenterY);
    if (dist < minDist && dist < 50) {
      minDist = dist;
      targetCell = cell;
    }
  });
  
  if (targetCell) {
    targetCell.appendChild(draggingObject);
    draggingObject.style.position = 'absolute';
    draggingObject.style.top = '50%';
    draggingObject.style.left = '50%';
    draggingObject.style.transform = 'translate(-50%, -50%)';
    draggingObject.style.width = '40px';
    draggingObject.style.height = '40px';
    draggingObject.style.zIndex = '1';
    draggingObject.style.cursor = 'default';
    draggingObject.classList.add('in-cell');
    draggingObject.dataset.inCell = 'true';
    return;
  }
  
  // Инерция в мире
  currentX = targetX;
  currentY = targetY;
  const dx = targetX - currentX;
  const dy = targetY - currentY;
  velocityX = dx * 2;
  velocityY = dy * 2;
  startAnimation();
});


// === АНИМАЦИЯ ИНЕРЦИИ ===
function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 16;
  lastTime = timestamp;
  
  if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    currentX += velocityX;
    currentY += velocityY;
    if (draggingObject) {
      draggingObject.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    velocityX *= FRICTION;
    velocityY *= FRICTION;
  } else {
    lastTime = 0;
    animationRunning = false;
    return;
  }
  
  requestAnimationFrame(animate);
}

function startAnimation() {
  if (!animationRunning) {
    animationRunning = true;
    lastTime = 0;
    requestAnimationFrame(animate);
  }
}

export function stopDragging() {
  if (isDragging && draggingObject) {
    isDragging = false;
    draggingObject.style.cursor = 'grab';
    draggingObject.style.zIndex = '5';
  }
}

export function isDraggingActive() {
  return isDragging;
}