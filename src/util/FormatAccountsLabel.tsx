import { ChartOfAccount } from "@/API/Resources/v1/ChartOfAccount/ChartOfAccount.Service.ts";
import { elementRepeat } from "@/util/accountUtil.ts";
import React from "react";
import { FormatOptionLabelContext } from "react-select";

const FormatAccountLabel = (account: ChartOfAccount) => {
  const fourSpace = <span>&ensp;&nbsp;</span>;
  const labelChildren = [];
  if (account.depth > 0) {
    labelChildren.push(...elementRepeat(fourSpace, account.depth));
    labelChildren.push(<span>-&nbsp;&nbsp;</span>);
  }
  labelChildren.push(<span>{account.account_name}</span>);

  return React.createElement(
    "span",
    {},
    React.Children.map(labelChildren, (children) => (
      <React.Fragment>{children}</React.Fragment>
    )),
  );
};

const formatOptionLabelOfAccounts = (
  option: ChartOfAccount,
  { context }: { context: FormatOptionLabelContext },
) => {
  return context === "menu" ? FormatAccountLabel(option) : option.account_name;
};
export { FormatAccountLabel,formatOptionLabelOfAccounts };
