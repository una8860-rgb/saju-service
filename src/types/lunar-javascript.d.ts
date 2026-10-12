// lunar-javascript는 타입 선언이 없어 사용하는 API만 선언한다.
declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    static fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): Solar;
    getYear(): number; getMonth(): number; getDay(): number;
    getHour(): number; getMinute(): number; getSecond(): number;
    getLunar(): Lunar;
    toYmdHms(): string;
  }
  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }
  export class Lunar {
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhi(): string;
    getNextJie(wholeDay?: boolean): JieQi;
    getPrevJie(wholeDay?: boolean): JieQi;
    getJieQiTable(): Record<string, Solar>;
  }
}
