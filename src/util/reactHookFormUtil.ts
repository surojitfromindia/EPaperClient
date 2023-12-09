class ReactHookFormUtil {
    static deepFlatReactHookFormErrorOnlyMessage(errors): string[] {
        const flattenedErrors = {};
        const flattenErrors = (errorObject, parentKey = "") => {
            for (const key in errorObject) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                if (typeof errorObject[key] === "object" && errorObject[key] !== null) {
                    if ("message" in errorObject[key]) {
                        flattenedErrors[newKey] = errorObject[key].message;
                    } else {
                        flattenErrors(errorObject[key], newKey);
                    }
                } else {
                    flattenedErrors[newKey] = errorObject[key];
                }
            }
        };

        flattenErrors(errors);
        return Object.values(flattenedErrors);
    }
}
export { ReactHookFormUtil };