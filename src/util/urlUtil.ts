const mergePathNameAndSearchParams = ({ path_name, search_params }: { path_name: string; search_params: string }) => {
  let url = path_name;
  // if search_params is not empty, and it does not start with "?", then add "?" to the beginning of search_params
  if (search_params && search_params.length > 0 && search_params[0] !== '?') {
    url += '?';
  }

  return url + search_params;
};
const updateOrAddSearchParam = ({ search_string, key, value }: { search_string: string; key: string; value: string }) => {
  const searchParams = new URLSearchParams(search_string);
  searchParams.set(key, value);
  return searchParams.toString();
};

const updateOrAddSearchParams = (search_string: string, params: { key: string; value: string }[]) => {
  const searchParams = new URLSearchParams(search_string);
  for (const e of params) {
    searchParams.set(e.key, e.value);
  }
  return searchParams.toString();

};

export { mergePathNameAndSearchParams, updateOrAddSearchParam,updateOrAddSearchParams };
