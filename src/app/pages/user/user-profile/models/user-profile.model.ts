export interface UserProfile {
    id: string;
    fullName: string;
    dobInString: string;
    createdDateInString: string;
    lastModifiedDateInString: string | undefined;
    ktpId: string | undefined;
    bpjsId: string | undefined;
    hasRecognitionData: boolean;
}
