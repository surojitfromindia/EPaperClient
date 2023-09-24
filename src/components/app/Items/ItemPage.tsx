import ItemService, { Item } from "@/API/Resources/v1/Item/Item.Service.ts";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import {ItemListing} from "@/components/app/Items/ItemListing.tsx";
import {toast} from "@/components/ui/use-toast.ts";
type OnItemsDeleteSuccess = (
    action_type: "delete",
    item_ids: number[],
) => void;
type OnItemAddOrEditSuccess = (
    action_type: "add" | "edit",
    item_id: number,
) => void;
type OnItemModification = OnItemAddOrEditSuccess &
    OnItemsDeleteSuccess;

const itemService = new ItemService();

export function ItemPage() {
  const navigate = useNavigate()
  const { item_id } = useParams();
  const selectedAccountId = useMemo(() => {
    //try to parse the number, check the return if NaN then return nothing from this memo
    const parseResult = Number.parseInt(item_id ?? "");
    if (!Number.isNaN(parseResult)) {
      return parseResult;
    }
  }, [item_id]);
  const isDetailsPageOpen: boolean =
      selectedAccountId && selectedAccountId > 0 ? true : false;

  // states
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [, setIsEditModalOpen] = useState<boolean>(false);
  const [, setEditingItemId] = useState<number>();

  const loadItems = useCallback(() => {
    itemService.getItems().then((items) => {
      setItems(items?.items ?? []);
      setIsLoading(false);
    });
  }, []);

  const onItemEditClick = useCallback((edit_item_id?: number) => {
    if (edit_item_id) {
      setEditingItemId(edit_item_id);
    } else {
      setEditingItemId(undefined);
    }
    setIsEditModalOpen((prev) => !prev);
  }, []);

  const onItemAddClick = useCallback(() => {
    navigate("/app/inventory/items/new")
  }, []);

  const onItemModificationSuccess = useCallback<OnItemModification>(
      (action_type) => {
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

  // get all charts of accounts
  useEffect(() => {
    loadItems();
    return () => {
      itemService.abortGetRequest();
    };
  }, [loadItems]);


  return (

      <>
        <div className={"grid grid-cols-3"}>
          <div className={isDetailsPageOpen ? `col-span-1` : "col-span-3"}>
            <ItemListing
                shrinkTable={isDetailsPageOpen}
                selectedItemId={selectedAccountId}
                items={items}
                isItemsFetching={isLoading}
                onItemModificationSuccess={onItemModificationSuccess}
                onItemEditClick={onItemEditClick}
                onItemAddClick={onItemAddClick}
            />
          </div>
          { (
              <div className={"col-span-2"}>
                <Outlet />
              </div>
          )}
        </div>

      </>
  );
}
