import {objMap} from "../../util.js";
import {intField, suitedValue} from "../utils.js";
import CharacterDataMixin from "./mixin/character.js";

export default class FatedActorData extends CharacterDataMixin(foundry.abstract.TypeDataModel) {
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
