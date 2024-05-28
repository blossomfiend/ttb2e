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
        await controlHand.pass(discardPile, [card.id]);
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

    async function playCard(card) {
        await TtbChatMessage.create({
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            speaker: {actor: userCharacter},
            content: `<p>Played ${localizeCardName(card)}.</p>`
        });
        await controlHand.pass(discardPile, [card.id], {chatNotification: false});
        userCharacter = userCharacter;
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
    <div class="flex flex-col gap-1">
        <button on:click={() => new DuelApplication().render({force: true})}>{localize("ttb.ui.flip")}</button>
        {#if controlHand != null}
            <button on:click={draw}>Draw Card</button>
            <button on:click={resetDeck}>Reset Twist Deck</button>
            <button on:click={resetDiscard}>Reset Discard Pile</button>
        {/if}
    </div>
    {#if controlHand != null}
        <div class="grow flex flex-col gap-2">
            <div class="w-full flex flex-row justify-between">
                <div>Control Hand: {controlHand.cards.size}</div>
                <div>Twist Deck: {twistDeck.availableCards.length}</div>
                <div>Discard Pile: {discardPile.cards.size}</div>
            </div>
            <div class="flex flex-row gap-1">
                {#each controlHand.cards as card}
                    <div class="flex flex-col gap-1">
                        <PlayingCard {card}/>
                        <button on:click={() => playCard(card)}>Play</button>
                        <button on:click={() => discard(card)}>Discard</button>
                    </div>
                {/each}
            </div>
        </div>
    {:else if game.user.isGM}
        <div class="flex flex-col gap-2">
            Fatemaster Area
            <button on:click={resetFateDeck}>Reset Fate Deck</button>
        </div>
    {/if}
</div>
