export const get = async (endpoint, request, baseURL) => {
    const parameters = new URLSearchParams(request).toString();
    const response = await fetch(`${baseURL}/${endpoint}?${parameters}`);
    if (!response.ok) throw new Error(`in GET/${endpoint}: ${response.statusText}`);
    return await response.json();
}
  
export const post = async (endpoint, request, baseURL) => {
    const postOptions = { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)};
    const response = await fetch(`${baseURL}/${endpoint}`, postOptions);
    if (!response.ok) throw new Error(`in POST/${endpoint}: ${response.statusText}`);
    return await response.json();
}  