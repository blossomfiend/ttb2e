<script>
    import {localize} from "../util.js";

    export let document;
    export let close;

    let roles = [
        {
            name: "defining",
            cards: [1, 5, 9, 13],
        },
        {
            name: "ascendant",
            cards: [4, 8, 12],
        },
        {
            name: "center",
            cards: [3, 7, 11],
        },
        {
            name: "descendant",
            cards: [2, 6, 10],
        },
    ]

    function submit() {

    }
</script>

<form on:submit|preventDefault class="standard-form">
    <div class="form-group">
        <label>Defining Suit</label>
        <div class="form-fields">
            <select bind:value={definingSuit}>
                {#each Object.keys(game.ttb2e.suits) as suit}
                    <option value={suit}>{localize(`ttb.suits.${suit}.name`)}</option>
                {/each}
            </select>
        </div>
        <p class="hint">
            This suit will be on the cards with values 1, 5, 9, and 13.
        </p>
    </div>
    <footer>
        <button on:click={submit}>
            Initialize
        </button>
    </footer>
</form>
