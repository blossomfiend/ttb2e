<script>
    import TextSuits from "./partial/TextSuits.svelte";
    import InlineFateModifiers from "./partial/InlineFateModifiers.svelte";
    import {localize, canCardBeChosen} from "../util.js";
    import PlayingCard from "./partial/PlayingCard.svelte";

    export let skill = null;
    export let aspect = null;
    export let flippedCards;
    export let targetNumber;
    export let actingValue;
    export let fateModifier;

    $: title = (() => {
        let titleElements = [];
        if (skill != null) {
            titleElements.push(localize(`ttb.${skill}.name`));
        }
        if (aspect != null) {
            titleElements.push(localize(`ttb.aspects.${aspect}.name`));
        }
        if (titleElements.length === 0) {
            titleElements.push(localize(`ttb.ui.flip`));
        }
        return titleElements.join(" + ");
    })();

    $: canCheat = fateModifier >= 0 && !flippedCards.some(c => c.suit === "blackJoker");
</script>

<div class="message-content flex flex-col gap-2">
    <div class="text-center text-16">
        {title}
        <InlineFateModifiers {fateModifier}/>
    </div>
    <div class="flex flex-row justify-evenly">
        {#if targetNumber != null}
            <div class="flex flex-col items-center">
                <div>
                    <span>{targetNumber.value}</span>
                    <span><TextSuits suits={targetNumber.suits}/></span>
                </div>
                <div class="text-13 small-caps text-text-dark-secondary">
                    TN
                </div>
            </div>
        {/if}
        {#if actingValue != null}
            <div class="flex flex-col items-center">
                <div>
                    <span>{actingValue.value}</span>
                    <span><TextSuits suits={actingValue.suits}/></span>
                </div>
                <div class="text-13 small-caps text-text-dark-secondary">
                    AV
                </div>
            </div>
        {/if}
    </div>
    <div class="flex flex-row gap-1 justify-center">
        {#each flippedCards as flippedCard}
            <PlayingCard
                card={flippedCard}
                {actingValue}
                {targetNumber}
                canBeChosen={canCardBeChosen(flippedCard, flippedCards, fateModifier)}/>
        {/each}
    </div>
    <!--    <div>-->
    <!--        <button class="bg-black/10 my-1" disabled={!canCheat}>{canCheat ? "Cheat!" : "No cheating."}</button>-->
    <!--    </div>-->
</div>
