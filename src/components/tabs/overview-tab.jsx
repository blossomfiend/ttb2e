import { createMemo } from "solid-js";
import TwistDeckInitApplication from "../../applications/twist-deck-init.mjs";
import { localize } from "../../util.mts";

export default function OverviewTab(props) {
  const system = createMemo(() => props.actor.system);

  return (
    <div class="flex flex-row gap-4">

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
          <option value="">None</option>
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
