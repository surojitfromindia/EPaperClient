class LocalStorageAccess {
  static saveToken(token: string) {
    localStorage.setItem("_ePaperC", token);
  }
  static saveOrganizationId(organizationId: string) {
    localStorage.setItem("currentOrganizationId", organizationId);
  }
  static getOrganizationId() {
    return localStorage.getItem("currentOrganizationId");
  }
  static getToken() {
    return localStorage.getItem("_ePaperC");
  }
  static removeToken() {
    localStorage.removeItem("_ePaperC");
  }
  static removeAccessInfo() {
    localStorage.removeItem("_ePaperC");
    localStorage.removeItem("currentOrganizationId");
  }
}
export { LocalStorageAccess };
