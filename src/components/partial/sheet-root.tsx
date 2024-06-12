import { themeColorCss } from "../color.mjs";
import { JSX } from "solid-js";

export default function SheetRoot(props: {
  themeColor?: string;
  children: JSX.Element[];
  [x: string]: unknown;
}) {
  return (
    <div
      {...props}
      class={`size-full flex flex-col items-stretch overflow-y-scroll overflow-x-hidden text-sm
        sheet-root
        scrollbar-theme-lighter dark:scrollbar-theme-darker transition-all`}
      style={themeColorCss(props.themeColor)}
    >
      {props.children}
    </div>
  );
}
