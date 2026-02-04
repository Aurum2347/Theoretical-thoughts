import { ITEMS } from './items.js';

let draggingObject = null;
let isDragging = false;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let lastTime = 0;
let animationRunning = false;
const FRICTION = 0.92;

// Для плавного эффекта над панелью
let sidebarHoverState = 0; // 0 = нет, 1 = да
let sidebarHoverAnimationId = null;

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
  
  obj.style.transform = `translate(${clientX - 30}px, ${clientY - 30}px)`;
  document.body.appendChild(obj);
  
  const rect = obj.getBoundingClientRect();
  const startX = clientX - rect.width / 2;
  const startY = clientY - rect.height / 2;
  
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
  
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('closeContextMenu'));
  
  if (target.parentElement?.classList.contains('crafting-cell')) {
    const cell = target.parentElement;
    
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    document.body.appendChild(target);
    
    const startX = centerX - rect.width / 2;
    const startY = centerY - rect.height / 2;
    
    target.style.position = '';
    target.style.top = '';
    target.style.left = '';
    target.style.width = '60px';
    target.style.height = '60px';
    target.classList.remove('in-cell');
    delete target.dataset.inCell;
    
    currentX = startX;
    currentY = startY;
    targetX = e.clientX - rect.width / 2;
    targetY = e.clientY - rect.height / 2;
    velocityX = 0;
    velocityY = 0;
    
    isDragging = true;
    draggingObject = target;
    target.style.zIndex = '30';
    target.style.cursor = 'grabbing';
    target.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    return;
  }
  
  const rect = target.getBoundingClientRect();
  currentX = rect.left;
  currentY = rect.top;
  targetX = e.clientX - rect.width / 2;
  targetY = e.clientY - rect.height / 2;
  velocityX = 0;
  velocityY = 0;
  
  isDragging = true;
  draggingObject = target;
  target.style.zIndex = '30';
  target.style.cursor = 'grabbing';
  target.style.transform = `translate(${currentX}px, ${currentY}px)`;
});

// === ПЛАВНОЕ ИЗМЕНЕНИЕ СОСТОЯНИЯ НАВЕДЕНИЯ ===
function animateSidebarHover() {
  if (!draggingObject) return;
  
  const ease = 0.1;
  sidebarHoverState += (sidebarHoverTarget - sidebarHoverState) * ease;
  
  // Применяем плавный transform
  const scale = 1 - sidebarHoverState * 0.1; // от 1.0 до 0.9
  const rotate = sidebarHoverState * 25; // от 0 до 25 градусов
  
  draggingObject.style.transform = `translate(${targetX}px, ${targetY}px) scale(${scale}) rotate(${rotate}deg)`;
  
  if (Math.abs(sidebarHoverState - sidebarHoverTarget) > 0.01) {
    sidebarHoverAnimationId = requestAnimationFrame(animateSidebarHover);
  } else {
    sidebarHoverAnimationId = null;
  }
}

let sidebarHoverTarget = 0;

// === MOUSEMOVE ===
document.addEventListener('mousemove', (e) => {
  if (!isDragging || !draggingObject) return;
  
  const rect = draggingObject.getBoundingClientRect();
  targetX = e.clientX - rect.width / 2;
  targetY = e.clientY - rect.height / 2;
  
  // Проверяем наведение на левую панель
  const sidebar = document.getElementById('sidebar');
  let inSidebar = false;
  
  if (sidebar && !sidebar.classList.contains('collapsed')) {
    const sbRect = sidebar.getBoundingClientRect();
    inSidebar = (
      e.clientX >= sbRect.left && e.clientX <= sbRect.right &&
      e.clientY >= sbRect.top && e.clientY <= sbRect.bottom
    );
  }
  
  // Обновляем цель для плавной анимации
  sidebarHoverTarget = inSidebar ? 1 : 0;
  
  // Запускаем анимацию, если не запущена
  if (!sidebarHoverAnimationId) {
    sidebarHoverAnimationId = requestAnimationFrame(animateSidebarHover);
  }
  
  // Отключаем transition для мгновенного перемещения
  draggingObject.style.transition = 'none';
});

// === MOUSEUP ===
document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  
  // Останавливаем анимацию наведения
  if (sidebarHoverAnimationId) {
    cancelAnimationFrame(sidebarHoverAnimationId);
    sidebarHoverAnimationId = null;
  }
  
  isDragging = false;
  if (!draggingObject) return;
  
  draggingObject.style.cursor = 'grab';
  draggingObject.style.zIndex = '5';
  
  const objCenterX = targetX + (draggingObject.getBoundingClientRect().width / 2);
  const objCenterY = targetY + (draggingObject.getBoundingClientRect().height / 2);
  
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
  
  // Если попал в левое меню — удаляем с улучшенной анимацией
  if (inSidebar) {
    // Плавное исчезновение с затуханием и вращением
    draggingObject.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
    draggingObject.style.transform = 'scale(0.7) rotate(45deg)';
    draggingObject.style.opacity = '0';
    
    setTimeout(() => {
      if (draggingObject.parentNode) {
        draggingObject.remove();
      }
      draggingObject = null;
    }, 300);
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
    draggingObject.style.width = '50px';
    draggingObject.style.height = '50px';
    draggingObject.style.zIndex = '1';
    draggingObject.style.cursor = 'grab';
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
    draggingObject.style.transform = `translate(${targetX}px, ${targetY}px)`;
  }
}

export function isDraggingActive() {
  return isDragging;
}