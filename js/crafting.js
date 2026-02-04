// js/crafting.js
import { RECIPES, ITEM_RECIPE_NAMES } from './recipes.js';
import { ITEMS } from './items.js';

let currentResult = null;
let resultPreview = null;

export function initCrafting() {
  const cells = document.querySelectorAll('#crafting-panel .crafting-cell');
  
  cells.forEach(cell => {
    const observer = new MutationObserver(() => {
      checkCrafting();
    });
    observer.observe(cell, { childList: true });
  });
  
  // Отключаем нативный drag для изображений
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}

function checkCrafting() {
  const grid = getCraftingGrid();
  const recipe = findMatchingRecipe(grid);
  
  const resultSlot = document.querySelector('.result-slot');
  
  if (recipe) {
    const resultItem = ITEMS.find(item => 
      item.id.replace('.png', '') === recipe.result
    );
    
    if (resultItem && currentResult !== resultItem.id) {
      currentResult = resultItem.id;
      
      resultPreview = createResultPreview(resultItem);
      resultSlot.innerHTML = '';
      resultSlot.appendChild(resultPreview);
    }
  } else {
    if (currentResult) {
      currentResult = null;
      resultPreview = null;
      resultSlot.innerHTML = '<div class="result-placeholder">Положите что-нибудь чтобы скрафтить</div>';
    }
  }
}

function createResultPreview(item) {
  const preview = document.createElement('div');
  preview.className = 'crafting-result-preview';
  preview.dataset.resultId = item.id;
  
  if (item.id !== 'white') {
    const img = document.createElement('img');
    img.src = `items/${item.id}`;
    img.draggable = false;
    img.style.pointerEvents = 'none';
    preview.appendChild(img);
  } else {
    preview.style.background = 'rgba(255,255,255,0.85)';
    preview.style.borderRadius = '4px';
  }
  
  preview.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    
    // Получаем точные координаты центра слота результата
    const resultSlot = document.querySelector('.result-slot');
    const slotRect = resultSlot.getBoundingClientRect();
    const x = slotRect.left + slotRect.width / 2;
    const y = slotRect.top + slotRect.height / 2;
    
    // Очищаем сетку
    clearCraftingGrid();
    
    // Создаём объект
    const event = new CustomEvent('spawnObject', {
      detail: { item, clientX: x, clientY: y }
    });
    window.dispatchEvent(event);
  });
  
  return preview;
}

function getCraftingGrid() {
  const cells = document.querySelectorAll('#crafting-panel .crafting-cell');
  const grid = [];
  
  for (let i = 0; i < 9; i++) {
    const cell = cells[i];
    const item = cell.querySelector('.world-object');
    
    if (item) {
      const itemId = item.dataset.id;
      const recipeName = ITEM_RECIPE_NAMES[itemId] || null;
      grid.push(recipeName);
    } else {
      grid.push(null);
    }
  }
  
  return [
    [grid[0], grid[1], grid[2]],
    [grid[3], grid[4], grid[5]],
    [grid[6], grid[7], grid[8]]
  ];
}

function findMatchingRecipe(grid) {
  return RECIPES.find(recipe => {
    const pattern = recipe.pattern;
    
    let minX = 3, minY = 3, maxX = -1, maxY = -1;
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] !== null) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    for (let offsetY = 0; offsetY <= 3 - (maxY - minY + 1); offsetY++) {
      for (let offsetX = 0; offsetX <= 3 - (maxX - minX + 1); offsetX++) {
        let match = true;
        
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            const recipeX = x - offsetX + minX;
            const recipeY = y - offsetY + minY;
            
            let expected = null;
            if (
              recipeY >= 0 && recipeY < pattern.length &&
              recipeX >= 0 && recipeX < pattern[recipeY].length
            ) {
              expected = pattern[recipeY][recipeX];
            }
            
            if (grid[y][x] !== expected) {
              match = false;
              break;
            }
          }
          if (!match) break;
        }
        
        if (match) return true;
      }
    }
    
    return false;
  });
}

function clearCraftingGrid() {
  const cells = document.querySelectorAll('#crafting-panel .crafting-cell');
  cells.forEach(cell => {
    const item = cell.querySelector('.world-object');
    if (item) item.remove();
  });
  
  currentResult = null;
  resultPreview = null;
  const resultSlot = document.querySelector('.result-slot');
  resultSlot.innerHTML = '<div class="result-placeholder">Положите что-нибудь чтобы скрафтить</div>';
}