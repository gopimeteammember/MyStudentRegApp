// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZonelessChangeDetection(),
//     provideRouter(routes), provideClientHydration(withEventReplay())
//   ]
// };

import { ApplicationConfig , provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
// 🛑 Import provideHttpClient and withFetch
import { provideHttpClient, withFetch } from '@angular/common/http'; 

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // 🛑 FIX: Add provideHttpClient(withFetch()) here
    provideHttpClient(withFetch()) 
  ]
};