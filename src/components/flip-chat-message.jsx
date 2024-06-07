import { createMemo, For, Show } from "solid-js";
import { canCardBeChosen, localize } from "../util.mjs";
import InlineFateModifiers from "./partial/inline-fate-modifiers.jsx";
import PlayingCard from "./partial/playing-card.jsx";
import TextSuits from "./partial/text-suits.jsx";
import { trackDocument } from "./rendering-utils.mjs";

export default function FlipChatMessage(props) {
  const message = trackDocument(props.message);
  const system = () => message().system;
  const skill = () => system().skill;
  const aspect = () => system().aspect;
  const flippedCards = () => system().flippedCards;
  const targetNumber = () => system().targetNumber;
  const actingValue = () => system().actingValue;
  const fateModifier = () => system().fateModifier;

  const title = createMemo(
    () => {
      const titleElements = [];
      if (skill() != null) {
        titleElements.push(localize(`ttb.${skill()}.name`));
      }
      if (aspect() != null) {
        titleElements.push(localize(`ttb.aspects.${aspect()}.name`));
      }
      if (titleElements.length === 0) {
        titleElements.push(localize("ttb.ui.flip"));
      }
      return titleElements.join(" + ");
    },
    { equals: true },
  );

  const canCheat = createMemo(
    () =>
      fateModifier() >= 0 &&
      !flippedCards().some((card) => card.suit === "blackJoker"),
  );

  const headerFields = [
    { value: targetNumber, title: "TN" },
    { value: actingValue, title: "AV" },
  ];

  return (
    <div class="extra-content flex flex-col gap-2">
      <div class="text-center text-16">
        {title()} <InlineFateModifiers fateModifier={fateModifier()} />
      </div>
      <div class="flex flex-row justify-evenly">
        <For each={headerFields}>{(props) => <HeaderField {...props} />}</For>
      </div>
      <div class="flex flex-row gap-1 justify-center">
        <For each={flippedCards()}>
          {(flippedCard) => (
            <PlayingCard
              card={flippedCard}
              actingValue={actingValue()}
              targetNumber={targetNumber()}
              canBeChosen={canCardBeChosen(
                flippedCard,
                flippedCards(),
                fateModifier(),
              )}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function HeaderField(props) {
  return (
    <Show when={props.value() != null}>
      <div class="flex flex-col items-center">
        <div>
          {props.value().value} <TextSuits suits={props.value().suits} />
        </div>
        <div class="text-13 small-caps text-text-dark-secondary">
          {props.title}
        </div>
      </div>
    </Show>
  );
}
