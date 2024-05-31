import {objMap} from "../../util.js";
import {intField, suitedValue} from "../utils.js";
import CharacterDataMixin from "./abstract/character.js";

export default class FatemasterCharacterActorData extends CharacterDataMixin(foundry.abstract.TypeDataModel) {
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
