import { localize } from "../util.mts";
import SolidApplicationMixin from "./solid-application.mjs";

export default class SkillConfigApplication extends SolidApplicationMixin(
  foundry.applications.api.DocumentSheetV2,
) {
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/skill-config.jsx");
  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      contentClasses: ["standard-form"],
    },
    position: {
      width: 300,
    },
    form: {
      closeOnSubmit: true,
    },
  };
  #skill;

  constructor(options = {}) {
    options.document = options.actor;
    super(options);
    this.#skill = options.skill;
  }

  /**
   * @override
   */
  get title() {
    return localize("ttb.ui.skillConfigTitle", {
      name: this.document.name,
      skill: localize(`ttb.${this.#skill}.name`),
    });
  }

  /**
   *
   * @param options
   * @return {*}
   * @protected
   */
  _initializeApplicationOptions(options = {}) {
    options = super._initializeApplicationOptions(options);
    options.uniqueId = `${this.constructor.name}-${options.document.uuid}-${options.skill}`;
    return options;
  }

  /**
   *
   * @param options
   * @return {{skill}}
   * @protected
   */
  _prepareContext(options = {}) {
    return {
      actor: this.document,
      skill: this.#skill,
    };
  }
}
