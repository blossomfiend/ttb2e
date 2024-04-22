import {objMap} from "../../util.js";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TtbActor extends Actor {
    constructor(data, context) {
        super(data, context);
    }

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;
        const skills = systemData.skills;
        const aspects = systemData.aspects;
        const derivedAspects = systemData.derivedAspects;
        const flags = actorData.flags.boilerplate || {};

        for (const skillConstants of game.ttb2e.skills) {
            const skill = skills[skillConstants.name];
            Object.assign(skill, skillConstants);
            skill.av = Object.fromEntries(skillConstants.aspects.map(aspect => {
                const baseValue = skill.override ?? (skill.rank + aspects[aspect]);
                const av = combine(sum, suited(baseValue), skill.bonus);
                return [aspect, av];
            }));
            if (skillConstants.aspects.length === 1) {
                Object.assign(skill.av, skill.av[skillConstants.aspects[0]]);
            }
        }

        systemData.wounds.max =
            (systemData.wounds.override
                ?? 4 + skills.toughness.av.value + Math.ceil(Math.max(0, aspects.resilience) / 2))
            + systemData.wounds.bonus.value;
        systemData.wounds.negative = Math.max(0, -systemData.wounds.value);

        derivedAspects.initiative.value = suited(aspects.speed + skills.notice.rank);
        derivedAspects.defense.value = combine(sum,
            suited(2),
            combine(Math.max,
                suited(0),
                skills.evade.av,
                suited(aspects.speed)));
        derivedAspects.willpower.value = combine(sum,
            suited(2),
            combine(Math.max,
                suited(0),
                skills.centering.av,
                suited(aspects.tenacity)));

        derivedAspects.walk.value = suited(4 + Math.ceil(aspects.speed / 2));
        derivedAspects.charge.value = suited(Math.max(derivedAspects.walk.value.value, 4 + aspects.speed));
        derivedAspects.height.value = suited(2);

        for (let derivedAspectName in derivedAspects) {
            const derivedAspect = derivedAspects[derivedAspectName];
            if (derivedAspect.override != null) {
                derivedAspect.value.value = derivedAspect.override;
            }
            derivedAspect.value = combine(sum, derivedAspect.value, derivedAspect.bonus);
        }

        // make sure Charge is always at least the value of Walk
        if (derivedAspects.charge.override === null) {
            derivedAspects.charge.value.value = Math.max(derivedAspects.charge.value.value, derivedAspects.walk.value.value);
        }

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }


    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;

        // Loop through ability scores, and add their modifiers to our sheet output.
        for (let [key, ability] of Object.entries(systemData.abilities)) {
            // Calculate the modifier using d20 rules.
            ability.mod = Math.floor((ability.value - 10) / 2);
        }
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
        systemData.xp = (systemData.cr * systemData.cr) * 100;
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        this._getCharacterRollData(data);
        this._getNpcRollData(data);

        data.testField = "hello from getRollData()";
        this.items;

        return data;
    }

    /**
     * Prepare character roll data.
     */
    _getCharacterRollData(data) {
        if (this.type !== 'character') return;

        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.abilities) {
            for (let [k, v] of Object.entries(data.abilities)) {
                data[k] = foundry.utils.deepClone(v);
            }
        }

        // Add level for easier access, or fall back to 0.
        if (data.attributes.level) {
            data.lvl = data.attributes.level.value ?? 0;
        }
    }

    /**
     * Prepare NPC roll data.
     */
    _getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

    _onUpdate(data, options, userId) {
        return super._onUpdate(data, options, userId);
    }

    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);

        if (this.type === "fated") {
            // Set up all the cards documents needed for fated to play the game
            let folder = await Folder.create({name: `${this.name}'s Cards`, type: "Cards"});
            let [twistDeck, controlHand, playArea, discardPile] = await Cards.createDocuments([
                {name: `${this.name}'s Twist Deck`, type: "deck", folder: folder.id},
                {name: `${this.name}'s Control Hand`, type: "hand", folder: folder.id},
                {name: `${this.name}'s Play Area`, type: "pile", folder: folder.id},
                {name: `${this.name}'s Discard Pile`, type: "pile", folder: folder.id},
            ]);

            this.updateSource({
                system: {
                    cards: {
                        containerFolder: folder.id,
                        twistDeck: twistDeck.id,
                        controlHand: controlHand.id,
                        playArea: playArea.id,
                        discardPile: discardPile.id,
                    },
                },
            });
        }
    }

    async _preDelete(options, user) {
        await super._preDelete(options, user);

        if (this.type === "fated") {
            // Delete the cards we created for the fated
            await this.system.cards.containerFolder?.delete();
            await Promise.all(["twistDeck", "controlHand", "playArea", "discardPile"].map(async field => {
                await this.system.cards[field]?.delete();
            }));
        }
    }
}

/**
 *
 * @param {number} value
 * @return {SuitedValue}
 * @private
 */
function suited(value) {
    return {
        value: value,
        suits: {
            rams: 0,
            crows: 0,
            tomes: 0,
            masks: 0,
        },
    };
}

/**
 *
 * @param {(a: number, b: number) => number} combinator
 * @param {...Suits} values
 * @returns {Suits}
 * @private
 */
function combineSuits(combinator, ...values) {
    return values.reduce((a, b) =>
        /** @type {Suits} */ objMap(a, (aVal, suit) => combinator(aVal, b[suit]))
    );
}

/**
 *
 * @param {(a: number, b: number) => number} combinator
 * @param {...SuitedValue} values
 * @returns {SuitedValue}
 * @private
 */
function combine(combinator, ...values) {
    return values.reduce((a, b) => ({
        value: combinator(a.value, b.value),
        suits: combineSuits(combinator, a.suits, b.suits),
    }));
}

/**
 *
 * @param {...number} values
 * @return {number}
 */
function sum(...values) {
    return values.reduce((a, b) => a + b, 0);
}
