import { createMemo } from "solid-js";
import TwistDeckInitApplication from "../../applications/twist-deck-init.mjs";
import { localize } from "../../util.mjs";

export default function OverviewTab(props) {
  const system = createMemo(() => props.actor.system);
  const aspects = createMemo(() =>
    game.ttb2e.aspects.map((aspect) => ({
      name: aspect,
      value: system().aspects[aspect],
    })),
  );
  const derivedAspects = createMemo(() =>
    game.ttb2e.derivedAspects.map((derivedAspect) => ({
      name: derivedAspect,
      ...system().derivedAspects[derivedAspect],
    })),
  );

  return (
    <div class="flex flex-row gap-4">
      {/*<div class="flex flex-col gap-3 p-2">*/}
      {/*  <Index each={aspects()}>*/}
      {/*    {(aspect) => {*/}
      {/*      const name = createMemo(() => aspect().name);*/}
      {/*      return (*/}
      {/*        <label class="flex flex-row gap-1">*/}
      {/*          <span class="flex-1">*/}
      {/*            {localize(`ttb.aspects.${name()}.name`)}*/}
      {/*          </span>*/}
      {/*          <span class="w-12">*/}
      {/*            <NumberInput*/}
      {/*              name={`system.aspects.${name()}`}*/}
      {/*              value={aspect().value}*/}
      {/*            />*/}
      {/*          </span>*/}
      {/*        </label>*/}
      {/*      );*/}
      {/*    }}*/}
      {/*  </Index>*/}
      {/*  <hr />*/}
      {/*  <Index each={derivedAspects()}>*/}
      {/*    {(derivedAspect) => {*/}
      {/*      const name = createMemo(() => derivedAspect().name);*/}
      {/*      return (*/}
      {/*        <div class="w-full flex flex-row items-stretch gap-1 justify-between">*/}
      {/*          <TextButton*/}
      {/*            class="flex-1 align-middle"*/}
      {/*            onClick={() =>*/}
      {/*              new SkillConfigApplication({*/}
      {/*                actor: props.actor,*/}
      {/*                skill: `derivedAspects.${name()}`,*/}
      {/*              }).render({ force: true })*/}
      {/*            }*/}
      {/*          >*/}
      {/*            {localize(`ttb.derivedAspects.${name()}.name`)}*/}
      {/*          </TextButton>*/}
      {/*          <button*/}
      {/*            class="sheet-button w-12 text-center"*/}
      {/*            onClick={() =>*/}
      {/*              new DuelApplication({*/}
      {/*                actor: props.actor,*/}
      {/*                skill: `derivedAspects.${name()}`,*/}
      {/*              }).render({ force: true })*/}
      {/*            }*/}
      {/*          >*/}
      {/*            {derivedAspect().value.value}*/}
      {/*            <TextSuits suits={derivedAspect().value.suits} />*/}
      {/*          </button>*/}
      {/*        </div>*/}
      {/*      );*/}
      {/*    }}*/}
      {/*  </Index>*/}
      {/*</div>*/}
      <div class="p-2 flex flex-col gap-2">
        <p>Fate steps here</p>
        <button
          class="sheet-button"
          onClick={async () => {
            await props.actor.ensureCardsExist();
            ui.notifications.info(
              localize("ttb.notifications.cardsCreated", {
                name: props.actor.name,
              }),
            );
          }}
        >
          Ensure Cards Documents exist
        </button>
        <button
          class="sheet-button"
          onClick={() =>
            new TwistDeckInitApplication({ document: props.actor }).render({
              force: true,
            })
          }
        >
          Initialize Twist Deck
        </button>
        <select
          class="sheet-select"
          name="system.colors.theme"
          value={system().colors.theme}
        >
          {game.ttb2e.themes.map((theme) => (
            <option value={theme.name}>
              {localize(`ttb.themes.${theme.name}.name`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
