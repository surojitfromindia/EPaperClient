class INVENTORY {
  static basicPath = "/app/inventory";
  static INDEX = this.basicPath;
  static ITEMS = this.basicPath + "/items";
  static ITEM_CREATE = this.basicPath + "/items/create";
  static ITEM_EDIT = (id: string) => `${this.basicPath}/items/${id}/edit`;
  static ITEM_DETAIL = (id: string) => `${this.basicPath}/items/${id}`;
}
class APP_PATH {
  static basicPath = "/app";
  static INDEX = this.basicPath;
  static DASHBOARD = "/app/dashboard";
  static INVENTORY = INVENTORY;
}

class EPaperURL {
  static HOME = "/";
  static SIGN_UP = "/sign_up";
  static SIGN_IN = "/sign_in";
  static SIGN_OUT = "/sign_out";
  static APP_PAGE = APP_PATH;
}

const AppURLPaths = {
  HOME: EPaperURL.HOME,
  SIGN_UP: EPaperURL.SIGN_UP,
  SIGN_IN: EPaperURL.SIGN_IN,
  SIGN_OUT: EPaperURL.SIGN_OUT,
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
  },
};

export { AppURLPaths };
