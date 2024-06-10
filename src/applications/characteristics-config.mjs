import { localize } from "../util.mjs";
import SolidApplicationMixin from "./solid-application.mjs";

export default class CharacteristicsConfig extends SolidApplicationMixin(
  foundry.applications.api.DocumentSheetV2,
) {
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/characteristics-config.jsx");
  static DEFAULT_OPTIONS = {
    tag: "div",
    window: {
      contentClasses: ["standard-form"],
    },
    position: {
      width: 300,
    },
    form: {
      closeOnSubmit: false,
    }
  };

  /**
   * @override
   */
  get title() {
    return localize("ttb.ui.characteristicsConfig.title", {
      name: this.document.name,
    });
  }

  /**
   *
   * @param options
   * @return {{skill}}
   * @protected
   */
  _prepareContext(options = {}) {
    return {
      close: () => this.close(),
      document: this.document,
    };
  }
}
