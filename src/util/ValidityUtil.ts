class ValidityUtil {
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === "string" && value.trim() === "") {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    return typeof value === "object" && Object.keys(value).length === 0;
  }

  static isNotEmpty = (value: unknown) => !this.isEmpty(value);

  /**
   * @desc check if an object is empty
   * exclude key from check
   * @param value
   * @param ignore_keys
   */
  static isObjectEmpty = <T>(value: T, ignore_keys?: (keyof T)[]) => {
    const object_copy = { ...value };
    ignore_keys?.forEach((key) => {
      delete object_copy[key];
    });
    // we must check for each key of the object
    // if any key has a value
    // then the object is not empty
    return Object.keys(object_copy).every((key) => {
      return this.isEmpty(object_copy[key]);
    });
  };

  static isValidNumber(value: unknown) {
    if (typeof value === "number") return true;
    if (value === null) return false;
    if (value === undefined) return false;
    if (value === "") return false;
    if (Number.isNaN(value)) return false;
    if (Array.isArray(value)) return false;
  }

  static optionalChain<T>(
    values: (unknown|T)[],
    checkFunction: (value: unknown) => boolean,
    default_value: T,
  ): T {
    let n: T = default_value;
    for(const m of values){
      if(checkFunction(m)){
        n = m as T;
        break
      }
    }
    return n;
  }
  static optionalChainNotEmpty<T>(
      values: (unknown|T)[],
      default_value: T,
  ):T{
    return this.optionalChain(values,this.isNotEmpty, default_value)
  }
}

export { ValidityUtil };
