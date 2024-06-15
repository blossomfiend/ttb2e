export default function EditableImage(props) {
  return (
    <img
      height="128"
      width="128"
      src={props.document[props.path]}
      onClick={openImagePicker}
      {...props}
    />
  );

  function openImagePicker() {
    const current = props.document[props.path];
    const { img } =
      props.document.constructor.getDefaultArtwork?.(
        props.document.toObject(),
      ) ?? {};
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => props.document.update({ [props.path]: path }),
    });
    return fp.browse();
  }
}
