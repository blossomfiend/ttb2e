import { createMemo, createSignal, Show, Suspense, useContext } from "solid-js";
import { AppContainerContext } from "../app-container.jsx";
import BarLoader from "./bar-loader.jsx";
import DocumentType from "./document-type.jsx";
import EditableImage from "./editable-image.jsx";
import NameInput from "./name-input.tsx";
import SheetRoot from "./sheet-root.tsx";
import TabMenu from "./tab-menu.jsx";
import Tabs from "./tabs.jsx";

/**
 * Either `props.tabs` or `props.children` should be defined.
 * @param {Document} props.document
 * @param {string} [props.themeColor]
 * @param {JSX.Element} [props.belowImage]
 * @param {JSX.Element} [props.header]
 * @param {JSX.Element} [props.children]
 * @param {Object} [props.tabs]
 * @return {JSX.Element}
 * @constructor
 */
export default function SheetScaffold(props) {
  const appContext = useContext(AppContainerContext);
  const canEdit = createMemo(() => props.document.isOwner);
  const [currentTab, setCurrentTab] = createSignal(props.tabs?.[0]);
  return (
    <SheetRoot themeColor={props.themeColor} onDrop={props.onDrop}>
      <header class="z-20 flex flex-row gap-2 p-2 pt-4">
        <div class="flex-none flex flex-col items-center gap-2">
          <EditableImage
            alt="image"
            class="flex-none rounded-full border-0 object-cover size-28"
            document={props.document}
            path="img"
          />
          {props.belowImage}
        </div>
        <div class="grow flex flex-col items-stretch p-1">
          <div class="flex flex-row gap-3 items-stretch">
            <NameInput disabled={!canEdit()} value={props.document.name} />
            <div class="flex-none text-lg font-modesto text-stone-700 dark:text-zinc-300">
              <DocumentType document={props.document} />
            </div>
          </div>
          {props.header}
        </div>
      </header>

      <Show
        when={props.tabs}
        fallback={<main class="grow">{props.children}</main>}
      >
        <nav
          class="z-10 sticky top-0 bg-stone-200/90 dark:bg-zinc-900/90 shadow-md
          flex flex-row justify-evenly items-stretch
          border-0 border-b border-solid border-theme-light dark:border-theme-dark"
        >
          <TabMenu
            currentTab={currentTab()}
            onTabChange={(tab) => appContext.start(() => setCurrentTab(tab))}
            tabs={props.tabs}
          />
        </nav>

        <main
          class="grow"
          classList={{ "pending-fade-out": appContext.isPending() }}
        >
          <Suspense fallback={<BarLoader />}>
            <Tabs currentTab={currentTab()} tabs={props.tabs} {...props}></Tabs>
          </Suspense>
        </main>
      </Show>
    </SheetRoot>
  );
}
