/**
 * @typedef Ttb2e
 * @type {Object}
 * @property {Object<Object>} suits
 * @property {Array<string>} aspects
 * @property {Array<string>} derivedAspects
 * @property {Array<string>} skillCategories
 * @property {Array<{name: string, aspect: string|Array<string>, category: string}>} skills
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
            aspect: "cunning",
            category: "academic",
        },
        {
            name: "engineering",
            aspect: "intellect",
            category: "academic",
        },
        {
            name: "history",
            aspect: "intellect",
            category: "academic",
        },
        {
            name: "literacy",
            aspect: "intellect",
            category: "academic",
        },
        {
            name: "mathematics",
            aspect: "intellect",
            category: "academic",
        },
        {
            name: "music",
            aspect: "charm",
            category: "academic",
        },
        {
            name: "flexible",
            aspect: "grace",
            category: "closeCombat",
        },
        {
            name: "grappling",
            aspect: "speed",
            category: "closeCombat",
        },
        {
            name: "heavyMelee",
            aspect: "might",
            category: "closeCombat",
        },
        {
            name: "martialArts",
            aspect: "speed",
            category: "closeCombat",
        },
        {
            name: "melee",
            aspect: "might",
            category: "closeCombat",
        },
        {
            name: "pneumatic",
            aspect: "might",
            category: "closeCombat",
        },
        {
            name: "pugilism",
            aspect: "might",
            category: "closeCombat",
        },
        {
            name: "alchemistry",
            aspect: "intellect",
            category: "crafting",
        },
        {
            name: "art",
            aspect: "cunning",
            category: "crafting",
        },
        {
            name: "artefacting",
            aspect: "intellect",
            category: "crafting",
        },
        {
            name: "blacksmithing",
            aspect: "intellect",
            category: "crafting",
        },
        {
            name: "culinary",
            aspect: "charm",
            category: "crafting",
        },
        {
            name: "explosives",
            aspect: "intellect",
            category: "crafting",
        },
        {
            name: "homesteading",
            aspect: "tenacity",
            category: "crafting",
        },
        {
            name: "printing",
            aspect: "intellect",
            category: "crafting",
        },
        {
            name: "stitching",
            aspect: "tenacity",
            category: "crafting",
        },
        {
            name: "doctor",
            aspect: "intellect",
            category: "expertise",
        },
        {
            name: "forgery",
            aspect: "cunning",
            category: "expertise",
        },
        {
            name: "gambling",
            aspect: "cunning",
            category: "expertise",
        },
        {
            name: "husbandry",
            aspect: "charm",
            category: "expertise",
        },
        {
            name: "lockpicking",
            aspect: "grace",
            category: "expertise",
        },
        {
            name: "notice",
            aspect: "cunning",
            category: "expertise",
        },
        {
            name: "track",
            aspect: "cunning",
            category: "expertise",
        },
        {
            name: "wilderness",
            aspect: "cunning",
            category: "expertise",
        },
        {
            name: "counterSpelling",
            aspect: "tenacity",
            category: "magical",
        },
        {
            name: "enchanting",
            aspect: ["charm", "cunning"],
            category: "magical",
        },
        {
            name: "necromancy",
            aspect: ["charm", "tenacity"],
            category: "magical",
        },
        {
            name: "sorcery",
            aspect: ["intellect", "tenacity"],
            category: "magical",
        },
        {
            name: "prestidigitation",
            aspect: ["cunning", "intellect"],
            category: "magical",
        },
        {
            name: "archery",
            aspect: "grace",
            category: "rangedCombat",
        },
        {
            name: "heavyGuns",
            aspect: "might",
            category: "rangedCombat",
        },
        {
            name: "longArms",
            aspect: "intellect",
            category: "rangedCombat",
        },
        {
            name: "pistol",
            aspect: "grace",
            category: "rangedCombat",
        },
        {
            name: "shotgun",
            aspect: "grace",
            category: "rangedCombat",
        },
        {
            name: "thrownWeapons",
            aspect: "grace",
            category: "rangedCombat",
        },
        {
            name: "barter",
            aspect: "tenacity",
            category: "social",
        },
        {
            name: "bewitch",
            aspect: "charm",
            category: "social",
        },
        {
            name: "convince",
            aspect: "intellect",
            category: "social",
        },
        {
            name: "deceive",
            aspect: "cunning",
            category: "social",
        },
        {
            name: "intimidate",
            aspect: "tenacity",
            category: "social",
        },
        {
            name: "leadership",
            aspect: "charm",
            category: "social",
        },
        {
            name: "scrutiny",
            aspect: "cunning",
            category: "social",
        },
        {
            name: "acrobatics",
            aspect: "grace",
            category: "training",
        },
        {
            name: "acrobatics",
            aspect: "grace",
            category: "training",
        },
        {
            name: "athletics",
            aspect: "might",
            category: "training",
        },
        {
            name: "carouse",
            aspect: "resilience",
            category: "training",
        },
        {
            name: "centering",
            aspect: "tenacity",
            category: "training",
        },
        {
            name: "evade",
            aspect: "speed",
            category: "training",
        },
        {
            name: "pickPocket",
            aspect: "speed",
            category: "training",
        },
        {
            name: "stealth",
            aspect: "cunning",
            category: "training",
        },
        {
            name: "toughness",
            aspect: "resilience",
            category: "training",
        },
    ],
};

export default TTB2E;
