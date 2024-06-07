import { localize } from "../util.mjs";
import SolidApplicationMixin from "./solid-application.mjs";

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
  #actor;
  #aspect;
  #skill;

  constructor(options = {}) {
    super(options);
    this.#actor = options.actor;
    this.#aspect = options.aspect;
    this.#skill = options.skill;
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
      actor: this.#actor,
      aspect: this.#aspect,
      skill: this.#skill,
    };
  }
}
