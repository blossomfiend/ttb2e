export default function NumberInput(props) {
  return (
    <input
      autoComplete="off"
      {...props}
      class={`subtle-input ${props.class ?? ""}`}
      data-dtype="Number"
      type="text"
    />
  );
}
