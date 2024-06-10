import { Show } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import Flip from "../flip.mjs";
import InlineFateModifiers from "./partial/inline-fate-modifiers.jsx";
import SuitedNumberFormField from "./partial/suited-number-form-field.jsx";

export default function Duel(props) {
  const [state, setState] = createStore({
    targetNumber: null,
    actingValue: null,
  });
  const buttons = [3, 2, 1, 0, -1, -2, -3];

  const startFlip = async (fateModifier) => {
    let flip = new Flip(
      { fateModifier },
      {
        actor: props.actor,
        skill: props.skill,
        aspect: props.aspect,
        targetNumber: state.targetNumber,
        actingValue: state.actingValue,
      },
    );
    await flip.evaluate();
    props.close();
  };

  return (
    <form
      class="standard-form flex flex-col gap-5"
      on:submit={(e) => e.preventDefault()}
    >
      <div class="form-group">
        <label>Acting Value</label>
        <div class="form-fields">
          <SuitedNumberFormField
            value={state.actingValue}
            name="actingValue"
            onChange={(value) => setState("actingValue", reconcile(value))}
          />
        </div>
        <p class="hint">
          Your acting value. You can press any of &lt;r, c, t, m&gt; in the
          entry field to quickly add suits, or &lt;R, C, T, M&gt; to remove
          suits.
        </p>
      </div>

      <div class="form-group">
        <label>Target Number</label>
        <div class="form-fields">
          <SuitedNumberFormField
            value={state.targetNumber}
            name="targetNumber"
            onChange={(value) => setState("targetNumber", reconcile(value))}
          />
        </div>
        <p class="hint">
          The target number you are making a duel against. This can be left out.
          You can press any of &lt;r, c, t, m&gt; in the entry field to quickly
          add suits, or &lt;R, C, T, M&gt; to remove suits.
        </p>
      </div>

      <footer class="flex flex-row gap-1">
        {buttons.map((buttonFateModifier, buttonIdx) => (
          <button onClick={() => startFlip(buttonFateModifier)}>
            <span class="text-base">
              <Show
                when={buttonFateModifier !== 0}
                fallback={<span class="alight">Flip</span>}
              >
                <InlineFateModifiers
                  fateModifier={buttonFateModifier}
                  class="align-middle"
                />
              </Show>
            </span>
          </button>
        ))}
      </footer>
    </form>
  );
}
