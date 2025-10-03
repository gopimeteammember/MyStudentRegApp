
// src/app/student.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define an interface for type safety (optional but recommended)
export interface MyStudent{
 id: number;
 firstName: string;
 lastName: string;
 email: string;
 course: string;
 registeredDate: string; 
}
export interface RawStudentData {
 id: number;
 first_name: string;
 last_name: string;
 email: string;
 course: string;
 registered_at: string;
}
// Utility function to convert snake_case (from DB) to camelCase (for UI)
export const mapRawStudent = (raw: RawStudentData): MyStudent => ({
 id: raw.id,
 firstName: raw.first_name,
 lastName: raw.last_name,
 email: raw.email,
 course: raw.course,
 registeredDate: raw.registered_at,
});

@Injectable({
 // 'root' means the service is available throughout the application
 providedIn: 'any'
})
export class Student {
 // IMPORTANT: Replace this with the URL of your actual backend API endpoint.
 // This is the endpoint that will receive the POST request and save to PostgreSQL.
 
 private apiUrl = 'http://localhost:3000/api/student'; 
 // private apiUrl = 'https://studregapp.vercel.app/api/student';
 // private apiUrl = 'https://dpg-d3403le3jp1c73ffjf20-a/dataentryapp/api/students';

 // Inject the HttpClient service
 constructor(private http: HttpClient) { }

 /**
 * Sends a POST request to the backend API to register a new student.
 * @param student - The student data object to be registered.
 * @returns An Observable of the HTTP response from the backend.
 */
 registerStudent(student: MyStudent): Observable<any> {
  // The http.post() method sends a POST request to the apiUrl 
  // with the 'student' object as the request body.
  return this.http.post<any>(this.apiUrl, student);
 }
 getStudents(): Observable<RawStudentData[]> {
  return this.http.get<RawStudentData[]>(this.apiUrl);
 }
 /**
 * Sends a PUT request to update an existing student record. (UPDATE)
 * @param student The full Student object with updated data.
 */
 updateStudent(student: MyStudent): Observable<any> {
  // The Express route is '/api/student/:id'
  const url = `${this.apiUrl}/${student.id}`;
  
  // We send the data using the camelCase format expected by the backend logic
  return this.http.put(url, {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    course: student.course,
  });
 }

 /**
 * Sends a DELETE request to remove a student record by ID. (DELETE)
 * @param id The ID of the student to delete.
 */
 deleteStudent(id: number): Observable<any> {
  const url = `${this.apiUrl}/${id}`;
  return this.http.delete(url);
 }
}
