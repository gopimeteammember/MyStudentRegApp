import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { StudentForm } from '../reg-form/reg-form';
import { MyStudent, StatusMessage } from '../student';

@Component({
  selector: 'app-edit-student-dialog',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDialogModule, MatButtonModule, EditStudentDialog, StudentForm], 
  template: `
    <mat-card class="max-w-xl w-full rounded-lg shadow-2xl font-inter">
      <mat-card-title class="pt-4 px-4 text-xl font-semibold flex items-center justify-between border-b border-gray-100 pb-2">
        <span class="flex items-center text-gray-800">
          <mat-icon class="mr-2">{{ data.student ? 'edit_square' : 'person_add' }}</mat-icon> 
          {{ data.student ? 'Edit Student Details' : 'Register New Student' }}
        </span>
        <!-- Button to close the dialog with null result (cancel/close) -->
        <button mat-icon-button [mat-dialog-close]="null" class="text-gray-500 hover:text-gray-900">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-title>
      <mat-card-content class="mt-4 p-4">
        <!-- StudentForm handles the actual input and saving -->
        <app-reg-form 
          [studentToEdit]="data.student" 
          (studentSaved)="handleStudentSaved($event)"
          (cancelEdit)="closeDialog(null)"
        ></app-reg-form>
      </mat-card-content>
    </mat-card>
  `,
})
export class EditStudentDialog {
  // Inject MAT_DIALOG_DATA to receive the student object or null (for registration)
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { student: MyStudent | null },
    // The dialog returns a StatusMessage if successful, or null if canceled
    public dialogRef: MatDialogRef<EditStudentDialog, StatusMessage | null>
  ) {}

  /**
   * Handles the successful save event from the StudentForm.
   * Closes the dialog and passes the success message back to the main component.
   */
  handleStudentSaved(message: StatusMessage): void {
    // Close dialog and return the message data
    this.dialogRef.close(message);
  }
  
  /**
   * Closes the dialog, returning null (for cancel/escape/form cancel button).
   */
  closeDialog(result: null): void {
    this.dialogRef.close(result);
  }
}
