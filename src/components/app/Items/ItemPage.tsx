import ItemService, { Item } from "@/API/Resources/v1/Item/Item.Service.ts";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ItemListing } from "@/components/app/Items/ItemListing.tsx";
import { toast } from "@/components/ui/use-toast.ts";
import classNames from "classnames";
type OnItemsDeleteSuccess = (action_type: "delete", item_ids: number[]) => void;
type OnItemAddOrEditSuccess = (
  action_type: "add" | "edit",
  item_id: number,
) => void;
type OnItemModification = OnItemAddOrEditSuccess & OnItemsDeleteSuccess;

const itemService = new ItemService();

export function ItemPage() {
  const navigate = useNavigate();
  const { item_id } = useParams();
  const selectedItemId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(item_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [item_id]);
  const isDetailsPageOpen: boolean = !!(
    selectedItemId && selectedItemId > 0
  );

  // states
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const loadItems = useCallback(() => {
    itemService.getItems().then((items) => {
      setItems(items?.items ?? []);
      setIsLoading(false);
    });
  }, []);



  const onItemAddClick = useCallback(() => {
    navigate("/app/inventory/items/new");
  }, [navigate]);
  useCallback<OnItemModification>(
      (action_type: string) => {
        if (action_type === "add") {
          toast({
            title: "Success",
            description: "Item is added successfully",
          });
        } else if (action_type === "edit") {
          toast({
            title: "Success",
            description: "Item is updated successfully",
          });
        } else if (action_type === "delete") {
          toast({
            title: "Success",
            description: "Item is delete successfully",
          });
        }
        loadItems();
      },
      [loadItems],
  );
  useEffect(() => {
    loadItems();
    return () => {
      itemService.abortGetRequest();
    };
  }, [loadItems]);

  return (
    <>
      <div className={"grid grid-cols-8"}>
        <div
          className={classNames(
            "col-span-8",
            isDetailsPageOpen && ` hidden lg:block lg:col-span-3`,
          )}
        >
          <ItemListing
            shrinkTable={isDetailsPageOpen}
            selectedItemId={selectedItemId}
            items={items}
            isItemsFetching={isLoading}
            onItemAddClick={onItemAddClick}
          />
        </div>
        {isDetailsPageOpen && (
          <div className={"col-span-8 lg:col-span-5"}>
            <Outlet />
          </div>
        )}
      </div>
    </>
  );
}
