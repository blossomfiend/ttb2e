import { objMap } from "../util.mjs";

export function intField(initial, options = {}) {
  return new foundry.data.fields.NumberField({
    required: true,
    nullable: initial === null,
    initial,
    integer: true,
    ...options,
  });
}

export function suits(options = {}) {
  return new foundry.data.fields.SchemaField(
    objMap(game.ttb2e.suits, () => intField(0, options)),
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
