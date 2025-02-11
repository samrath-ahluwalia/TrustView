import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

@Component({
  selector: 'app-o2-oimage-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './o2-oimage-verification.component.html',
  styleUrl: './o2-oimage-verification.component.css'
})

export class O2OImageVerificationComponent {
  @ViewChild('fileInput1') fileInput1!: ElementRef;
  @ViewChild('fileInput2') fileInput2!: ElementRef;

  mode: 'manual' | 'bulk' = 'manual';
  firstImage: File | null = null;
  secondImage: File | null = null;
  firstImagePreview: string | ArrayBuffer | null = null;
  secondImagePreview: string | ArrayBuffer | null = null;
  similarityScore: number = 0;
  confidenceLevel: number = 0;
  isProcessing = false;
  progressValue = 0;
  showFaceOutline = false;
  currentAnalysisStep = '';
  bulkResults = {
    matchedPairs: 0,
    unmatchedPairs: 0
  };

  readonly analysisSteps = [
    'Preprocessing',
    'Feature Extraction',
    'Model Inference',
    'Post-processing', 
    'Similarity Scoring',
    'Result Generation'
  ];

  s3Config: S3Config = {
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: ''
  };

  setMode(newMode: 'manual' | 'bulk'): void {
    this.mode = newMode;
    this.resetState();
  }

  async compareFaces(): Promise<void> {
    this.isProcessing = true;
    this.showFaceOutline = true;
    this.progressValue = 0;
    this.similarityScore = 0;
    this.confidenceLevel = 0;
    
    const duration = 6000;
    const stepDuration = duration / this.analysisSteps.length;
    let currentStepIndex = 0;

    const progressInterval = setInterval(() => {
      this.progressValue += 2;
      
      if (this.progressValue >= ((currentStepIndex + 1) * (100 / this.analysisSteps.length))) {
        if (currentStepIndex < this.analysisSteps.length - 1) {
          currentStepIndex++;
          this.currentAnalysisStep = this.analysisSteps[currentStepIndex];
        }
      }

      if (this.progressValue >= 100) {
        clearInterval(progressInterval);
        this.isProcessing = false;
        this.showFaceOutline = false;
        this.progressValue = 100;
        this.currentAnalysisStep = '';
        
        if (this.mode === 'manual') {
          this.similarityScore = Math.floor(Math.random() * 100);
          this.confidenceLevel = Math.floor(Math.random() * (100 - 70) + 70);
        } else {
          this.bulkResults = {
            matchedPairs: Math.floor(Math.random() * 50),
            unmatchedPairs: Math.floor(Math.random() * 30)
          };
        }
      }
    }, duration / 50);
    
    // Set initial step
    this.currentAnalysisStep = this.analysisSteps[0];
  }

  onFileChange(event: Event, imageType: 'first' | 'second'): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        if (imageType === 'first') {
          this.firstImage = file;
          this.firstImagePreview = e.target.result;
        } else {
          this.secondImage = file;
          this.secondImagePreview = e.target.result;
        }
      };
      
      reader.readAsDataURL(file);
    }
  }

  clearImage(imageType: 'first' | 'second', event: Event): void {
    event.stopPropagation();
    if (imageType === 'first') {
      this.firstImage = null;
      this.firstImagePreview = null;
      this.fileInput1.nativeElement.value = '';
    } else {
      this.secondImage = null;
      this.secondImagePreview = null;
      this.fileInput2.nativeElement.value = '';
    }
  }

  private resetState(): void {
    this.firstImage = null;
    this.secondImage = null;
    this.firstImagePreview = null;
    this.secondImagePreview = null;
    this.isProcessing = false;
    this.showFaceOutline = false;
    this.similarityScore = 0;
    this.confidenceLevel = 0;
    this.progressValue = 0;
    this.bulkResults = {
      matchedPairs: 0,
      unmatchedPairs: 0
    };
  }

  async processS3Images(): Promise<void> {
    this.isProcessing = true;
    this.showFaceOutline = true;
    this.progressValue = 0;

    const duration = 6000;
    const stepDuration = duration / this.analysisSteps.length;
    let currentStepIndex = 0;

    const progressInterval = setInterval(() => {
      this.progressValue += 2;
      
      if (this.progressValue >= ((currentStepIndex + 1) * (100 / this.analysisSteps.length))) {
        if (currentStepIndex < this.analysisSteps.length - 1) {
          currentStepIndex++;
          this.currentAnalysisStep = this.analysisSteps[currentStepIndex];
        }
      }

      if (this.progressValue >= 100) {
        clearInterval(progressInterval);
        this.isProcessing = false;
        this.showFaceOutline = false;
        this.progressValue = 100;
        this.currentAnalysisStep = '';
        
        this.bulkResults = {
          matchedPairs: Math.floor(Math.random() * 50),
          unmatchedPairs: Math.floor(Math.random() * 30)
        };
      }
    }, duration / 50);
    
    // Set initial step
    this.currentAnalysisStep = this.analysisSteps[0];
  }
}