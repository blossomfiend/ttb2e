export default function TextButton(props) {
  return (
    <button
      {...props}
      class={`text-button ${props.class ?? ""}`}
    >
      {props.children}
    </button>
  );
}
