export default function TextButton(props) {
  return (
    <div
      {...props}
      class={`hover:text-theme-dark dark:hover:text-theme-light
        hover:text-shadow-theme-light hover:dark:text-shadow-theme-dark
        hover:cursor-pointer transition-all ease-fast-in
        ${props.class ?? ""}`}
    >
      {props.children}
    </div>
  );
}
