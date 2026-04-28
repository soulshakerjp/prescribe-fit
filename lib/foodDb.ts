import { MacroTargets, MealEntry, MealSlot } from '@/types';
import { sumMacros } from '@/lib/pfcCalculator';

const foods = [
  { keyword: '鶏むね', calories: 108, protein: 23, fat: 1.5, carbs: 0, grams: 100 },
  { keyword: '鶏もも', calories: 127, protein: 19, fat: 5, carbs: 0, grams: 100 },
  { keyword: '鶏ささみ', calories: 98, protein: 23, fat: 0.8, carbs: 0, grams: 100 },
  { keyword: '卵', calories: 76, protein: 6.2, fat: 5.2, carbs: 0.2, grams: 50 },
  { keyword: '玄米', calories: 165, protein: 3.8, fat: 1.4, carbs: 35.6, grams: 120 },
  { keyword: 'ごはん', calories: 156, protein: 2.5, fat: 0.3, carbs: 37.1, grams: 120 },
  { keyword: '雑穀', calories: 168, protein: 3.9, fat: 1.2, carbs: 36.2, grams: 120 },
  { keyword: 'オートミール', calories: 114, protein: 3.8, fat: 2, carbs: 20, grams: 30 },
  { keyword: '鮭', calories: 133, protein: 22.3, fat: 4.1, carbs: 0.1, grams: 100 },
  { keyword: 'サバ', calories: 211, protein: 20.6, fat: 16.8, carbs: 0.2, grams: 100 },
  { keyword: 'カツオ', calories: 114, protein: 25.8, fat: 0.5, carbs: 0.1, grams: 100 },
  { keyword: 'まぐろ', calories: 125, protein: 26.4, fat: 1.4, carbs: 0.1, grams: 100 },
  { keyword: '牛もも', calories: 176, protein: 20.7, fat: 10.7, carbs: 0.5, grams: 100 },
  { keyword: '豚ヒレ', calories: 118, protein: 22.2, fat: 3.7, carbs: 0.2, grams: 100 },
  { keyword: '豚もも', calories: 171, protein: 20.5, fat: 10.2, carbs: 0.2, grams: 100 },
  { keyword: '豆腐', calories: 72, protein: 6.6, fat: 4.2, carbs: 1.7, grams: 100 },
  { keyword: '納豆', calories: 100, protein: 8.3, fat: 5, carbs: 6, grams: 45 },
  { keyword: 'ヨーグルト', calories: 62, protein: 3.6, fat: 3, carbs: 5, grams: 100 },
  { keyword: 'バナナ', calories: 84, protein: 1.1, fat: 0.2, carbs: 21.4, grams: 100 },
  { keyword: 'ブロッコリー', calories: 33, protein: 4.3, fat: 0.5, carbs: 5.2, grams: 100 },
  { keyword: 'キャベツ', calories: 23, protein: 1.3, fat: 0.2, carbs: 5.2, grams: 100 },
  { keyword: 'きのこ', calories: 18, protein: 2.7, fat: 0.3, carbs: 3.6, grams: 100 },
  { keyword: '味噌汁', calories: 38, protein: 2.6, fat: 1.5, carbs: 3.7, grams: 150 },
  { keyword: 'プロテイン', calories: 120, protein: 24, fat: 1.5, carbs: 3, grams: 30 },
  { keyword: 'パスタ', calories: 210, protein: 7.5, fat: 1.5, carbs: 41.3, grams: 140 },
  { keyword: '海老', calories: 83, protein: 18.6, fat: 0.6, carbs: 0.3, grams: 100 },
  { keyword: 'アボカド', calories: 187, protein: 2.5, fat: 18.7, carbs: 6.2, grams: 100 },
  { keyword: 'じゃがいも', calories: 76, protein: 1.6, fat: 0.1, carbs: 17.6, grams: 100 },
  { keyword: 'さつまいも', calories: 132, protein: 1.2, fat: 0.2, carbs: 31.9, grams: 100 },
  { keyword: 'ツナ', calories: 70, protein: 15.5, fat: 0.7, carbs: 0.1, grams: 70 }
];

function parseGrams(text: string, fallback: number) {
  const match = text.match(/(\d+)\s*g/);
  return match ? Number(match[1]) : fallback;
}

function estimateItem(text: string) {
  const food = foods.find((item) => text.includes(item.keyword));
  if (!food) {
    return { calories: 180, protein: 8, fat: 6, carbs: 24 };
  }
  const grams = parseGrams(text, food.grams);
  const ratio = grams / food.grams;
  return {
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10
  };
}

export function estimateMealEntry(slot: MealSlot, text: string): MealEntry {
  const parts = text
    .split(/[、,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const totals = sumMacros(parts.map(estimateItem));

  return {
    slot,
    text,
    ...totals
  };
}

export function estimateManyMealEntries(entries: Array<{ slot: MealSlot; text: string }>) {
  return entries.filter((entry) => entry.text.trim()).map((entry) => estimateMealEntry(entry.slot, entry.text));
}

export function macroLabel(targets: MacroTargets) {
  return `P ${targets.protein}g / F ${targets.fat}g / C ${targets.carbs}g`;
}
