// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */

const MAX_NUM_OF_DIGITS = 11;
const MAX_NUM_OF_DIGITS_INDEX = 0;
const MAX_NUM_OF_DECIMALS_INDEX = 1;
const DECIMAL_VALIDATION_THRESHOLD = 1;

const ERROR_MAP = {
  conversionError: { code: "doubleNumber.e001", message: "The value is not a valid decimal number." },
  digitError: { code: "doubleNumber.e002", message: "The value exceeded maximum number of digits." },
  decimalError: { code: "doubleNumber.e003", message: "The value exceeded maximum number of decimal places." }
};
Object.freeze(ERROR_MAP);

class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
    this.result = new ValidationResult();
  }

  validateDigits(number) {
    const digitThreshold = this.params[MAX_NUM_OF_DIGITS_INDEX] ?? MAX_NUM_OF_DIGITS;
    if (number.precision(true) > digitThreshold) {
      this.result.addInvalidTypeError(ERROR_MAP.digitError.code, ERROR_MAP.digitError.message);
    }
  }

  validateDecimals(number) {
    if (number.decimalPlaces() > this.params[MAX_NUM_OF_DECIMALS_INDEX]) {
      this.result.addInvalidTypeError(ERROR_MAP.decimalError.code, ERROR_MAP.decimalError.message);
    }
  }

  match(value) {
    if (value === null) return this.result;

    // 1 Number conversion
    let number;
    try {
      number = new Decimal(value);
    } catch (e) {
      this.result.addInvalidTypeError(ERROR_MAP.conversionError.code, ERROR_MAP.conversionError.message);
      return this.result;
    }

    // 2 Digit validation
    this.validateDigits(number);

    // 3 Decimal validation
    if (this.params.length > DECIMAL_VALIDATION_THRESHOLD) {
      this.validateDecimals(number);
    }

    return this.result;

  }
}

module.exports = DecimalNumberMatcher;
