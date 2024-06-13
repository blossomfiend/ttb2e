import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @extends ItemSheetV2
 * @extends SolidApplication
 */
export default class AbilitySheet extends SolidApplicationMixin(
  foundry.applications.sheets.ItemSheetV2,
) {
  /**
   * @inheritDoc
   * @override
   */
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/ability-sheet.jsx");

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