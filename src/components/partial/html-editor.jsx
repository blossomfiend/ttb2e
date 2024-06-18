import {
  createContext,
  createMemo,
  createResource,
  createSignal,
  onMount,
  Show,
  Suspense,
  untrack,
  useContext,
} from "solid-js";
import TextButton from "./text-button.tsx";

const HtmlEditorContext = createContext();

export function HtmlEditorRoot(props) {
  const [editor, setEditor] = createSignal(null);

  function setEditorWithPermission(editor) {
    if (!props.canEdit) return;
    setEditor(editor);
  }

  return (
    <HtmlEditorContext.Provider
      value={{
        editor,
        setEditor: setEditorWithPermission,
        canEdit: props.canEdit,
      }}
    >
      <Suspense>
        <Show when={editor() !== null} fallback={props.children}>
          <HtmlBox
            title={editor().title}
            collapsed={false}
            onHeaderClicked={() => {}}
            onEditClicked={() => setEditor(null)}
            canEdit={false}
          >
            <prose-mirror
              attr:value={editor().value}
              attr:data-document={editor().document}
              use:setPmValue={{}}
              class="h-full"
              onChange={(e) => {
                untrack(() => {
                  editor().onChange(e.target.value);
                  setEditor(null);
                });
              }}
            />
          </HtmlBox>
        </Show>
      </Suspense>
    </HtmlEditorContext.Provider>
  );

  function setPmValue(element, data) {
    onMount(() => {
      requestAnimationFrame(() => {
        element.getElementsByClassName("editor-content")[0].innerHTML =
          editor().value;
      });
    });
  }
}

export function HtmlField(props) {
  const context = useContext(HtmlEditorContext);
  if (!context) throw new Error("HtmlField was used without HtmlEditorRoot");

  const [collapsed, setCollapsed] = createSignal(false);

  const value = createMemo(() => props.value);
  const [contentHtml] = createResource(value, async (v) => {
    if (v == null || v === "") return "";
    return await TextEditor.enrichHTML(v);
  });

  return (
    <HtmlBox
      title={props.title}
      collapsed={collapsed()}
      onHeaderClicked={() => setCollapsed(!collapsed())}
      onEditClicked={() => context.setEditor(props)}
      canEdit={context.canEdit}
    >
      <div
        class="self-center p-2 prose prose-sm prose-stone dark:prose-zinc dark:prose-invert"
        innerHTML={contentHtml()}
      />
    </HtmlBox>
  );
}

function HtmlBox(props) {
  return (
    <Accordion
      header={
        <div class="flex flex-row justify-between">
          <span class="p-2">{props.title}</span>
          <Show when={props.canEdit}>
            <TextButton
              class="p-2"
              onClick={(e) => {
                e.stopPropagation();
                props.onEditClicked();
              }}
            >
              <i class="fa-solid fa-edit" />
            </TextButton>
          </Show>
        </div>
      }
      onHeaderClicked={() => props.onHeaderClicked()}
      collapsed={props.collapsed}
    >
      {props.children}
    </Accordion>
  );
}

function Accordion(props) {
  return (
    <div
      class="size-full flex flex-col rounded-lg border border-solid border-black/10 dark:border-white/10 overflow-hidden"
      classList={{
        collapsed: props.collapsed,
      }}
    >
      <div
        class="border-0 border-b border-solid border-black/10 dark:border-white/10 overflow-hidden
          [.collapsed>&]:border-transparent [.collapsed>&]:rounded-b-lg [.collapsed>&]:border-b-0"
        onClick={(e) => props.onHeaderClicked(e)}
      >
        <div
          class="size-full bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10 hover:cursor-pointer"
        >
          {props.header}
        </div>
      </div>
      <Show when={!props.collapsed}>{props.children}</Show>
    </div>
  );
}
