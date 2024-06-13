import { Dynamic } from "solid-js/web";
import { Transition } from "solid-transition-group";
import { softFade } from "../transitions.mjs";

export default function Tabs(props) {
  const { onEnter, onExit } = softFade({ duration: 200 });
  return (
    <div class="grid grid-cols-1 grid-rows-1 *:col-start-1 *:row-start-1">
      <Transition onEnter={onEnter} onExit={onExit}>
        <Dynamic component={props.currentTab.component} {...props} />
      </Transition>
    </div>
  );
}
