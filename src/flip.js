/**
 * @typedef {Object} FlipOptions
 */

import "./components/FlipChatMessage.svelte";

/**
 *
 */
export default class Flip {
    /**
     *
     * @param {FlipOptions} options This flips definition
     * @param {Object} data The roll data context of this flip
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
     * @type {Object}
     */
    data;

    async postFlip() {
        const message = await ChatMessage.create({
            type: "flip",
        }, {});
        logger.log(message);
    }
}
