import { Show } from "solid-js";
import TextSuits from "./text-suits.jsx";

export default function SuitedValue(props) {
  return (
    <Show when={props.value != null && props.value.value != null}>
      {props.value.value}
      <TextSuits suits={props.value.suits} />
    </Show>
  );
}
