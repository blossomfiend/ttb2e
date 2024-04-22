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

/**
 *
 * @template T
 * @param {Object} obj
 * @param {string} path
 * @param {T} defValue
 * @return {T|*}
 */
export function get(obj, path, defValue = null) {
    if (!path) return undefined;
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    const result = pathArray.reduce(
        (prevObj, key) => prevObj && prevObj[key],
        obj,
    );
    return result === undefined ? defValue : result;
}

/**
 *
 * @param {string} key
 * @param {Object} data
 * @return {string}
 */
export let localize = (key, data = {}) => game.i18n.format(key, data);
