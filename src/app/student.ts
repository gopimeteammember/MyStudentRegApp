// src/app/student.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define an interface for type safety (optional but recommended)
interface Student {
  firstName: string;
  lastName: string;
  email: string;
  course: string;
}

@Injectable({
  // 'root' means the service is available throughout the application
  providedIn: 'any'
})
export class StudentService {
  // IMPORTANT: Replace this with the URL of your actual backend API endpoint.
  // This is the endpoint that will receive the POST request and save to PostgreSQL.
  // private apiUrl = 'http://localhost:3000/api/students'; 
  private apiUrl = 'https://dpg-d3403le3jp1c73ffjf20-a/dataentryapp/api/students';

  // Inject the HttpClient service
  constructor(private http: HttpClient) { }

  /**
   * Sends a POST request to the backend API to register a new student.
   * @param student - The student data object to be registered.
   * @returns An Observable of the HTTP response from the backend.
   */
  registerStudent(student: Student): Observable<any> {
    // The http.post() method sends a POST request to the apiUrl 
    // with the 'student' object as the request body.
    return this.http.post<any>(this.apiUrl, student);
  }
}