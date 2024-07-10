import { commonActionFields } from "../data-util.mjs";

export default class ActionData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    return { ...commonActionFields() };
  }
}
