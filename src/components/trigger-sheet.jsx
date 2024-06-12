import { createMemo } from "solid-js";
import { localize } from "../util.mts";
import { HtmlEditorRoot, HtmlField } from "./partial/html-editor.jsx";
import SheetScaffold from "./partial/sheet-scaffold.jsx";

export default function TriggerSheet(props) {
  const system = createMemo(() => props.item.system);
  return (
    <SheetScaffold
      document={props.item}
      themeColor={props.action?.system?.colors?.finalColor}
      header={
        <label class="py-1 self-start flex flex-col">
          <div class="label-text">
            Trigger Suit <i class={`ttb-icon-${system().suit}`} />
          </div>
          <select
            class="sheet-select leading-none h-auto w-24"
            name="system.suit"
            value={system().suit}
          >
            {game.ttb2e.suits.map((suit) => (
              <option value={suit}>{localize(`ttb.suits.${suit}.name`)}</option>
            ))}
          </select>
        </label>
      }
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
