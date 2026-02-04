// js/players.js
let draggingPlayer = null;
let isDraggingPlayer = false;
let playerTargetX = 0, playerTargetY = 0;
let playerCurrentX = 0, playerCurrentY = 0;
let playerVelocityX = 0, playerVelocityY = 0;
let playerLastTime = 0;
let playerAnimationRunning = false;
const PLAYER_SMOOTHING = 1.0;
const PLAYER_FRICTION = 0.92;

export function initPlayers() {
  const addBtn = document.getElementById('add-player-btn');
  const modal = document.getElementById('player-modal');
  const nicknameInput = document.getElementById('player-nickname');
  const skinPreview = document.getElementById('skin-preview');
  const confirmBtn = document.getElementById('confirm-player');
  const cancelBtn = document.getElementById('cancel-player');

  // Открытие модального окна
  addBtn?.addEventListener('click', () => {
    modal.style.display = 'block';
    nicknameInput.value = '';
    skinPreview.src = 'https://minotar.net/body/MHF_Steve/100.png';
    nicknameInput.focus();
  });

  // Закрытие по отмене
  cancelBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Обновление превью
  nicknameInput?.addEventListener('input', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
      skinPreview.src = `https://minotar.net/body/${encodeURIComponent(nick)}/100.png`;
    } else {
      skinPreview.src = 'https://minotar.net/body/MHF_Steve/100.png';
    }
  });

  // Подтверждение
  confirmBtn?.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
      createPlayerSkin(nick);
      modal.style.display = 'none';
    }
  });

  // Закрытие по клику вне модального окна
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // === ПКМ по игроку ===
  document.addEventListener('contextmenu', (e) => {
    const target = e.target.closest('.player-skin');
    if (!target) return;
    
    e.preventDefault();
    
    // Здесь можно добавить меню позже
    console.log('ПКМ по игроку:', target.dataset.nickname);
    
    // Для теста — удаляем
    target.remove();
  });

  // Перетаскивание
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || isDraggingPlayer) return;
    
    const target = e.target.closest('.player-skin');
    if (!target) return;
    
    e.preventDefault();
    
    const rect = target.getBoundingClientRect();
    playerCurrentX = rect.left;
    playerCurrentY = rect.top;
    playerTargetX = e.clientX - 40; // центр ширины (80/2)
    playerTargetY = e.clientY - 80; // центр высоты (160/2)
    
    isDraggingPlayer = true;
    draggingPlayer = target;
    target.style.zIndex = '30';
    target.style.cursor = 'grabbing';
    target.style.transform = `translate(${playerCurrentX}px, ${playerCurrentY}px)`;
    
    startPlayerAnimation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDraggingPlayer || !draggingPlayer) return;
    playerTargetX = e.clientX - 40;
    playerTargetY = e.clientY - 80;
    draggingPlayer.style.transform = `translate(${playerTargetX}px, ${playerTargetY}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDraggingPlayer) return;
    
    isDraggingPlayer = false;
    if (draggingPlayer) {
      draggingPlayer.style.cursor = 'grab';
      draggingPlayer.style.zIndex = '5';
      
      const dx = playerTargetX - playerCurrentX;
      const dy = playerTargetY - playerCurrentY;
      playerVelocityX = dx * 2;
      playerVelocityY = dy * 2;
      
      startPlayerAnimation();
    }
  });
}

function createPlayerSkin(nickname) {
  const container = document.getElementById('players-container');
  if (!container) return;

  const skin = document.createElement('div');
  skin.className = 'player-skin';
  skin.dataset.nickname = nickname;

  const nameTag = document.createElement('div');
  nameTag.className = 'skin-name';
  nameTag.textContent = nickname;

  const img = document.createElement('img');
  img.src = `https://minotar.net/body/${encodeURIComponent(nickname)}/100.png`;
  img.alt = nickname;
  
  img.onerror = () => {
    img.src = 'https://minotar.net/body/MHF_Steve/100.png';
  };

  skin.appendChild(nameTag);
  skin.appendChild(img);
  container.appendChild(skin);

  // Центрируем по экрану
  const x = window.innerWidth / 2 - 40;
  const y = window.innerHeight / 2 - 80;
  skin.style.transform = `translate(${x}px, ${y}px)`;
}

function startPlayerAnimation() {
  if (!playerAnimationRunning) {
    playerAnimationRunning = true;
    playerLastTime = 0;
    requestAnimationFrame(playerAnimate);
  }
}

function playerAnimate(timestamp) {
  if (!playerLastTime) playerLastTime = timestamp;
  const dt = (timestamp - playerLastTime) / 16;
  playerLastTime = timestamp;

  if (isDraggingPlayer && draggingPlayer) {
    playerCurrentX = playerTargetX;
    playerCurrentY = playerTargetY;
    draggingPlayer.style.transform = `translate(${playerCurrentX}px, ${playerCurrentY}px)`;
  } else if (Math.abs(playerVelocityX) > 0.1 || Math.abs(playerVelocityY) > 0.1)    playerCurrentX += playerVelocityX;
    playerCurrentY += playerVelocityY;
    if (draggingPlayer) {
      draggingPlayer.style.transform = `translate(${playerCurrentX}px, ${playerCurrentY}px)`;
    }
    playerVelocityX *= PLAYER_FRICTION;
    playerVelocityY *= PLAYER_FRICTION;
  }

  if (isDraggingPlayer || Math.abs(playerVelocityX) > 0.1 || Math.abs(playerVelocityY) > 0.1) {
    requestAnimationFrame(playerAnimate);
  } else {
    playerLastTime = 0;
    playerAnimationRunning = false;
}
