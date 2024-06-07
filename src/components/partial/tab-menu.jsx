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
          class="overflow-x-hidden text-clip overflow-y-visible p-2"
          classList={{
            "text-shadow-red":
              props.idFunction(props.currentTab) === props.idFunction(tab),
          }}
          onClick={() => props.onTabChange(tab)}
        >
          {props.nameFunction(tab)}
        </a>
      )}
    </For>
  );
}
