export interface UserProfileDtoOutput {
    id: string;
    fullName: string;
    dobInISOString: string;
    legalIds: Record<string, string>[];
    metadata: Record<string, string>[];
    createdDateInISOString: string;
    lastModifiedDateInISOString: string;
}
