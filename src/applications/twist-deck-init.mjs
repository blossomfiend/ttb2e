import { localize } from "../util.mts";
import SolidApplicationMixin from "./solid-application.mjs";

export default class TwistDeckInitApplication extends SolidApplicationMixin(
  foundry.applications.api.DocumentSheetV2,
) {
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/twist-deck-init.jsx");
  static DEFAULT_OPTIONS = {
    tag: "div",
    window: {
      contentClasses: ["standard-form"],
    },
    position: {
      width: 480,
    },
  };

  /**
   * @override
   */
  get title() {
    return localize("ttb.ui.twistDeckInitTitle", {
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
