class INVENTORY {
  static basicPath = "/app/inventory";
  static INDEX = this.basicPath;
  static ITEMS = this.basicPath + "/items";
  static ITEM_CREATE = this.basicPath + "/items/create";
  static ITEM_EDIT = (id: string) => `${this.basicPath}/items/${id}/edit`;
  static ITEM_DETAIL = (id: string) => `${this.basicPath}/items/${id}`;
  static ITEM_DETAIL_COMMENTS = (id: string) =>
    `${this.basicPath}/items/${id}/comments`;
  static ITEM_DETAIL_TRANSACTIONS = (id: string) =>
    `${this.basicPath}/items/${id}/transactions`;
}

class CUSTOMER {
  static basicPath = "/app/customers";
  static INDEX = this.basicPath;
  static CUSTOMER_CREATE = this.basicPath + "/new";
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
  static INVOICE_CREATE = (params?: string) => this.basicPath + "/new" + params;
  static INVOICE_EDIT = (id: string) => `${this.basicPath}/${id}/edit`;
  static INVOICE_DETAIL = (id: string) => `${this.basicPath}/${id}`;
  static INVOICE_DETAIL_COMMENTS = (id: string) =>
    `${this.basicPath}/${id}/comments`;

  static INVOICE_DETAIL_TRANSACTIONS = (id: string) =>
    `${this.basicPath}/${id}/transactions`;
}

// home page of the app it will have dashboard and get started and other pages
class APP_HOME {
  static basicPath = "/app/home";
  static INDEX = this.basicPath;
  static DASHBOARD = this.basicPath + "/dashboard";
  static GET_STARTED = this.basicPath + "/get_started";
}

class APP_PAGE {
  static basicPath = "/app";
  static INDEX = APP_HOME.INDEX;
  static APP_HOME = APP_HOME;
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
  static APP_PAGE = APP_PAGE;
}

const AppURLPaths = {
  HOME: EPaperURL.HOME,
  SIGN_UP: EPaperURL.SIGN_UP,
  SIGN_IN: EPaperURL.SIGN_IN,
  SIGN_OUT: EPaperURL.SIGN_OUT,
  CREATE_ORGANIZATION: EPaperURL.CREATE_ORGANIZATION,
  APP_PAGE: {
    INDEX: EPaperURL.APP_PAGE.APP_HOME.INDEX,
    APP_HOME: {
      INDEX: EPaperURL.APP_PAGE.APP_HOME.INDEX,
      DASHBOARD: EPaperURL.APP_PAGE.APP_HOME.DASHBOARD,
      GET_STARTED: EPaperURL.APP_PAGE.APP_HOME.GET_STARTED,
    },

    INVENTORY: {
      INDEX: EPaperURL.APP_PAGE.INVENTORY.INDEX,
      ITEMS: EPaperURL.APP_PAGE.INVENTORY.ITEMS,
      ITEM_CREATE: EPaperURL.APP_PAGE.INVENTORY.ITEM_CREATE,
      ITEM_EDIT: EPaperURL.APP_PAGE.INVENTORY.ITEM_EDIT,
      ITEM_DETAIL: EPaperURL.APP_PAGE.INVENTORY.ITEM_DETAIL,
      ITEM_DETAIL_COMMENTS: EPaperURL.APP_PAGE.INVENTORY.ITEM_DETAIL_COMMENTS,
      ITEM_DETAIL_TRANSACTIONS:
        EPaperURL.APP_PAGE.INVENTORY.ITEM_DETAIL_TRANSACTIONS,
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
    },
  },
};

export { AppURLPaths };
