import { intField, suitedValue } from "../data-util.mjs";

export default class ActionData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ap: intField(1),
      resist: new fields.StringField({
        choices: ["defense", "willpower", "either"],
        nullable: true,
      }),
      rangeType: new fields.StringField({
        choices: ["melee", "projectile"],
        nullable: true,
      }),
      range: intField(null),
      targetNumber: suitedValue(null),
      // in the category.skill format, so for example
      // skills.doctor
      // derivedAspects.defense
      skill: new fields.StringField({ blank: false, nullable: true }),
      aspect: new fields.StringField({ choices: game.ttb2e.aspects, nullable: true }),
      description: new fields.HTMLField({  initial: "" }),
    };
  }
}
