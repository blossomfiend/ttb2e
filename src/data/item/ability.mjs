import { intField } from "../data-util.mjs";

export default class AbilityData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      count: intField(null),
      description: new fields.HTMLField(),
    };
  }
}
