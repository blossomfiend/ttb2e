/**
 * @typedef Ttb2e
 * @type {Object}
 * @property {Object<Object>} suits
 * @property {Array<string>} aspects
 * @property {Array<string>} derivedAspects
 * @property {Array<string>} skillCategories
 * @property {Array<{name: string, aspects: string|Array<string>, category: string}>} skills
 */

/**
 * @name Game#ttb2e
 * @property {Ttb2e} ttb2e
 */

/**
 * @type Ttb2e
 */
const TTB2E = {
    suits: {
        rams: {},
        crows: {},
        tomes: {},
        masks: {},
    },
    aspects: [
        "might",
        "grace",
        "speed",
        "resilience",
        "intellect",
        "charm",
        "cunning",
        "tenacity",
    ],
    derivedAspects: [
        "defense",
        "willpower",
        "initiative",
        "walk",
        "charge",
        "height",
    ],
    skillCategories: [
        "academic",
        "closeCombat",
        "crafting",
        "expertise",
        "magical",
        "rangedCombat",
        "social",
        "training"
    ],
    skills: [
        {
            name: "bureaucracy",
            aspects: ["cunning"],
            category: "academic",
        },
        {
            name: "engineering",
            aspects: ["intellect"],
            category: "academic",
        },
        {
            name: "history",
            aspects: ["intellect"],
            category: "academic",
        },
        {
            name: "literacy",
            aspects: ["intellect"],
            category: "academic",
        },
        {
            name: "mathematics",
            aspects: ["intellect"],
            category: "academic",
        },
        {
            name: "music",
            aspects: ["charm"],
            category: "academic",
        },
        {
            name: "flexible",
            aspects: ["grace"],
            category: "closeCombat",
        },
        {
            name: "grappling",
            aspects: ["speed"],
            category: "closeCombat",
        },
        {
            name: "heavyMelee",
            aspects: ["might"],
            category: "closeCombat",
        },
        {
            name: "martialArts",
            aspects: ["speed"],
            category: "closeCombat",
        },
        {
            name: "melee",
            aspects: ["might"],
            category: "closeCombat",
        },
        {
            name: "pneumatic",
            aspects: ["might"],
            category: "closeCombat",
        },
        {
            name: "pugilism",
            aspects: ["might"],
            category: "closeCombat",
        },
        {
            name: "alchemistry",
            aspects: ["intellect"],
            category: "crafting",
        },
        {
            name: "art",
            aspects: ["cunning"],
            category: "crafting",
        },
        {
            name: "artefacting",
            aspects: ["intellect"],
            category: "crafting",
        },
        {
            name: "blacksmithing",
            aspects: ["intellect"],
            category: "crafting",
        },
        {
            name: "culinary",
            aspects: ["charm"],
            category: "crafting",
        },
        {
            name: "explosives",
            aspects: ["intellect"],
            category: "crafting",
        },
        {
            name: "homesteading",
            aspects: ["tenacity"],
            category: "crafting",
        },
        {
            name: "printing",
            aspects: ["intellect"],
            category: "crafting",
        },
        {
            name: "stitching",
            aspects: ["tenacity"],
            category: "crafting",
        },
        {
            name: "doctor",
            aspects: ["intellect"],
            category: "expertise",
        },
        {
            name: "forgery",
            aspects: ["cunning"],
            category: "expertise",
        },
        {
            name: "gambling",
            aspects: ["cunning"],
            category: "expertise",
        },
        {
            name: "husbandry",
            aspects: ["charm"],
            category: "expertise",
        },
        {
            name: "lockpicking",
            aspects: ["grace"],
            category: "expertise",
        },
        {
            name: "notice",
            aspects: ["cunning"],
            category: "expertise",
        },
        {
            name: "track",
            aspects: ["cunning"],
            category: "expertise",
        },
        {
            name: "wilderness",
            aspects: ["cunning"],
            category: "expertise",
        },
        {
            name: "counterSpelling",
            aspects: ["tenacity"],
            category: "magical",
        },
        {
            name: "enchanting",
            aspects: ["charm", "cunning"],
            category: "magical",
        },
        {
            name: "necromancy",
            aspects: ["charm", "tenacity"],
            category: "magical",
        },
        {
            name: "sorcery",
            aspects: ["intellect", "tenacity"],
            category: "magical",
        },
        {
            name: "prestidigitation",
            aspects: ["cunning", "intellect"],
            category: "magical",
        },
        {
            name: "archery",
            aspects: ["grace"],
            category: "rangedCombat",
        },
        {
            name: "heavyGuns",
            aspects: ["might"],
            category: "rangedCombat",
        },
        {
            name: "longArms",
            aspects: ["intellect"],
            category: "rangedCombat",
        },
        {
            name: "pistol",
            aspects: ["grace"],
            category: "rangedCombat",
        },
        {
            name: "shotgun",
            aspects: ["grace"],
            category: "rangedCombat",
        },
        {
            name: "thrownWeapons",
            aspects: ["grace"],
            category: "rangedCombat",
        },
        {
            name: "barter",
            aspects: ["tenacity"],
            category: "social",
        },
        {
            name: "bewitch",
            aspects: ["charm"],
            category: "social",
        },
        {
            name: "convince",
            aspects: ["intellect"],
            category: "social",
        },
        {
            name: "deceive",
            aspects: ["cunning"],
            category: "social",
        },
        {
            name: "intimidate",
            aspects: ["tenacity"],
            category: "social",
        },
        {
            name: "leadership",
            aspects: ["charm"],
            category: "social",
        },
        {
            name: "scrutiny",
            aspects: ["cunning"],
            category: "social",
        },
        {
            name: "acrobatics",
            aspects: ["grace"],
            category: "training",
        },
        {
            name: "athletics",
            aspects: ["might"],
            category: "training",
        },
        {
            name: "carouse",
            aspects: ["resilience"],
            category: "training",
        },
        {
            name: "centering",
            aspects: ["tenacity"],
            category: "training",
        },
        {
            name: "evade",
            aspects: ["speed"],
            category: "training",
        },
        {
            name: "pickPocket",
            aspects: ["speed"],
            category: "training",
        },
        {
            name: "stealth",
            aspects: ["cunning"],
            category: "training",
        },
        {
            name: "toughness",
            aspects: ["resilience"],
            category: "training",
        },
    ],
};

export default TTB2E;
