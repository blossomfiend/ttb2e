import { For, Index } from "solid-js";
import DuelApplication from "../../applications/duel.mjs";
import SkillConfigApplication from "../../applications/skill-config.mjs";
import { localize } from "../../util.mjs";
import NumberInput from "../partial/number-input.jsx";
import TextSuits from "../partial/text-suits.jsx";

export default function SkillsTab(props) {
  const skills = () => Object.values(props.actor.system.skills);

  function renderDuel(skill, aspect) {
    new DuelApplication({ actor: props.actor, skill, aspect }).render({
      force: true,
    });
  }

  function renderSkillConfig(skill) {
    new SkillConfigApplication({ actor: props.actor, skill }).render({
      force: true,
    });
  }

  return (
    <div class="grid grid-cols-2 gap-4">
      {game.ttb2e.skillCategories.map((category, categoryIdx) => (
        <div class="flex flex-col gap-1">
          <h3 class="border-none text-16">
            {localize(`ttb.skillCategories.${category}`)}
          </h3>
          <div class="flex flex-col divide-y w-full">
            <For each={skills().filter((skill) => skill.category === category)}>
              {(skill, skillIdx) => (
                <div class="flex flex-row justify-between items-center border-border-dark-5 dark:border-border-light-2/50 w-full p-0">
                  <div class="flex flex-row items-center gap-2 overflow-hidden">
                    <label class="flex flex-col items-center p-1">
                      <span class="w-8">
                        <NumberInput
                          name={`system.skills.${skill.name}.rank`}
                          value={skill.rank}
                        />
                      </span>
                      <span class="text-13 leading-none small-caps text-text-dark-secondary dark:text-stone-300">
                        {localize("ttb.ui.rank")}
                      </span>
                    </label>
                    <div
                      class="p-1 hover:text-shadow-red hover:cursor-pointer truncate"
                      onClick={() => renderSkillConfig(`skills.${skill.name}`)}
                    >
                      {localize(`ttb.skills.${skill.name}.name`)}
                    </div>
                  </div>
                  <div class="flex flex-row gap-2 h-full">
                    <Index each={skill.aspects}>
                      {(aspect) => (
                        <div
                          class="flex flex-col gap-0 items-center hover:drop-shadow-red hover:cursor-pointer min-w-10 h-full justify-center"
                          onClick={() =>
                            renderDuel(`skills.${skill.name}`, aspect())
                          }
                        >
                          <div class="leading-none">
                            <span>{skill.av[aspect()].value}</span>
                            <TextSuits suits={skill.av[aspect()].suits} />
                          </div>
                          <div class="italic text-11 leading-none text-text-dark-secondary dark:text-stone-300">
                            {localize(`ttb.aspects.${aspect()}.name`)}
                          </div>
                        </div>
                      )}
                    </Index>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      ))}
    </div>
  );
}
