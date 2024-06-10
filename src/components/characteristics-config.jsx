import { createMemo, createSignal, Index } from "solid-js";

export default function CharacteristicsConfig(props) {
  const characteristics = createMemo(
    () => props.document.system.characteristics,
  );
  const [newCharacteristic, setNewCharacteristic] = createSignal("");

  return (
    <form class="standard-form">
      <div class="form-group stacked">
        <label>Add characteristic</label>
        <div class="flex flex-row gap-2">
          <input
            class="grow"
            type="text"
            value={newCharacteristic()}
            onChange={(e) => setNewCharacteristic(e.target.value)}
          />
          <button
            type="submit"
            class="size-8 flex flex-row items-center justify-center"
            on:click={(e) => {
              e.preventDefault();
              props.document.update({
                "system.characteristics": [
                  ...characteristics(),
                  newCharacteristic(),
                ],
              });
              setNewCharacteristic("");
            }}
          >
            <i class="m-0 fa-solid fa-plus" />
          </button>
        </div>
      </div>
      <div class="form-group stacked">
        <label>Current characteristics</label>
        <ul class="flex flex-col gap-2">
          <Index each={characteristics()}>
            {(characteristic) => (
              <li class="flex flex-row justify-between items-center">
                <div>{characteristic()}</div>
                <button
                  class="size-8 flex flex-row items-center justify-center"
                  on:click={(e) => {
                    e.preventDefault();
                    props.document.update({
                      "system.characteristics": characteristics().filter(
                        (c) => c !== characteristic(),
                      ),
                    });
                  }}
                >
                  <i class="m-0 fa-solid fa-trash" />
                </button>
              </li>
            )}
          </Index>
        </ul>
      </div>
      <footer>
        <button
          on:click={(e) => {
            e.preventDefault();
            props.close();
          }}
        >
          Close
        </button>
      </footer>
    </form>
  );
}
