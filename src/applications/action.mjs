import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @extends ItemSheetV2
 * @extends SolidApplication
 */
export default class ActionSheet extends SolidApplicationMixin(
  foundry.applications.sheets.ItemSheetV2,
) {
  /**
   * @inheritDoc
   * @override
   */
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/action-sheet.jsx");

  /**
   * @inheritDoc
   * @override
   */
  static DEFAULT_OPTIONS = {
    classes: ["no-application-padding"],
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true,
    },
    position: {
      height: 600,
      width: 600,
    },
  };

  /**
   * @inheritDoc
   * @protected
   * @override
   */
  async _prepareContext(options) {
    return {
      item: this.item,
    };
  }
}
