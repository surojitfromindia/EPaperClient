import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service";

const DEPTH_OFFSET = 0;

const generateTreeLine = (
  flatArray: ChartOfAccount[],
  depthOffSet = DEPTH_OFFSET,
) => {
  let aux = [0];
  const newArray: ({ bar: number[] } & ChartOfAccount)[] = [];
  for (const el of flatArray) {
    if (el.depth === depthOffSet) {
      // at root we reset
      aux = [0];
      newArray.push({ ...el, bar: Array.from(aux) });
      if (el.no_of_children > 0) {
        aux.push(el.no_of_children);
      }
    } else {
      // read the last element
      const pointerDepth = el.depth - depthOffSet;
      newArray.push({ ...el, bar: Array.from(aux) });
      if (aux[pointerDepth] > 0) {
        aux[pointerDepth] -= 1;
      }
      // if it has children more than zero, then push the count
      // after updating the last element
      if (el.no_of_children > 0) {
        // either update an existing position or push
        if (pointerDepth + 1 >= aux.length) {
          aux.push(el.no_of_children);
        } else {
          aux[pointerDepth + 1] += el.no_of_children;
        }
      }
    }
  }
  return newArray;
};




const elementRepeat = <T,>(element: T, times: number): T[] => {
  const d: T[] = [];
  Array(times).fill(0).forEach(() => d.push(element));
  return d;
};
export { generateTreeLine, elementRepeat };

console.log(elementRepeat('2',2))