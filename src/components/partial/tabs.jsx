import { Dynamic } from "solid-js/web";
import { Transition } from "solid-transition-group";

export default function Tabs(props) {
  return (
    <div class="grid grid-cols-1 grid-rows-1 *:col-start-1 *:row-start-1">
      <Transition
        onEnter={(el, done) => {
          const a = el.animate(
            [
              { opacity: 0, transform: "scale(.98)", easing: "ease-out" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: 200,
            },
          );
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate(
            [
              { opacity: 1, transform: "scale(1)", easing: "ease-out" },
              { opacity: 0, transform: "scale(.96)", easing: "ease-out" },
            ],
            {
              duration: 100,
            },
          );
          a.finished.then(done);
        }}
      >
        <Dynamic component={props.currentTab.component} {...props} />
      </Transition>
    </div>
  );
}
