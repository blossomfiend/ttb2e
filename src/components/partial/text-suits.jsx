import { Index } from "solid-js";

export default function TextSuits(props) {
  const displayedSuits = () =>
    Object.keys(game.ttb2e.suits).flatMap((suit) =>
      Array(props.suits[suit]).fill(suit),
    );

  return (
    <Index each={displayedSuits()}>
      {(suit) => <i class={`ttb-icon-${suit()}`} />}
    </Index>
  );
}
