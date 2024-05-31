/**
 * @typedef {ApplicationRenderOptions} SvelteRenderOptions
 */

/**
 * @template {Constructor} BaseApplication
 * @param {BaseApplication} BaseApplication
 */
export default function SvelteApplicationMixin(BaseApplication) {
    /**
     * @extends {ApplicationV2}
     * @mixin
     */
    return class SvelteApplication extends BaseApplication {
        /**
         * @type {typeof SvelteComponent}
         */
        static SVELTE_COMPONENT;

        get svelteComponent() {
            return this.#svelteComponent;
        }

        /**
         *
         * @type {SvelteComponent|null}
         */
        #svelteComponent = null;

        /**
         * Render the application with Svelte
         * @param {ApplicationRenderContext} context        Context data for the render operation
         * @param {SvelteRenderOptions} options         Options which configure application rendering behavior
         * @returns {Promise<SvelteComponent>}  A single rendered HTMLElement for each requested part
         * @protected
         * @override
         */
        async _renderHTML(context, options) {
            return Promise.resolve(context);
        }

        /**
         * @protected
         * @override
         */
        _replaceHTML(result, content, options) {
            if (options.isFirstRender) {
                this.#svelteComponent = new this.constructor.SVELTE_COMPONENT({
                    target: content,
                    props: result,
                });
            } else {
                this.#svelteComponent.$set(result);
            }
        }

        /**
         * @protected
         * @override
         */
        _onClose(options) {
            this.#svelteComponent.$destroy();
        }
    }
}
