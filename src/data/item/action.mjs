import { intField, suitedValue } from "../data-util.mjs";

export default class ActionData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      resist: new fields.StringField({
        required: true,
        nullable: true,
        choices: ["defense", "willpower", "either"],
      }),
      rangeType: new fields.StringField({
        required: true,
        nullable: true,
        choices: ["melee", "projectile"],
      }),
      range: intField(null),
      targetNumber: suitedValue(null),
      // in the category.skill format, so for example
      // skills.doctor
      // derivedAspects.defense
      skill: new fields.StringField({
        required: true,
        nullable: true,
        blank: false,
      }),
      aspect: new fields.StringField({
        required: true,
        nullable: true,
        choices: game.ttb2e.aspects,
      }),
      description: new fields.HTMLField({ required: true, initial: "" }),
    };
  }
}
