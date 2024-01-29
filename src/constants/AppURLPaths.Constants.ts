class INVENTORY {
  static basicPath = "/app/inventory";
  static INDEX = this.basicPath;
  static ITEMS = this.basicPath + "/items";
  static ITEM_CREATE = this.basicPath + "/items/create";
  static ITEM_EDIT = (id: string) => `${this.basicPath}/items/${id}/edit`;
  static ITEM_DETAIL = (id: string) => `${this.basicPath}/items/${id}`;
}

class CUSTOMER {
  static basicPath = "/app/customers";
  static INDEX = this.basicPath;
  static CUSTOMER_CREATE = this.basicPath + "/create";
  static CUSTOMER_EDIT = (id: string) => `${this.basicPath}/${id}/edit`;
  static CUSTOMER_DETAIL = (id: string) => `${this.basicPath}/${id}`;
  static CUSTOMER_DETAIL_COMMENTS = (id: string) =>
    `${this.basicPath}/${id}/comments`;

  static CUSTOMER_DETAIL_TRANSACTIONS = (id: string) =>
    `${this.basicPath}/${id}/transactions`;
}

class INVOICE {
    static basicPath = "/app/invoices";
    static INDEX = this.basicPath;
    static INVOICE_CREATE=(params?:string) => this.basicPath + "/new"+params;
    static INVOICE_EDIT = (id: string) => `${this.basicPath}/${id}/edit`;
    static INVOICE_DETAIL = (id: string) => `${this.basicPath}/${id}`;
    static INVOICE_DETAIL_COMMENTS = (id: string) =>
        `${this.basicPath}/${id}/comments`;

    static INVOICE_DETAIL_TRANSACTIONS = (id: string) =>
        `${this.basicPath}/${id}/transactions`;
}

class APP_PATH {
  static basicPath = "/app";
  static INDEX = this.basicPath;
  static DASHBOARD = "/app/dashboard";
  static INVENTORY = INVENTORY;
  static CUSTOMERS = CUSTOMER;
    static INVOICE = INVOICE;
}

class EPaperURL {
  static HOME = "/";
  static SIGN_UP = "/sign_up";
  static SIGN_IN = "/sign_in";
  static SIGN_OUT = "/sign_out";
  static CREATE_ORGANIZATION = "/new_organization";
  static APP_PAGE = APP_PATH;
}

const AppURLPaths = {
  HOME: EPaperURL.HOME,
  SIGN_UP: EPaperURL.SIGN_UP,
  SIGN_IN: EPaperURL.SIGN_IN,
  SIGN_OUT: EPaperURL.SIGN_OUT,
  CREATE_ORGANIZATION: EPaperURL.CREATE_ORGANIZATION,
  APP_PAGE: {
    INDEX: EPaperURL.APP_PAGE.INDEX,
    DASHBOARD: EPaperURL.APP_PAGE.DASHBOARD,
    INVENTORY: {
      INDEX: EPaperURL.APP_PAGE.INVENTORY.INDEX,
      ITEMS: EPaperURL.APP_PAGE.INVENTORY.ITEMS,
      ITEM_CREATE: EPaperURL.APP_PAGE.INVENTORY.ITEM_CREATE,
      ITEM_EDIT: EPaperURL.APP_PAGE.INVENTORY.ITEM_EDIT,
      ITEM_DETAIL: EPaperURL.APP_PAGE.INVENTORY.ITEM_DETAIL,
    },
    CUSTOMERS: {
      INDEX: EPaperURL.APP_PAGE.CUSTOMERS.INDEX,
      CUSTOMER_CREATE: EPaperURL.APP_PAGE.CUSTOMERS.CUSTOMER_CREATE,
      CUSTOMER_EDIT: EPaperURL.APP_PAGE.CUSTOMERS.CUSTOMER_EDIT,
      CUSTOMER_DETAIL: EPaperURL.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL,
      CUSTOMER_DETAIL_COMMENTS:
        EPaperURL.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL_COMMENTS,
      CUSTOMER_DETAIL_TRANSACTIONS:
        EPaperURL.APP_PAGE.CUSTOMERS.CUSTOMER_DETAIL_TRANSACTIONS,
    },
    INVOICES: {
        INDEX: EPaperURL.APP_PAGE.INVOICE.INDEX,
        INVOICE_CREATE: EPaperURL.APP_PAGE.INVOICE.INVOICE_CREATE,
        INVOICE_EDIT: EPaperURL.APP_PAGE.INVOICE.INVOICE_EDIT,
        INVOICE_DETAIL: EPaperURL.APP_PAGE.INVOICE.INVOICE_DETAIL,
        INVOICE_DETAIL_COMMENTS:
            EPaperURL.APP_PAGE.INVOICE.INVOICE_DETAIL_COMMENTS,
        INVOICE_DETAIL_TRANSACTIONS:
            EPaperURL.APP_PAGE.INVOICE.INVOICE_DETAIL_TRANSACTIONS,
    }
  },
};

export { AppURLPaths };
