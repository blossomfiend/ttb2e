import {
  createMemo,
  createSignal,
  Index,
  lazy,
  Suspense,
  useContext,
} from "solid-js";
import DuelApplication from "../applications/duel.mjs";
import SkillConfigApplication from "../applications/skill-config.mjs";
import { localize } from "../util.mjs";
import { AppContainerContext } from "./app-container.jsx";
import BarLoader from "./partial/bar-loader.jsx";
import NumberInput from "./partial/number-input.jsx";
import TabMenu from "./partial/tab-menu.jsx";
import Tabs from "./partial/tabs.jsx";
import TextButton from "./partial/text-button.jsx";
import TextSuits from "./partial/text-suits.jsx";
import OverviewTab from "./tabs/overview-tab.jsx";

export default function CharacterSheet(props) {
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
  const canEdit = createMemo(() => game.user?.isGM || props.actor);

  return (
    <div
      class="size-full flex flex-col ttb overflow-y-scroll overflow-x-hidden text-sm
        bg-stone-200 text-stone-800 dark:bg-zinc-900 dark:text-zinc-50
        scrollbar-theme-lighter dark:scrollbar-theme-darker transition-all"
      style={{ "--char-theme-color": system().colors.finalColor }}
    >
      <header class="z-20 flex flex-row gap-2 p-2 pt-4">
        <div class="flex flex-col items-center gap-2">
          <img
            alt="portrait of the character"
            class="rounded-full border-0"
            data-edit="img"
            height="100"
            width="100"
            src={props.actor.img}
            title={props.actor.name}
          />
          <div class="w-28 flex flex-row items-stretch rounded-lg bg-black/10 dark:bg-white/10 shadow">
            <NumberInput
              class="self-stretch rounded-l-lg rounded-r-none flex-1 text-end"
              name="system.wounds.value"
              value={system().wounds.value}
            />
            <span class="self-center px-1">/</span>
            <span class="flex-1 text-start flex flex-row justify-between items-center">
              <span class="px-0.5">{system().wounds.max}</span>
              <TextButton class="self-stretch align-middle p-1">
                <i class="fa-solid fa-cog" />
              </TextButton>
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
            value={props.actor.name}
          />

          <div
            class="flex flex-row *:border-y-0 divide-x divide-theme-lighter dark:divide-theme-darker divide-solid
              *:px-2 first:*:pl-0 last:*:pr-0 *:py-0.5"
          >
            {props.actor.type === "fated" ? (
              <TextButton
                onClick={() => {
                  /* TODO card config */
                }}
              >
                Fated
              </TextButton>
            ) : (
              <TextButton
                onClick={() => {
                  /* TODO rank config */
                }}
              >
                {`${localize(`ttb.ranks.${system().rank.name}.name`)} (${system().rankValue})`}
              </TextButton>
            )}
            <div class="flex flex-row gap-1">
              {system().characteristics.join(", ")}
              <TextButton>
                <i class="fa-solid fa-cog" />
              </TextButton>
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
                      onClick={() =>
                        new SkillConfigApplication({
                          actor: props.actor,
                          skill: `derivedAspects.${name()}`,
                        }).render({ force: true })
                      }
                    >
                      {localize(`ttb.derivedAspects.${name()}.name`)}
                    </TextButton>
                    <button
                      class="sheet-button border-none w-full h-5 p-0 text-center"
                      onClick={() =>
                        new DuelApplication({
                          actor: props.actor,
                          skill: `derivedAspects.${name()}`,
                        }).render({ force: true })
                      }
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
          border-0 border-b border-solid border-theme-dark dark:border-theme-light"
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
}
