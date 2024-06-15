import {
  createMemo,
  createSignal,
  Index,
  lazy,
  Show,
  useContext,
} from "solid-js";
import CharacteristicsConfig from "../applications/characteristics-config.mjs";
import SkillConfigApplication from "../applications/skill-config.mjs";
import { localize } from "../util.mts";
import { AppContainerContext } from "./app-container.jsx";
import NumberInput from "./partial/number-input.jsx";
import SheetScaffold from "./partial/sheet-scaffold.jsx";
import TextButton from "./partial/text-button.tsx";
import TextSuits from "./partial/text-suits.jsx";
import OverviewTab from "./tabs/overview-tab.jsx";
import Flip from "../flip.mjs";

export default function CharacterSheet(props) {
  const canEdit = createMemo(() => props.actor.isOwner);
  const system = createMemo(() => props.actor.system);
  const aspects = createMemo(() =>
    game.ttb2e.aspects.map((aspect) => ({
      name: aspect,
      value: system().aspects[aspect],
    })),
  );
  const derivedAspects = createMemo(() =>
    game.ttb2e.derivedAspects.map((derivedAspect) => ({
      name: derivedAspect,
      ...system().derivedAspects[derivedAspect],
    })),
  );
  let tabs = [
    {
      id: "overview",
      component: OverviewTab,
      icon: "fa-solid fa-user",
    },
    {
      id: "skills",
      component: lazy(() => import("./tabs/skills-tab.jsx")),
      icon: "fa-solid fa-head-side-gear",
    },
    {
      id: "abilities",
      component: lazy(() => import("./tabs/abilites-tab.jsx")),
      icon: "fa-solid fa-scroll",
    },
    {
      id: "actions",
      component: lazy(() => import("./tabs/actions-tab.jsx")),
      icon: "fa-solid fa-scroll",
    },
    // { id: "talents", component: null, icon: "fa-solid fa-scroll" },
    // { id: "items", component: null, icon: "fa-solid fa-treasure-chest" },
    // { id: "magic", component: null, icon: "fa-solid fa-hand-holding-magic" },
    // { id: "effects", component: null, icon: "fa-solid fa-sparkles" },
  ].map((tab) => ({
    ...tab,
    name: localize(`ttb.ui.tabs.${tab.id}.name`),
  }));
  const [currentTab, setCurrentTab] = createSignal(tabs[0]);
  const appContext = useContext(AppContainerContext);

  return (
    <SheetScaffold
      document={props.actor}
      actor={props.actor}
      themeColor={system().colors.finalColor.css}
      belowImage={<HealthBar />}
      header={
        <>
          <SubNameBar />
          <AspectGrid />
        </>
      }
      tabs={tabs}
      onDrop={async (e) => {
        const data = TextEditor.getDragEventData(e);
        if (data.type === "Item") {
          const item = await Item.implementation.fromDropData(data);
          const itemData = item.toObject();
          return props.actor.createEmbeddedDocuments("Item", [itemData]);
        }
      }}
    />
  );

  function HealthBar() {
    return (
      <div class="w-28 h-6 flex flex-row items-stretch rounded-lg bg-black/10 dark:bg-white/10 shadow">
        <NumberInput
          class="flex-1 self-stretch rounded-l-lg rounded-r-none text-end"
          name="system.wounds.value"
          disabled={!canEdit()}
          value={system().wounds.value}
        />
        <span class="self-center px-1">/</span>
        <span class="flex-1 text-start flex flex-row justify-between items-stretch">
          <NumberInput class="text-left" disabled value={system().wounds.max} />
          <Show when={canEdit()}>
            <TextButton class="align-middle p-1">
              <i class="m-0 fa-solid fa-cog" />
            </TextButton>
          </Show>
        </span>
      </div>
    );
  }

  function SubNameBar() {
    return (
      <div class="flex flex-row gap-3">
        {props.actor.type === "fated" ? (
          <TextButton
            onClick={() => {
              /* TODO card config */
            }}
            disabled={!canEdit()}
          >
            Fated
          </TextButton>
        ) : (
          <label class="flex flex-row gap-1 items-baseline">
            <span>{localize(`ttb.ranks.${system().rank.name}.name`)}</span>
            <NumberInput
              class="flex-none w-6 p-0 leading-none select-all"
              name="system.rankValue"
              disabled={!canEdit()}
              value={system().rankValue}
            />
          </label>
        )}
        <div class="flex flex-row gap-1">
          {system().characteristics.join(", ")}
          <Show when={canEdit()}>
            <TextButton onClick={openCharacteristicsConfig}>
              <i class="fa-solid fa-cog" />
            </TextButton>
          </Show>
        </div>
      </div>
    );
  }

  function AspectGrid() {
    return (
      <div class="size-full pt-px grid grid-cols-8 gap-y-px *:py-1 *:px-px">
        <Index each={aspects()}>
          {(aspect) => {
            const name = createMemo(() => aspect().name);
            return (
              <label class="p-px flex flex-col items-center justify-center">
                <div class="label-text">
                  {localize(`ttb.aspects.${name()}.name`)}
                </div>
                <div>
                  <NumberInput
                    class="p-0 w-full h-5"
                    disabled={!canEdit()}
                    name={`system.aspects.${name()}`}
                    value={aspect().value}
                  />
                </div>
              </label>
            );
          }}
        </Index>
        <Index each={derivedAspects()}>
          {(derivedAspect) => {
            const name = createMemo(() => derivedAspect().name);
            return (
              <div class="w-full flex flex-col items-center justify-center">
                <TextButton
                  class="label-text"
                  disabled={!canEdit()}
                  onClick={() => openDerivedAspectConfig(name())}
                >
                  {localize(`ttb.derivedAspects.${name()}.name`)}
                </TextButton>
                <button
                  class="sheet-button border-none w-full h-5 p-0 text-center"
                  disabled={!canEdit() || ["walk", "charge"].includes(name())}
                  onClick={() => openDerivedAspectDuel(derivedAspect())}
                >
                  {name() === "charge" && derivedAspect().value.value === 0
                    ? "--"
                    : derivedAspect().value.value}
                  <Show when={["defense", "willpower"].includes(name())}>
                    <TextSuits suits={derivedAspect().value.suits} />
                  </Show>
                </button>
              </div>
            );
          }}
        </Index>
        <label class="p-px flex flex-col items-center justify-center">
          <div class="label-text">
            {localize(`ttb.derivedAspects.height.name`)}
          </div>
          <div>
            <NumberInput
              class="p-0 w-full h-5"
              disabled={!canEdit()}
              name={`system.height`}
              value={system().height}
            />
          </div>
        </label>
        <div class="col-span-2" />
      </div>
    );
  }

  function openCharacteristicsConfig() {
    if (!canEdit()) return;
    return new CharacteristicsConfig({ document: props.actor }).render({
      force: true,
    });
  }

  function openDerivedAspectConfig(derivedAspect) {
    if (!canEdit()) return;
    new SkillConfigApplication({
      actor: props.actor,
      skill: `derivedAspects.${derivedAspect}`,
    }).render({ force: true });
  }

  async function openDerivedAspectDuel(derivedAspect) {
    if (!canEdit()) return;
    await new Flip({
      actor: props.actor,
      skill: `derivedAspects.${derivedAspect.name}`,
      actingValue: derivedAspect.value,
    }).openConfigurationUi();
  }
}
