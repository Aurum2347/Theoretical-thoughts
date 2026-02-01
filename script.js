let draggingObject = null;
let isDragging = false;
let targetX = 0, targetY = 0; // Куда мышь хочет двигать
let currentX = 0, currentY = 0; // Где сейчас объект
let velocityX = 0, velocityY = 0;
let lastTime = 0;

const SMOOTHING = 0.25; // Чем меньше — тем плавнее (0.1–0.4)
const FRICTION = 0.92;  // Затухание инерции

// === Панель ===
document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.add('collapsed');
  document.getElementById('open-sidebar-btn')?.classList.add('visible');
});

document.getElementById('open-sidebar-btn')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.remove('collapsed');
  document.getElementById('open-sidebar-btn')?.classList.remove('visible');
});

// === Предметы ===
const ITEMS = [
  { id: 'white', name: 'Белый квадрат' },
  { id: 'apple.png', name: 'Яблоко' },
  { id: 'iron_ingot.png', name: 'Железный слиток' },
  { id: 'stick.png', name: 'Палка' }
];

const container = document.querySelector('.items-container');
if (container) {
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

    preview.addEventListener('mousedown', (e) => {
      e.preventDefault();

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

      // Позиция под курсором
      const startX = e.clientX - 30;
      const startY = e.clientY - 30;
      obj.style.transform = `translate(${startX}px, ${startY}px)`;

      // Инициализация
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
    });

    container.appendChild(preview);
  });
}

// === MOUSEMOVE — обновляем цель ===
document.addEventListener('mousemove', (e) => {
  if (!isDragging || !draggingObject) return;

  // Смещение курсора внутри объекта — фиксируем его
  // Для простоты будем считать, что центр объекта = курсор
  targetX = e.clientX - 30;
  targetY = e.clientY - 30;
});

// === MOUSEUP — запускаем инерцию ===
document.addEventListener('mouseup', () => {
  if (!isDragging) return;

  isDragging = false;
  if (draggingObject) {
    draggingObject.style.cursor = 'grab';
    draggingObject.style.zIndex = '5';
  }
  // velocityX/Y уже обновляются в animate()
});

// === Возможность двигать существующие объекты ===
document.addEventListener('mousedown', (e) => {
  const target = e.target.closest('.world-object');
  if (target && !isDragging) {
    e.preventDefault();

    const rect = target.getBoundingClientRect();
    const startX = rect.left;
    const startY = rect.top;

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
  }
});

// === Анимация с плавностью и инерцией ===
function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 16; // нормализация к 60 FPS
  lastTime = timestamp;

  if (draggingObject) {
    // Плавное следование за целью
    currentX += (targetX - currentX) * SMOOTHING;
    currentY += (targetY - currentY) * SMOOTHING;

    // Ограничивать не будем — или добавь при желании
    draggingObject.style.transform = `translate(${currentX}px, ${currentY}px)`;
  } else if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    // Инерция после отпускания
    currentX += velocityX;
    currentY += velocityY;
    draggingObject.style.transform = `translate(${currentX}px, ${currentY}px)`;

    velocityX *= FRICTION;
    velocityY *= FRICTION;
  }

  // Продолжаем анимацию, пока есть движение
  if (draggingObject || Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    requestAnimationFrame(animate);
  } else {
    // Сбрасываем анимацию
    lastTime = 0;
  }
}

// === Запуск анимации при первом изменении ===
let animationRunning = false;
function startAnimation() {
  if (!animationRunning) {
    animationRunning = true;
    lastTime = 0;
    requestAnimationFrame(animate);
  }
}

// === Перехватываем mousemove и mouseup для запуска анимации ===
document.addEventListener('mousemove', () => {
  if (isDragging || Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
    startAnimation();
  }
});

document.addEventListener('mouseup', () => {
  // Рассчитываем скорость на основе последних перемещений
  // Для простоты — можно использовать разницу между target и current
  // Но лучше — хранить историю. Сделаем упрощённо:
  const dx = targetX - currentX;
  const dy = targetY - currentY;
  velocityX = dx * 2; // усиливаем немного
  velocityY = dy * 2;
  startAnimation();
});

// === Контекстное меню ===
let contextMenu = null;
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
  const target = e.target.closest('.world-object');
  if (!target) return;

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
  contextMenu.style.left = e.clientX + 8 + 'px';
  contextMenu.style.top = e.clientY + 6 + 'px';
  setTimeout(() => contextMenu?.classList.add('visible'), 10);

  const handleClick = (ev) => {
    if (ev.target.dataset.action === 'delete') target.remove();
    if (contextMenu) contextMenu.remove();
    contextMenu = null;
    document.removeEventListener('click', handleClick);
  };
  contextMenu.addEventListener('click', handleClick);
});

// ═══════════════════════════════════════════════════════════════════════
// === ВЫДЕЛЕНИЕ ОБЛАСТИ (MARQUEE SELECTION) — НОВОЕ, БЕЗ ИЗМЕНЕНИЙ В DRAG ===
// ═══════════════════════════════════════════════════════════════════════

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

// Добавим обработчик mousedown ДО существующего (чтобы не мешать drag)
document.addEventListener('mousedown', (e) => {
  // Если уже тянется объект — ничего не делаем
  if (isDragging) return;

  const clickedOnObject = e.target.closest('.world-object');
  const clickedOnUI = e.target.closest('#sidebar') || e.target.closest('#open-sidebar-btn');

  if (!clickedOnObject && !clickedOnUI) {
    e.preventDefault();
    isSelecting = true;
    selectionStartX = e.clientX;
    selectionStartY = e.clientY;
    createSelectionRect();
  }
}, { capture: true }); // ← важно: capture фаза, чтобы сработать до других обработчиков

document.addEventListener('mousemove', (e) => {
  if (!isSelecting) return;

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
      // Можно добавить выделение объектов позже
    }
  }
});
