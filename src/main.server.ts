import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { StudentDashboard } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(StudentDashboard, config, context);

export default bootstrap;
