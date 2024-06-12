import {
  createComputed,
  createDeferred,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  untrack,
} from "solid-js";
import DuelApplication from "../applications/duel.mjs";
import TtbChatMessage from "../documents/chat-message.mjs";
import { localize, localizeCardName } from "../util.mts";
import PlayingCard from "./partial/playing-card.jsx";
import { createHook, trackDocument } from "./rendering-utils.mjs";

export default function ControlCenter() {
  const userActor = trackDocument(createDeferred(selectUser()));
  const controlHand = createMemo(() => userActor()?.system?.cards?.controlHand);
  const twistDeck = createMemo(() => userActor()?.system?.cards?.twistDeck);
  const discardPile = createMemo(() => userActor()?.system?.cards?.discardPile);
  const controlHandCards = trackAvailableCards(controlHand);
  const discardPileCards = trackAvailableCards(discardPile);
  const twistDeckCards = trackAvailableCards(twistDeck);

  async function draw() {
    if (twistDeckCards().length < 1 && discardPile().cards.size < 1) {
      ui.notifications.error("You don't have any cards left to draw.");
      return;
    }
    if (twistDeckCards().length < 1) {
      await discardPile().recall();
      await twistDeck().shuffle();
    }
    await controlHand().draw(twistDeck());
  }

  async function discard(card) {
    await controlHand().pass(discardPile(), [card.id], {
      chatNotification: false,
    });
    await postMessage(
      localize("ttb.chat.discardCard", {
        card: localizeCardName(card),
        controlHand: controlHand().link,
      }),
    );
  }

  async function resetDeck() {
    await twistDeck().recall();
    await twistDeck().shuffle();
  }

  async function resetDiscard() {
    await discardPile().recall();
    await twistDeck().shuffle();
  }

  async function showCard(card) {
    await postMessage(
      localize("ttb.chat.showCard", {
        card: localizeCardName(card),
        controlHand: controlHand().link,
      }),
    );
  }

  async function postMessage(message) {
    await TtbChatMessage.create({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: { actor: userActor() },
      content: (
        <div class="cards-notification flexrow">
          <img
            class="icon"
            src={/*@once*/ controlHand().thumbnail}
            alt={/*@once*/ controlHand().name}
          />
          <p>{message}</p>
        </div>
      ).outerHTML,
    });
  }

  async function resetFateDeck() {
    const fateDeck = game.cards.get(game.settings.get("ttb2e", "fateDeck"));
    await fateDeck.recall({ chatNotification: false });
    await fateDeck.shuffle();
  }

  return (
    <div class="flex flex-row gap-3">
      <div class="w-32 shrink-0 flex flex-col gap-1">
        <button onClick={() => new DuelApplication().render({ force: true })}>
          {localize("ttb.ui.flip")}
        </button>
        <Show when={controlHand() != null}>
          <button onClick={draw}>{localize("ttb.ui.drawCard")}</button>
          <button onClick={resetDeck}>
            {localize("ttb.ui.resetTwistDeck")}
          </button>
          <button onClick={resetDiscard}>
            {localize("ttb.ui.resetDiscardPile")}
          </button>
        </Show>
      </div>
      <Switch>
        <Match when={controlHand() != null}>
          <div class="grow flex flex-col gap-2">
            <div class="w-full flex flex-row justify-between">
              <div>
                {localize("ttb.ui.controlHand")}: {controlHandCards()?.length}
              </div>
              <div>
                {localize("ttb.ui.twistDeck")}: {twistDeckCards().length}
              </div>
              <div>
                {localize("ttb.ui.discardPile")}: {discardPileCards()?.length}
              </div>
            </div>
            <div class="flex flex-row gap-1 flex-wrap">
              <For each={controlHandCards()}>
                {(card) => (
                  <div class="flex flex-col gap-1">
                    <PlayingCard card={card} />
                    <button onClick={() => showCard(card)}>
                      {localize("ttb.ui.show")}
                    </button>
                    <button onClick={() => discard(card)}>
                      {localize("ttb.ui.discard")}
                    </button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={game.user?.isGM}>
          <div class="flex flex-col gap-2">
            Fatemaster Area
            <button onClick={resetFateDeck}>
              {localize("ttb.ui.resetFateDeck")}
            </button>
          </div>
        </Match>
      </Switch>
    </div>
  );
}

function trackAvailableCards(cardsDocument) {
  const [cards, setCards] = createSignal([
    ...(cardsDocument()?.availableCards ?? []),
  ]);
  createComputed(() => {
    setCards([...(cardsDocument()?.availableCards ?? [])]);
  });
  const hasCardsDocument = createMemo(() => cardsDocument() != null);
  const cardsType = createMemo(() => cardsDocument()?.type);
  createComputed(() => {
    if (hasCardsDocument()) {
      const type = cardsType();
      untrack(() => {
        createHook("createCard", (card) => {
          if (card.parent.id === cardsDocument().id)
            setCards([...cards(), card]);
        });
        createHook("deleteCard", (card) => {
          if (card.parent.id === cardsDocument().id)
            setCards(cards().filter((c) => c.id !== card.id));
        });
        if (type === "deck")
          createHook("updateCard", (card, updateData) => {
            if (card.source.id === cardsDocument().id) {
              if (updateData.drawn === false)
                setCards([...cards().filter((c) => c.id !== card.id), card]);
              else if (updateData.drawn === true)
                setCards(cards().filter((c) => c.id !== card.id));
            }
          });
      });
    }
  });
  return createDeferred(cards);
}

function selectUser() {
  const controlledFated = getControlledFated();
  const userActor = getUserActor();
  return createMemo(() => {
    if (controlledFated() != null) return controlledFated();
    if (userActor()?.type === "fated") return userActor();
    return null;
  });
}

function getUserActor() {
  const user = trackDocument(() => game.user);
  return createMemo(() => user().character);
}

function getControlledFated() {
  const tokens = getControlledTokens();
  return createMemo(
    () =>
      tokens().find((t) => t?.actor != null && t.actor.type === "fated")
        ?.actor ?? null,
  );
}

function getControlledTokens() {
  const [tokens, setTokens] = createSignal(
    canvas.tokens.placeables.filter((t) => t.controlled),
  );
  createHook("controlToken", (token, controlled) => {
    if (controlled) setTokens([...tokens(), token]);
    else setTokens(tokens().filter((t) => t.id !== token.id));
  });
  return tokens;
}
