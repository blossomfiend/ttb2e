import { createMemo } from "solid-js";
import { localize } from "../util.mts";
import { HtmlEditorRoot, HtmlField } from "./partial/html-editor.jsx";
import NumberInput from "./partial/number-input.jsx";
import SheetScaffold from "./partial/sheet-scaffold.jsx";
import SuitedNumberFormField from "./partial/suited-number-form-field.jsx";

export default function TriggerSheet(props) {
  const system = createMemo(() => props.item.system, { equals: false });

  const skillOptions = [
    ["none", "None"],
    ...["defense", "willpower"].map((da) => [
      `derivedAspects.${da}`,
      localize(`ttb.derivedAspects.${da}.name`),
    ]),
    ...game.ttb2e.skills
      .map((s) => [`skills.${s.name}`, localize(`ttb.skills.${s.name}.name`)])
      .sort((a, b) => new Intl.Collator().compare(a[0], b[0])),
  ];
  const aspectOptions = [
    ["default", "Default"],
    ...game.ttb2e.aspects.map((a) => [a, localize(`ttb.aspects.${a}.name`)]),
  ];
  return (
    <SheetScaffold
      document={props.item}
      themeColor={props.item.actor?.system?.colors?.finalColor}
      header={
        <div class="flex flex-row flex-wrap gap-2 items-stretch">
          <label class="p-px flex flex-col items-center justify-center w-32">
            <div class="label-text">Skill</div>
            <div class="self-stretch">
              <select
                class="sheet-select h-5"
                value={system().skill ?? "none"}
                onChange={(e) => {
                  props.item.update({
                    "system.skill":
                      e.target.value === "none" ? null : e.target.value,
                  });
                }}
              >
                {skillOptions.map(([value, text]) => {
                  return <option value={value}>{text}</option>;
                })}
              </select>
            </div>
          </label>
          <label class="p-px flex flex-col items-center justify-center w-32">
            <div class="label-text">Aspect</div>
            <div class="self-stretch">
              <select
                class="sheet-select h-5"
                value={system().aspect ?? "default"}
                onChange={(e) => {
                  props.item.update({
                    "system.aspect":
                      e.target.value === "default" ? null : e.target.value,
                  });
                }}
              >
                {aspectOptions.map(([value, text]) => {
                  return <option value={value}>{text}</option>;
                })}
              </select>
            </div>
          </label>
          <label class="p-px flex flex-col items-center justify-center w-32">
            <div class="label-text">Range type</div>
            <div class="self-stretch">
              <select
                class="sheet-select h-5"
                value={system().rangeType ?? "none"}
                onChange={(e) => {
                  props.item.update({
                    "system.rangeType":
                      e.target.value === "none" ? null : e.target.value,
                  });
                }}
              >
                <option value={"none"}>None</option>
                <option value={"melee"}>Melee</option>
                <option value={"projectile"}>Projectile</option>
              </select>
            </div>
          </label>
          <label class="p-px flex flex-col items-center justify-center w-32">
            <div class="label-text">Range</div>
            <div class="self-stretch">
              <NumberInput
                class="h-5"
                value={system().range}
                name="system.range"
                placeholder="Range in yd"
              />
            </div>
          </label>
          <label class="p-px flex flex-col items-center justify-center w-32">
            <div class="label-text">Resisted by</div>
            <div class="self-stretch">
              <select
                class="sheet-select h-5"
                value={system().resist ?? "none"}
                onChange={(e) => {
                  props.item.update({
                    "system.resist":
                      e.target.value === "none" ? null : e.target.value,
                  });
                }}
              >
                <option value={"none"}>None</option>
                <option value={"defense"}>Defense</option>
                <option value={"willpower"}>Willpower</option>
                <option value={"either"}>Either</option>
              </select>
            </div>
          </label>
        </div>
      }
    >
      <div class="p-2 h-full">
        <HtmlEditorRoot canEdit={props.item.isOwner}>
          <div class="flex flex-col items-stretch gap-3">
            <div class="p-px flex flex-col gap-1 w-64">
              <div class="text-base">Target Number</div>
              <SuitedNumberFormField
                value={system().targetNumber}
                onChange={(value) =>
                  props.item.update({ "system.targetNumber": value })
                }
              />
            </div>

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
