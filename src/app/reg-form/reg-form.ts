import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from '../student'; // Import the service
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';



@Component({
  selector: 'app-reg-form',
  templateUrl: './reg-form.html',
  styleUrls: ['./reg-form.css'],
  imports: [ReactiveFormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatFormField,MatLabel, MatInputModule, MatSelectModule, MatButtonModule, CommonModule]
})
export class RegFormComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService // Inject the service
  ) {}

  ngOnInit(): void {
    // Initialize the reactive form with fields and validators
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      course: ['Science', Validators.required],
      // You can add more fields here
    });
  }

  // Method called when the form is submitted
  onSubmit(): void {
    // if (this.registrationForm.valid) {
      const studentData = this.registrationForm.value;
      console.log('Form Submitted with data:', studentData);

      // 1. Call the service to post data to the backend API
      // 2. The backend API handles inserting the entry into the PostgreSQL database
      this.studentService.registerStudent(studentData).subscribe({
        next: (response) => {
          console.log('Registration successful!', response);
          alert('Student registered successfully!');
          this.registrationForm.reset(); // Clear the form on success
        },
        error: (error) => {
          console.error('Registration failed:', error);
          alert('Registration failed. Please try again.');
        }
      });
    // } else {
    //   // Mark all fields as touched to display validation errors
    //   this.registrationForm.markAllAsTouched();
    // }
  }
}

// --- Hypothetical Student Service (student.service.ts) ---

/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/students'; // <-- **Change this to your actual API endpoint**

  constructor(private http: HttpClient) { }

  registerStudent(student: any): Observable<any> {
    // The HTTP POST request sends the data to your backend API
    return this.http.post(this.apiUrl, student);
  }
}
*/