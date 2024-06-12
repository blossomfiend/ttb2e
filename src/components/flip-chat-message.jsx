import { createMemo, For, onMount, Show, Suspense } from "solid-js";
import { ErrorBoundary, render } from "solid-js/web";
import { canCardBeChosen, localize } from "../util.mts";
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

  onMount(() => {
    if (ui.chat.isAtBottom) ui.chat.scrollBottom();
  });

  return (
    <div class="extra-content use-tailwind">
      <div class="size-full flex flex-col gap-2 items-stretch">
        <div class="text-center text-base">
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
    </div>
  );
}

function HeaderField(props) {
  return (
    <Show when={props.value() != null}>
      <div class="flex flex-col items-center">
        <div class="text-sm leading-tight italic text-stone-700">
          {props.title}
        </div>
        <div class="text-base leading-tight">
          {props.value().value}<TextSuits suits={props.value().suits} />
        </div>
      </div>
    </Show>
  );
}

export function renderChatMessage(message, html, data) {
  render(
    () => (
      <ErrorBoundary
        fallback={(e) => {
          logger.error(e);
          return <div>Error: {e.toString()}</div>;
        }}
      >
        <Suspense>
          <FlipChatMessage message={message} />
        </Suspense>
      </ErrorBoundary>
    ),
    html[0],
  );
}
