import { createMemo, Index, Show } from "solid-js";
import { Transition } from "solid-transition-group";
import SkillConfigApplication from "../../applications/skill-config.mjs";
import Flip from "../../flip.mjs";
import { localize } from "../../util.mts";
import NumberInput from "../partial/number-input.jsx";
import SuitedValue from "../partial/SuitedValue.jsx";
import TextButton from "../partial/text-button.tsx";
import { slide } from "../transitions.mjs";

const GROUP_DELAY = 60;
const SKILL_DELAY = 16;
const FADE_DURATION = 150;

export default function SkillsTab(props) {
  const actor = () => props.actor;
  const canEdit = createMemo(() => props.actor.isOwner);
  const skills = createMemo(() => Object.values(props.actor.system.skills));

  return (
    <div class="grid grid-cols-2 gap-3 py-4 px-2">
      {game.ttb2e.skillCategories.map(Category)}
    </div>
  );

  function Category(category, idx) {
    const { onEnter, onExit } = slide({
      duration: FADE_DURATION,
      delay: GROUP_DELAY * idx,
      fill: "both",
    });
    return (
      <Transition onEnter={onEnter} onExit={onExit} appear={true}>
        <div class="flex flex-col gap-1">
          <div class="border-none text-base">
            {localize(`ttb.skillCategories.${category}`)}
          </div>
          <div class="flex flex-col divide-y w-full">
            <Index
              each={skills().filter((skill) => skill.category === category)}
            >
              {(skill, skillIdx) => (
                <Skill skill={skill()} groupIdx={idx} skillIdx={skillIdx} />
              )}
            </Index>
          </div>
        </div>
      </Transition>
    );
  }

  function Skill(props) {
    const name = createMemo(() => props.skill.name);
    const { onEnter, onExit } = slide({
      duration: FADE_DURATION,
      delay: GROUP_DELAY * props.groupIdx + SKILL_DELAY * props.skillIdx,
      fill: "both",
    });
    return (
      <Transition onEnter={onEnter} onExit={onExit} appear={true}>
        <div class="flex flex-row justify-between items-center w-full">
          <div class="flex flex-row items-center gap-1 overflow-hidden">
            <NumberInput
              class="self-stretch text-base w-8 m-px"
              disabled={!canEdit()}
              name={`system.skills.${name()}.rank`}
              value={props.skill.rank}
            />
            <TextButton
              class="p-1 truncate"
              disabled={!canEdit()}
              onClick={() => renderSkillConfig(`skills.${name()}`)}
            >
              {localize(`ttb.skills.${name()}.name`)}
            </TextButton>
          </div>
          <div class="self-stretch flex flex-row gap-1">
            <Index each={props.skill.aspects}>
              {(aspect) => (
                <button
                  class="py-0.5 sheet-button flex flex-col items-center min-w-14 justify-center leading-none border-none"
                  disabled={!canEdit()}
                  onClick={() =>
                    renderDuel(
                      `skills.${name()}`,
                      aspect(),
                      props.skill.av[aspect()],
                    )
                  }
                >
                  <div class="label-text">
                    {localize(`ttb.aspects.${aspect()}.name`)}
                  </div>
                  <div class="">
                    <SuitedValue value={props.skill.av[aspect()]} />
                    <Show when={actor().type === "fatemasterCharacter"}>
                      {" "}
                      (
                      <SuitedValue
                        value={{
                          value:
                            props.skill.av[aspect()].value +
                            actor().system.rankValue,
                          suits: props.skill.av[aspect()].suits,
                        }}
                      />
                      )
                    </Show>
                  </div>
                </button>
              )}
            </Index>
          </div>
        </div>
      </Transition>
    );
  }

  async function renderDuel(skill, aspect, actingValue) {
    if (!canEdit()) return;
    await new Flip({
      actor: props.actor,
      skill,
      aspect,
      actingValue,
    }).openConfigurationUi();
  }

  function renderSkillConfig(skill) {
    if (!canEdit()) return;
    new SkillConfigApplication({ actor: props.actor, skill }).render({
      force: true,
    });
  }
}
