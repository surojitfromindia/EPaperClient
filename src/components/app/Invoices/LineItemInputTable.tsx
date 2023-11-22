import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactSelect, {
  components,
  DropdownIndicatorProps,
  OptionProps,
} from "react-select";
import {
  reactSelectComponentOverride,
  reactSelectStyle,
} from "@/util/style/reactSelectStyle.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { ChevronDown, CircleEllipsis, XCircle } from "lucide-react";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ReactAsyncSelect from "react-select/async";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import AutoCompleteService from "@/API/Resources/v1/AutoComplete.Service.ts";
import ItemService from "@/API/Resources/v1/Item/Item.Service.ts";
import * as z from "zod";
import { UseFieldArrayReturn } from "react-hook-form";
import {
  InvoiceLineItem,
  InvoiceLineItemGenerated,
} from "@/API/Resources/v1/Invoice/Invoice.Service.ts";
import { TaxRate } from "@/API/Resources/v1/TaxRate.ts";
import { cn } from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";

const autoCompleteService = new AutoCompleteService();
const itemService = new ItemService();

const lineItemSchema = z.object({
  item: z.object({
    label: z.string(),
    value: z.number(),
  }),
  unit: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number(),
  tax: z.object({
    label: z.string(),
    value: z.number(),
    tax_percentage: z.number(),
  }),
  total: z.number(),
});

type LineItemInputTableProps = {
  taxesDropDown: { label: string; value: number }[]; // Replace 'any' with the actual type
  itemFor: "sales" | "purchase";
  line_items?: (InvoiceLineItem | InvoiceLineItemGenerated)[];
};
type LINE_ITEM_OPTION_TYPE = {
  label: string;
  value: number;
  price: number;
};

