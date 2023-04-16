export enum TableLegalIdFilter {
    None = 'None',
    KtpId = 'ktp-id',
    BpjsId = 'bpjs-id',
}

export const TableLegalIdFilterLabelMapping: Record<TableLegalIdFilter, string> = {
    [TableLegalIdFilter.None]: '-',
    [TableLegalIdFilter.KtpId]: 'Ktp',
    [TableLegalIdFilter.BpjsId]: 'Bpjs',
};
