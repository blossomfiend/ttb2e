import SolidApplicationMixin from "./solid-application.mjs";

/**
 * @extends foundry.applications.sheets.ActorSheetV2
 */
export default class CharacterApplication extends SolidApplicationMixin(
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
    viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
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
      actorData: this.actor.toObject(false),
      actor: this.actor,
      token: this.token,
    };
  }
}
