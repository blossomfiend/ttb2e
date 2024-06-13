import { intField } from "../data-util.mjs";

export default class AbilityData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      value: intField(null),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}
