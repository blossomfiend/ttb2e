import { localize } from "../../util.mts";
import { createMemo } from "solid-js";

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
