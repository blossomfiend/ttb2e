<svelte:options accessors={true}/>
<script>
    import "../app.css"
    import SkillsTab from "./SkillsTab.svelte";
    import TabMenu from "./TabMenu.svelte";
    import Tabs from "./Tabs.svelte";
    import NumberInput from "./NumberInput.svelte";
    import AttributesTab from "./AttributesTab.svelte";

    export let actor;
    const rest = $$restProps;

    $: system = actor.system;

    // let cardsPromise = Cards.create({name: "test"})
    //     .then(cards => console.log(cards));

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

    let aspects = game.ttb2e.aspects;
</script>

<div class="flex flex-col ttb scrollable">
    <header class="sheet-header flex flex-row gap-2 mb-3">
        <img class="" src="{actor.img}" data-edit="img" title="{actor.name}" height="100" width="100"
             alt="portrait of the character"/>
        <div class="flex flex-col gap-2">
            <!-- Header / Character name-->
            <h1 class="">
                <input name="name" class="character-name text-2xl" type="text" value="{actor.name}" placeholder="Name" autocomplete="off"/>
            </h1>
            <!-- Resources -->
            <div class="flex flex-row justify-between gap-2">
                <div class="flex flex-col text-center gap-1">
                    <span class="resource-label">Wounds</span>
                    <div class="resource-content flex flex-row justify-between items-center max-w-32">
                        <NumberInput name="system.wounds.value" value="{system.wounds.value}"/>
                        <span class="px-1"> / </span>
                        <NumberInput name="system.wounds.max" value="{system.wounds.max}" disabled/>
                    </div>
                </div>

                <label class="flex flex-col text-center gap-1">
                    <span class="resource-label">XP</span>
                    <span class="resource-content flex flex-row justify-between items-center">
                        <NumberInput name="system.xp" value="{system.xp}"/>
                    </span>
                </label>

                <label class="flex flex-col text-center gap-1">
                    <span class="resource-label">Level?</span>
                    <span class="resource-content flex flex-row justify-between items-center">
                        <NumberInput name="system.attributes.level.value" value="1"/>
                    </span>
                </label>
            </div>
        </div>
    </header>

    <!-- svelte-ignore a11y-missing-attribute -->
    <nav class="sheet-tabs tabs sticky top-0 backdrop-blur-lg">
        <TabMenu tabs={tabs} onTabChange={t => currentTab = t} currentTab={currentTab}/>
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
</div>

<style>
    input[name="name"] {
        @apply text-24 w-full h-full text-left border-transparent bg-transparent p-0.5 leading-none
        hover:shadow-foundry hover:shadow-shadow-primary hover:bg-black/5
        focus:bg-black/5 focus:border-border-light-tertiary
        disabled:shadow-none disabled:text-text-dark-primary disabled:bg-transparent
        dark:text-stone-100 dark:disabled:text-stone-100;
    }
</style>
