export default function NumberInput(props) {
  return (
    <input
      {...props}
      class={`subtle-input ${props.class ?? ""}`}
      data-dtype="Number"
      type="text"
    />
  );
}
