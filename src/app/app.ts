import { Component, computed, effect, inject, NgModule, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- 1. Import HttpClientModule
import { StudentForm } from './reg-form/reg-form';
import { CommonModule, DatePipe, NgClass } from '@angular/common';

import { RawStudentData, MyStudent, Student,mapRawStudent } from './student';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { take, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  // Now includes the StudentFormComponent
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, StudentForm, DatePipe], 
  template: `
    <div class="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
      <div class="max-w-7xl mx-auto">
        <header class="text-center mb-10">
          <h1 class="text-4xl font-extrabold text-indigo-700 tracking-tight sm:text-5xl">
            Student Registration Portal
          </h1>
          <p class="mt-3 text-xl text-gray-500">
            Register, view, and manage student records.
          </p>
        </header>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Registration/Edit Form Component (Left Column) -->
          <div class="lg:col-span-1">
            <app-reg-form 
              [studentToEdit]="studentToEdit()" 
              (studentSaved)="handleStudentSaved()"
              (cancelEdit)="cancelEdit()"
            ></app-reg-form>

            <!-- Global API Message Display (Kept here as it's global success/error) -->
            <div *ngIf="message() as msg" class="mt-4 p-3 rounded-lg text-sm"
            [ngClass]="msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ msg.content }}
            </div>
          </div>

          <!-- Student List Table (Right Column - kept here for master data control) -->
          <div class="lg:col-span-2">
            <div class="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
              <h2 class="text-2xl font-bold mb-6 text-gray-800">
                Registered Students ({{ students().length }})
              </h2>

              <div *ngIf="isLoading()" class="text-center p-8 text-gray-500">
                <svg class="animate-spin h-5 w-5 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading student records...
              </div>

              <div *ngIf="!isLoading() && students().length === 0" class="text-center p-8 text-gray-500">
                No students registered yet.
              </div>

              <!-- Students Table -->
              <div *ngIf="students().length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let student of students()" class="hover:bg-indigo-50 transition duration-150">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ student.firstName }} {{ student.lastName }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ student.email }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ student.course }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button (click)="startEdit(student)" 
                                class="text-indigo-600 hover:text-indigo-900 transition duration-150 p-1 rounded-md hover:bg-indigo-100">
                          Edit
                        </button>
                        <button (click)="openDeleteConfirm(student)"
                                class="text-red-600 hover:text-red-900 transition duration-150 p-1 rounded-md hover:bg-red-100">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CUSTOM CONFIRMATION MODAL (Used for deletion) -->
    <div *ngIf="showDeleteConfirm() && studentToDelete()" 
         class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
            <h3 class="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h3>
            <p class="text-gray-700 mb-6">
                Are you sure you want to permanently delete the record for 
                <span class="font-semibold">{{ studentToDelete()!.firstName }} {{ studentToDelete()!.lastName }}</span>? 
                This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
                <button (click)="closeDeleteConfirm()"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                    Cancel
                </button>
                <button (click)="confirmDelete()"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-md shadow-red-500/50">
                    Delete
                </button>
            </div>
        </div>
    </div>

  `,
  styles: [`
    /* Custom font import for aesthetics */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `],
})

// @NgModule({
//   declarations: [App],
//     imports: [
//     BrowserModule,
//     HttpClientModule, // <-- 2. Add HttpClientModule here
//     RegFormComponent,
//     // ... other modules (e.g., ReactiveFormsModule, MatCardModule)
//   ],
//   providers: [],
//   bootstrap: [App]
// })

export class StudentDashboard implements OnInit {
  protected readonly title = signal('Stud_Reg_App');
  private studentService = inject(Student);

  
  // --- Master State Signals ---
  students = signal<MyStudent[]>([]);
  isLoading = signal(true);
  message = signal<{ content: string, type: 'success' | 'error' } | null>(null);
  
  // State for passing data to the form component
  studentToEdit = signal<MyStudent | null>(null);

  // Custom Modal/Dialog State
  showDeleteConfirm = signal(false);
  studentToDelete = signal<MyStudent | null>(null);

  // Auto-clear message after 5 seconds
  constructor() {
    effect(() => {
      if (this.message()) {
        setTimeout(() => this.message.set(null), 5000);
      }
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Fetches all students and maps the raw data structure.
   */
  loadStudents(): void {
    this.isLoading.set(true);
    this.studentService.getStudents().pipe(
      take(1),
      map((rawStudents: RawStudentData[]) => rawStudents.map(mapRawStudent))
    ).subscribe({
      next: (students: MyStudent[]) => {
        this.students.set(students);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.message.set({ content: 'Failed to load students. Check API connection.', type: 'error' });
        console.error('Error loading students:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Called by the StudentFormComponent when a student is successfully registered or updated.
   * This clears the editing state and refreshes the list.
   */
  handleStudentSaved(): void {
    // Clear the editing state in the parent
    this.studentToEdit.set(null); 
    // Reload the data from the server
    this.loadStudents();
  }

  // --- List/Editing Control Logic ---

  /**
   * Sets the signal that feeds into the StudentFormComponent to begin editing.
   */
  startEdit(student: MyStudent): void {
    this.studentToEdit.set(student);
    this.message.set(null);
  }

  /**
   * Clears the editing state, called either by the list or the form component.
   */
  cancelEdit(): void {
    this.studentToEdit.set(null);
    this.message.set(null);
  }

  // --- Deletion Confirmation Logic ---

  /**
   * Opens the custom delete confirmation modal.
   */
  openDeleteConfirm(student: MyStudent): void {
    this.studentToDelete.set(student);
    this.showDeleteConfirm.set(true);
  }

  /**
   * Closes the custom delete confirmation modal.
   */
  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.studentToDelete.set(null);
  }

  /**
   * Executes the deletion after user confirmation.
   */
  confirmDelete(): void {
    const id = this.studentToDelete()?.id;
    if (!id) {
      this.closeDeleteConfirm();
      return;
    }
    
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.message.set({ content: 'Student deleted successfully!', type: 'success' });
        // Update list optimistically
        this.students.update(list => list.filter(s => s.id !== id));
        
        // If the deleted student was the one being edited, clear the form
        if (this.studentToEdit()?.id === id) {
          this.cancelEdit();
        }
      },
      error: (err: any) => {
        this.message.set({ content: 'Failed to delete student.', type: 'error' });
        console.error('Delete operation failed:', err);
      },
      complete: () => {
        this.closeDeleteConfirm(); // Always close the modal
      }
    });
  }
}




