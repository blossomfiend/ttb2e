import {intField, suitedValue} from "../../utils.js";

export default function CharacterDataMixin(BaseDataModel) {
    class CharacterData extends BaseDataModel {
        /** @inheritdoc */
        static defineSchema() {
            const fields = foundry.data.fields;
            return {
                wounds: new fields.SchemaField({
                    value: intField(5),
                    override: intField(null),
                    bonus: suitedValue(),
                }),
                aspects: new fields.SchemaField(Object.fromEntries(game.ttb2e.aspects.map(aspect => [aspect, intField(0)]))),
                derivedAspects: new fields.SchemaField(Object.fromEntries(game.ttb2e.derivedAspects.map(derivedAspect => [
                    derivedAspect,
                    new fields.SchemaField({
                        override: intField(null),
                        bonus: suitedValue(),
                    })
                ]))),
                skills: new fields.SchemaField(Object.fromEntries(game.ttb2e.skills.map(skill => [
                    skill.name,
                    new fields.SchemaField({
                        rank: intField(0),
                        override: intField(null),
                        bonus: suitedValue(),
                    })
                ]))),
                characteristics: new fields.ArrayField(new fields.StringField({
                    required: true, nullable: false,
                }), {
                    required: true, nullable: false, initial: ["Living", "Fated"],
                }),
                actionPoints: new fields.SchemaField({value: intField(2)}),
            };
        }
    }
    return CharacterData;
}
