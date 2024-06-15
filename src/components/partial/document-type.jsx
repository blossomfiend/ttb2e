import { createMemo } from "solid-js";
import { localize } from "../../util.mts";

export default function DocumentType(props) {
  const cls = createMemo(() => props.document.constructor);
  return (
    <>
      {localize(
        cls().hasTypeData
          ? CONFIG[cls().documentName].typeLabels[props.document.type]
          : cls().metadata.label,
      )}
    </>
  );
}
