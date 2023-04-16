import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { USER_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';
import { DateUtility } from '../../../utilities';
import {
    TableDisplayColumnHeading,
    TableLegalIdFilter,
    TableLegalIdFilterLabelMapping,
    TableSortColumnFilter,
    TableSortOrderFilter,
} from './enums';
import { UsersTableDisplay } from './models';
import { UserListService } from './user-list.service';
import { UserListUtility } from './user-list.utility';

@Component({
    selector: 'app-user',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
    protected readonly pageSize = environment.appConfig.userList.numberOfUsersPerPage;

    protected tableLegalIdFilterLabelMapping = TableLegalIdFilterLabelMapping;
    protected tableLegalIdFilter = Object.values(TableLegalIdFilter);
    protected inputFullName?: string;
    protected inputLegalIdType?: string;
    protected inputLegalIdValue?: string;
    protected pageNumber = 1;
    protected inputSortColumn: 'full-name' | 'created-on' | 'last-modified-on' | undefined;
    protected inputSortOrder: 'ascending' | 'descending' | undefined;
    protected canOpenNextPage = false;
    protected tableDataSource = new MatTableDataSource<UsersTableDisplay>();
    protected displayedColumns: string[] = [
        TableDisplayColumnHeading.IndexNumber,
        TableDisplayColumnHeading.FullName,
        TableDisplayColumnHeading.Dob,
        TableDisplayColumnHeading.KtpId,
        TableDisplayColumnHeading.BpjsId,
        TableDisplayColumnHeading.CreatedDate,
        TableDisplayColumnHeading.LastModifiedDate,
    ];

    @ViewChild(MatPaginator)
    private paginator!: MatPaginator;

    constructor(
        private readonly userListService: UserListService,
        private readonly router: Router,
        private readonly dateUtility: DateUtility,
        private readonly userListUtility: UserListUtility,
        private readonly dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        this.pageNumber = this.userListUtility.getPageAttributeFromUrlQueryParam()['page'];

        await this.tryPopulateUsersTable();
    }

    protected async showPreviousUserListPage(): Promise<void> {
        this.pageNumber -= 1;

        this.router.navigateByUrl(USER_PAGE + '?page=' + this.pageNumber);
        await this.tryPopulateUsersTable();
    }

    protected async showNextUserListPage(): Promise<void> {
        this.pageNumber += 1;

        this.router.navigateByUrl(USER_PAGE + '?page=' + this.pageNumber);
        await this.tryPopulateUsersTable();
    }

    protected async onFilterChange(tableSortColumnFilter?: string, tableSortOrderFilter?: string): Promise<void> {
        this.pageNumber = 1;
        window.history.replaceState(null, '', 'user?page=1');

        if (tableSortColumnFilter == TableDisplayColumnHeading.CreatedDate) {
            this.inputSortColumn = TableSortColumnFilter.CreatedOn;
        }

        if (tableSortColumnFilter == TableDisplayColumnHeading.LastModifiedDate) {
            this.inputSortColumn = TableSortColumnFilter.LastModifiedOn;
        }

        if (tableSortColumnFilter == TableDisplayColumnHeading.FullName) {
            this.inputSortColumn = TableSortColumnFilter.FullName;
        }

        if (tableSortOrderFilter == 'asc') {
            this.inputSortOrder = TableSortOrderFilter.Ascending;
        }

        if (tableSortOrderFilter == 'desc') {
            this.inputSortOrder = TableSortOrderFilter.Descending;
        }

        if (tableSortOrderFilter == '') {
            this.inputSortOrder = undefined;
        }

        await this.tryPopulateUsersTable();
    }

    protected async onTableRowClick(userRowDisplay: UsersTableDisplay): Promise<void> {
        await this.router.navigateByUrl(USER_PAGE + '/' + userRowDisplay.userProfileId);
    }

    private async tryPopulateUsersTable(): Promise<void> {
        try {
            const userDataTable: UsersTableDisplay[] = [];

            const users = await this.userListService.getUserProfiles(
                this.inputFullName?.toLowerCase(),
                this.inputLegalIdType,
                this.inputLegalIdValue,
                this.pageNumber,
                this.pageSize,
                this.inputSortColumn,
                this.inputSortOrder,
            );

            for (let n = 0; n < users.length; n++) {
                const user = users[n];

                userDataTable.push({
                    indexNumber: n + (this.pageNumber * 10 - 9),
                    userProfileId: user.id,
                    fullName: user.fullName,
                    dobInString: this.dateUtility.convertDateToDDMMYYYYString(user.dobInISOString),
                    createdDateInString: user.createdDateInISOString
                        ? this.dateUtility.convertDateToDDMMYYYYString(user.createdDateInISOString)
                        : user.createdDateInISOString,
                    lastModifiedDateInString: user.lastModifiedDateInISOString
                        ? this.dateUtility.convertDateToDDMMYYYYString(user.lastModifiedDateInISOString)
                        : user.lastModifiedDateInISOString,
                    ktpId: user.legalIds[0][LegalIdTypeEnum.KtpId],
                    bpjsId: user.legalIds[0][LegalIdTypeEnum.BpjsId],
                });
            }

            this.canOpenNextPage = userDataTable.length === this.pageSize;

            this.tableDataSource = new MatTableDataSource<UsersTableDisplay>(userDataTable);
            this.tableDataSource.paginator = this.paginator;
        } catch (error) {
            this.showErrorModal();
            console.log(error);
            return;
        }
    }

    private showErrorModal(): void {
        this.dialog.open(ConfirmationDialogComponent, {
            hasBackdrop: true,
            data: {
                title: 'Error',
                message: 'Gagal mendapatkan data. Coba lagi.',
                confirmationMessage: 'Ok',
            },
        });
    }
}
