import { ITEMS } from './items.js';

// Глобальное состояние перетаскивания (инкапсулировано в модуле)
let draggingObject = null;
let isDragging = false;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let lastTime = 0;
let animationRunning = false;
const SMOOTHING = 0.25;
const FRICTION = 0.92;

// === СОЗДАНИЕ ОБЪЕКТА ИЗ СОБЫТИЯ (от sidebar.js) ===
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
  
  startAnimation();
}

// === ПЕРЕТАСКИВАНИЕ СУЩЕСТВУЮЩИХ ОБЪЕКТОВ ===
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || isDragging) return;
  
  const target = e.target.closest('.world-object');
  if (!target) return;
  
  e.preventDefault();
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
  
  startAnimation();
});

// === MOUSEMOVE / MOUSEUP ===
document.addEventListener('mousemove', (e) => {
  if (!isDragging || !draggingObject) return;
  targetX = e.clientX - 30;
  targetY = e.clientY - 30;
  startAnimation();
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  
  isDragging = false;
  if (draggingObject) {
    draggingObject.style.cursor = 'grab';
    draggingObject.style.zIndex = '5';
    
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    velocityX = dx * 2;
    velocityY = dy * 2;
    
    startAnimation();
  }
});

// === АНИМАЦИЯ ===
function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 16;
  lastTime = timestamp;
  
  if (draggingObject) {
    currentX += (targetX - currentX) * SMOOTHING;
    currentY += (targetY - currentY) * SMOOTHING;
    draggingObject.style.transform = `translate(${currentX}px, ${currentY}px)`;
  } else if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    currentX += velocityX;
    currentY += velocityY;
    if (draggingObject) draggingObject.style.transform = `translate(${currentX}px, ${currentY}px)`;
    velocityX *= FRICTION;
    velocityY *= FRICTION;
  }
  
  if (draggingObject || Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    requestAnimationFrame(animate);
  } else {
    lastTime = 0;
    animationRunning = false;
  }
}

function startAnimation() {
  if (!animationRunning) {
    animationRunning = true;
    lastTime = 0;
    requestAnimationFrame(animate);
  }
}

// === ЭКСПОРТ ФУНКЦИЙ ДЛЯ ВНЕШНЕГО ИСПОЛЬЗОВАНИЯ ===
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