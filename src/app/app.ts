import { Component, computed, effect, inject, NgModule, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- 1. Import HttpClientModule
import { StudentForm } from './reg-form/reg-form';
import { CommonModule, DatePipe, NgClass } from '@angular/common';

import { RawStudentData, MyStudent, Student,mapRawStudent, StatusMessage } from './student';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { take, map } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { DeleteConfirmDialog } from './delete-confirm-dialog/delete-confirm-dialog';
import { EditStudentDialog } from './edit-student-dialog/edit-student-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    StudentForm, // Kept in imports even though it's used inside a dialog
    DatePipe, 
    NgClass, 
    // Material Modules
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule, 
    MatSelectModule,
    EditStudentDialog // Import the new dialog component for type safety
  ], 
  template: `
    <!-- MAIN CONTENT WRAPPER -->
    <div class="font-inter min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12 relative"> 
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">{{ title() }}</h1>
      
      <div class="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        
        <!-- Global Message Alert -->
        <mat-card *ngIf="message()" class="mb-4 rounded-lg shadow-md"
          [ngClass]="{
            'bg-green-100 border-green-400 text-green-700': message()?.type === 'success',
            'bg-red-100 border-red-400 text-red-700': message()?.type === 'error'
          }">
          <mat-card-content class="p-4 flex justify-between items-center">
            <p class="text-sm">
              <span class="font-semibold">{{ message()?.type === 'success' ? 'Success:' : 'Error:' }}</span>
              {{ message()?.content }}
            </p>
            <button mat-icon-button (click)="message.set(null)">
                <mat-icon class="!text-base">close</mat-icon>
            </button>
          </mat-card-content>
        </mat-card>
        <!-- New Register Button (MOVED TO THE START) -->
        <button mat-flat-button color="primary" (click)="openStudentDialog(null)" class="hidden sm:inline-flex">
              <mat-icon>person_add</mat-icon> Register New Student
            </button>
            <button mat-icon-button color="primary" (click)="openStudentDialog(null)" class="sm:hidden">
              <mat-icon>person_add</mat-icon>
            </button>
        <!-- Student List/Dashboard Column -->
        <mat-card class="rounded-lg shadow-xl">
          <mat-card-header class="pt-4 px-4 border-b border-gray-100 flex justify-between items-center">
           
            <mat-card-title class="text-xl font-semibold text-gray-800">
              Registered Students ({{ students().length }})
            </mat-card-title>
          </mat-card-header>

          <mat-card-content class="p-4">
            
            <!-- Search and Counter -->
            <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <mat-form-field appearance="outline" class="w-full sm:w-1/3">
                <mat-label class="text-sm">Search</mat-label>
                <input matInput 
                  [value]="searchControl.value"
                  (input)="searchControl.setValue($event.target.value)" 
                  placeholder="Name, email, or course"
                  class="text-sm">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>
              
              <div class="text-sm text-gray-600 whitespace-nowrap">
                Showing **{{ filteredStudents().length }}** record{{ filteredStudents().length !== 1 ? 's' : '' }}
              </div>
            </div>
            
            <div *ngIf="isLoading()" class="text-center p-8">
              <mat-progress-spinner mode="indeterminate" diameter="30"></mat-progress-spinner>
              <p class="text-sm text-gray-500 mt-2">Loading student records...</p>
            </div>

            <!-- No Results Message -->
            <div *ngIf="!isLoading() && students().length > 0 && filteredStudents().length === 0" 
                  class="p-4 bg-yellow-100 rounded text-yellow-800 border border-yellow-300">
              **No students found** matching "{{ searchControl.value }}".
            </div>
            
            <!-- Empty State -->
            <div *ngIf="!isLoading() && students().length === 0" class="text-center p-8 text-gray-500">
              No students registered yet. Click "Register New Student" to begin!
            </div>

            <!-- Student Table -->
            <div *ngIf="!isLoading() && filteredStudents().length > 0" class="overflow-x-auto shadow-md rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100"> 
                  <tr *ngFor="let student of filteredStudents(); trackBy: trackByStudentId" class="hover:bg-gray-50 transition duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ student.firstName }} {{ student.lastName }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ student.email }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ student.course }}
                    </td>
                    <!-- EDIT ACTION: Now calls openStudentDialog with the student object -->
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button mat-flat-button color="primary" (click)="openStudentDialog(student)" class="text-xs shadow-md hover:shadow-lg transition">
                        <mat-icon class="!text-base mr-1">edit</mat-icon> Edit
                      </button>
                      <button mat-flat-button color="warn" (click)="openDeleteConfirm(student)" class="text-xs shadow-md hover:shadow-lg transition">
                        <mat-icon class="!text-base mr-1">delete</mat-icon> Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div> 
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
    
    /* Icon sizing fix for material icons, reduced to 16px to look smaller with the text-sm class */
    .mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
  `],
})
export class StudentDashboard implements OnInit {
  protected readonly title = signal('Angular Student Registration Dashboard');
  private studentService = inject(Student);
  private dialog = inject(MatDialog); 

