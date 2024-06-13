import { createDeferred, createMemo, For, Show } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import TextButton from "../partial/text-button.tsx";
import { trackDocument } from "../rendering-utils.mjs";
import { softFade } from "../transitions.mjs";
import TextSuits from "../partial/text-suits.jsx";
import DuelApplication from "../../applications/duel.mjs";

export default function ActionsTab(props) {
  const canEdit = createMemo(() => props.actor.isOwner);
  const abilities = createMemo(() =>
    props.actor.items.filter((item) => item.type === "action"),
  );
  const { onEnter, onExit } = softFade({ duration: 150 });

  return (
    <div class="py-4 px-2 flex flex-col gap-2">
      <TransitionGroup onEnter={onEnter} onExit={onExit} appear={false}>
        <For each={abilities()}>
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
    const av = props.actor.getActingValue(system().skill, system().aspect);
    return (
      <div class="flex flex-col gap-1">
        <div class="self-stretch flex flex-row justify-between">
          <div class="flex flex-row gap-2">
            <TextButton class="text-base font-bold" onClick={() => {
              if (!av || !canEdit()) return;
              const app = new DuelApplication({
                title: props.action.name,
                actor: props.actor,
                skill: system().skill,
                aspect: system().aspect,
                targetNumber: system().targetNumber,
                actingValue: av,
              });
              app.render(true);
            }}>
              {props.action.name}
            </TextButton>
            <TextButton
              class="w-auto text-base font-bold"
              onClick={() => {
                props.action.sheet.render({ force: true });
              }}
            >
              <i class="fa-solid fa-edit" />
            </TextButton>
          </div>
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

        <div class="flex flex-row gap-3">
          <Show when={system().skill != null}>
            <div class="flex flex-row gap-1">
              <div class="text-stone-700 dark:text-zinc-300">AV</div>
              <div>
                {av.value}
                <TextSuits suits={av.suits} />
              </div>
            </div>
          </Show>
          <Show when={system().targetNumber.value}>
            <div class="flex flex-row gap-1">
              <div class="text-stone-700 dark:text-zinc-300">TN</div>
              <div>
                {system().targetNumber.value}
                <TextSuits suits={system().targetNumber.suits} />
              </div>
            </div>
          </Show>
          <Show when={system().range}>
            <div class="flex flex-row gap-1">
              <div class="text-stone-700 dark:text-zinc-300">Range</div>
              <div>
                <Show when={system().rangeType}>
                  <i class={`ttb-icon-${system().rangeType}`} />
                </Show>
                {system().range}
              </div>
            </div>
          </Show>
          <Show when={system().resist}>
            <div class="flex flex-row gap-1">
              <div class="text-stone-700 dark:text-zinc-300">Resist</div>
              <div>
                {() => {
                  if (system().resist === "defense") return "Df";
                  else if (system().resist === "willpower") return "Wp";
                  else if (system().resist === "either") return "Df/Wp";
                }}
              </div>
            </div>
          </Show>
        </div>

        <div
          class="ml-2 rounded-lg p-2
                  prose prose-sm prose-stone dark:prose-zinc dark:prose-invert"
          innerHTML={system().description}
        />
      </div>
    );
  }
}
