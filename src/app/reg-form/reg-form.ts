import { Component, computed, effect, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyStudent, StatusMessage, Student } from '../student'; // Import the service
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { StudentDashboard } from '../app';

 export @Component({
  selector: 'app-reg-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <!-- Added space-y-4 to the form for vertical spacing between fields -->
    <form [formGroup]="studentForm" (ngSubmit)="saveStudent()" class="flex flex-col space-y-4">
      
      <!-- Field 1: First Name (Full Width) -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label class="text-sm">First Name</mat-label>
        <input matInput formControlName="firstName" required class="text-sm">
        <mat-error *ngIf="studentForm.get('firstName')?.invalid && studentForm.get('firstName')?.touched">
          First Name is required.
        </mat-error>
      </mat-form-field>

      <!-- Field 2: Last Name (Full Width) -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label class="text-sm">Last Name</mat-label>
        <input matInput formControlName="lastName" required class="text-sm">
        <mat-error *ngIf="studentForm.get('lastName')?.invalid && studentForm.get('lastName')?.touched">
          Last Name is required.
        </mat-error>
      </mat-form-field>

      <!-- Field 3: Email (Full Width) -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label class="text-sm">Email</mat-label>
        <input matInput formControlName="email" type="email" required class="text-sm">
        <mat-error *ngIf="studentForm.get('email')?.invalid && studentForm.get('email')?.touched">
          Valid Email is required.
        </mat-error>
      </mat-form-field>

      <!-- Field 4: Course (Mat-Select Dropdown) -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label class="text-sm">Course</mat-label>
        <mat-select formControlName="course" required class="text-sm">
          <mat-option *ngFor="let course of courseList" [value]="course">
            {{ course }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="studentForm.get('course')?.invalid && studentForm.get('course')?.touched">
          Course is required.
        </mat-error>
      </mat-form-field>
      
      <!-- Action Buttons -->
      <div class="flex space-x-2 pt-2">
        <button mat-flat-button color="primary" type="submit" [disabled]="studentForm.invalid || isSaving()">
          <mat-icon *ngIf="isSaving()">{{ studentToEdit ? 'sync' : 'how_to_reg' }}</mat-icon>
          {{ isSaving() ? (studentToEdit ? 'Updating...' : 'Registering...') : (studentToEdit ? 'Update Student' : 'Register Student') }}
        </button>
        
        <!-- Cancel button is now crucial for the dialog wrapper component to handle the close event -->
        <button mat-button type="button" (click)="cancel()">
          Cancel
        </button>
      </div>
    </form>
  `,
})
class StudentForm implements OnInit, OnChanges {
  @Input() studentToEdit: MyStudent | null = null;
  // Output now emits the StatusMessage object instead of void
  @Output() studentSaved = new EventEmitter<StatusMessage>();
  @Output() cancelEdit = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private studentService = inject(Student);
  
  isSaving = signal(false);
  // Expose the static course list for the template dropdown
  courseList = Student.COURSE_LIST;

  studentForm: FormGroup = this.fb.group({
    id: [0], // Hidden ID field for edit
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    course: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.studentToEdit) {
      this.studentForm.patchValue(this.studentToEdit);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentToEdit']) {
      if (this.studentToEdit) {
        this.studentForm.patchValue(this.studentToEdit);
      } else {
        // Clear the form when starting a new registration or editing is canceled
        this.studentForm.reset({ id: 0, firstName: '', lastName: '', email: '', course: '' });
      }
    }
  }

  saveStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.studentForm.value;
    const studentName = `${formValue.firstName} ${formValue.lastName}`; // Capture the name
    
    const studentData = {
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      email: formValue.email!,
      course: formValue.course!,
    };

    let saveObservable: Observable<any>;

    if (this.studentToEdit) {
      // Update existing student
      saveObservable = this.studentService.updateStudent(formValue.id!, studentData);
    } else {
      // Add new student
      saveObservable = this.studentService.addStudent(studentData);
    }

    saveObservable.subscribe({
      next: () => {
        const action = this.studentToEdit ? 'updated' : 'registered';
        const successMessage: StatusMessage = { 
          // Use the captured studentName in the message
          content: `${studentName} was successfully ${action}!`, 
          type: 'success' 
        };
        this.studentSaved.emit(successMessage); // Emit the success message to the dialog wrapper
        this.studentForm.reset({ id: 0, firstName: '', lastName: '', email: '', course: '' });
      },
      error: (err: any) => {
        const action = this.studentToEdit ? 'update' : 'register';
        const errorMessage: StatusMessage = { 
          // Use the captured studentName in the message
          content: `Failed to ${action} ${studentName}.`, 
          type: 'error' 
        };
        this.studentSaved.emit(errorMessage); // Emit error, though dialog usually closes on success only
        console.error('Save operation failed:', err);
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }
  
  cancel(): void {
    // This emission tells the parent dialog wrapper to close
    this.cancelEdit.emit();
  }
}
