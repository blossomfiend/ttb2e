import { createComputed, For } from "solid-js";
import { createStore } from "solid-js/store";

export default function SuitedNumberFormField(props) {
  const [state, setState] = createStore({
    value: props.value?.value ?? "",
    suits: props.value?.suits ?? {
      rams: 0,
      crows: 0,
      tomes: 0,
      masks: 0,
    },
  });

  createComputed(() => {
    props.onChange?.(
      state.value !== ""
        ? {
            value: state.value,
            suits: state.suits,
          }
        : null,
    );
  });

  function inputKeyDown(event) {
    let suit;
    switch (event.key) {
      case "r":
      case "R":
        suit = "rams";
        break;
      case "c":
      case "C":
        suit = "crows";
        break;
      case "t":
      case "T":
        suit = "tomes";
        break;
      case "m":
      case "M":
        suit = "masks";
        break;
      default:
        return;
    }
    const delta = event.shiftKey ? -1 : 1;
    setState("suits", suit, (x) => Math.max(0, x + delta));
  }

  return (
    <div class="flex flex-col gap-2">
      <input
        type="number"
        name={`${props.name}.value`}
        onKeyDown={inputKeyDown}
        value={state.value}
        onChange={(event) => setState("value", event.target.value)}
      />
      <div class="flex flex-row gap-2 justify-between">
        <For each={Object.entries(state.suits)}>
          {([suit, count]) => (
            <div class="grow flex flex-col items-center gap-1">
              <button
                class="w-full"
                on:click={(event) => {
                  event.preventDefault();
                  setState("suits", suit, (x) => x + 1);
                }}
              >
                +
              </button>
              <div>
                {count} <i class={`ttb-icon-${suit}`} />
              </div>
              <input
                type="hidden"
                name={`${props.name}.suits.${suit}`}
                value={count}
              />
              <button
                class="w-full"
                on:click={(event) => {
                  event.preventDefault();
                  setState("suits", suit, (x) => x - 1);
                }}
                disabled={count <= 0}
              >
                -
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
