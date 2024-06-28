import {
  createColumnHelper,
  createSolidTable,
  flexRender,
  getCoreRowModel,
} from "@tanstack/solid-table";
import { For, Show, Suspense, createMemo, createSignal, Index } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { localizeSkillCheck } from "../../util.mts";
import SuitedValue from "../partial/SuitedValue.jsx";
import TextButton from "../partial/text-button.tsx";
import { enrichHtml } from "../rendering-utils.mjs";
import { grow, softFade } from "../transitions.mjs";

export default function ActionsTab(props) {
  const actor = createMemo(() => props.actor);
  const canEdit = createMemo(() => actor().isOwner);
  const actions = createMemo(() =>
    props.actor.items.filter((item) => item.type === "action"),
  );
  const { onEnter, onExit } = softFade({ duration: 150 });
  const showAvWithRank = createMemo(
    () =>
      props.actor.type === "fatemasterCharacter" &&
      !props.actor.system.doesFlipCards,
  );

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("img", {
      header: () => <div class="basis-6 flex-none" />,
      cell: (props) => (
        <div class="basis-6 flex-none">
          <img
            class="size-6 rounded-l block border-0"
            src={props.renderValue()}
            alt={`icon for the action ${props.row.original.name}`}
          />
        </div>
      ),
    }),
    columnHelper.accessor("system.ap", {
      header: () => <div class="basis-6 flex-none">AP</div>,
      cell: (props) => (
        <div class="basis-6 flex-none flex flex-row items-center">
          {props.renderValue()}
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: () => (
        <div class="grow overflow-hidden overflow-ellipsis">Action</div>
      ),
      cell: (props) => (
        <div class="grow overflow-hidden overflow-ellipsis whitespace-nowrap flex flex-row items-center">
          {props.renderValue()}
        </div>
      ),
    }),
    columnHelper.accessor(
      (action) => {
        const av = () =>
          action.system.skill != null
            ? props.actor.getActingValue(
                action.system.skill,
                action.system.aspect,
              )
            : null;
        return showAvWithRank()
          ? {
              value: av().value + props.actor.system.rankValue,
              suits: av().suits,
            }
          : av();
      },
      {
        id: "system.actingValue",
        header: () => (
          <div class="basis-1/6 flex-none">
            {showAvWithRank() ? "AV*" : "AV"}
          </div>
        ),
        cell: (props) => (
          <div class="basis-1/6 flex-none flex flex-row items-center">
            <span>
              <SuitedValue value={props.renderValue()} />
            </span>
          </div>
        ),
      },
    ),
    columnHelper.accessor("system.targetNumber", {
      header: () => <div class="basis-1/6 flex-none">TN</div>,
      cell: (props) => (
        <div class="basis-1/6 flex-none flex flex-row items-center">
          <span>
            <SuitedValue value={props.renderValue()} />
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("system.resist", {
      header: () => <div class="basis-10 flex-none">Resist</div>,
      cell: (props) => (
        <div class="basis-10 flex-none flex flex-row items-center">
          {() => {
            if (props.renderValue() === "defense") return "Df";
            else if (props.renderValue() === "willpower") return "Wp";
            else if (props.renderValue() === "either") return "Df/Wp";
            else return "";
          }}
        </div>
      ),
    }),
    columnHelper.accessor(
      (action) => ({
        rangeType: action.system.rangeType,
        range: action.system.range,
      }),
      {
        id: "system.range",
        header: () => <div class="basis-10 flex-none">Range</div>,
        cell: (props) => (
          <div class="basis-10 flex-none flex flex-row items-center">
            <span>
              <Show when={props.renderValue().rangeType}>
                <i class={`ttb-icon-${props.renderValue().rangeType}`} />
              </Show>
              {props.renderValue().range}
            </span>
          </div>
        ),
      },
    ),
    columnHelper.display({
      id: "actions",
      header: () => <div class="basis-10 flex-none" />,
      cell: (props) => (
        <div class="basis-10 flex-none flex flex-row items-center">
          <TextButton
            disabled={!canEdit()}
            onClick={(e) => {
              e.stopPropagation();
              props.row.original.sheet.render(true);
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
                content: `Do you want to delete the action ${props.row.original.name}?`,
                defaultYes: false,
                yes: () =>
                  actor().deleteEmbeddedDocuments("Item", [
                    props.row.original.id,
                  ]),
              });
            }}
          >
            <i class="fa-solid fa-trash" />
          </TextButton>
        </div>
      ),
    }),
  ];
  const table = createSolidTable({
    columns,
    getCoreRowModel: getCoreRowModel(),
    renderFallbackValue: null,
    get data() {
      return actions();
    },
  });

  return (
    <div class="py-4 px-2 flex flex-col gap-1">
      <input
        type="text"
        class="subtle-input border-black/10 dark:border-white/10"
        placeholder="Search…"
      />
      <For each={table.getHeaderGroups()}>
        {(headerGroup) => (
          <div class="flex flex-row gap-1 rounded border bg-theme-lighter dark:bg-theme-darker">
            <For each={headerGroup.headers}>
              {(header) =>
                header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
              }
            </For>
          </div>
        )}
      </For>
      <TransitionGroup onEnter={onEnter} onExit={onExit} appear={false}>
        <Index each={table.getRowModel().rows}>
          {(row) => {
            const [collapsed, setCollapsed] = createSignal(true);
            const { onEnter, onExit } = grow({ duration: 100 });
            const system = createMemo(() => row().original.system);
            const [descriptionHtml] = enrichHtml(
              () => row().original.system.description,
            );
            return (
              <div class="flex flex-col bg-black/5 dark:bg-white/5">
                <div
                  class="py-0.5 flex flex-row gap-1 rounded border bg-black/5 dark:bg-white/5 hover:cursor-pointer"
                  onClick={() => {
                    setCollapsed(!collapsed());
                  }}
                >
                  <For each={row().getVisibleCells()}>
                    {(cell) =>
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    }
                  </For>
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
                      <Suspense
                        fallback={<i class="fa-solid fa-gear fa-spin" />}
                      >
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
          }}
        </Index>
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
}
