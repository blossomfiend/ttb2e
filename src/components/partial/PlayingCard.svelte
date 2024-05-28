<script>
    import TextSuits from "./TextSuits.svelte";

    export let card;
    export let canBeChosen = true;
    export let actingValue = null;
    export let targetNumber = null;

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

    $: duelTotal = getDuelTotal(card);
    $: higherThanTN = doesCardMatchTN(card, duelTotal);
    $: valueDifference = duelTotal.value - targetNumber?.value ?? 0;
    $: severity = Math.floor((card.value - 1) / 5) + 1;
</script>

<div class="w-16 h-24 leading-none rounded grid grid-cols-1 grid-rows-1 text-slate-900"
     class:shadow-md={canBeChosen}
     class:shadow-sm={!canBeChosen}>
    <div class="row-start-1 row-end-1 col-start-1 col-end-1 flex flex-col justify-between rounded"
         class:bg-slate-100={targetNumber == null}
         class:bg-lime-100={targetNumber != null && higherThanTN}
         class:bg-red-100={targetNumber != null && !higherThanTN}>
        <div class="grow flex flex-row justify-between rounded shadow-sm bg-white"
             class:text-red-700={card.suit === "redJoker"}>
            <div class="self-start flex flex-col items-center p-1">
                <div>{card.value}</div>
                <div>
                    {#if card.suit === "redJoker" || card.suit === "blackJoker"}
                        <span>J</span>
                    {:else}
                        <i class={`ttb-icon-${card.suit}`}/>
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
                    {#if card.suit === "redJoker"}<span>J</span>{/if}
                </div>
            </div>
        {/if}
    </div>
    {#if !canBeChosen}
        <div class="row-start-1 row-end-1 col-start-1 col-end-1 rounded bg-slate-700/60"></div>
    {/if}
</div>
