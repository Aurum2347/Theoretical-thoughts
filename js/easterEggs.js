// js/easterEggs.js
export function initEasterEggs() {
  const btn = document.getElementById('easter-egg-btn');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    showThanksModal();
  });
}

function showThanksModal() {
  if (document.getElementById('thanks-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'thanks-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="thanks-content">
      <button class="close-thanks">×</button>
      <h2>Спасибо за то что вы находитесь на сайте</h2>
      <p>Сайт был разработан одним человеком и нейросетью - Aurum2347 и Qwen3-Max.</p>
      
      <div class="special-thanks">
        <p><strong>— Особые благодарности —</strong></p>
        <p><strong>Mael1a</strong> - Обозревала этот сайт на стриме, и так же в целом морально поддерживала.</p>
        <a href="https://www.twitch.tv/mael11a" target="_blank" class="twitch-btn">Twitch</a>
        
        <p><strong>NaTro</strong> - человек который 12/7, почти каждые 20 минут кидал мемы в TikTok, и из ТикТока в Телеграмм, поднимая оптимизм.</p>
        
        <p>А так же огромное спасибо всем моим подписчикам, моего Telegramm канала - вы лучшие ребята🔥🔥🔥</p>
        <a href="https://t.me/aurums2347" target="_blank" class="telegram-btn">Telegram</a>
      </div>
      
      <div class="secret-code-container">
        <input type="text" class="secret-code-input" placeholder="Секретный код" maxlength="20">
        <button class="secret-code-submit">»</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
  
  setTimeout(() => {
    const input = modal.querySelector('.secret-code-input');
    if (input) input.focus();
  }, 100);
  
  const closeHandler = () => {
    modal.remove();
  };
  
  modal.querySelector('.close-thanks')?.addEventListener('click', closeHandler);
  modal.querySelector('.modal-overlay')?.addEventListener('click', closeHandler);
  
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeHandler();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  const input = modal.querySelector('.secret-code-input');
  const submitBtn = modal.querySelector('.secret-code-submit');
  
  submitBtn?.addEventListener('click', () => {
    const code = input.value.trim().toLowerCase();
    if (code === 'mael1a') {
      createPlushToy();
      closeHandler();
    }
  });
  
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });
}

let clickCount = 0;
let plushElement = null;
let contextMenuOpen = false;
let isDragging = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;

function createPlushToy() {
  if (plushElement) return;
  
  plushElement = document.createElement('div');
  plushElement.className = 'plush-toy';
  
  const img = document.createElement('img');
  img.src = 'assets/mael1a.png';
  img.style.width = '200px';
  img.style.height = 'auto';
  img.style.imageRendering = 'pixelated';
  
  plushElement.appendChild(img);
  document.body.appendChild(plushElement);
  
  // Центрируем
  const x = window.innerWidth / 2 - 100;
  const y = window.innerHeight / 2 - 100;
  currentX = x;
  currentY = y;
  plushElement.style.transform = `translate(${x}px, ${y}px)`;
  
  // Обработчики
  plushElement.addEventListener('mousedown', handlePlushMouseDown);
  plushElement.addEventListener('contextmenu', handlePlushContextMenu);
}

function handlePlushMouseDown(e) {
  if (e.button !== 0) return;
  
  // Останавливаем выделение области
  window.dispatchEvent(new CustomEvent('dragStart'));
  
  const rect = plushElement.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  
  // Начинаем отслеживание
  document.addEventListener('mousemove', handlePlushMouseMove);
  document.addEventListener('mouseup', handlePlushMouseUp);
  
  // Предотвращаем только если это drag
  let moved = false;
  
  const moveHandler = (e) => {
    moved = true;
    handlePlushMouseMove(e);
  };
  
  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    
    if (!moved) {
      // Это был клик, а не drag
      handlePlushClick(e);
    } else {
      // Завершаем drag
      window.dispatchEvent(new CustomEvent('dragEnd'));
    }
  };
  
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  
  e.preventDefault(); // Предотвращаем выделение текста
}

function handlePlushMouseMove(e) {
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  plushElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

function handlePlushMouseUp() {
  // Убираем обработчики
  document.removeEventListener('mousemove', handlePlushMouseMove);
  document.removeEventListener('mouseup', handlePlushMouseUp);
}

function handlePlushClick(e) {
  // Анимация: только по высоте
  plushElement.style.transition = 'transform 0.1s ease';
  plushElement.style.transform += ' scaleY(0.7)';
  
  setTimeout(() => {
    plushElement.style.transform = plushElement.style.transform.replace(' scaleY(0.7)', '');
    setTimeout(() => {
      plushElement.style.transform += ' scaleY(1.2)';
      setTimeout(() => {
        plushElement.style.transform = plushElement.style.transform.replace(' scaleY(1.2)', '');
        plushElement.style.transition = '';
      }, 100);
    }, 50);
  }, 100);
  
  // Звук
  const sound = new Audio('assets/boing.wav');
  sound.volume = 0.7;
  sound.play().catch(e => console.log('Звук не проигран:', e));
  
  clickCount++;
  if (clickCount >= 10) {
    triggerBoomAnimation();
    clickCount = 0;
  }
}

function handlePlushContextMenu(e) {
  e.preventDefault();
  
  if (contextMenuOpen) return;
  contextMenuOpen = true;
  
  const menu = document.createElement('div');
  menu.className = 'context-menu visible';
  menu.innerHTML = `
    <div class="context-menu-title">Мия</div>
    <div class="context-menu-item" data-action="details">Подробнее</div>
    <div class="context-menu-item" data-action="delete">Удалить</div>
  `;
  
  menu.style.left = `${e.clientX + 8}px`;
  menu.style.top = `${e.clientY + 6}px`;
  document.body.appendChild(menu);
  
  const closeMenu = () => {
    menu.classList.remove('visible');
    setTimeout(() => {
      if (menu.parentNode) menu.remove();
      contextMenuOpen = false;
    }, 250);
  };
  
  menu.querySelector('[data-action="details"]')?.addEventListener('click', () => {
    const fakeItem = {
      id: 'mael1a.png',
      name: 'Мия',
      descriptionFile: 'mael1a.md',
      identifier: null
    };
    window.dispatchEvent(new CustomEvent('showItemDetails', { detail: { item: fakeItem } }));
    closeMenu();
  });
  
  menu.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
    triggerBoomAnimation();
    closeMenu();
  });
  
  const clickHandler = (ev) => {
    if (!menu.contains(ev.target)) {
      closeMenu();
      document.removeEventListener('click', clickHandler);
    }
  };
  document.addEventListener('click', clickHandler);
}

function triggerBoomAnimation() {
  if (!plushElement) return;
  
  const rect = plushElement.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;
  
  plushElement.style.opacity = '0';
  plushElement.style.pointerEvents = 'none';
  
  const boomSound = new Audio('assets/boom.wav');
  boomSound.volume = 0.8;
  boomSound.play().catch(e => console.log('Boom звук не проигран:', e));
  
  const boomGif = document.createElement('img');
  boomGif.src = 'assets/boom.gif';
  boomGif.style.position = 'fixed';
  boomGif.style.left = `${x}px`;
  boomGif.style.top = `${y}px`;
  boomGif.style.zIndex = '100';
  boomGif.style.pointerEvents = 'none';
  document.body.appendChild(boomGif);
  
  setTimeout(() => {
    if (boomGif.parentNode) boomGif.remove();
    if (plushElement.parentNode) plushElement.remove();
    plushElement = null;
    clickCount = 0;
  }, 1500);
}