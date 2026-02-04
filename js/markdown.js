// js/markdown.js

// marked уже загружен как глобальная переменная через <script>
// Проверяем наличие
if (typeof marked === 'undefined') {
  console.error('Библиотека marked не загружена!');
}

export async function showItemDetails(item) {
  let modal = document.getElementById('item-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'item-details-modal';
    modal.className = 'modal hidden';
    document.body.appendChild(modal);
  }
  
  try {
    const response = await fetch(`items/descriptions/${item.descriptionFile}`);
    if (!response.ok) throw new Error('Файл не найден');
    
    const markdownText = await response.text();
    
    // Используем глобальный marked
    const htmlContent = marked.parse ? 
      marked.parse(markdownText) : 
      marked(markdownText);
    
    const identifierDisplay = item.identifier ? 
      `<div class="item-identifier">Идентификатор: ${item.identifier}</div>` : '';
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="item-details-content" data-selectable="true">
        <button class="close-button">×</button>
        <div class="item-header">
          <div class="item-icon">
            <img src="items/${item.id}" alt="${item.name}">
          </div>
          <div class="item-info">
            <div class="info-label">Название</div>
            <div class="item-name">${item.name}</div>
            ${identifierDisplay}
          </div>
        </div>
        <div class="item-description">
          ${htmlContent}
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.remove('hidden');
    }, 10);
    
    const closeHandler = () => {
      modal.classList.add('hidden');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    };
    
    const closeButton = modal.querySelector('.close-button');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeButton?.addEventListener('click', closeHandler);
    overlay?.addEventListener('click', closeHandler);
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeHandler();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
  } catch (error) {
    console.error('Ошибка загрузки описания:', error);
    alert('Не удалось загрузить описание предмета');
    modal.style.display = 'none';
  }
}