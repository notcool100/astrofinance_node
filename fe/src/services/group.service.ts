import apiService from "./api";

export interface Group {
    id: string;
    name: string;
    code: string;
    centerId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    center?: {
        id: string;
        name: string;
    }
}

export const getAllGroups = async (
    search?: string,
): Promise<Group[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    return apiService.get<Group[]>(`/groups?${params.toString()}`);
};

export const getGroupById = async (id: string): Promise<Group> => {
    return apiService.get<Group>(`/groups/${id}`);
};
