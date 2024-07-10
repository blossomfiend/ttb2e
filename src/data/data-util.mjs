export function intField(initial, options = {}) {
  return new foundry.data.fields.NumberField({
    required: initial !== undefined,
    nullable: initial === null,
    initial,
    integer: true,
    ...options,
  });
}

export function suits(options = {}) {
  return new foundry.data.fields.SchemaField(
    Object.fromEntries(
      game.ttb2e.suits.map((suit) => [suit, intField(0, options)]),
    ),
    options,
  );
}

export function suitedValue(initial = 0, options = {}) {
  return new foundry.data.fields.SchemaField(
    {
      value: intField(initial, options),
      suits: suits(options),
    },
    options,
  );
}

export function damageField(options = {}) {
  const fields = foundry.data.fields;
  return new fields.SchemaField(
    {
      weak: new fields.SchemaField({
        damage: intField(0),
        blast: intField(0),
      }),
      moderate: new fields.SchemaField({
        damage: intField(0),
        blast: intField(0),
      }),
      severe: new fields.SchemaField({
        damage: intField(0),
        blast: intField(0),
      }),
    },
    { initial: null, nullable: true, ...options },
  );
}

export function triggerFields({ withName = true } = {}) {
  const fields = foundry.data.fields;
  return {
    ...(withName ? { name: new fields.StringField({ initial: "" }) } : {}),
    suits: suits(),
    description: new fields.HTMLField({ initial: "" }),
  };
}

export function commonActionFields() {
  const fields = foundry.data.fields;
  return {
    ap: intField(1),
    resist: new fields.StringField({
      choices: ["defense", "willpower", "either"],
      nullable: true,
    }),
    rangeType: new fields.StringField({
      choices: ["melee", "projectile"],
      nullable: true,
    }),
    range: intField(null),
    targetNumber: suitedValue(null),
    // in the category.skill format, so for example
    // skills.doctor
    // derivedAspects.defense
    skill: new fields.StringField({ blank: false, nullable: true }),
    aspect: new fields.StringField({
      choices: game.ttb2e.aspects,
      nullable: true,
    }),
    description: new fields.HTMLField({ initial: "" }),
    damage: damageField(),
    capacity: intField(null),
    reload: intField(null),
    triggers: new fields.ArrayField(new fields.SchemaField(triggerFields())),
  };
}
