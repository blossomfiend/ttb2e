<script>
    /**
     * @type {Suits}
     */
    export let suits;

    // just show any suit icon as many times as it is in the total
    $: displayedSuits = Object.keys(game.ttb2e.suits).flatMap(suit => Array(suits[suit]).fill(suit));
</script>

{#each displayedSuits as suit}
    <i class={`ttb-icon-${suit}`}/>
{/each}
