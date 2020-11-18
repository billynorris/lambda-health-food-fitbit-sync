export default class FitBitSleepV1 {
  sleep: Array<SleepEntry>;
}

type SleepEntry = {
  dateOfSleep: string;

  duration: number;

  efficiency: number;

  /**
   * @format Date
   */
  endTime: string;

  infoCode: number;

  isMainSleep: boolean;

  levels: {
    data: Array<{
      /**
       * @format Date
       */
      dateTime: string;

      level: 'deep' | 'light' | 'rem' | 'wake';

      seconds: number;
    }>;

    shortData: Array<{
      /**
       * @format Date
       */
      dateTime: string;

      level: 'deep' | 'light' | 'rem' | 'wake';

      seconds: number;
    }>;

    summary: {
      deep: {
        count: number;

        minutes: number;

        thirtyDatAvhMinutes: number;
      };

      light: {
        count: number;

        minutes: number;

        thirtyDatAvhMinutes: number;
      };

      rem: {
        count: number;

        minutes: number;

        thirtyDatAvhMinutes: number;
      };

      wake: {
        count: number;

        minutes: number;

        thirtyDatAvhMinutes: number;
      };
    }
  }

  logId: number;

  minutesAfterWakeup: number;

  minutesAsleep: number;

  minutesAwake: number;

  minutesToFallAsleep: number;

  /**
  * @format Date
  */
  startTime: string;

  timeInBed: number;

  type: 'stages' | 'classic'
};
