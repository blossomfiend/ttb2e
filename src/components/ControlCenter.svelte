<script>
    import {onMount} from 'svelte';
    import {localize, localizeCardName} from "../util.js";
    import DuelApplication from "../applications/duel.js";
    import PlayingCard from "./partial/PlayingCard.svelte";
    import TtbChatMessage from "../documents/chat-message.js";

    function selectUser() {
        const main = game.user.character;
        if (main?.type === "fated") return main;
        const selected = canvas.tokens.placeables.find(token => token.controlled)?.actor;
        if (selected?.type === "fated") return selected;
        return null;
    }

    let userCharacter = selectUser();
    $: controlHand = userCharacter?.system?.cards?.controlHand;
    $: twistDeck = userCharacter?.system?.cards?.twistDeck;
    $: discardPile = userCharacter?.system?.cards?.discardPile;

    /**
     * Draw a card from the users twist deck.
     */
    async function draw() {
        if (twistDeck.availableCards.length < 1) {
            await discardPile.recall();
            await twistDeck.shuffle();
        }
        await controlHand.draw(twistDeck);
        userCharacter = userCharacter;
    }

    async function discard(card) {
        await controlHand.pass(discardPile, [card.id], {chatNotification: false});
        await postMessage(localize("ttb.chat.discardCard", {
            card: localizeCardName(card),
            controlHand: controlHand.link,
        }));
        userCharacter = userCharacter;
    }

    async function resetDeck() {
        await twistDeck.recall();
        await twistDeck.shuffle();
        userCharacter = userCharacter;
    }

    async function resetDiscard() {
        await discardPile.recall();
        await twistDeck.shuffle();
        userCharacter = userCharacter;
    }

    async function showCard(card) {
        await postMessage(localize("ttb.chat.showCard", {
            card: localizeCardName(card),
            controlHand: controlHand.link,
        }));
    }

    async function postMessage(message) {
        await TtbChatMessage.create({
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            speaker: {actor: userCharacter},
            content: `
                <div class="cards-notification flexrow">
                    <img class="icon" src="${controlHand.thumbnail}" alt="${controlHand.name}">
                    <p>${message}</p>
                </div>`
        });

    }

    async function resetFateDeck() {
        const fateDeck = game.cards.get(game.settings.get("ttb2e", "fateDeck"));
        await fateDeck.recall({chatNotification: false});
        await fateDeck.shuffle();
    }

    onMount(() => {
        const hook = Hooks.on("controlToken", () => {
            userCharacter = selectUser();
        });
        return () => {
            Hooks.off("controlToken", hook);
        };
    });
</script>

<div class="flex flex-row gap-3">
    <div class="w-32 shrink-0 flex flex-col gap-1">
        <button on:click={() => new DuelApplication().render({force: true})}>{localize("ttb.ui.flip")}</button>
        {#if controlHand != null}
            <button on:click={draw}>{localize("ttb.ui.drawCard")}</button>
            <button on:click={resetDeck}>{localize("ttb.ui.resetTwistDeck")}</button>
            <button on:click={resetDiscard}>{localize("ttb.ui.resetDiscardPile")}</button>
        {/if}
    </div>
    {#if controlHand != null}
        <div class="grow flex flex-col gap-2">
            <div class="w-full flex flex-row justify-between">
                <div>{localize("ttb.ui.controlHand")}: {controlHand.cards.size}</div>
                <div>{localize("ttb.ui.twistDeck")}: {twistDeck.availableCards.length}</div>
                <div>{localize("ttb.ui.discardPile")}: {discardPile.cards.size}</div>
            </div>
            <div class="flex flex-row gap-1 flex-wrap">
                {#each controlHand.cards as card}
                    <div class="flex flex-col gap-1">
                        <PlayingCard {card}/>
                        <button on:click={() => showCard(card)}>{localize("ttb.ui.show")}</button>
                        <button on:click={() => discard(card)}>{localize("ttb.ui.discard")}</button>
                    </div>
                {/each}
            </div>
        </div>
    {:else if game.user.isGM}
        <div class="flex flex-col gap-2">
            Fatemaster Area
            <button on:click={resetFateDeck}>{localize("ttb.ui.resetFateDeck")}</button>
        </div>
    {/if}
</div>
