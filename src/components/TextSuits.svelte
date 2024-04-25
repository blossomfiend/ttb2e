<script>
    import Suit from "./Icons/Suit.svelte";

    /**
     * @type {Suits}
     */
    export let suits;

    // just show any suit icon as many times as it is in the total
    $: displayedSuits = Object.keys(game.ttb2e.suits).flatMap(suit => Array(suits[suit]).fill(suit));
</script>

{#each displayedSuits as suit}
    <Suit suit={suit} classes="h-texticon inline align-bottom"/>
{/each}
