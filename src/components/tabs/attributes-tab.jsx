import { createMemo } from "solid-js";
import DuelApplication from "../../applications/duel.mjs";
import SkillConfigApplication from "../../applications/skill-config.mjs";
import TwistDeckInitApplication from "../../applications/twist-deck-init.mjs";
import { localize } from "../../util.mjs";
import NumberInput from "../partial/number-input.jsx";
import TextSuits from "../partial/text-suits.jsx";

export default function AttributesTab(props) {
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
      <div class="flex flex-col gap-3">
        {aspects().map((aspect) => (
          <label class="flex flex-row gap-1">
            <span class="flex-1">
              {localize(`ttb.aspects.${aspect.name}.name`)}
            </span>
            <span class="w-12">
              <NumberInput
                name={`system.aspects.${aspect.name}`}
                value={aspect.value}
              />
            </span>
          </label>
        ))}
        <hr />
        {derivedAspects().map((derivedAspect) => (
          <div class="w-full flex flex-row items-center gap-1 justify-between">
            <div
              class="flex-1 hover:text-shadow-red hover:cursor-pointer"
              onClick={() =>
                new SkillConfigApplication({
                  actor: props.actor,
                  skill: `derivedAspects.${derivedAspect.name}`,
                }).render({ force: true })
              }
            >
              {localize(`ttb.derivedAspects.${derivedAspect.name}.name`)}
            </div>
            <button
              class="w-12 text-center hover:text-shadow-red hover:cursor-pointer"
              onClick={() =>
                new DuelApplication({
                  actor: props.actor,
                  skill: `derivedAspects.${derivedAspect.name}`,
                }).render({ force: true })
              }
            >
              {derivedAspect.value.value}
              <TextSuits suits={derivedAspect.value.suits} />
            </button>
          </div>
        ))}
      </div>
      <div>
        <p>Fate steps here</p>
        <button
          onClick={() => {
            actor.ensureCardsExist();
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
          onClick={() =>
            new TwistDeckInitApplication({ document: props.actor }).render({
              force: true,
            })
          }
        >
          Initialize Twist Deck
        </button>
      </div>
    </div>
  );
}
