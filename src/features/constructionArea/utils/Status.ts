export const getFloorStatuscolor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
    };

    return map[status] ?? { bg: "#135BEC", text: "#fff" };
};
