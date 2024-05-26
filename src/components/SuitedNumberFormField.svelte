<script>
    export let value = null;

    let numberValue = "";
    let suits = {
        rams: 0,
        crows: 0,
        tomes: 0,
        masks: 0,
    };

    $: inputKeydown = (event) => {
        let suit;
        switch (event.key) {
            case "r":
            case "R":
                suit = "rams"; break;
            case "c":
            case "C":
                suit = "crows"; break;
            case "t":
            case "T":
                suit = "tomes"; break;
            case "m":
            case "M":
                suit = "masks"; break;
            default: return;
        }
        suits = {...suits, [suit]: Math.max(0, suits[suit] + (event.shiftKey ? -1 : 1))};
    };

    $: value = numberValue === "" ? null : {value: +numberValue, suits}
</script>

<div class="flex flex-col gap-2">
    <input type="number" name="targetNumber.value" on:keydown={inputKeydown} bind:value={numberValue}/>
    <div class="flex flex-row gap-2 justify-between">
        {#each Object.entries(suits) as [suit, count]}
            <div class="grow flex flex-col items-center gap-1">
                <button class="w-full"
                        on:click={() => {suits = {...suits, [suit]: suits[suit] + 1}}}>
                    +
                </button>
                <div>{count} <i class={`ttb-icon-${suit}`}/></div>
                <button
                    on:click={() => {suits = {...suits, [suit]: Math.max(0, suits[suit] - 1)}}}
                    disabled={suits[suit] <= 0}>-
                </button>
            </div>
        {/each}
    </div>
</div>
