import { localize, objMap, rankByValue } from "../util.mts";
import TtbCards from "./cards.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class TtbActor extends Actor {
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

    if (this.type === "fatemasterCharacter") {
      systemData.rank = rankByValue(systemData.rankValue);
      systemData.fatePoints.max = systemData.rank.fatePoints;
    }

    for (const skillConstants of game.ttb2e.skills) {
      const skill = skills[skillConstants.name];
      Object.assign(skill, skillConstants);
      skill.av = Object.fromEntries(
        skillConstants.aspects.map((aspect) => {
          const baseValue = skill.override ?? skill.rank + aspects[aspect];
          const av = combine(sum, suited(baseValue), skill.bonus);
          return [aspect, av];
        }),
      );
      if (skillConstants.aspects.length === 1) {
        Object.assign(skill.av, skill.av[skillConstants.aspects[0]]);
      }
    }

    systemData.wounds.max =
      (systemData.wounds.override ??
        4 +
          skills.toughness.av.value +
          Math.ceil(Math.max(0, aspects.resilience) / 2)) +
      systemData.wounds.bonus.value;
    systemData.wounds.negative = Math.max(0, -systemData.wounds.value);

    derivedAspects.initiative.value = suited(
      aspects.speed + skills.notice.rank,
    );
    derivedAspects.defense.value = combine(
      sum,
      suited(2),
      combine(Math.max, suited(0), skills.evade.av, suited(aspects.speed)),
    );
    derivedAspects.willpower.value = combine(
      sum,
      suited(2),
      combine(
        Math.max,
        suited(0),
        skills.centering.av,
        suited(aspects.tenacity),
      ),
    );

    derivedAspects.walk.value = suited(4 + Math.ceil(aspects.speed / 2));
    derivedAspects.charge.value = suited(
      Math.max(derivedAspects.walk.value.value, 4 + aspects.speed),
    );

    for (let derivedAspectName in derivedAspects) {
      const derivedAspect = derivedAspects[derivedAspectName];
      if (derivedAspect.override != null) {
        derivedAspect.value.value = derivedAspect.override;
      }
      derivedAspect.value = combine(
        sum,
        derivedAspect.value,
        derivedAspect.bonus,
      );
    }

    // make sure Charge is always at least the value of Walk
    if (derivedAspects.charge.override === null) {
      derivedAspects.charge.value.value = Math.max(
        derivedAspects.charge.value.value,
        derivedAspects.walk.value.value,
      );
    }

    systemData.colors.finalColor = Color.from(
      systemData.colors.customColor ??
        game.ttb2e.themes.find((t) => t.name === systemData.colors.theme)
          ?.color,
    );
  }

  /**
   * This is mostly a carbon copy of the original, but it doesn't clamp bar values below 0.
   * TTB usually doesn't care much about limits and just sets values however it wants to.
   * @inheritDoc
   * @override
   */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    const attr = foundry.utils.getProperty(this.system, attribute);
    const current = isBar ? attr.value : attr;
    const update = isDelta ? current + value : value;
    if (update === current) return this;

    let updates;
    if (isBar) updates = { [`system.${attribute}.value`]: Math.min(update, attr.max) };
    else updates = { [`system.${attribute}`]: update };

    // Allow a hook to override these changes
    const allowed = Hooks.call(
      "modifyTokenAttribute",
      { attribute, value, isDelta, isBar },
      updates,
    );
    return allowed !== false ? this.update(updates) : this;
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    await this.ensureCardsExist({ inCreation: true });

    // Configure prototype token settings
    if (this.type === "fated") {
      this.updateSource({
        prototypeToken: {
          sight: { enabled: true },
          actorLink: true,
          disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        },
      });
    }
  }

  /**
   * Set up all the cards documents needed for fated to play the game
   * @return {Promise<void>}
   */
  async ensureCardsExist({ inCreation = false } = {}) {
    // only fated ever have these cards
    if (this.type !== "fated") {
      return;
    }
    const getPileName = (cardsType) =>
      localize(`ttb.cardPile.${cardsType}`, { owner: this.name });
    const cards = {};

    // recreate folder first
    cards.containerFolder = this.system.cards.containerFolder;
    if (cards.containerFolder == null) {
      cards.containerFolder = await Folder.create({
        name: getPileName("containerFolder"),
        type: "Cards",
      });
    } else {
      await cards.containerFolder.update({
        name: getPileName("containerFolder"),
      });
    }

    // then all the card piles
    const cardsDocumentTypes = {
      twistDeck: "deck",
      controlHand: "hand",
      playArea: "pile",
      discardPile: "pile",
    };
    for (let cardsType in cardsDocumentTypes) {
      cards[cardsType] = this.system.cards[cardsType];
      if (cards[cardsType] == null) {
        // recreate documents that got deleted
        cards[cardsType] = await TtbCards.create({
          name: getPileName(cardsType),
          type: cardsDocumentTypes[cardsType],
          folder: cards.containerFolder.id,
        });
      } else {
        // fix other's names
        await cards[cardsType].update({ name: getPileName(cardsType) });
      }
    }
    const updateData = { system: { cards } };
    console.log(updateData);
    if (inCreation) await this.updateSource(updateData);
    else await this.update(updateData);
  }

  async _preDelete(options, user) {
    await super._preDelete(options, user);

    if (this.type === "fated") {
      // Delete the cards we created for the fated
      await this.system.cards.containerFolder?.delete();
      await Promise.all(
        ["twistDeck", "controlHand", "playArea", "discardPile"].map(
          async (field) => {
            await this.system.cards[field]?.delete();
          },
        ),
      );
    }
  }

  getActingValue(skill, aspect) {
    const [category, skillName] = skill.split(".");
    if (category === "skills") {
      return this.system.skills[skillName].av[aspect];
    }
    if (category === "derivedAspects") {
      return this.system.derivedAspects[skillName].value;
    }
    return null;
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
    /** @type {Suits} */ objMap(a, (aVal, suit) => combinator(aVal, b[suit])),
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
