import { createDeferred, createMemo, For, Show } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import SuitedValue from "../partial/SuitedValue.jsx";
import TextButton from "../partial/text-button.tsx";
import { trackDocument } from "../rendering-utils.mjs";
import { softFade } from "../transitions.mjs";

export default function ActionsTab(props) {
  const canEdit = createMemo(() => props.actor.isOwner);
  const actions = createMemo(() =>
    props.actor.items.filter((item) => item.type === "action"),
  );
  const { onEnter, onExit } = softFade({ duration: 150 });

  return (
    <div class="py-4 px-2 flex flex-col gap-1">
      <div class="flex flex-row gap-1 rounded border bg-theme-lighter dark:bg-theme-darker">
        <div class="basis-6 flex-none" />
        <div class="basis-6 flex-none">AP</div>
        <div class="grow overflow-hidden overflow-ellipsis">Name</div>
        <div class="basis-1/6 flex-none">AV</div>
        <div class="basis-1/6 flex-none">TN</div>
        <div class="basis-10 flex-none">Resist</div>
        <div class="basis-10 flex-none">Range</div>
        {/*Edit/Delete*/}
        <div class="basis-10 flex-none" />
      </div>
      <TransitionGroup onEnter={onEnter} onExit={onExit} appear={false}>
        <For each={actions()}>
          {(untrackedAction) => {
            const action = createDeferred(
              trackDocument(() => untrackedAction),
              { equals: false },
            );
            return (
              <Show when={action() != null}>
                <Action action={action()} actor={props.actor} />
              </Show>
            );
          }}
        </For>
      </TransitionGroup>
      <button
        class="sheet-button"
        disabled={!canEdit()}
        onClick={() => {
          props.actor.createEmbeddedDocuments("Item", [
            {
              name: "New Action",
              type: "action",
            },
          ]);
        }}
      >
        Add Action
      </button>
    </div>
  );

  function Action(props) {
    const system = createMemo(() => props.action.system, { equals: false });
    const av = createMemo(() =>
      system().skill != null
        ? props.actor.getActingValue(system().skill, system().aspect)
        : null,
    );
    return (
      <div class="flex flex-row gap-1 rounded border bg-black/5 dark:bg-white/5">
        <div class="basis-6 flex-none">
          <img
            class="size-6 rounded-l block border-0"
            src={props.action.img}
            alt={props.action.name}
          />
        </div>
        <div class="basis-6 flex-none flex flex-row items-center">
          {system().ap}
        </div>
        <div class="grow overflow-hidden overflow-ellipsis whitespace-nowrap flex flex-row items-center">
          {props.action.name}
        </div>
        <div class="basis-1/6 flex-none flex flex-row items-center">
          <span>
            <SuitedValue value={av()} />
          </span>
        </div>
        <div class="basis-1/6 flex-none flex flex-row items-center">
          <span>
            <SuitedValue value={system().targetNumber} />
          </span>
        </div>
        <div class="basis-10 flex-none overflow-hidden flex flex-row items-center">
          {() => {
            if (system().resist === "defense") return "Df";
            else if (system().resist === "willpower") return "Wp";
            else if (system().resist === "either") return "Df/Wp";
            else return "";
          }}
        </div>
        <div class="basis-10 flex-none flex flex-row items-center">
          <span>
            <Show when={system().rangeType}>
              <i class={`ttb-icon-${system().rangeType}`} />
            </Show>
            {system().range}
          </span>
        </div>
        <div class="basis-10 flex-none flex flex-row items-center">
          <TextButton
            disabled={!canEdit()}
            onClick={() => {
              props.action.sheet.render(true);
            }}
          >
            <i class="fa-solid fa-edit" />
          </TextButton>
          <TextButton
            disabled={!canEdit()}
            onClick={async () => {
              await Dialog.confirm({
                title: "Are you sure?",
                content: `Do you want to delete the action ${props.action.name}?`,
                defaultYes: false,
                yes: () =>
                  props.actor.deleteEmbeddedDocuments("Item", [
                    props.action.id,
                  ]),
              });
            }}
          >
            <i class="fa-solid fa-trash" />
          </TextButton>
        </div>
      </div>
    );
  }
}
