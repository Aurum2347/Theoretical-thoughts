// js/recipes.js
export const RECIPES = [
  // Палка из досок (2x2)
  {
    pattern: [
      ['wooden_planks', 'wooden_planks']
    ],
    result: 'stick'
  },
  // Деревянная кирка
  {
    pattern: [
      ['wooden_planks', 'wooden_planks', 'wooden_planks'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'wooden_pickaxe'
  },
  // Каменная кирка
  {
    pattern: [
      ['cobblestone', 'cobblestone', 'cobblestone'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'stone_pickaxe'
  },
  // Железная кирка
  {
    pattern: [
      ['iron_ingot', 'iron_ingot', 'iron_ingot'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'iron_pickaxe'
  },
  // Золотая кирка
  {
    pattern: [
      ['gold_ingot', 'gold_ingot', 'gold_ingot'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'golden_pickaxe'
  },
  // Алмазная кирка
  {
    pattern: [
      ['diamond', 'diamond', 'diamond'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'diamond_pickaxe'
  },
  // Незеритовая кирка
  {
    pattern: [
      ['netherite_ingot', 'netherite_ingot', 'netherite_ingot'],
      [null, 'stick', null],
      [null, 'stick', null]
    ],
    result: 'netherite_pickaxe'
  }
];

// Маппинг названий предметов для рецептов
export const ITEM_RECIPE_NAMES = {
  'stick.png': 'stick',
  'wooden_planks.png': 'wooden_planks',
  'cobblestone.png': 'cobblestone',
  'iron_ingot.png': 'iron_ingot',
  'gold_ingot.png': 'gold_ingot',
  'diamond.png': 'diamond',
  'netherite_ingot.png': 'netherite_ingot'
};