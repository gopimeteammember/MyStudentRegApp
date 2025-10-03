import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { StudentDashboard } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import 'zone.js';
// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));
bootstrapApplication(StudentDashboard, {
  providers: [
    // ... other providers (like provideRouter, provideAnimations)
    
    provideHttpClient() // <-- 2. Add the provider function here
  ]
}).catch(err => console.error(err));  