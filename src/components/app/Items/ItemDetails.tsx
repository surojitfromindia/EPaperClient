import { Button } from "@/components/ui/button.tsx";
import { ChevronDown, Edit, Pencil, X } from "lucide-react";
import { mergePathNameAndSearchParams } from "@/util/urlUtil.ts";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import * as React from "react";
import ItemService, { Item } from "@/API/Resources/v1/Item/Item.Service.ts";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import { useAppSelector } from "@/redux/hooks.ts";
import { RNumberFormatAsText } from "@/components/app/common/RNumberFormat.tsx";
const itemService = new ItemService();

export default function ItemDetails() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const { item_id_param } = useParams();
  const currentActiveTab = useMemo(() => {
    const lastPath = pathname.split("/").pop();
    switch (lastPath) {
      case "transactions":
        return "transactions";
      case "history":
        return "history";
      default:
        return "overview";
    }
  }, [pathname]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState<Item>();
  const editItemId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(item_id_param ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [item_id_param]);
  const loadEditPage = useCallback(() => {
    setIsLoading(true);
    itemService
      .getItem({
        item_id: editItemId,
      })
      .then((data) => {
        setItemDetails(data?.item);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [editItemId]);

  const handleCloseClick = () => {
    navigate(
      mergePathNameAndSearchParams({
        path_name: "/app/inventory/items",
        search_params: search,
      }),
    );
  };
  const handleEditClick = useCallback(() => {
    navigate(`/app/inventory/items/${editItemId}/edit`);
  }, [editItemId, navigate]);
  const handleTransactionTabClick = () => {
    navigate(`/app/inventory/items/${editItemId}/transactions`);
  };
  const handleOverViewTabClick = () => {
    navigate(`/app/inventory/items/${editItemId}`);
  };

  // effects
  useEffect(() => {
    loadEditPage();
    return () => {
      itemService.abortGetRequest();
    };
  }, [loadEditPage]);

  if (isLoading) {
    return (
      <div className={"relative h-screen"}>
        <LoaderComponent />
      </div>
    );
  }
  return (
    <main className={"flex flex-col h-screen "}>
      <section className={"pl-5 pr-2 py-3 "}>
        <div className={"flex items-center justify-between h-10"}>
          <div className={"flex flex-col"}>
            <span className={"font-medium text-xl"}>{itemDetails?.name}</span>
          </div>
          <div>
            <span className={"text-xs flex space-x-1"}>
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={handleEditClick}
              >
                <Pencil className={"w-4 h-4"} />
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>
                    More
                    <ChevronDown className={"w-4 h-4 ml-1"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="text-sm w-56 bg-gray-50 outline-none  p-1"
                  align={"end"}
                >
                  <DropdownMenuItem
                    className={"menu-item-ok"}
                    role={"button"}
                    onClick={handleEditClick}
                  >
                    <Edit className={"h-4 w-4"} />
                    <span>Configure</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={"menu-item-danger"}
                    role={"button"}
                  >
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant={"ghost"} onClick={handleCloseClick}>
                <X className={"w-4 h-4"} />
              </Button>
            </span>
          </div>
        </div>
      </section>

      <Tabs
        defaultValue={currentActiveTab}
        className="mt-3 overflow-y-scroll flex-1 flex-grow"
      >
        <div className={"w-full ml-4 top-0  sticky bg-background"}>
          <TabsList className={" "}>
            <TabsTrigger
              onClick={handleOverViewTabClick}
              value="overview"
              className={"capitalize"}
            >
              overview
            </TabsTrigger>
            <TabsTrigger
              onClick={handleTransactionTabClick}
              value="transactions"
              className={"capitalize"}
            >
              transactions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className={"px-5"}>
            <ItemOverView itemDetails={itemDetails} />
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          <Outlet />
        </TabsContent>
      </Tabs>
    </main>
  );
}
interface ItemOverViewProps extends React.HTMLAttributes<HTMLDivElement> {
  itemDetails?: Item;
}

function ItemOverView({ itemDetails }: ItemOverViewProps) {
  const organizationCurrencyCode = useAppSelector(
    ({ organization }) => organization.currency_code,
  );
  return (
    <div className={"grid grid-cols-3 mt-8 mb-20"}>
      <div className={"col-span-2 max-w-sm space-y-11"}>
        <div className={"flex flex-col space-y-4 text-sm"}>
          <div className={"grid grid-cols-10 capitalize space-x-3"}>
            <span className={"col-span-3 text-muted-foreground"}>
              item type
            </span>
            <span className={"col-span-7"}>
              {itemDetails?.item_for_formatted}
            </span>
          </div>{" "}
          <div className={"grid grid-cols-10 capitalize space-x-3"}>
            <span className={"col-span-3 text-muted-foreground"}>
              product type
            </span>
            <span className={"col-span-7"}>
              {itemDetails?.product_type_formatted}
            </span>
          </div>{" "}
          <div className={"grid grid-cols-10 capitalize space-x-3"}>
            <span className={"col-span-3 text-muted-foreground"}>unit</span>
            <span className={"col-span-7"}>{itemDetails?.unit}</span>
          </div>{" "}
          <div className={"grid grid-cols-10 capitalize space-x-3"}>
            <span className={"col-span-3 text-muted-foreground flex-wrap"}>
              created source
            </span>
            <span className={"col-span-7"}>user</span>
          </div>
        </div>
        {/*selling info*/}
        {(itemDetails?.item_for === "sales" ||
          itemDetails?.item_for === "sales_and_purchase") && (
          <div>
            <div className={"capitalize mb-5"}>sales information</div>
            <div className={"flex flex-col space-y-3 text-sm"}>
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground"}>
                  selling price
                </span>
                <span className={"col-span-7"}>
                  <RNumberFormatAsText
                    value={itemDetails?.selling_price}
                    thousandSeparator={true}
                    prefix={organizationCurrencyCode}
                  />
                </span>
              </div>{" "}
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground"}>
                  sales account
                </span>
                <span className={"col-span-7"}>
                  {itemDetails?.sales_account_name}
                </span>
              </div>{" "}
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground flex-wrap"}>
                  description
                </span>
                <span className={"col-span-7"}>
                  {itemDetails?.selling_description}
                </span>
              </div>
            </div>
          </div>
        )}
        {/*purchase info*/}
        {(itemDetails?.item_for === "purchase" ||
          itemDetails?.item_for === "sales_and_purchase") && (
          <div>
            <div className={"capitalize mb-5"}>purchase information</div>
            <div className={"flex flex-col space-y-3 text-sm"}>
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground"}>
                  cost price
                </span>
                <span className={"col-span-7"}>
                  <RNumberFormatAsText
                    value={itemDetails?.purchase_price}
                    thousandSeparator={true}
                    prefix={organizationCurrencyCode}
                  />
                </span>
              </div>{" "}
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground"}>
                  purchase account
                </span>
                <span className={"col-span-7"}>
                  {itemDetails?.purchase_account_name}
                </span>
              </div>{" "}
              <div className={"grid grid-cols-10 capitalize space-x-3"}>
                <span className={"col-span-3 text-muted-foreground flex-wrap"}>
                  description
                </span>
                <span className={"col-span-7"}>
                  {itemDetails?.purchase_description}
                </span>
              </div>
            </div>
          </div>
        )}{" "}
      </div>
    </div>
  );
}
