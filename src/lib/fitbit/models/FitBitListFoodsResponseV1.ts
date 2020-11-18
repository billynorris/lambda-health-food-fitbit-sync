export default class FitBitListFoodsResponseV1 {
  foods: Array<FoodItemV1>;
}

type FoodItemV1 = {
  isFavourite: boolean;

  logDate: string;

  logId: number;

  loggedFood: {

    accessLevel: string;

    amount: number;

    brand: string;

    calories: number;

    foodId: number;

    mealTypeId: number;

    name: string;

    unit: {
      id: number;

      name: string;

      plural: string;
    }

    units: Array<number>
  }

  nutritionalValues: {
    calories: number;

    carbs: number;

    cholesterol: number;

    fat: number;

    fiber: number;

    protein: number;

    sodium: number;

    sugars: number;
  }
};
