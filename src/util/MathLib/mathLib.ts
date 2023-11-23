import *  as MathJs  from "mathjs";
const NUMERIC_PRECISION =2;

class MathLib {
  precision: number;

  constructor({ precision = NUMERIC_PRECISION }: { precision?: number }) {
    this.precision = precision;
  }

  static getWithPrecision(precision: number, number: number) {
    const fixedValue = MathJs.round(MathJs.number(number), precision);
    return MathJs.number(fixedValue);
  }

  static getDecimalFromPercentage(precision: number, percentage_value: number) {
    return MathLib.getWithPrecision(precision, percentage_value / 100);
  }

  getWithPrecision(number: number) {
    return MathLib.getWithPrecision(this.precision, number);
  }

  getDecimalFromPercentage(number: number) {
    return MathLib.getDecimalFromPercentage(this.precision, number);
  }
}

export { MathLib };
