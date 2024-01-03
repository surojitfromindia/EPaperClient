class LocalStorageAccess {
  static saveToken(token: string) {
    localStorage.setItem("_ePaperC", token);
  }
  static getToken() {
    return localStorage.getItem("_ePaperC");
  }
  static removeToken() {
    localStorage.removeItem("_ePaperC");
  }
}
export { LocalStorageAccess}