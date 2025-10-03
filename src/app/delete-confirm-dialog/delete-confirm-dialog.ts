import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MyStudent } from '../student';

export @Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  // MatDialogModule is required for mat-dialog-close
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule], 
  template: `
    <mat-card class="max-w-sm w-full rounded-lg shadow-2xl font-inter">
      <mat-card-title class="pt-4 px-4 text-xl font-semibold text-red-700 flex items-center">
        <mat-icon class="mr-2">warning</mat-icon> Confirm Deletion
      </mat-card-title>
      <mat-card-content class="mt-4 p-4">
        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to delete the student: 
          <!-- Access data passed from the parent component -->
          <span class="font-bold text-gray-800">{{ data.student.firstName }} {{ data.student.lastName }}</span>?
          <br>This action cannot be undone.
        </p>
      </mat-card-content>
      <mat-card-actions class="flex justify-end space-x-3 p-4 border-t border-gray-100">
        <!-- Cancel Button: Closes the dialog and returns 'false' to the main component -->
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <!-- Delete Button: Closes the dialog and returns 'true' to the main component -->
        <button mat-flat-button color="warn" [mat-dialog-close]="true">
          <mat-icon class="!text-base mr-1">delete_forever</mat-icon> Delete
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
class DeleteConfirmDialog {
  // Inject MAT_DIALOG_DATA to receive the student object and MatDialogRef to manage the dialog instance
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { student: MyStudent },
    public dialogRef: MatDialogRef<DeleteConfirmDialog, boolean>
  ) {}
}
