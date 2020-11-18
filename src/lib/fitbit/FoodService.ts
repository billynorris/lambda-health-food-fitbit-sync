/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import log from '@dazn/lambda-powertools-logger';
import FoodEntryV1 from '../../models/FoodEntryV1';
import FitbitClient from './clients/FitbitFoodClient';
import FitBitFoodEntryV1 from './models/FitBitFoodEntryV1';

export default class {
  private client: FitbitClient;

  constructor() {
    this.client = new FitbitClient();
  }

  private sleep = (ms: number): Promise<any> => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  private readonly mealTypeMappings: { [key: string]: string } = {
    Breakfast: '1',
    Lunch: '3',
    Dinner: '5',
    Snacks: '7',
  };

  private getUnitMapping = (value: string | number): string => {
    const mappingData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../assets/unit_mappings.json'), 'utf8')) as { [key: string]: Array<string> };

    if (typeof value === 'string') {
      const mapping = Object.keys(mappingData)
        .find((y) => mappingData[y].find((z) => z.toUpperCase() === value.toUpperCase()));

      if (!mapping) {
        log.error('Missing mapping', {
          value,
        });
        throw new Error(`missing mapping for value: ${value}`);
      }

      return mapping;
    }

    return mappingData[value][0];
  };

  syncFoodDataAsync = async (
    access_token: string,
    entries: Array<FoodEntryV1>,
  ): Promise<any> => {
    const groupedEntries = entries.reduce((reducer, x) => {
      if (reducer[x.date]) {
        reducer[x.date].push(x);
      } else {
        // eslint-disable-next-line no-param-reassign
        reducer[x.date] = [x];
      }
      return reducer;
    }, {} as { [key: string]: Array<FoodEntryV1> });

    // eslint-disable-next-line no-restricted-syntax
    for (const [entryDate, entry] of Object.entries(groupedEntries)) {
      // eslint-disable-next-line no-await-in-loop
      const data = await this.listFoodsAsync(access_token, entryDate);

      const newFoodEntries = entry.reduce((reducer, foodEntry) => {
        const foodKey = this.buildFoodKey(foodEntry);
        if (reducer[foodKey]) {
          throw new Error(`Entry already exists ${foodKey}`);
        }

        // eslint-disable-next-line no-param-reassign
        reducer[foodKey] = foodEntry;
        return reducer;
      }, {} as { [key: string]: FoodEntryV1 });

      const foodEntriesToDelete = data.reduce((reducer, foodEntry) => {
        const foodKey = this.buildFoodKey(foodEntry);

        if (!newFoodEntries[foodKey]) {
          reducer.push(foodEntry);
        } else {
          delete newFoodEntries[foodKey];
        }
        return reducer;
      }, [] as Array<FoodEntryV1>);

      for (const newFoodEntry of Object.values(newFoodEntries)) {
        // One at a time to prevent hitting API rate limit
        await this.addFoodEntryAsync(access_token, newFoodEntry);
        await this.sleep(1000);
      }

      for (const foodEntryToDelete of foodEntriesToDelete) {
        // One at a time to prevent hitting API rate limit
        await this.deleteFoodEntryAsync(access_token, foodEntryToDelete);
        await this.sleep(1000);
      }
    }
  };

  listFoodsAsync = async (
    access_token: string,
    date: string,
  ): Promise<Array<FoodEntryV1>> => {
    const data = await this.client.getFoodLogAsync(access_token, date);

    return data.foods.map((y) => ({
      id: y.logId.toString(),
      amount: y.loggedFood.amount,
      date: y.logDate,
      foodName: y.loggedFood.name,
      mealType: Object.keys(this.mealTypeMappings)
        .find((z) => this.mealTypeMappings[z].toString() === y.loggedFood.mealTypeId.toString()),
      nutrition: {
        calories: y.nutritionalValues.calories,
        carbohydrates: y.nutritionalValues.carbs,
        cholesterol: y.nutritionalValues.cholesterol,
        fat: y.nutritionalValues.fat,
        fiber: y.nutritionalValues.fiber,
        protein: y.nutritionalValues.protein,
        sodium: y.nutritionalValues.sodium,
        sugars: y.nutritionalValues.sugars,
      },
      unit: this.getUnitMapping(y.loggedFood.unit.id),
    }));
  };

  addFoodEntryAsync = async (
    access_token: string,
    entry: FoodEntryV1,
  ): Promise<any> => {
    const request: FitBitFoodEntryV1 = {
      foodName: entry.foodName,
      mealTypeId: this.mealTypeMappings[entry.mealType],
      unitId: parseInt(this.getUnitMapping(entry.unit), 10),
      amount: entry.amount,
      date: entry.date,
      calories: entry.nutrition.calories,
      totalCarbohydrate: entry.nutrition.carbohydrates,
      cholesterol: entry.nutrition.cholesterol,
      dietaryFiber: entry.nutrition.fiber,
      totalFat: entry.nutrition.fat,
      protein: entry.nutrition.protein,
      sodium: entry.nutrition.sodium,
      sugars: entry.nutrition.sugars,
    };

    log.debug('Adding new food item', {
      foodName: entry.foodName,
      mealType: entry.mealType,
      units: entry.unit,
      amount: entry.amount,
      date: entry.date,
    });

    return this.client.addFoodItemAsync(access_token, request);
  };

  deleteFoodEntryAsync = async (
    access_token: string,
    entry: FoodEntryV1,
  ): Promise<any> => {
    log.debug('Removing food entry', {
      foodName: entry.foodName,
      mealType: entry.mealType,
      units: entry.unit,
      amount: entry.amount,
      date: entry.date,
    });
    return this.client.deletefoodLogAsync(access_token, entry.id);
  };

  private buildFoodKey = (value: FoodEntryV1) => [
    value.date,
    value.foodName.substring(0, 50),
    value.amount,
    value.unit,
    value.mealType].join('|');
}
