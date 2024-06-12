export default class TriggerData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      skills: new fields.ArrayField(
        new fields.StringField({ blank: false }),
      ),
      suit: new fields.StringField({ initial: "rams", choices: game.ttb2e.suits, blank: false }),
      description: new fields.HTMLField(),
    };
  }
}
