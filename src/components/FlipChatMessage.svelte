<script>
    import TextSuits from "./partial/TextSuits.svelte";
    import InlineFateModifiers from "./partial/InlineFateModifiers.svelte";
    import {localize} from "../util.js";

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

    function getDuelTotal(card) {
        let suits = actingValue != null ? {...actingValue.suits} : {
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
            suits
        };
    }

    function canCardBeChosen(card) {
        if (flippedCards.some(c => c.suit === "blackJoker")) {
            return card.suit === "blackJoker";
        }
        if (card.suit === "redJoker") {
            return true;
        }
        if (fateModifier < 0) {
            return card.value === Math.min(...flippedCards.map(c => c.value));
        }
        return true;
    }

    function doesCardMatchTN(card, duelTotal = getDuelTotal(card)) {
        if (targetNumber == null) {
            return true;
        }
        if (targetNumber.value > duelTotal.value) {
            return false;
        }
        const missingSuitCount = Object.entries(targetNumber.suits)
            .map(([suit, targetCount]) => Math.max(0, targetCount - duelTotal.suits[suit]))
            .reduce((a, b) => a + b, 0);
        return missingSuitCount <= (card.suit === "redJoker" ? 1 : 0);
    }
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
            {@const duelTotal = getDuelTotal(flippedCard)}
            {@const canBeChosen = canCardBeChosen(flippedCard)}
            {@const higherThanTN = doesCardMatchTN(flippedCard, duelTotal)}
            {@const valueDifference = duelTotal.value - targetNumber?.value ?? 0}
            {@const severity = Math.floor((flippedCard.value - 1) / 5) + 1}
            <div>
                <div class="w-16 h-24 leading-none bg-white rounded grid grid-cols-1 grid-rows-1"
                     class:shadow-md={canBeChosen}
                     class:shadow-sm={!canBeChosen}>
                    <div class="row-start-1 row-end-1 col-start-1 col-end-1 flex flex-col justify-between rounded"
                         class:bg-slate-100={targetNumber == null}
                         class:bg-lime-100={targetNumber != null && higherThanTN}
                         class:bg-red-100={targetNumber != null && !higherThanTN}>
                        <div class="grow flex flex-row justify-between rounded shadow-sm bg-white"
                             class:text-red-700={flippedCard.suit === "redJoker"}>
                            <div class="self-start flex flex-col items-center p-1">
                                <div>{flippedCard.value}</div>
                                <div>
                                    {#if flippedCard.suit === "redJoker" || flippedCard.suit === "blackJoker"}
                                        <span>J</span>
                                    {:else}
                                        <i class={`ttb-icon-${flippedCard.suit}`}/>
                                    {/if}
                                </div>
                            </div>
                            <div class="text-[6px] opacity-60 py-1.5 px-1 flex flex-row gap-px">
                                {#each Array(severity) as _}
                                    <i class="fa-solid fa-diamond"/>
                                {/each}
                            </div>
                        </div>
                        {#if targetNumber != null || actingValue != null}
                            <div class="self-end flex flex-col items-end rounded-b w-full p-1 pt-1.5">
                                {#if targetNumber != null}
                                    <div class="text-text-dark-secondary text-13 italic pr-1">
                                        {`${valueDifference > 0 ? "+" : ""}${valueDifference}`}
                                    </div>
                                {/if}
                                <div class:text-lime-900={targetNumber != null && higherThanTN}
                                     class:text-red-900={targetNumber != null && !higherThanTN}>
                                    <span>{duelTotal.value}</span>
                                    <span><TextSuits suits={duelTotal.suits}/></span>
                                    {#if flippedCard.suit === "redJoker"}<span>J</span>{/if}
                                </div>
                            </div>
                        {/if}
                    </div>
                    {#if !canBeChosen}
                        <div class="row-start-1 row-end-1 col-start-1 col-end-1 rounded bg-slate-700/60"></div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
<!--    <div>-->
<!--        <button class="bg-black/10 my-1" disabled={!canCheat}>{canCheat ? "Cheat!" : "No cheating."}</button>-->
<!--    </div>-->
</div>
