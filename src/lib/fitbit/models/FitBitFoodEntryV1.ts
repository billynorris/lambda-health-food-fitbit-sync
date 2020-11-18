import NutritionV1 from './NutritionV1';

export default class FitBitFoodEntryV1 extends NutritionV1 {
  foodId?: string;

  foodName: string;

  date: string;

  unitId: number;

  amount: number;

  mealTypeId: string;
}
