import { createDeferred, createEffect, createMemo, For, Show } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import TextButton from "../partial/text-button.tsx";
import { trackDocument } from "../rendering-utils.mjs";
import { softFade } from "../transitions.mjs";

export default function AbilitiesTab(props) {
  const canEdit = createMemo(() => props.actor.isOwner);
  const abilities = createMemo(() =>
    props.actor.items.filter((item) => item.type === "ability"),
  );
  const { onEnter, onExit } = softFade({ duration: 150 });

  return (
    <div class="py-4 px-2 flex flex-col gap-2">
      <TransitionGroup onEnter={onEnter} onExit={onExit} appear={false}>
        <For each={abilities()}>
          {(untrackedAbility) => {
            const ability = createDeferred(
              trackDocument(() => untrackedAbility),
              { equals: false },
            );
            return (
              <Show when={ability() != null}>
                <Ability ability={ability()} actor={props.actor} />
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
              name: "New Ability",
              type: "ability",
            },
          ]);
        }}
      >
        Add Ability
      </button>
    </div>
  );

  function Ability(props) {
    return (
      <div class="flex flex-col gap-1">
        <div class="self-stretch flex flex-row justify-between">
          <TextButton
            class="flex flex-row gap-2 text-base font-bold w-auto"
            onClick={() => {
              props.ability.sheet.render({ force: true });
            }}
          >
            <div>{props.ability.name}</div>
            <i class="fa-solid fa-edit" />
          </TextButton>
          <TextButton
            class="text-base font-bold"
            disabled={!canEdit()}
            onClick={async () => {
              await Dialog.confirm({
                title: "Are you sure?",
                content: `Do you want to delete the ability ${props.ability.name}?`,
                defaultYes: false,
                yes: () =>
                  props.actor.deleteEmbeddedDocuments("Item", [
                    props.ability.id,
                  ]),
              });
            }}
          >
            <i class="fa-solid fa-trash" />
          </TextButton>
        </div>

        <div
          class="ml-2 rounded-lg p-2
                  prose prose-sm prose-stone dark:prose-zinc dark:prose-invert"
          innerHTML={props.ability.system.description}
        />
      </div>
    );
  }
}
