import {objMap} from "../../util.js";

export default class FatedActorData extends foundry.abstract.TypeDataModel {
    /** @inheritdoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            wounds: new fields.SchemaField({
                value: this._intField(5),
                override: this._intField(null),
                bonus: this._suitedValue(),
            }),
            aspects: new fields.SchemaField(Object.fromEntries(game.ttb2e.aspects.map(aspect => [aspect, this._intField(0)]))),
            derivedAspects: new fields.SchemaField(Object.fromEntries(game.ttb2e.derivedAspects.map(derivedAspect => [
                derivedAspect,
                new fields.SchemaField({
                    override: this._intField(null),
                    bonus: this._suitedValue(),
                })
            ]))),
            skills: new fields.SchemaField(Object.fromEntries(game.ttb2e.skills.map(skill => [
                skill.name,
                new fields.SchemaField({
                    rank: this._intField(0),
                    override: this._intField(null),
                    bonus: this._suitedValue(),
                })
            ]))),
            xp: this._intField(0),
            characteristics: new fields.ArrayField(new fields.StringField({
                required: true, nullable: false,
            }), {
                required: true, nullable: false, initial: ["Living", "Fated"],
            }),
            cards: new fields.SchemaField({
                containerFolder: new fields.ForeignDocumentField(Folder),
                twistDeck: new fields.ForeignDocumentField(Cards),
                controlHand: new fields.ForeignDocumentField(Cards),
                playArea: new fields.ForeignDocumentField(Cards),
                discardPile: new fields.ForeignDocumentField(Cards),
            })
        };
    }

    static _intField(initial, options = {}) {
        return new foundry.data.fields.NumberField({
            required: true, nullable: initial === null, initial, integer: true, ...options,
        });
    }

    /**
     * @typedef Suits
     * @type {Object}
     * @property {number} rams
     * @property {number} crows
     * @property {number} tomes
     * @property {number} masks
     */

    static _suits(options = {}) {
        return new foundry.data.fields.SchemaField(objMap(game.ttb2e.suits, () => this._intField(0, options)), options);
    }

    /**
     * @typedef SuitedValue
     * @type {Object}
     * @property {number} value
     * @property {Suits} suits
     */

    static _suitedValue(initial = 0, options = {}) {
        return new foundry.data.fields.SchemaField({
            value: this._intField(initial, options),
            suits: this._suits(options),
        }, options);
    }
}
