import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @extends ActorSheetV2
 * @mixes SolidApplication
 */
export default class CharacterSheet extends SolidApplicationMixin(
  foundry.applications.sheets.ActorSheetV2,
) {
  /**
   * @override
   */
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/character-sheet.jsx");

  /**
   * @override
   */
  static DEFAULT_OPTIONS = {
    viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
    classes: ["no-application-padding"],
    window: {
      minimizable: true,
      resizable: true,
      contentClasses: [],
    },
    form: {
      submitOnChange: true,
    },
    position: {
      height: 800,
      width: 600,
    },
  };

  /**
   * @protected
   * @override
   */
  async _prepareContext(options) {
    return {
      actor: this.actor,
      token: this.token,
    };
  }
}
