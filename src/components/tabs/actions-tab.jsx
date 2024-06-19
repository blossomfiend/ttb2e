import {
  createDeferred,
  createMemo,
  createSignal,
  For,
  Show,
  Suspense,
} from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { localizeSkillCheck } from "../../util.mts";
import SuitedValue from "../partial/SuitedValue.jsx";
import TextButton from "../partial/text-button.tsx";
import { enrichHtml, trackDocument } from "../rendering-utils.mjs";
import { grow, softFade } from "../transitions.mjs";

export default function ActionsTab(props) {
  const canEdit = createMemo(() => props.actor.isOwner);
  const actions = createMemo(() =>
    props.actor.items.filter((item) => item.type === "action"),
  );
  const { onEnter, onExit } = softFade({ duration: 150 });

  return (
    <div class="py-4 px-2 flex flex-col gap-1">
      <input
        type="text"
        class="subtle-input border-black/10 dark:border-white/10"
        placeholder="Search…"
      />
      <div class="flex flex-row gap-1 rounded border bg-theme-lighter dark:bg-theme-darker">
        <div class="basis-6 flex-none" />
        <div class="basis-6 flex-none">AP</div>
        <div class="grow overflow-hidden overflow-ellipsis">Action</div>
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
    const [collapsed, setCollapsed] = createSignal(true);
    const { onEnter, onExit } = grow({ duration: 100 });
    const [descriptionHtml] = enrichHtml(() => system().description);

    return (
      <div class="flex flex-col bg-black/5 dark:bg-white/5">
        <div
          class="py-0.5 flex flex-row gap-1 rounded border bg-black/5 dark:bg-white/5 hover:cursor-pointer"
          onClick={() => {
            setCollapsed(!collapsed());
          }}
        >
          <div class="basis-6 flex-none">
            <img
              class="size-6 rounded-l block border-0"
              src={props.action.img}
              alt={`icon for the action ${props.action.name}`}
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
              onClick={(e) => {
                e.stopPropagation();
                props.action.sheet.render(true);
              }}
            >
              <i class="fa-solid fa-edit" />
            </TextButton>
            <TextButton
              disabled={!canEdit()}
              onClick={async (e) => {
                e.stopPropagation();
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
        <Transition onEnter={onEnter} onExit={onExit}>
          <Show when={!collapsed()}>
            <div class="flex flex-col overflow-hidden">
              <div class="p-1 flex flex-row border-0 border-b border-solid border-black/10 dark:border-white/10">
                {() => {
                  const skillCheck = localizeSkillCheck(
                    system().skill,
                    system().aspect,
                  );
                  return (
                    <Show when={skillCheck != null}>
                      <div>Skill: {skillCheck}</div>
                    </Show>
                  );
                }}
              </div>
              <Suspense fallback={<i class="fa-solid fa-gear fa-spin" />}>
                <div
                  class="p-2 prose prose-sm prose-stone dark:prose-zinc dark:prose-invert"
                  innerHTML={descriptionHtml()}
                />
              </Suspense>
            </div>
          </Show>
        </Transition>
      </div>
    );
  }
}
