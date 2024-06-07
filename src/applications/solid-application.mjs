/**
 * @typedef {ApplicationRenderOptions} SvelteRenderOptions
 */

/**
 * @template {Constructor} BaseApplication
 * @param {ApplicationV2} BaseApplication
 */
export default function SolidApplicationMixin(BaseApplication) {
  /**
   * @extends {ApplicationV2}
   * @mixin
   */
  return class SolidApplication extends BaseApplication {
    static SOLID_COMPONENT_LOADER;
    #propStore = null;
    #setPropStore = null;
    #disposeSolidApplication = null;

    /**
     * @protected
     * @override
     */
    async _renderHTML(context, options) {
      const { createApp } = await import("../components/app-container.jsx");
      return {
        createApp,
        props: context,
      };
    }

    /**
     * @protected
     * @override
     */
    _replaceHTML({ createApp, props }, mountElement, options) {
      if (options.isFirstRender) {
        if (this.#disposeSolidApplication !== null) {
          logger.warn(
            "There was already a solid application but we were asked to rerender",
            this,
            props,
            options,
          );
          this.#disposeSolidApplication?.();
        }
        [this.#propStore, this.#setPropStore, this.#disposeSolidApplication] =
          createApp(
            this.constructor.SOLID_COMPONENT_LOADER,
            mountElement,
            props,
          );
      } else if (this.#setPropStore === null || this.#propStore === null)
        logger.warn(
          "Solid application was asked to render but didn't have a prop store",
          this,
          props,
          options,
        );
      else this.#setPropStore?.(props);
    }

    /**
     * @protected
     * @override
     */
    _onClose(options) {
      super._onClose(options);
      this.#disposeSolidApplication?.();
      this.#disposeSolidApplication = null;
      this.#propStore = null;
      this.#setPropStore = null;
    }
  };
}
