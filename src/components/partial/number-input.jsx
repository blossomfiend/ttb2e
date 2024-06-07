import { ttbNumber } from "./number-input.module.css";

export default function NumberInput(props) {
  return (
    <input
      class={ttbNumber + " " + (props.class || "")}
      data-dtype="Number"
      name={props.name}
      type="text"
      value={props.value}
    />
  );
}
