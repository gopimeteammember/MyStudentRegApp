import { Component, NgModule, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- 1. Import HttpClientModule
import { RegFormComponent } from './reg-form/reg-form';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgClass, RegFormComponent,CommonModule,HttpClientModule], // <-- 2. Add HttpClientModule here
  templateUrl: './app.html',
  styleUrl: './app.css',
 
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

export class App {
  protected readonly title = signal('Stud_Reg_App');
}
