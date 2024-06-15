import { localize } from "../util.mts";
import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @typedef DuelOptions
 * @property {SuitedValue|null} targetNumber
 * @property {SuitedValue|null} actingValue
 * @property {string} [title]
 */

export default class DuelApplication extends SolidApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static SOLID_COMPONENT_LOADER = () => import("../components/duel.jsx");
  /**
   * @override
   */
  static DEFAULT_OPTIONS = {
    tag: "div",
    window: {
      contentClasses: ["standard-form"],
      icon: "fa-regular fa-cards",
    },
    position: {
      width: 480,
      height: "auto",
    },
  };

  #options;

  /**
   *
   * @param {DuelOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.#options = options;
  }

  /**
   * @override
   */
  get title() {
    if (this.options.title)
      return localize("ttb.ui.duelConfig.titleWithData", {
        title: this.options.title,
      });
    return localize("ttb.ui.duelConfig.defaultTitle");
  }

  /**
   * @protected
   * @override
   */
  async _prepareContext(options) {
    return {
      close: () => this.close(),
      ...this.#options,
    };
  }
}
