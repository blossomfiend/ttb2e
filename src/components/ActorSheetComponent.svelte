<script>
    import "../app.css"

    let { actor } = $props();
    let system = $derived(actor.system);

    // let cardsPromise = Cards.create({name: "test"})
    //     .then(cards => console.log(cards));

    let cards = game.cards;

    function test() {
        system.cards.twistDeck.sheet.render(true);
    }
</script>

<div class="tw-flex tw-flex-col">
    <header class="sheet-header tw-flex tw-flex-row tw-gap-2 tw-mb-3">
        <img class="" src="{actor.img}" data-edit="img" title="{actor.name}" height="100" width="100"
             alt="portrait of the character"/>
        <div class="tw-flex tw-flex-col tw-gap-2">
            <!-- Header / Character name-->
            <h1 class="">
                <input name="name" class="tw-text-2xl" type="text" value="{actor.name}" placeholder="Name"/>
            </h1>
            <!-- Resources -->
            <div class="flexrow tw-flex tw-flex-row tw-justify-between tw-gap-2">
                <div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1">
                    <label for="system.health.value" class="resource-label">Wounds</label>
                    <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center">
                        <input type="text" name="system.wounds.value" value="{system.wounds.value}" data-dtype="Number"/>
                        <span class="tw-mx-2"> / </span>
                        <input type="text" name="system.wounds.max" value="{system.wounds.max}" data-dtype="Number"/>
                    </div>
                </div>

                <div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1">
                    <label for="system.power.value" class="resource-label">XP</label>
                    <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center">
                        <input type="text" name="system.xp" value="{system.xp}" data-dtype="Number"/>
                    </div>
                </div>

                <div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1">
                    <label for="system.attributes.level.value" class="resource-label">Level</label>
                    <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center">
                        <input type="text" name="system.attributes.level.value" value="1" data-dtype="Number"/>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- svelte-ignore a11y-missing-attribute -->
    <nav class="sheet-tabs tabs" data-group="primary">
        <a class="item" data-tab="features">Features</a>
        <a class="item" data-tab="description">Description</a>
        <a class="item" data-tab="items">Items</a>
        <a class="item" data-tab="spells">Spells</a>
        <a class="item" data-tab="effects">Effects</a>
    </nav>

    <main class="sheet-body">
        <div class="tab" data-group="primary" data-tab="features">
            Features
            <button type="button" on:click={test}>
                Test
            </button>
        </div>
        <div class="tab" data-group="primary" data-tab="description">
            Description
        </div>
        <div class="tab" data-group="primary" data-tab="items">
            Items
        </div>
        <div class="tab" data-group="primary" data-tab="spells">
            Spells
        </div>
        <div class="tab" data-group="primary" data-tab="effects">
            Effects
        </div>
    </main>
</div>
