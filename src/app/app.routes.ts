import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { O2OImageVerificationComponent } from './components/o2-oimage-verification/o2-oimage-verification.component';
import { TwinDetectionComponent } from './components/twin-detection/twin-detection.component';
import { O2NImageVerificationComponent } from './components/o2-nimage-verification/o2-nimage-verification.component';
import { DeduplicationCheckComponent } from './components/deduplication-check/deduplication-check.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'one2oneImageVerification', component: O2OImageVerificationComponent},
    {path: 'twinDetection', component: TwinDetectionComponent},
    {path: 'one2nImageVerification', component: O2NImageVerificationComponent},
    {path: 'deDuplicationCheck', component: DeduplicationCheckComponent}

];
