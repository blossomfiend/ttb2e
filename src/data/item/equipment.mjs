import { commonActionFields, intField } from "../data-util.mjs";

export default class EquipmentData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cost: new fields.NumberField({ initial: 0, nullable: false }),
      craftingSkill: intField(0),
      toolkitSkill: new fields.StringField({
        initial: null,
        nullable: true,
        blank: false,
      }),
      isAmmunition: new fields.BooleanField({ initial: false }),
      action: new fields.SchemaField(
        {
          ...commonActionFields(),
        },
        {
          initial: null,
          nullable: true,
        },
      ),
    };
  }
}
