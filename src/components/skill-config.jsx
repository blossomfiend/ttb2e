import { createMemo } from "solid-js";
import SuitedNumberFormField from "./partial/suited-number-form-field.jsx";

export default function SkillConfig(props) {
  const skillObject = createMemo(() =>
    foundry.utils.getProperty(props.actor, `system.${props.skill}`),
  );
  return (
    <>
      <div class="form-group slim">
        <label>Override</label>
        <div class="form-fields">
          <input
            type="number"
            name={`system.${props.skill}.override`}
            value={skillObject().override}
          />
        </div>
        <p class="hint">
          If provided, this value overrides the aspect and rank of the skill.
        </p>
      </div>
      <div class="form-group">
        <label>Bonus</label>
        <div class="form-fields">
          <SuitedNumberFormField
            name={`system.${props.skill}.bonus`}
            value={skillObject().bonus}
          />
        </div>
        <p class="hint">A bonus, added to any check with this skill.</p>
      </div>
      <footer>
        <button>Save</button>
      </footer>
    </>
  );
}
