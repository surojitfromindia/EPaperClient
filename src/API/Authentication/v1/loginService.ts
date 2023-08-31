import PostRequestWrapper from "@/API/Authentication/v1/axiosConfig.ts";

interface LoginWithEmailPayload{
    email : string,
    password: string,
}

class AuthenticationService{
    static loginWithEmail = (payload: LoginWithEmailPayload)=>{
        return PostRequestWrapper("/accounts/login",payload)
    }
}

export default AuthenticationService;

