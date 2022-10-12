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

class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  validateDigits(number, result) {
    if (number.precision(true) > (this.params[MAX_NUM_OF_DIGITS_INDEX] ?? MAX_NUM_OF_DIGITS)) {
      result.addInvalidTypeError("doubleNumber.e002", "The value exceeded maximum number of digits.");
    }
    return result;
  }

  validateDecimals(number, result) {
    if (number.decimalPlaces() > this.params[MAX_NUM_OF_DECIMALS_INDEX]) {
      result.addInvalidTypeError("doubleNumber.e003", "The value exceeded maximum number of decimal places.");
    }
    return result;
  }

  match(value) {
    let result = new ValidationResult();
    if (value === null) return result;

    let number;
    try {
      number = new Decimal(value);
    } catch (e) {
      result.addInvalidTypeError("doubleNumber.e001", "The value is not a valid decimal number.");
      return result;
    }

    result = this.validateDigits(number, result);

    if (this.params.length > DECIMAL_VALIDATION_THRESHOLD) {
      result = this.validateDecimals(number, result);
    }
    return result;

  }
}

module.exports = DecimalNumberMatcher;
