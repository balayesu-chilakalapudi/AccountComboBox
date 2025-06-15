import { LightningElement, wire, track, api } from 'lwc';
import getAccountRecords from '@salesforce/apex/AccountController.getAccountRecords';
import saveAccountOnCase from '@salesforce/apex/AccountController.saveAccountOnCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountComboBox extends NavigationMixin(LightningElement) {
    @track accountOptions = [];
    @track selectedAccounts = [];
    @track filteredAccounts = [];
    searchQuery

    // Wire Apex method to fetch account records
    @wire(getAccountRecords)
    wiredAccounts({ error, data }) {
        if (data) {
            // Transform the account records into options for dual listbox
            this.accountOptions = data.map(account => ({
                label: account.Name,
                value: account.Id
            }));
            this.filteredAccounts = [...this.accountOptions];
        } else if (error) {
            // Handle error if necessary
            console.error('Error fetching Accounts:', error);
        }
    }

    // Event handler for selected account changes
    handleAccountSelection(event) {
        try {
            console.log('handleAccountSelection:' + event.detail.value);
            this.selectedAccounts = event.detail.value;
            console.log('selected Accounts:' + this.selectedAccounts);
        } catch (err) {
            console.log(err.stack);
        }
    }

    // Handle form submission
    @api handleSubmit() {
        if (this.selectedAccounts.length > 0) {
            console.log('Selected Accounts:', this.selectedAccounts);
            this.handleSaveAccounts();
            // You can perform other actions such as sending the selected accounts to the server
        } else {
            console.log('No accounts selected.');
            let message = 'No accounts selected.';
            this.showToast('Error', message, 'error');
        }
    }

    handleSearchChange(event) {
        this.searchQuery = event.target.value.toLowerCase();

        let filtered = [];

        if (this.searchQuery) {
            filtered = this.accountOptions.filter(account =>
                account.label.toLowerCase().includes(this.searchQuery)
            );
        } else {
            filtered = [...this.accountOptions];
        }

        // 👉 Now: Remove selected accounts from filtered options
        const availableOptions = filtered.filter(account =>
            !this.selectedAccounts.includes(account.value)
        );

        // 👉 Merge selected options separately to always show them
        const selectedOptions = this.accountOptions.filter(account =>
            this.selectedAccounts.includes(account.value)
        );

        // 👉 Combine selected + available (dual listbox expects both)
        const mergedOptions = [...selectedOptions, ...availableOptions];

        this.filteredAccounts = mergedOptions;
    }


    handleSaveAccounts() {
        if (this.selectedAccounts.length === 0) {
            this.showToast('Error', 'Please select at least one Account.', 'error');
            return;
        }

        const selectedAccountIds = this.selectedAccounts.join(',');

        try {
            this.dispatchEvent(new CustomEvent('editsave', {
                detail: { selectedAccountIds: selectedAccountIds }
            }));
            console.log('event dispatched');
        } catch (err) {
            console.log(err.stack);
        }

        /*saveAccountOnCase({ selecteAccounts: selectedAccountIds })
            .then(result => {
                this.showToast('Success', 'Case and AccountCase records created successfully!', 'success');
                console.log('New Case Id:', result);
                // Optionally navigate or reset form
                // Navigate to Case record page
            })
            .catch(error => {
                console.error('Error saving accounts on case:', error);
                let message = 'Unknown error';
                if (Array.isArray(error.body)) {
                    message = error.body.map(e => e.message).join(', ');
                } else if (typeof error.body.message === 'string') {
                    message = error.body.message;
                }
                this.showToast('Error', message, 'error');
            });*/
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

}