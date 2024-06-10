import { For, mergeProps } from "solid-js";

export default function TabMenu(inputProps) {
  const props = mergeProps(
    {
      tabs: [],
      idFunction: (tab) => tab.id,
      nameFunction: (tab) => tab.name,
      onTabChange: () => {},
      currentTab: null,
    },
    inputProps,
  );
  return (
    <For each={props.tabs}>
      {(tab) => (
        <a
          class="flex-1 text-center overflow-x-hidden text-clip overflow-y-visible p-1 transition-all
            rounded-t-lg border-b-0 border-x border-t border-solid border-transparent
            [&.selected]:bg-theme-light dark:[&.selected]:bg-theme-dark
            hover:border-theme-dark dark:hover:border-theme-light
            text-shadow-none dark:drop-shadow"
          classList={{
            selected:
              props.idFunction(props.currentTab) === props.idFnction(tab),
          }}
          onClick={() => props.onTabChange(tab)}
        >
          <i class={tab.icon}></i> {props.nameFunction(tab)}
        </a>
      )}
    </For>
  );
}
