/**
 * @typedef {ApplicationRenderOptions} SvelteRenderOptions
 */

/**
 * @template {new (...args: any[]) => ApplicationV2} TBase
 * @param {TBase} BaseApplication
 */
export default function SolidApplicationMixin(BaseApplication) {
  /**
   * @augments BaseApplication
   * @mixin
   */
  return class SolidApplication extends BaseApplication {
    /**
     * @inheritDoc
     * @override
     */
    static DEFAULT_OPTIONS = {
      classes: ["use-tailwind"],
    };

    /**
     * @template T
     * @type {() => Promise<{ default: (...T) => JSX.Element; }>}
     */
    static SOLID_COMPONENT_LOADER;

    #propStore = null;
    #setPropStore = null;
    #disposeSolidApplication = null;

    /**
     * @inheritDoc
     * @protected
     * @override
     */
    async _renderHTML(context, options) {
      // preload component
      this.constructor.SOLID_COMPONENT_LOADER();
      // and get app creation stuff at the same time
      const { createApp } = await import("../components/app-container.jsx");
      return {
        createApp,
        props: context,
      };
    }

    /**
     * @inheritDoc
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
     * @inheritDoc
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
