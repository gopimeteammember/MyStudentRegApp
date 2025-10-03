import { Component, computed, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyStudent, Student } from '../student'; // Import the service
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reg-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">
        {{ isEditing() ? 'Update Student Record' : 'Register New Student' }}
      </h2>
      
      <form [formGroup]="registrationForm" (ngSubmit)="saveStudent()" class="space-y-4">
        
        <!-- First Name -->
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
          <input id="firstName" formControlName="firstName" type="text" 
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Jane">
          <div *ngIf="registrationForm.get('firstName')?.invalid && registrationForm.get('firstName')?.touched" class="text-red-500 text-xs mt-1">
            First Name is required.
          </div>
        </div>

        <!-- Last Name -->
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
          <input id="lastName" formControlName="lastName" type="text" 
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Doe">
          <div *ngIf="registrationForm.get('lastName')?.invalid && registrationForm.get('lastName')?.touched" class="text-red-500 text-xs mt-1">
            Last Name is required.
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input id="email" formControlName="email" type="email" 
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="jane.doe@example.com">
          <div *ngIf="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
            Please enter a valid email address.
          </div>
        </div>

        <!-- Course -->
        <div>
          <label for="course" class="block text-sm font-medium text-gray-700">Course</label>
          <input id="course" formControlName="course" type="text" 
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Computer Science">
          <div *ngIf="registrationForm.get('course')?.invalid && registrationForm.get('course')?.touched" class="text-red-500 text-xs mt-1">
            Course is required.
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col space-y-3 pt-2">
          <button type="submit" 
            [disabled]="registrationForm.invalid"
            class="w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 shadow-md 
                   "
                   [ngClass]="{
                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/50': !registrationForm.invalid,
                    'bg-gray-400 cursor-not-allowed': registrationForm.invalid
                   }">
            {{ isEditing() ? 'Confirm Update' : 'Register Student' }}
          </button>

          <button type="button" 
            *ngIf="isEditing()"
            (click)="cancelEdit.emit()"
            class="w-full py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition duration-300">
            Cancel Edit
          </button>
        </div>
      </form>

      <!-- Component-level message display -->
      <div *ngIf="message() as msg" class="mt-4 p-3 rounded-lg text-sm"
            [ngClass]="msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        {{ msg.content }}
      </div>
    </div>
  `,
})
export class StudentForm {
//   registrationForm!: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private studentService: StudentService // Inject the service
//   ) {}

//   ngOnInit(): void {
//     // Initialize the reactive form with fields and validators
//     this.registrationForm = this.fb.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       course: ['Science', Validators.required],
//       // You can add more fields here
//     });
//   }

//   // Method called when the form is submitted
//   onSubmit(): void {
//     // if (this.registrationForm.valid) {
//       const studentData = this.registrationForm.value;
//       console.log('Form Submitted with data:', studentData);

//       // 1. Call the service to post data to the backend API
//       // 2. The backend API handles inserting the entry into the PostgreSQL database
//       this.studentService.registerStudent(studentData).subscribe({
//         next: (response) => {
//           console.log('Registration successful!', response);
//           alert('Student registered successfully!');
//           this.registrationForm.reset(); // Clear the form on success
//         },
//         error: (error) => {
//           console.error('Registration failed:', error);
//           alert('Registration failed. Please try again.');
//         }
//       });
    
//   }
// }
  private fb = inject(FormBuilder);
  private studentService = inject(Student);

  // --- Inputs and Outputs for communication with Parent (StudentDashboard) ---
  @Input({ required: true }) set studentToEdit(student: MyStudent | null) {
    if (student) {
      // Set form values for editing
      this.registrationForm.patchValue(student);
      this.editingStudentId.set(student.id);
    } else {
      // Clear form for new registration
      this.registrationForm.reset();
      this.editingStudentId.set(null);
    }
  }

  // Event to notify parent component when a student is saved (registered or updated)
  @Output() studentSaved = new EventEmitter<void>();
  // Event to notify parent component to exit edit mode
  @Output() cancelEdit = new EventEmitter<void>();

  // --- Internal State ---
  message = signal<{ content: string, type: 'success' | 'error' } | null>(null);
  editingStudentId = signal<number | null>(null);
  isEditing = computed(() => this.editingStudentId() !== null);

  registrationForm: FormGroup;

  constructor() {
    // Initialize the reactive form with fields and validators
    this.registrationForm = this.fb.group({
      id: [null], // Used only for updates
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      course: ['', Validators.required],
    });
    
    // Auto-clear message after 5 seconds
    effect(() => {
      if (this.message()) {
        setTimeout(() => this.message.set(null), 5000);
      }
    });
  }

  /**
   * Handles form submission for both registration (POST) and update (PUT).
   */
  saveStudent(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.message.set({ content: 'Please correct the form errors.', type: 'error' });
      return;
    }

    const studentData: MyStudent = this.registrationForm.value;
    let operation: Observable<any>;
    let successMessage: string;
    
    if (this.isEditing()) {
      operation = this.studentService.updateStudent(studentData);
      successMessage = `Student ${studentData.firstName} updated successfully!`;
    } else {
      operation = this.studentService.registerStudent(studentData);
      successMessage = `Student ${studentData.firstName} registered successfully!`;
    }

    operation.subscribe({
      next: () => {
        this.message.set({ content: successMessage, type: 'success' });
        this.studentSaved.emit(); // Notify parent to refresh list and reset editing state
      },
      error: (err: any) => {
        this.message.set({ content: `Failed to ${this.isEditing() ? 'update' : 'register'} student.`, type: 'error' });
        console.error('API operation failed:', err);
      }
    });
  }
}
