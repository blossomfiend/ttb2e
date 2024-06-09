import {
  createEffect,
  createMemo,
  createSignal,
  lazy,
  Suspense,
  useContext,
} from "solid-js";
import { localize } from "../util.mjs";
import { AppContainerContext } from "./app-container.jsx";
import styles from "./character-sheet.module.css";
import BarLoader from "./partial/bar-loader.jsx";
import NumberInput from "./partial/number-input.jsx";
import TabMenu from "./partial/tab-menu.jsx";
import Tabs from "./partial/tabs.jsx";
import OverviewTab from "./tabs/overview-tab.jsx";

export default function CharacterSheet(props) {
  const system = createMemo(() => props.actor.system);
  createEffect(() => {
    logger.info("character sheet system data", system());
  });
  createEffect(() => {
    logger.info("speed", props.actor.system.aspects.speed);
  });
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
    <div class="flex flex-col ttb overflow-y-auto overflow-x-hidden">
      <header class="sheet-header flex flex-row gap-2 mb-3">
        <img
          alt="portrait of the character"
          class=""
          data-edit="img"
          height="100"
          src={props.actor.img}
          title={props.actor.name}
          width="100"
        />
        <div class="flex flex-col gap-2">
          <h1 class="">
            <input
              autocomplete="off"
              class={`${styles.name}`}
              name="name"
              placeholder="Name"
              type="text"
              value={props.actor.name}
            />
          </h1>
          <div class="flex flex-row justify-between gap-2">
            <div class="flex flex-col text-center gap-1">
              <span class="resource-label">Wounds</span>
              <div class="resource-content flex flex-row justify-between items-center max-w-32">
                <NumberInput
                  name="system.wounds.value"
                  value={system().wounds.value}
                />
                <span class="px-1">/</span>
                <NumberInput
                  disabled
                  name="system.wounds.max"
                  value={system().wounds.max}
                />
              </div>
            </div>

            <label class="flex flex-col text-center gap-1">
              <span class="resource-label">XP</span>
              <span class="resource-content flex flex-row justify-between items-center">
                <NumberInput name="system.xp" value={system().xp} />
              </span>
            </label>
          </div>
        </div>
      </header>

      <nav class="sticky top-0 backdrop-blur-lg dark:bg-[var(--background)]">
        <TabMenu
          currentTab={currentTab()}
          onTabChange={(tab) => appContext.start(() => setCurrentTab(tab))}
          tabs={tabs}
        />
      </nav>

      <main
        class="sheet-body size-full"
        classList={{ [styles.pendingFadeOut]: appContext.isPending() }}
      >
        <Suspense fallback={<BarLoader />}>
          <Tabs currentTab={currentTab()} tabs={tabs} {...props}></Tabs>
        </Suspense>
      </main>
    </div>
  );
}
