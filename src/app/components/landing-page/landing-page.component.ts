import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { compileNgModule } from '@angular/compiler';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  constructor(private _router: Router){}
  O2ONavigate(): void{
    console.log("Navigated")
    this._router.navigate(['/one2oneImageVerification']).then(() => {
      window.scrollTo(0, 0); // Scroll to top after navigation
    });  }
  O2nNavigate(): void{
    console.log("Navigated")
    this._router.navigate(['/one2nImageVerification']).then(() => {
      window.scrollTo(0, 0);
    });  }
  deduplicationNavigate(): void{
    console.log("Navigated")
    this._router.navigate(['/deDuplicationCheck']).then(() => {
      window.scrollTo(0, 0);
    });
  }
  twinDetectionNavigate(): void{
    console.log("Navigated")
    this._router.navigate(['/twinDetection']).then(() => {
      window.scrollTo(0, 0);
    });
  }
  verificationSteps = [
    {
      title: 'Pre-Examination Setup',
      description: 'Initial database creation with candidate application photos and biometric data'
    },
    {
      title: 'Desk Image Capture',
      description: 'Real-time capture of candidate biometric data at examination desk'
    },
    {
      title: '1:1 Verification',
      description: 'Immediate comparison with application data to identify mismatches'
    },
    {
      title: 'Cross-Check Verification',
      description: 'Deduplication checks and twin verification process'
    },
    {
      title: 'Shift Comparison',
      description: '1:N verification across all examination shifts'
    }
  ];
}
