<script>
    import {localize, localizeCardName} from "../util.js";

    export let document;
    export let close = () => {};

    let suitRoles = {};

    async function submit() {
        console.log(suitRoles);
        const toCreate = game.ttb2e.suitRoles.flatMap(({name: suitRole, values}) => {
            const suit = suitRoles[suitRole];
            return values.map(value => ({
                name: `${localizeCardName({value, suit})} (${document.name})`,
                value,
                suit,
                faces: [{}],
                face: 0,
            }));
        });
        console.log(toCreate);
        const twistDeck = document.system.cards.twistDeck;
        const toDelete = twistDeck.cards.map(card => card.id);
        await Promise.all([
            twistDeck.deleteEmbeddedDocuments("Card", toDelete),
            twistDeck.createEmbeddedDocuments("Card", toCreate),
        ]);
        await twistDeck.shuffle({chatNotification: false});
        close();
    }
</script>

<form on:submit|preventDefault class="standard-form">
    {#each game.ttb2e.suitRoles as suitRole}
        <div class="form-group">
            <label>{localize(`ttb.suitRoles.${suitRole.name}.name`)}</label>
            <div class="form-fields">
                <select bind:value={suitRoles[suitRole.name]}>
                    {#each Object.keys(game.ttb2e.suits) as suit}
                        <option value={suit}>{localize(`ttb.suits.${suit}.name`)}</option>
                    {/each}
                </select>
            </div>
            <p class="hint">
                {localize(`ttb.suitRoles.${suitRole.name}.hint`)}
            </p>
        </div>
    {/each}
    <footer>
        <button on:click={submit}>
            Replace Twist Deck
        </button>
    </footer>
</form>
