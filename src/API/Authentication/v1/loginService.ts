import PostRequestWrapper from "@/API/Authentication/v1/axiosConfig.ts";

interface LoginWithEmailPayload {
  email: string;
  password: string;
}
interface SignUpPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

class AuthenticationService {
  static loginWithEmail = (payload: LoginWithEmailPayload) => {
    return PostRequestWrapper("/accounts/login", payload);
  };
  static signUp = (payload: SignUpPayload) => {
    return PostRequestWrapper("/accounts", payload);
  };
}

export default AuthenticationService;
export type { LoginWithEmailPayload, SignUpPayload };
