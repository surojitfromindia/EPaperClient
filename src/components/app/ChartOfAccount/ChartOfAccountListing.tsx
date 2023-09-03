import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import React, {useMemo} from "react";
import {ChartOfAccount} from "@/API/Resources/v1/ChartOfAccount.Service.ts";
import {FolderIcon} from "lucide-react";

const DEPTH_OFFSET = 2;

interface ChartOfAccountListingProps extends React.HTMLAttributes<HTMLDivElement> {
    accounts: ChartOfAccount[]
}

export function ChartOfAccountListing({accounts}: ChartOfAccountListingProps) {
    const GiveSpace = (account_depth: number, account_bar: number[], has_children: boolean) => {
        const SShape = []
        const depth = account_depth - DEPTH_OFFSET;
        if (account_bar.length > 1) {
            const IShape = <span className={"intermediary-nodes"}> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
            const SpaceBetweenShape = <span> &nbsp;&nbsp;&nbsp;&nbsp; </span>
            const SpaceBetweenShapeInInter = <span> &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; </span>
            let LShape = <span className={"display-node-name"}> &nbsp;&nbsp;&nbsp;&nbsp; </span>;
            if (has_children) {
                // if it has some children, we add more space around
                LShape = <span className={"display-node-name"}> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>;
            }
            for (let s = 1; s < depth; s += 1) {
                // if the number is positive, we add '|' shape
                //if not a string of spaces, number of space after "|" is smaller than regular
                if (account_bar[s] > 0) {
                    SShape.push(IShape)
                    SShape.push(SpaceBetweenShape)
                } else {
                    SShape.push(SpaceBetweenShapeInInter)
                }

            }
            SShape.push(LShape)
        }
        let iconBasic = "h-4 w-4 mr-1 mb-0.5 inline -ml-4"
        if (has_children) {
            // prepare the folder icon, custom margin
            if (account_bar.length !== 1) {
                iconBasic += " -ml-[4px]"
            }
            SShape.push(<FolderIcon className={iconBasic}/>)
        }
        return React.createElement("span", {}, React.Children.map(SShape,children=><React.Fragment>{children}</React.Fragment>));
    }

    const accountsWithTreeFormat = useMemo(() => {
        return generateTreeLine(accounts)
    }, [accounts])

    return (<>
        <main>
            <section className={"flex mb-6"}>
                <h1 className={"text-xl"}>
                    Chart of Accounts
                </h1>
            </section>
            <section className={"mb-12"}>
                <Table className={"h-full"}>
                    <TableHeader>
                        <TableRow className={"uppercase"}>
                            <TableHead>account name</TableHead>
                            <TableHead>account code</TableHead>
                            <TableHead>parent account</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accountsWithTreeFormat.map((account) => (<TableRow className={""} key={account.account_id}>
                            <TableCell>
                                <>
                                    <span className={"font-medium text-center "}>
                                        {GiveSpace(account.depth, account.bar, account.no_of_children > 0)}
                                        <span className={" whitespace-nowrap"}>{account.name}</span>
                                    </span>
                                </>
                            </TableCell>
                            <TableCell>{account.code}</TableCell>
                            <TableCell>{account.account_parent_name}</TableCell>
                        </TableRow>))}

                    </TableBody>
                </Table>
            </section>
        </main>
    </>)
}


const generateTreeLine = (flatArray: ChartOfAccount[], depthOffSet = DEPTH_OFFSET) => {
    let aux = [0];
    const newArray: ({ bar: number[] } & ChartOfAccount)[] = [];
    for (const el of flatArray) {
        if ((el.depth === depthOffSet)) {
            // at root we reset
            aux = [0]
            newArray.push({...el, bar: Array.from(aux)});
            if (el.no_of_children > 0) {
                aux.push(el.no_of_children)
            }

        } else {
            // read the last element
            const pointerDepth = el.depth - depthOffSet;
            newArray.push({...el, bar: Array.from(aux)})
            if (aux[pointerDepth] > 0) {
                aux[pointerDepth] -= 1;
            }
            // if it has children more than zero, then push the count
            // after updating the last element
            if (el.no_of_children > 0) {
                // either update an existing position or push
                if (pointerDepth + 1 >= aux.length) {
                    aux.push(el.no_of_children)

                } else {
                    aux[pointerDepth + 1] += el.no_of_children;
                }
            }


        }
    }
    return newArray;
};
