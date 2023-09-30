import {NumericFormat, NumericFormatProps} from "react-number-format"

export default function RNumberFormat(props:NumericFormatProps) {
  return <NumericFormat {...props} />;
}

export function RNumberFormatAsText(props:NumericFormatProps){

  return <RNumberFormat {...props} displayType={"text"}/>
}