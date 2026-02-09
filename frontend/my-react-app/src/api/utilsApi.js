import { BASE_URL, authHeaders, handleResponse } from "./http";

export async function fetchPreviewId(module, projectName, account) {
    const params = new URLSearchParams({
        module,
        projectName: projectName || "",
        account: account || ""
    });

    const res = await fetch(`${BASE_URL}/utils/preview-id?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
    });

    return handleResponse(res);
}