  // --- Search/Filter State ---
  searchControl = new FormControl(''); 
  searchTerm = signal<string>(''); 

  // --- Master State Signals ---
  students = signal<MyStudent[]>([]);
  isLoading = signal(true);
  message = signal<StatusMessage | null>(null);
  
  // Note: studentToEdit is no longer needed since the data is passed directly to the dialog.

  // --- Filtered Students Computed Signal ---
  filteredStudents = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase() ?? '';
    const allStudents = this.students();

    if (!searchTerm) {
      return allStudents;
    }

    return allStudents.filter(student => {
      // Create a full name target for checking combined first and last names
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

      // Check if the search term matches the full name, email, or course
      const matchesName = fullName.includes(searchTerm);
      const matchesEmail = student.email.toLowerCase().includes(searchTerm);
      const matchesCourse = student.course.toLowerCase().includes(searchTerm);

      return matchesName || matchesEmail || matchesCourse;
    });
  });
  
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

    // Subscribe to the FormControl's changes and push the value to the signal
    this.searchControl.valueChanges.subscribe(value => {
        this.searchTerm.set(value ?? '');
    });
    // Initialize the signal with the current value
    this.searchTerm.set(this.searchControl.value ?? '');
  }

  trackByStudentId(index: number, student: MyStudent): number {
    return student.id; 
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

  // --- Dialog Control Logic ---

  /**
   * Opens the MatDialog for either editing an existing student or registering a new one.
   * @param student The student object to edit, or null to register a new student.
   */
  openStudentDialog(student: MyStudent | null): void {
    this.message.set(null); // Clear message before opening dialog

    // Open the dialog, passing the student object or null
    const dialogRef = this.dialog.open(EditStudentDialog, {
      width: '500px', 
      data: { student: student },
      panelClass: 'custom-dialog-container',
      // Prevents closing the dialog by clicking the backdrop or pressing escape, 
      // ensuring the user uses the in-form buttons.
      disableClose: true 
    });

    // Subscribe to the result when the dialog closes
    dialogRef.afterClosed().subscribe((result: StatusMessage | null) => {
      // result will be the StatusMessage object if the form saved successfully
      if (result) {
        this.message.set(result); // Show success/error message
        this.loadStudents(); // Reload the student list
      }
    });
  }

  /**
   * Opens the MatDialog to confirm deletion.
   */
  openDeleteConfirm(student: MyStudent): void {
    // Open the dialog, passing the student object as data
    const dialogRef = this.dialog.open(DeleteConfirmDialog, {
      width: '400px', // Set a maximum width for desktop
      data: { student: student },
      panelClass: 'custom-dialog-container'
    });

    // Subscribe to the result when the dialog closes
    dialogRef.afterClosed().subscribe((result: boolean) => {
      // result is true if 'Delete' was clicked
      if (result === true) {
        this.confirmDelete(student.id);
      }
    });
  }

  /**
   * Executes the deletion after user confirmation from the MatDialog.
   */
  confirmDelete(id: number): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.message.set({ content: 'Student deleted successfully!', type: 'success' });
        
        // Remove the student from the local list immediately.
        this.students.update(list => list.filter(s => s.id !== id));
      },
      error: (err: any) => {
        this.message.set({ content: 'Failed to delete student.', type: 'error' });
        console.error('Delete operation failed:', err);
      },
    });
  }
}