import { createMemo, For, Show } from "solid-js";
import TextSuits from "./text-suits.jsx";

/**
 *
 * @param {TtbCard} props.card
 * @param {SuitedValue} [props.targetNumber]
 * @param {SuitedValue} [props.actingValue]
 * @param {boolean} [props.canBeChosen]
 * @constructor
 */
export default function PlayingCard(props) {
  const duelTotal = createMemo(() =>
    getDuelTotal(props.card, props.actingValue),
  );
  const higherThanTN = createMemo(() =>
    doesCardMatchTN(props.card, props.targetNumber ?? null, duelTotal()),
  );
  const valueDifference = () =>
    duelTotal().value - (props.targetNumber?.value ?? 0);
  const severity = () => game.ttb2e.severityByCardValue[props.card.value];

  return (
    <div
      class="w-16 h-24 leading-none rounded grid grid-cols-1 grid-rows-1 text-zinc-900"
      classList={{
        "shadow-md": props.canBeChosen,
        "shadow-sm": !props.canBeChosen,
      }}
    >
      <div
        class="row-start-1 row-end-1 col-start-1 col-end-1 flex flex-col justify-between rounded"
        classList={{
          "bg-zinc-100": props.targetNumber == null,
          "bg-lime-100": props.targetNumber != null && higherThanTN(),
          "bg-red-100": props.targetNumber != null && !higherThanTN(),
        }}
      >
        <div
          class="grow flex flex-row justify-between rounded shadow-sm bg-white"
          classList={{ "text-red-700": props.card?.suit === "redJoker" }}
        >
          <div class="self-start flex flex-col items-center p-1">
            <div>{props.card.value}</div>
            <div>
              <Show
                when={
                  props.card.suit !== "redJoker" &&
                  props.card.suit !== "blackJoker"
                }
                fallback={<span>J</span>}
              >
                <i class={`ttb-icon-${props.card.suit}`} />
              </Show>
            </div>
          </div>
          <div class="text-[6px] opacity-60 py-1.5 px-1 flex flex-row gap-px">
            <For each={Array(severity())}>
              {() => <i class="fa-solid fa-diamond" />}
            </For>
          </div>
        </div>
        <Show when={props.targetNumber != null || props.actingValue != null}>
          <div class="self-end flex flex-col items-end rounded-b w-full p-1 pt-1.5">
            <Show when={props.targetNumber != null}>
              <div class="text-text-dark-secondary text-sm italic pr-1">
                {`${valueDifference() > 0 ? "+" : ""}${valueDifference()}`}
              </div>
            </Show>
            <div
              classList={{
                "text-lime-900": props.targetNumber != null && higherThanTN(),
                "text-red-900": props.targetNumber != null && !higherThanTN(),
              }}
            >
              {duelTotal().value} <TextSuits suits={duelTotal().suits} />
              <Show when={props.card.suit === "redJoker"}>
                <span>J</span>
              </Show>
            </div>
          </div>
        </Show>
      </div>
      <Show when={!(props.canBeChosen ?? true)}>
        <div class="row-start-1 row-end-1 col-start-1 col-end-1 rounded bg-zinc-900/50" />
      </Show>
    </div>
  );
}

function getDuelTotal(card, actingValue = null) {
  let suits =
    actingValue != null
      ? { ...actingValue.suits }
      : {
          rams: 0,
          crows: 0,
          tomes: 0,
          masks: 0,
        };
  if (card.suit !== "redJoker" && card.suit !== "blackJoker") {
    suits[card.suit] += 1;
  }
  return {
    value: card.value + (actingValue?.value ?? 0),
    suits,
  };
}

function doesCardMatchTN(card, targetNumber, duelTotal = getDuelTotal(card)) {
  if (targetNumber == null) {
    return true;
  }
  if (targetNumber.value > duelTotal.value) {
    return false;
  }
  const missingSuitCount = Object.entries(targetNumber.suits)
    .map(([suit, targetCount]) =>
      Math.max(0, targetCount - duelTotal.suits[suit]),
    )
    .reduce((a, b) => a + b, 0);
  return missingSuitCount <= (card.suit === "redJoker" ? 1 : 0);
}
