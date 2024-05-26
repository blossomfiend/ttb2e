/**
 * @typedef {Object} FlipOptions
 * @property {-3|-2|-1|0|1|2|3} fateModifier
 */

/**
 * @typedef {Object} FlipData
 * @property {SuitedValue|null} targetNumber
 * @property {SuitedValue|null} actingValue
 */

import "./components/FlipChatMessage.svelte";
import TtbChatMessage from "./documents/chat-message.js";

/**
 *
 */
export default class Flip {
    /**
     *
     * @param {FlipOptions} options This flips definition
     * @param {FlipData} data The roll data context of this flip
     */
    constructor(options, data) {
        this.options = options;
        this.data = data;
    }

    /**
     * @type {FlipOptions}
     */
    options;

    /**
     * @type {FlipData}
     */
    data;

    async postFlip() {
        const message = await TtbChatMessage.create({
            type: "flip",
        }, {});
    }
}
