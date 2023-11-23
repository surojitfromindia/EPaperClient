

function convertNullValueToString(value:any) {
  if (value === null) return "";
  if (value === undefined) return "";
  return value;
}

export { convertNullValueToString };
