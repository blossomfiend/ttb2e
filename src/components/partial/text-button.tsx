import type { JSX } from "solid-js";

export default function TextButton(
  props:
    | {
        class?: string;
        children: JSX.Element;
      }
    | JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button {...props} class={`text-button ${props.class ?? ""}`}>
      {props.children}
    </button>
  );
}
