import {objMap} from "../util.js";

export function intField(initial, options = {}) {
    return new foundry.data.fields.NumberField({
        required: true, nullable: initial === null, initial, integer: true, ...options,
    });
}

/**
 * @typedef Suits
 * @type {Object}
 * @property {number} rams
 * @property {number} crows
 * @property {number} tomes
 * @property {number} masks
 */

export function suits(options = {}) {
    return new foundry.data.fields.SchemaField(objMap(game.ttb2e.suits, () => intField(0, options)), options);
}

/**
 * @typedef SuitedValue
 * @type {Object}
 * @property {number} value
 * @property {Suits} suits
 */

export function suitedValue(initial = 0, options = {}) {
    return new foundry.data.fields.SchemaField({
        value: intField(initial, options),
        suits: suits(options),
    }, options);
}
