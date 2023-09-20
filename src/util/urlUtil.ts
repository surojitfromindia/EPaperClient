const mergePathNameAndSearchParams = ({path_name, search_params}:{path_name:string, search_params:string})=>{
    return path_name+search_params
}
export {
    mergePathNameAndSearchParams
}