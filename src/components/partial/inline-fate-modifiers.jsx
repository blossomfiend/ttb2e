import { createMemo, Index } from "solid-js";

export default function InlineFateModifiers(props) {
  const type = createMemo(() => (props.fateModifier > 0 ? "plus" : "minus"));
  return (
    <Index each={Array(Math.abs(props.fateModifier)).fill(null)}>
      {() => <i class={`ttb-icon-${type()} ${props.class ?? ""}`} />}
    </Index>
  );
}
