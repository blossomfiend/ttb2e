import { inclusiveRange } from "./util.mts";

const suits = ["rams", "crows", "tomes", "masks"] as const;
const ranks = [
  {
    name: "peon",
    fatePoints: 0,
    unconsciousAtZero: true,
    values: [1, 2, 3, 4],
  },
  {
    name: "minion",
    fatePoints: 1,
    unconsciousAtZero: true,
    values: [5, 6],
  },
  {
    name: "enforcer",
    fatePoints: 2,
    unconsciousAtZero: false,
    values: [7, 8],
  },
  {
    name: "henchman",
    fatePoints: 3,
    unconsciousAtZero: false,
    values: [9, 10, 11],
  },
  {
    name: "master",
    fatePoints: 4,
    unconsciousAtZero: false,
    values: [12, 13],
  },
  {
    name: "tyrant",
    fatePoints: 5,
    unconsciousAtZero: false,
    values: [14],
  },
] as const;
const ttbGameData = {
  suits,
  aspects: [
    "might",
    "grace",
    "speed",
    "resilience",
    "charm",
    "intellect",
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
    "training",
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
  suitRoles: [
    {
      name: "defining",
      values: [1, 5, 9, 13],
    },
    {
      name: "ascendant",
      values: [4, 8, 12],
    },
    {
      name: "center",
      values: [3, 7, 11],
    },
    {
      name: "descendant",
      values: [2, 6, 10],
    },
  ],
  // prettier-ignore
  severityByCardValue: [
    /* blackJoker */ 0,
    /*  1- 5 */ 1, 1, 1, 1, 1,
    /*  6-10 */ 2, 2, 2, 2, 2,
    /* 11-13 */ 3, 3, 3,
    /* redJoker */ 4
  ],
  ranks,
  themes: [
    {
      name: "guildRed",
      color: "#b31a1c",
    },
    {
      name: "bayouBrown",
      color: "#806133",
    },
    {
      name: "tenThundersOrange",
      color: "#fa9d1e",
    },
    {
      name: "outcastYellow",
      color: "#e7c712",
    },
    {
      name: "resurrectionistGreen",
      color: "#018846",
    },
    {
      name: "arcanistBlue",
      color: "#0088be",
    },
    {
      name: "neverbornPurple",
      color: "#6d2d82",
    },
    {
      name: "explorersTeal",
      color: "#02a896"
    }
  ],
  fateDeck: [
    ...Object.keys(suits).flatMap((suit) =>
      [...inclusiveRange(1, 13)].map((value) => ({
        suit,
        value,
      })),
    ),
    { suit: "blackJoker", value: 0 },
    { suit: "redJoker", value: 14 },
  ],
  rankByValue: Object.fromEntries(
    [...inclusiveRange(1, 14)].map((value) => [
      value,
      // @ts-ignore
      ranks.find((rank) => rank.values.includes(value)),
    ]),
  ),
} as const;

export type TtbGameData = typeof ttbGameData;

declare global {
  namespace game {
    let ttb2e: TtbGameData;
  }
}

export default ttbGameData;
