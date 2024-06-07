import { intField } from "../data-util.mjs";
import CharacterDataModel from "./abstract/character.mjs";

export default class FatemasterCharacterActorData extends CharacterDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      rankValue: intField(1),
      fatePoints: new fields.SchemaField({
        value: intField(0),
      }),
    };
  }
}
