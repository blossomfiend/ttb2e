<svelte:options accessors={true}/>
<script>
    import "../app.css"
    import {SYSTEM_ID} from "../globals.js";
    import SkillsTab from "./SkillsTab.svelte";
    import TabMenu from "./TabMenu.svelte";
    import Tabs from "./Tabs.svelte";
    import NumberInput from "./NumberInput.svelte";
    import AttributesTab from "./AttributesTab.svelte";

    export let actor;
    export let formRoot;
    const rest = $$restProps;

    $: system = actor.system;

    // let cardsPromise = Cards.create({name: "test"})
    //     .then(cards => console.log(cards));

    let cards = game.cards;

    function test() {
        system.cards.twistDeck.sheet.render(true);
    }

    let tabs = [
        {id: "attributes", name: "Attributes"},
        {id: "skills", name: "Skills"},
        {id: "talents", name: "Talents"},
        {id: "items", name: "Items"},
        {id: "magic", name: "Magic"},
        {id: "effects", name: "Effects"},
    ];
    let currentTab = tabs[0];

    function onTabChange(tab) {
        currentTab = tab;
    }

    let aspects = game[SYSTEM_ID].aspects;
    let localize = key => game.i18n.format(key);
    let transitionParams = {
        duration: 200,
        start: 0.98,
    };
</script>

<form bind:this={formRoot} class="flex flex-col ttb dark:text-stone-100">
    <header class="sheet-header flex flex-row gap-2 mb-3">
        <img class="" src="{actor.img}" data-edit="img" title="{actor.name}" height="100" width="100"
             alt="portrait of the character"/>
        <div class="flex flex-col gap-2">
            <!-- Header / Character name-->
            <h1 class="">
                <input name="name" class="character-name text-2xl" type="text" value="{actor.name}" placeholder="Name"/>
            </h1>
            <!-- Resources -->
            <div class="flex flex-row justify-between gap-2">
                <div class="flex flex-col text-center gap-1">
                    <label for="system.health.value" class="resource-label">Wounds</label>
                    <div class="resource-content flex flex-row justify-between items-center max-w-32">
                        <NumberInput name="system.wounds.value" value="{system.wounds.value}"/>
                        <span class="px-1"> / </span>
                        <NumberInput name="system.wounds.max" value="{system.wounds.max}" disabled/>
                    </div>
                </div>

                <div class="flex flex-col text-center gap-1">
                    <label for="system.power.value" class="resource-label">XP</label>
                    <div class="resource-content flex flex-row justify-between items-center">
                        <NumberInput name="system.xp" value="{system.xp}"/>
                    </div>
                </div>

                <div class="flex flex-col text-center gap-1">
                    <label for="system.attributes.level.value" class="resource-label">Level</label>
                    <div class="resource-content flex flex-row justify-between items-center">
                        <NumberInput name="system.attributes.level.value" value="1"/>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- svelte-ignore a11y-missing-attribute -->
    <nav class="sheet-tabs tabs sticky top-0 backdrop-blur-lg">
        <TabMenu tabs={tabs} onTabChange={onTabChange} currentTab={currentTab}/>
    </nav>

    <main class="sheet-body size-full">
        <Tabs tabs={tabs} currentTab={currentTab.id} let:id={tabId}>
            {#if tabId === "attributes" }
                <AttributesTab actor={actor}/>
            {:else if tabId === "skills" }
                <SkillsTab actor={actor}/>
            {:else if tabId === "talents" }
                Talents
            {:else if tabId === "items" }
                Items
            {:else if tabId === "magic" }
                Magic
            {:else if tabId === "effects" }
                Effects
            {/if}
        </Tabs>
    </main>
</form>

<style>
    input[name="name"] {
        @apply text-24 w-full h-full text-left border-transparent bg-transparent p-0.5 leading-none
        hover:shadow-foundry hover:shadow-shadow-primary hover:bg-black/5
        focus:bg-black/5 focus:border-border-light-tertiary
        disabled:shadow-none disabled:text-text-dark-primary disabled:bg-transparent
        dark:text-stone-100 dark:disabled:text-stone-100;
    }
</style>
