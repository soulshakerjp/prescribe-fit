import { ExercisePreset } from '@/types';

export const exercisePresets: ExercisePreset[] = [
  { name: 'ベンチプレス', muscleGroup: 'chest', defaultWeightKg: 60, defaultReps: 8, defaultSets: 4 },
  { name: 'インクラインダンベルプレス', muscleGroup: 'chest', defaultWeightKg: 20, defaultReps: 10, defaultSets: 3 },
  { name: 'ディップス', muscleGroup: 'chest', defaultWeightKg: 0, defaultReps: 12, defaultSets: 3 },
  { name: 'ケーブルクロスオーバー', muscleGroup: 'chest', defaultWeightKg: 12, defaultReps: 12, defaultSets: 3 },
  { name: 'デッドリフト', muscleGroup: 'back', defaultWeightKg: 80, defaultReps: 5, defaultSets: 4 },
  { name: '懸垂', muscleGroup: 'back', defaultWeightKg: 0, defaultReps: 8, defaultSets: 3 },
  { name: 'ベントオーバーロウ', muscleGroup: 'back', defaultWeightKg: 50, defaultReps: 10, defaultSets: 3 },
  { name: 'ラットプルダウン', muscleGroup: 'back', defaultWeightKg: 45, defaultReps: 10, defaultSets: 3 },
  { name: 'スクワット', muscleGroup: 'legs', defaultWeightKg: 70, defaultReps: 6, defaultSets: 4 },
  { name: 'レッグプレス', muscleGroup: 'legs', defaultWeightKg: 120, defaultReps: 10, defaultSets: 3 },
  { name: 'ルーマニアンデッドリフト', muscleGroup: 'legs', defaultWeightKg: 60, defaultReps: 8, defaultSets: 3 },
  { name: 'レッグカール', muscleGroup: 'legs', defaultWeightKg: 35, defaultReps: 12, defaultSets: 3 },
  { name: 'ショルダープレス', muscleGroup: 'shoulders', defaultWeightKg: 30, defaultReps: 8, defaultSets: 4 },
  { name: 'サイドレイズ', muscleGroup: 'shoulders', defaultWeightKg: 8, defaultReps: 12, defaultSets: 3 },
  { name: 'リアレイズ', muscleGroup: 'shoulders', defaultWeightKg: 6, defaultReps: 15, defaultSets: 3 },
  { name: 'バーベルカール', muscleGroup: 'arms', defaultWeightKg: 20, defaultReps: 10, defaultSets: 3 },
  { name: 'トライセプスエクステンション', muscleGroup: 'arms', defaultWeightKg: 18, defaultReps: 10, defaultSets: 3 },
  { name: 'プランク', muscleGroup: 'core', defaultWeightKg: 0, defaultReps: 60, defaultSets: 3 },
  { name: 'アブローラー', muscleGroup: 'core', defaultWeightKg: 0, defaultReps: 12, defaultSets: 3 }
];

export const muscleGroupLabels: Record<string, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
  shoulders: '肩',
  arms: '腕',
  core: '体幹'
};
