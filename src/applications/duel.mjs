import { localize } from "../util.mjs";
import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @typedef {import("../flip.mjs").FlipData | any} DuelOptions
 * @property {TtbActor} actor
 * @property {string} skill A string like "skill.sorcery" or "derivedAspect.defense"
 * @property {string} aspect
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
    return localize("ttb.ui.duelConfigTitle");
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
