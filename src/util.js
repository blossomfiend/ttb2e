/**
 * @template Value
 * @template NewValue
 * @param {Object<Value>} obj
 * @param {function(value: Value, key: string, obj: Object<Value>): NewValue} func
 * @return {Object<NewValue>}
 */
export function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v, k, obj)]));
}
