import axios from "axios";
const axiosInstance = axios.create({
    baseURL: `${import.meta.env["VITE_AUTH_BASE_URL"]}/v1`,
    // withCredentials:true,
});

const PostRequestWrapper = async(url:string, payload:unknown)=>{
    try {
        console.log("payload===>", payload)
        const axiosResponse = await axiosInstance.post(url,payload);
        if(axiosResponse.data.success){
            return axiosResponse.data.data;
        }
    }
    catch (error:unknown){
        ResponseErrorHandler(error)
    }
}

const ResponseErrorHandler = (error: unknown)=>{
    if(axios.isAxiosError(error)){
        throw new Error("Axios error")
    }
    else{
        console.log(error)
        throw new Error("Unknown error")
    }
}

export default PostRequestWrapper;