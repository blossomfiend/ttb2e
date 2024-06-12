export default function NameInput(props) {
  return (
    <input
      autocomplete="off"
      name="name"
      placeholder="Name"
      type="text"
      {...props}
      class={`subtle-input font-modesto text-start text-2xl h-auto leading-none 
        p-0 text-theme-darker dark:text-theme-lighter ${props.class ?? ""}`}
    />
  );
}
