import { createMemo } from "solid-js";
import { HtmlEditorRoot, HtmlField } from "./partial/html-editor.jsx";
import SheetScaffold from "./partial/sheet-scaffold.jsx";

export default function TriggerSheet(props) {
  const system = createMemo(() => props.item.system);
  return (
    <SheetScaffold
      document={props.item}
      themeColor={props.item.actor?.system?.colors?.finalColor}
      header={<></>}
    >
      <div class="p-2 h-full">
        <HtmlEditorRoot canEdit={props.item.isOwner}>
          <div class="flex flex-col items-stretch">
            <HtmlField
              title="Description"
              value={system().description}
              onChange={(v) => props.item.update({ "system.description": v })}
              document={props.item}
            />
          </div>
        </HtmlEditorRoot>
      </div>
    </SheetScaffold>
  );
}
