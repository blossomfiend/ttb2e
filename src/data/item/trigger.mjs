import { suits, triggerFields } from "../data-util.mjs";

export default class TriggerData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      skills: new fields.ArrayField(new fields.StringField({ blank: false })),
      ...triggerFields({withName: false}),
    };
  }
}
