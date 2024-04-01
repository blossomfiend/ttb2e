export default class FatedData extends foundry.abstract.TypeDataModel {
    /** @inheritdoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            wounds: new fields.SchemaField({
                max: this._intField(5),
                value: this._intField(5),
            }),
            aspects: new fields.SchemaField(
                this.aspects.reduce((obj, aspect) => ({...obj, [aspect]: this._intField(0)}), {}),
            ),
            derived: new fields.SchemaField({
                defense: this._intField(2),
                willpower: this._intField(2),
                initiative: this._intField(0),
                walk: this._intField(4),
                charge: this._intField(4),
                height: this._intField(2),
            }),
            xp: this._intField(0),
            characteristics: new fields.ArrayField(new fields.StringField({
                required: true,
                nullable: false,
            }), {
                required: true,
                nullable: false,
                initial: ["Living", "Fated"],
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

    static aspects = [
        "might",
        "grace",
        "speed",
        "resilience",
        "intellect",
        "charm",
        "cunning",
        "tenacity",
    ]

    static _intField(initial, options = {}) {
        return new foundry.data.fields.NumberField({
            required: true,
            nullable: false,
            initial,
            integer: true,
            ...options,
        });
    }
}
