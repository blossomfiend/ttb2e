import { createStore } from "solid-js/store";
import { localize, localizeCardName } from "../util.mjs";

export default function TwistDeckInit(props) {
  const [state, setState] = createStore({
    suitRoles: Object.fromEntries(
      game.ttb2e.suitRoles.map(({ name }) => [name, "rams"]),
    ),
  });

  async function submit() {
    const toCreate = game.ttb2e.suitRoles.flatMap(
      ({ name: suitRole, values }) => {
        const suit = state.suitRoles[suitRole];
        return values.map((value) => ({
          name: `${localizeCardName({ value, suit })} (${props.document.name})`,
          value,
          suit,
          faces: [{}],
          face: 0,
        }));
      },
    );
    const twistDeck = props.document.system.cards.twistDeck;
    const toDelete = twistDeck.cards.map((card) => card.id);
    await Promise.all([
      twistDeck.deleteEmbeddedDocuments("Card", toDelete),
      twistDeck.createEmbeddedDocuments("Card", toCreate),
    ]);
    await twistDeck.shuffle({ chatNotification: false });
    props.close();
  }

  return (
    <form class="standard-form" on:submit={(e) => e.preventDefault()}>
      {game.ttb2e.suitRoles.map((suitRole) => (
        <div class="form-group">
          <label>{localize(`ttb.suitRoles.${suitRole.name}.name`)}</label>
          <div class="form-fields">
            <select
              value={state.suitRoles[suitRole.name]}
              onChange={(e) =>
                setState("suitRoles", suitRole.name, e.target.value)
              }
            >
              {Object.keys(game.ttb2e.suits).map((suit) => (
                <option value={suit}>
                  {localize(`ttb.suits.${suit}.name`)}
                </option>
              ))}
            </select>
          </div>
          <p class="hint">{localize(`ttb.suitRoles.${suitRole.name}.hint`)}</p>
        </div>
      ))}
      <footer>
        <button onClick={submit}>Replace Twist Deck</button>
      </footer>
    </form>
  );
}
