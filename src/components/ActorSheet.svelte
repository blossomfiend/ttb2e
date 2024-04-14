<script>
    import "../app.css"
    import {SYSTEM_ID} from "../globals.js";
    import SkillsTab from "./SkillsTab.svelte";
    import Tabs from "./Tabs.svelte";

    export let actor;
    const rest = $$restProps;

    $: system = actor.system;

    // let cardsPromise = Cards.create({name: "test"})
    //     .then(cards => console.log(cards));

    let cards = game.cards;

    function test() {
        system.cards.twistDeck.sheet.render(true);
    }

    let tabs = [
        { id: "attributes", name: "Attributes" },
        { id: "skills", name: "Skills" },
        { id: "talents", name: "Talents" },
        { id: "items", name: "Items" },
        { id: "magic", name: "Magic" },
        { id: "effects", name: "Effects" },
    ];
    let currentTab = tabs[0];

    function onTabChange(tab) {
        currentTab = tab;
    }

    let aspects = game[SYSTEM_ID].aspects;
    let localize = key => game.i18n.format(key);
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
                        <input type="text" name="system.wounds.value" value="{system.wounds.value}"
                               data-dtype="Number"/>
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
    <nav class="sheet-tabs tabs">
        <Tabs tabs={tabs} onTabChange={onTabChange} currentTab={currentTab}/>
    </nav>

    <main class="sheet-body">
        {#if currentTab.id === "attributes" }
            <div class="tab">
                <div class="tw-flex tw-flex-row tw-gap-4">
                    <div class="tw-flex tw-flex-col tw-gap-3">
                        {#each game[SYSTEM_ID].aspects as aspect}
                            <div class="tw-flex tw-flex-row tw-gap-1">
                                <label for={`system.aspects.${aspect}`} class="tw-flex-1">{localize(`ttb.aspects.${aspect}.name`)}</label>
                                <input type="text" data-dtype="Number" name={`system.aspects.${aspect}`}
                                       value={system.aspects[aspect]} class="tw-flex-1 tw-w-full">
                            </div>
                        {/each}
                        <hr/>
                        {#each game[SYSTEM_ID].derivedAspects as derivedAspect}
                            <div class="tw-flex tw-flex-row tw-gap-1">
                                <label for={`system.derivedAspects.${derivedAspect}.value.value`}
                                       class="tw-flex-1">{localize(`ttb.derivedAspects.${derivedAspect}.name`)}</label>
                                <input type="text" data-dtype="Number"
                                       name={`system.derivedAspects.${derivedAspect}.value.value`}
                                       value={system.derivedAspects[derivedAspect].value.value} class="tw-flex-1 tw-w-full"
                                       disabled>
                            </div>
                        {/each}
                    </div>
                    <div>
                        Fate steps here
                    </div>
                </div>
            </div>
        {:else if currentTab.id === "skills" }
            <div class="tab">
                <SkillsTab actor={actor}/>
            </div>
        {:else if currentTab.id === "talents" }
            <div class="tab">
                Talents
            </div>
        {:else if currentTab.id === "items" }
            <div class="tab">
                Items
            </div>
        {:else if currentTab.id === "magic" }
            <div class="tab">
                Magic
            </div>
        {:else if currentTab.id === "effects" }
            <div class="tab">
                Effects
            </div>
        {/if}
    </main>
</div>
