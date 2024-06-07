import { intField } from "../data-util.mjs";
import CharacterDataModel from "./abstract/character.mjs";

export default class FatedActorData extends CharacterDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      xp: intField(0),
      cards: new fields.SchemaField({
        containerFolder: new fields.ForeignDocumentField(Folder),
        twistDeck: new fields.ForeignDocumentField(Cards),
        controlHand: new fields.ForeignDocumentField(Cards),
        playArea: new fields.ForeignDocumentField(Cards),
        discardPile: new fields.ForeignDocumentField(Cards),
      }),
    };
  }
}
