import { intField, suitedValue } from "../data-util.mjs";

export default class FlipChatMessageData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      title: new fields.StringField({ required: false }),
      skill: new fields.StringField({ required: false }),
      aspect: new fields.StringField({ required: false }),
      fateModifier: intField(0),
      flippedCards: new fields.ArrayField(
        new fields.SchemaField({
          suit: new fields.StringField({
            choices: [...game.ttb2e.suits, "redJoker", "blackJoker"],
          }),
          value: intField(0),
        }),
      ),
      actingValue: suitedValue(0, { nullable: true }),
      targetNumber: suitedValue(0, { nullable: true }),
    };
  }
}
