import {
  createMemo,
  createSignal,
  Index,
  lazy,
  Show,
  Suspense,
  useContext,
} from "solid-js";
import CharacteristicsConfig from "../applications/characteristics-config.mjs";
import DuelApplication from "../applications/duel.mjs";
import SkillConfigApplication from "../applications/skill-config.mjs";
import { localize } from "../util.mjs";
import { AppContainerContext } from "./app-container.jsx";
import { themeColorCss } from "./color.mts";
import BarLoader from "./partial/bar-loader.jsx";
import NumberInput from "./partial/number-input.jsx";
import TabMenu from "./partial/tab-menu.jsx";
import Tabs from "./partial/tabs.jsx";
import TextButton from "./partial/text-button.jsx";
import TextSuits from "./partial/text-suits.jsx";
import OverviewTab from "./tabs/overview-tab.jsx";

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
      icon: "fa-solid fa-plus-minus",
    },
    { id: "talents", component: null, icon: "fa-solid fa-scroll" },
    { id: "items", component: null, icon: "fa-solid fa-treasure-chest" },
    { id: "magic", component: null, icon: "fa-solid fa-hand-holding-magic" },
    { id: "effects", component: null, icon: "fa-solid fa-sparkles" },
  ].map((tab) => ({
    ...tab,
    name: localize(`ttb.ui.tabs.${tab.id}.name`),
  }));
  const [currentTab, setCurrentTab] = createSignal(tabs[0]);
  const appContext = useContext(AppContainerContext);

  return (
    <div
      class="size-full flex flex-col ttb overflow-y-scroll overflow-x-hidden text-sm
        bg-stone-200 text-stone-800 dark:bg-zinc-900 dark:text-zinc-50
        scrollbar-theme-lighter dark:scrollbar-theme-darker transition-all"
      style={themeColorCss(system().colors.finalColor)}
    >
      <header class="z-20 flex flex-row gap-2 p-2 pt-4">
        <div class="flex-none flex flex-col items-center gap-2">
          <img
            alt="portrait of the character"
            class="flex-none rounded-full border-0 object-cover size-28"
            data-edit="img"
            height="128"
            width="128"
            src={props.actor.img}
            title={props.actor.name}
            onClick={openImagePicker}
          />
          <div class="w-28 h-6 flex flex-row items-stretch rounded-lg bg-black/10 dark:bg-white/10 shadow">
            <NumberInput
              class="flex-1 self-stretch rounded-l-lg rounded-r-none text-end"
              name="system.wounds.value"
              disabled={!canEdit()}
              value={system().wounds.value}
            />
            <span class="self-center px-1">/</span>
            <span class="flex-1 text-start flex flex-row justify-between items-stretch">
              <NumberInput
                class="text-left"
                disabled
                value={system().wounds.max}
              />
              <Show when={canEdit()}>
                <TextButton class="align-middle p-1">
                  <i class="m-0 fa-solid fa-cog" />
                </TextButton>
              </Show>
            </span>
          </div>
        </div>
        <div class="grow flex flex-col items-stretch p-1">
          <input
            autocomplete="off"
            class="subtle-input font-modesto text-start text-2xl h-auto leading-none p-0
              text-theme-darker dark:text-theme-lighter"
            name="name"
            placeholder="Name"
            type="text"
            disabled={!canEdit()}
            value={props.actor.name}
          />

          <div
            class="flex flex-row *:border-y-0 divide-x
              divide-theme-lighter dark:divide-theme-darker divide-solid
              *:px-2 first:*:pl-0 last:*:pr-0 *:py-0.5"
          >
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
                  class="flex-none w-6 leading-none select-all"
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

          <div
            class="size-full pt-px grid grid-cols-8 gap-y-px bg-theme-lighter dark:bg-theme-darker
              *:bg-stone-200 dark:*:bg-zinc-900 *:py-1 *:px-px"
          >
            <Index each={aspects()}>
              {(aspect) => {
                const name = createMemo(() => aspect().name);
                return (
                  <label class="p-px flex flex-col items-center justify-center">
                    <div class="text-xs italic text-stone-700 dark:text-zinc-300">
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
                      class="text-xs italic text-stone-700 dark:text-zinc-300"
                      disabled={!canEdit()}
                      onClick={() => openDerivedAspectConfig(name())}
                    >
                      {localize(`ttb.derivedAspects.${name()}.name`)}
                    </TextButton>
                    <button
                      class="sheet-button border-none w-full h-5 p-0 text-center"
                      disabled={!canEdit()}
                      onClick={() => openDerivedAspectDuel(name())}
                    >
                      {derivedAspect().value.value}
                      <TextSuits suits={derivedAspect().value.suits} />
                    </button>
                  </div>
                );
              }}
            </Index>
            <div class="col-span-2" />
          </div>
        </div>
      </header>

      <nav
        class="z-10 sticky top-0 bg-stone-200 dark:bg-zinc-900 shadow-md
          flex flex-row justify-evenly items-stretch
          border-0 border-b border-solid border-theme-light dark:border-theme-dark"
      >
        <TabMenu
          currentTab={currentTab()}
          onTabChange={(tab) => appContext.start(() => setCurrentTab(tab))}
          tabs={tabs}
        />
      </nav>

      <main
        class="sheet-body size-full"
        classList={{ "pending-fade-out": appContext.isPending() }}
      >
        <Suspense fallback={<BarLoader />}>
          <Tabs currentTab={currentTab()} tabs={tabs} {...props}></Tabs>
        </Suspense>
      </main>
    </div>
  );

  function openImagePicker() {
    const current = props.actor.img;
    const { img } =
      props.actor.constructor.getDefaultArtwork?.(props.actor.toObject()) ?? {};
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => props.actor.update({ img: path }),
    });
    return fp.browse();
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

  function openDerivedAspectDuel(derivedAspect) {
    if (!canEdit()) return;
    new DuelApplication({
      actor: props.actor,
      skill: `derivedAspects.${name()}`,
    }).render({ force: true });
  }
}