export function LineItemInputTable({
  taxesDropDown,
  itemFor,
  line_items = [],
}: LineItemInputTableProps) {
  const BLANK_ROW = useMemo(
    () => ({
      item: null,
      unit: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      tax: null,
      total: 0,
      is_loading: false,
    }),
    [],
  );
  const [lineItems, setLineItems] = useState([]);
  const lineItemRefs = useRef([]);
  lineItemRefs.current = lineItems.map(
    (_, i) => lineItemRefs.current[i] ?? createRef(),
  );

  useEffect(() => {
    // at the time of creation, if line_items is empty, then add a blank row.
    if (line_items.length === 0) {
      setLineItems([BLANK_ROW]);
    }
  }, [BLANK_ROW, line_items.length]);

  useEffect(() => {
    if (line_items.length > 0) {
      setLineItems([...line_items]);
    }
  }, [line_items]);

  const [isInitialItemLoadingDone, setIsInitialItemLoadingDone] =
    useState(false);
  const [isInitialLoadingInProgress, setIsInitialLoadingInProgress] =
    useState(false);
  const [itemDefaultList, setItemDefaultList] = useState<
    { label: string; value: number }[]
  >([]);

  const itemAutoCompleteFetch = useCallback(
    async (search_text: string): Promise<Array<LINE_ITEM_OPTION_TYPE>> => {
      const auto_complete_data = await autoCompleteService.getItems({
        search_text: search_text,
        item_for: itemFor,
      });
      const { results } = auto_complete_data;
      return results.map((entry) => ({
        label: entry.text,
        value: entry.id,
        price: itemFor === "sales" ? entry.selling_price : entry.purchase_price,
      }));
    },
    [itemFor],
  );
  const handleItemAutoCompleteInitialFocus = useCallback(() => {
    if (isInitialItemLoadingDone) return;
    else {
      setIsInitialItemLoadingDone(true);
      setIsInitialLoadingInProgress(true);
      itemAutoCompleteFetch("")
        .then((data) => {
          setItemDefaultList(data);
          setIsInitialLoadingInProgress(false);
        })
        .catch((error) => console.log(error));
    }
  }, [itemAutoCompleteFetch, isInitialItemLoadingDone]);
  const handleItemAutoCompleteChange = useCallback(
    (search_text: string, callback) => {
      itemAutoCompleteFetch(search_text).then((data) => callback(data));
    },
    [itemAutoCompleteFetch],
  );

  const handleItemSelect = (item_id: number, index: number) => {
    const temp_line_item = [...lineItems];
    if (!item_id) {
      temp_line_item[index] = BLANK_ROW;
      setLineItems([...temp_line_item]);
      return;
    } else {
      temp_line_item[index] = {
        ...temp_line_item[index],
        is_loading: true,
      };
      setLineItems([...temp_line_item]);
    }
    // do an item api call.
    itemService
      .getItem({
        item_id,
      })
      .then((data) => {
        const fetched_item = data.item;
        setLineItems((items) =>
          items.map((item, item_index) => {
            if (item_index === index) {
              item.price =
                itemFor === "sales"
                  ? fetched_item.selling_price
                  : fetched_item.purchase_price;
                item.unit = fetched_item.unit;
                item.unit_id = fetched_item.unit_id;
              item.description =
                itemFor === "sales"
                  ? fetched_item.selling_description
                  : fetched_item.purchase_description;
              item.tax = {
                label: fetched_item.tax_name,
                value: fetched_item.tax_id,
                tax_percentage: fetched_item.tax_percentage,
              };
              item.item = {
                label: fetched_item.name,
                value: fetched_item.item_id,
              };
              item.is_loading = false;
              return item;
            }
            return item;
          }),
        );
      })
      .catch((error) => console.log(error));
  };

  const handleNewRowAt = (index: number) => {
    const temp_line_item = [...lineItems];
    temp_line_item.splice(index + 1, 0, BLANK_ROW);
    setLineItems([...temp_line_item]);
  };

  const handleRowRemoveAt = (index: number) => {
    if (lineItems.length === 1) return;
    const temp_line_item = [...lineItems];
    temp_line_item.splice(index, 1);
    setLineItems([...temp_line_item]);
  };

  const handleRowCloneAt = (index: number) => {
    const temp_line_item = [...lineItems];
    const cloned_item = Object.assign({}, temp_line_item[index]);
    // remove some fields from cloned_item that we don't want to clone, such as line_item_id.
    Reflect.deleteProperty(cloned_item, "line_item_id");
    // insert the cloned item at the index + 1
    temp_line_item.splice(index + 1, 0, cloned_item);
    setLineItems([...temp_line_item]);
  };

  const handleQuantityChange = (
    ev: React.FocusEvent<HTMLInputElement>,
    index: number,
  ) => {
    const raw_value = ev.target.value;
    const value = Number.isNaN(Number(raw_value)) ? 1 : Number(raw_value);
    const temp_line_item = [...lineItems];
    temp_line_item[index] = {
      ...temp_line_item[index],
      quantity: value,
    };
    setLineItems([...temp_line_item]);
  };

  const handlePriceChange = (
    ev: React.FocusEvent<HTMLInputElement>,
    index: number,
  ) => {
    const raw_value = ev.target.value;
    const value = Number.isNaN(Number(raw_value)) ? 0 : Number(raw_value);
    const temp_line_item = [...lineItems];
    temp_line_item[index] = {
      ...temp_line_item[index],
      price: value,
    };
    setLineItems([...temp_line_item]);
  };

  const ITEM_OPTIONS_COMPONENT: React.FC<
    OptionProps<LINE_ITEM_OPTION_TYPE, false>
  > = (props) => (
    <components.Option {...props}>
      <div className="flex flex-col">
        <div className="text-sm">{props.data.label}</div>
        <div className="text-xs text-gray-500">Rate : ${props.data.price}</div>
      </div>
    </components.Option>
  );

  const ccp = useRef(null);
  const handleSelectItemRemove = (index: number) => {
    const temp_line_item = [...lineItems];
    temp_line_item[index] = BLANK_ROW;
    setLineItems([...temp_line_item]);
  };

  return (
    <div className={"flex flex-col space-y-3"}>
      <ReactSelect
        className={"w-[150px]"}
        classNames={reactSelectStyle}
        components={{
          ...reactSelectComponentOverride,
        }}
        placeholder={"Tax treatment"}
        options={[
          { label: "Tax Inclusive", value: "true" },
          { label: "Tax Exclusive", value: "false" },
        ]}
        isSearchable={false}
      />
      <Table className="divide-y  divide-gray-200 border-y border-gray-300 w-[900px]">
        <TableHeader>
          <TableRow className="divide-x divide-gray-200 hover:bg-transparent  ">
            <TableHead className="w-[380px] px-4 py-1 text_thead">
              item
            </TableHead>
            <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
              quantity
            </TableHead>
            <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
              rate
            </TableHead>
            <TableHead className="w-[100px] px-4 py-1 text_thead text-right">
              discount
            </TableHead>
            <TableHead className="w-[170px] px-4 py-1 text_thead">
              tax (%)
            </TableHead>
            <TableHead className="text-right px-4 pr-1 text_thead">
              <div>amount</div>
              <div className={"relative break-words"}>
                <div className={"absolute -top-[17px] -right-[32px] "}>
                  <CircleEllipsis className={"w-4 h-4 text-primary"} />
                </div>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((lineItem, index) => (
            <TableRow
              key={index}
              className="divide-x divide-gray-200 hover:bg-none!impotant"
            >
              {lineItem.is_loading && (
                <TableCell colSpan={6}>
                  <div className={"relative h-10 w-full"}>
                    <LoaderComponent mText={""} />
                  </div>
                </TableCell>
              )}
              {!lineItem.is_loading && (
                <>
                  <TableCell className="px-1 py-1 align-top">
                    <div className="w-full flex flex-col space-y-1">
                      {lineItem.item && (
                        <div
                          className={
                            "pl-3 pr-2 flex justify-between w-full py-2"
                          }
                        >
                          <div className="text-sm">{lineItem.item.label}</div>
                          <div className="text-xs text-gray-500">
                            <div className={"flex space-x-1"}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <CircleEllipsis
                                    type={"button"}
                                    className={
                                      "w-4 h-4 text-gray-400 cursor-pointer"
                                    }
                                  />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  side={"bottom"}
                                  align={"end"}
                                  className="w-36"
                                >
                                  <DropdownMenuItem onClick={() => {}}>
                                    View Details{" "}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {}}>
                                    Edit Item{" "}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <XCircle
                                type={"button"}
                                className={
                                  "w-4 h-4 text-gray-400 cursor-pointer"
                                }
                                onClick={() => handleSelectItemRemove(index)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={cn(!lineItem.item ? "" : "hidden")}>
                        <ReactAsyncSelect
                          openMenuOnFocus={true}
                          id={`line_item-${index}`}
                          className={"w-full"}
                          defaultOptions={itemDefaultList}
                          inputId={"item"}
                          loadOptions={handleItemAutoCompleteChange}
                          onFocus={handleItemAutoCompleteInitialFocus}
                          placeholder="Type or select an item"
                          classNames={reactSelectStyle}
                          components={{
                            ...reactSelectComponentOverride,
                            DropdownIndicator: () => null,
                            Option: ITEM_OPTIONS_COMPONENT,
                          }}
                          menuPortalTarget={document.body}
                          isClearable={false}
                          value={lineItem.item}
                          onChange={(e_value) => {
                            handleItemSelect(
                              e_value ? e_value.value : null,
                              index,
                            );
                          }}
                          isLoading={isInitialLoadingInProgress}
                          hideSelectedOptions={true}
                        />
                      </div>

                      {lineItem.item && (
                        <Textarea
                          className="w-full min-h-[40px] border-0 max bg-gray-50/80 text-gray-500"
                          placeholder="Item Description"
                          value={lineItem.description}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-top">
                    <div className={"flex flex-col items-end space-y-2"}>
                      <Input
                        className="w-full border-0 text-right"
                        id="quantity-1"
                        defaultValue={lineItem.quantity}
                        onBlur={(e) => handleQuantityChange(e, index)}
                      />
                      <div className={'w-auto'}>
                        {lineItem.unit &&
                            <Badge className={"text-[10px] px-1 py-0.5 rounded-sm capitalize"}>
                              {lineItem.unit}
                            </Badge>
                        }
                      </div>

                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-top">
                    <div>
                      <Input
                        className="w-full border-0 text-right"
                        id="price-1"
                        value={lineItem.price}
                        onBlur={(e) => handlePriceChange(e, index)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-top">
                    <div>
                      <Input
                        className="w-full border-0 text-right"
                        id="price-1"
                        value={0.0}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-top">
                    <div>
                      <ReactSelect
                        className={"w-full z-100"}
                        options={taxesDropDown}
                        inputId={"tax"}
                        placeholder={"Select tax"}
                        classNames={reactSelectStyle}
                        components={{
                          ...reactSelectComponentOverride,
                          DropdownIndicator: (
                            props: DropdownIndicatorProps,
                          ) => {
                            if (props.selectProps.value) {
                              return null; // Return null to not display anything when a value is selected
                            }
                            return <components.DropdownIndicator {...props} />;
                          },
                        }}
                        menuPortalTarget={document.body}
                        isClearable={true}
                        value={lineItem.tax}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-1 py-1 align-top">
                    <div>0</div>
                    <div className={"relative break-words"}>
                      <div className={"absolute -top-[17px] -right-[32px] "}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CircleEllipsis
                              type={"button"}
                              className={"w-4 h-4 text-primary cursor-pointer"}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-36">
                            <DropdownMenuItem
                              onClick={() => handleNewRowAt(index + 1)}
                            >
                              New Row Below
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleNewRowAt(index - 1)}
                            >
                              New Row Above
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRowCloneAt(index)}
                            >
                              Clone
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {
                        <div className={"absolute -top-[17px] -right-[55px] "}>
                          <XCircle
                            type={"button"}
                            className={
                              "w-4 h-4 text-destructive cursor-pointer"
                            }
                            onClick={() => handleRowRemoveAt(index)}
                          />
                        </div>
                      }
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex mt-2.5">
        <Button
          variant="default"
          className={"border-r-0 rounded-r-none p-2"}
          type={"button"}
          onClick={() => handleNewRowAt(lineItems.length - 1)}
        >
          Add New Row
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size={"icon"}
              className={"ml-[1px] border-l-0 rounded-l-none"}
              type={"button"}
            >
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-36">
            <DropdownMenuItem>Bulk Insert</DropdownMenuItem>
            <DropdownMenuItem>Insert Header</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>{" "}
    </div>
  );
}
export { lineItemSchema };
