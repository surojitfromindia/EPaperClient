class ConnectionUtil {
  // check if there is an active network connection
  // in user's device
  static async checkConnection() {
    window.addEventListener("offline", () => {
      return false;
    });
  }
}
