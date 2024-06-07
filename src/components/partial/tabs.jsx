import { Dynamic } from "solid-js/web";

export default function Tabs(props) {
  return (
    <div class="grid grid-cols-1 grid-rows-1">
      <Dynamic component={props.currentTab.component} {...props} />
    </div>
  );
}
