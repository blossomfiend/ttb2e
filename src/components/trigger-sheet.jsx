import { createMemo, onMount } from "solid-js";
import { localize } from "../util.mts";
import SheetScaffold from "./partial/sheet-scaffold.jsx";
import { HtmlEditorRoot, HtmlField } from "./partial/html-editor.jsx";

export default function TriggerSheet(props) {
  const system = createMemo(() => props.item.system);
  return (
    <SheetScaffold
      document={props.item}
      themeColor={props.action?.system?.colors?.finalColor}
      header={
        <label class="self-start flex flex-col">
          <div class="label-text">Trigger Suit</div>
          <select
            class="sheet-select leading-none h-auto w-24"
            name="sytem.suit"
          >
            {game.ttb2e.suits.map((suit) => (
              <option value={suit}>{localize(`ttb.suits.${suit}.name`)}</option>
            ))}
          </select>
        </label>
      }
    >
      <div class="p-2 h-full">
        <HtmlEditorRoot>
          <div class="flex flex-col items-stretch">
            <HtmlField
              title="Description"
              value={system().description}
              onChange={(v) => props.item.update({ "system.description": v })}
            />
          </div>
        </HtmlEditorRoot>
      </div>
    </SheetScaffold>
  );
}
