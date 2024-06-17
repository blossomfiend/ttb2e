import TextSuits from "./text-suits.jsx";

export default function SuitedValue(props) {
  return <>
    {props.value.value}
    <TextSuits suits={props.value.suits} />
  </>
}