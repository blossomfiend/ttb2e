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
  return new foundry.data.fields.SchemaField(
    {
      weak: intField(0),
      moderate: intField(0),
      severe: intField(0),
    },
    { initial: null, nullable: true, ...options },
  );
}
