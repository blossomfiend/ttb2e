import {intField, suitedValue} from "../utils.js";

export default class FlipChatMessageData extends foundry.abstract.DataModel {
    /** @inheritDoc */
    static defineSchema() {
        return {
            skill: new foundry.data.fields.StringField({default: null, nullable: true}),
            aspect: new foundry.data.fields.StringField({default: null, nullable: true}),
            fateModifier: intField(0),
            flippedCards: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    suit: new foundry.data.fields.StringField({choices: [...Object.keys(game.ttb2e.suits), "redJoker", "blackJoker"]}),
                    value: intField(0),
                }),
            ),
            actingValue: suitedValue(0, {nullable: true}),
            targetNumber: suitedValue(0, {nullable: true}),
        };
    }
}
