import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  path: string;
}

interface ManualResult {
  id: number;
  similarity: number;
  matched: boolean;
  imageUrl?: string;
}

interface BulkResult {
  id: number;
  duplicateGroup: number;
  matchCount: number;
}

interface Results {
  duplicateCount?: string | number;
  qualityScore?: string | number;
  confidenceScore?: string | number;
  totalDuplicates?: number;
  sameNameDuplicates?: number;
  differentNameDuplicates?: number;
  totalPairs?: number;
  maxDuplicates?: number;
}

@Component({
  selector: 'app-deduplication-check',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './deduplication-check.component.html',
  styleUrl: './deduplication-check.component.css',
  animations: [
    trigger('scanAnimation', [
      state('inactive', style({
        height: '0%',
        opacity: 0
      })),
      state('active', style({
        height: '100%',
        opacity: 0.5
      })),
      transition('inactive => active', animate('2s linear')),
      transition('active => inactive', animate('0s'))
    ])
  ]
})

export class DeduplicationCheckComponent implements OnInit {
  @ViewChild('referenceInput') referenceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('comparisonInput') comparisonInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bulkInput') bulkInput!: ElementRef<HTMLInputElement>;

  mode: 'manual' | 'bulk' = 'manual';
  referencePreview: string | null = null;
  comparisonPreviews: string[] = [];
  bulkPreviews: string[] = [];
  bulkUploadType: 'local' | 's3' = 'local';
  isLoadingS3 = false;
  showResults = false;
  canAnalyze = false;
  isLoading = false;
  showFaceOutline = false;
  isProcessing = false; // Added missing property
  totalDuplicates = 0;
  

  // Animation related properties
  scanningStates: { [key: string]: 'active' | 'inactive' } = {};
  scanInterval: any;
  currentScanningIndex = -1;

  manualResults: Array<{id: number, similarity: number, matched: boolean}> = [];
  bulkResults: Array<{id: number, duplicateGroup: number, matchCount: number}> = [];
  

  analysisSteps = ['Uploading', 'Detecting Faces', 'Comparing Images', 'Generating Results'];
  currentAnalysisStep = '';

  s3Config: S3Config = {
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: '',
    path: ''
  };

  results: Results = {
    duplicateCount: '-',
    qualityScore: '-',
    confidenceScore: '-',
    totalDuplicates: 0,
    sameNameDuplicates: 0,
    differentNameDuplicates: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.initializeResultsContainers();
  }

  getSimilarityColor(similarity: number): string {
    if (similarity >= 50) return 'bg-success';
    return 'bg-danger';
  }

  
  private initializeResultsContainers(): void {
    // Initialize empty results arrays
    this.manualResults = [];
    this.bulkResults = [];
  }

  startScanning(): void {
    if (this.mode === 'manual') {
      this.startManualModeScanning();
    } else {
      this.startBulkModeScanning();
    }
  }

  private startManualModeScanning(): void {
    // Reset states
    this.scanningStates = {
      reference: 'inactive',
      ...this.comparisonPreviews.reduce((acc, _, idx) => ({
        ...acc,
        [`comparison${idx}`]: 'inactive'
      }), {})
    };

    let currentIndex = -1;
    this.scanInterval = setInterval(() => {
      // Reset previous scan
      if (currentIndex >= 0) {
        const prevKey = currentIndex === 0 ? 'reference' : `comparison${currentIndex - 1}`;
        this.scanningStates[prevKey] = 'inactive';
      }

      // Move to next image
      currentIndex++;
      if (currentIndex > this.comparisonPreviews.length) {
        currentIndex = 0;
      }
      const currentKey = currentIndex === 0 ? 'reference' : `comparison${currentIndex - 1}`;
      this.scanningStates[currentKey] = 'active';
    }, 2000);
  }

  private startBulkModeScanning(): void {
    // Reset states
    this.scanningStates = this.bulkPreviews.reduce((acc, _, idx) => ({
      ...acc,
      [`bulk${idx}`]: 'inactive'
    }), {});

    let currentIndex = 0;
    this.scanInterval = setInterval(() => {
      // Reset previous scan
      if (currentIndex > 0) {
        this.scanningStates[`bulk${currentIndex - 1}`] = 'inactive';
      }

      // Move to next image
      if (currentIndex >= this.bulkPreviews.length) {
        currentIndex = 0;
      }
      this.scanningStates[`bulk${currentIndex}`] = 'active';
      currentIndex++;
    }, 2000);
  }

  stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      // Reset all scanning states
      Object.keys(this.scanningStates).forEach(key => {
        this.scanningStates[key] = 'inactive';
      });
    }
  }

  setMode(newMode: 'manual' | 'bulk') {
    this.mode = newMode;
    this.resetState();
  }

  setBulkUploadType(type: 'local' | 's3'): void {
    this.bulkUploadType = type;
    this.clearBulkUploads();
    // Reset results when switching upload types
    this.showResults = false;
    this.isProcessing = false;
    this.showFaceOutline = false;
  }

  clearAll(): void {
    this.stopScanning();
    this.referencePreview = null;
    this.comparisonPreviews = [];
    this.bulkPreviews = [];
    this.showResults = false;
  }

  clearBulkUploads(): void {
    this.stopScanning();
    this.bulkPreviews = [];
    this.showResults = false;
  }

  isS3ConfigValid(): boolean {
    return !!(
      this.s3Config.accessKeyId &&
      this.s3Config.secretAccessKey &&
      this.s3Config.bucketName &&
      this.s3Config.region
    );
  }

  async loadImagesFromS3(): Promise<void> {
    if (!this.isS3ConfigValid()) return;
    
    this.isLoadingS3 = true;
    try {
      // Start analysis process immediately
      this.isProcessing = true;
      this.showFaceOutline = true;
      this.startScanning();
      this.runAnalysisSteps();

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock bulk previews (in real implementation, this would be your S3 data)
      this.bulkPreviews = Array(5).fill('').map(() => 'mock-image-url');
      
    } catch (error) {
      console.error('Error loading images from S3:', error);
    } finally {
      this.isLoadingS3 = false;
    }
  }

  

  private resetState() {
    this.stopScanning();
    this.showResults = false;
    this.canAnalyze = false;
    this.isLoading = false;
    this.showFaceOutline = false;
    
    if (this.mode === 'manual') {
      this.bulkPreviews = [];
    } else {
      this.referencePreview = null;
      this.comparisonPreviews = [];
    }
  }

  analyze(): void {
    this.isProcessing = true;
    this.isLoading = true;
    this.showResults = false;
    this.showFaceOutline = true;
    this.startScanning();
    this.runAnalysisSteps();

    // Generate mock results based on mode
    if (this.mode === 'manual') {
      this.generateManualResults();
    } else {
      this.generateBulkResults();
    }
}

private generateManualResults(): void {
  
  this.manualResults = this.comparisonPreviews.map((preview, index) => {
    const similarity = Math.floor(Math.random() * 101);
    return {
      id: index + 1,
      similarity: similarity,
      matched: similarity >= 50, // Corrected logic
      imageUrl: preview
    };
  });
  this.totalDuplicates = this.manualResults.filter(result => result.matched).length;
}

private generateBulkResults(): void {
  this.bulkResults = this.bulkPreviews.map((_, index) => ({
    id: index + 1,
    duplicateGroup: Math.floor(Math.random() * 5) + 1,
    matchCount: Math.floor(Math.random() * 3) + 1
  }));
}

  private runAnalysisSteps(): void {
    const steps = [...this.analysisSteps];
    
    const runNextStep = (stepIndex = 0) => {
      if (stepIndex < steps.length) {
        this.currentAnalysisStep = steps[stepIndex];
        setTimeout(() => {
          runNextStep(stepIndex + 1);
        }, 1500);
      } else {
        this.finalizeAnalysis();
      }
    };

    runNextStep();
  }

  private finalizeAnalysis(): void {
    this.stopScanning();
    this.isLoading = false;
    this.isProcessing = false;
    this.showFaceOutline = false;
    this.showResults = true;

    if (this.mode === 'manual') {
      this.results = {
        duplicateCount: Math.floor(Math.random() * 10),
        qualityScore: Math.floor(Math.random() * 30) + 70,
        confidenceScore: Math.floor(Math.random() * 20) + 80,
        totalPairs: Math.floor(Math.random() * 20) + 5,
        maxDuplicates: Math.floor(Math.random() * 10) + 2
      };
    } else {
      this.results = {
        totalDuplicates: Math.floor(Math.random() * 50) + 10,
        sameNameDuplicates: Math.floor(Math.random() * 20) + 5,
        differentNameDuplicates: Math.floor(Math.random() * 30) + 5,
        totalPairs: Math.floor(Math.random() * 20) + 5,
        maxDuplicates: Math.floor(Math.random() * 10) + 2
      };
    }
  }

  // Manual mode methods
  triggerReferenceUpload(): void {
    this.referenceInput?.nativeElement.click();
  }

  triggerComparisonUpload(): void {
    this.comparisonInput?.nativeElement.click();
  }

  onReferenceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (!this.isValidImageFile(file)) {
        alert('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.referencePreview = e.target?.result as string;
        this.updateAnalyzeState();
      };
      reader.readAsDataURL(file);
    }
  }

  onComparisonSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files?.length) {
      Array.from(files).forEach((file) => {
        if (!this.isValidImageFile(file)) {
          alert('Please upload valid image files only');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.comparisonPreviews.push(e.target?.result as string);
          this.updateAnalyzeState();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  clearReference(): void {
    this.referencePreview = null;
    if (this.referenceInput?.nativeElement) {
      this.referenceInput.nativeElement.value = '';
    }
    this.updateAnalyzeState();
  }

  removeComparisonImage(index: number): void {
    this.comparisonPreviews.splice(index, 1);
    if (this.comparisonInput?.nativeElement) {
      this.comparisonInput.nativeElement.value = '';
    }
    this.updateAnalyzeState();
  }

  // Bulk mode methods
  triggerBulkUpload(): void {
    this.bulkInput?.nativeElement.click();
  }

  onBulkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files?.length) {
      Array.from(files).forEach((file) => {
        if (!this.isValidImageFile(file)) {
          alert('Please upload valid image files only');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.bulkPreviews.push(e.target?.result as string);
          this.updateAnalyzeState();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeBulkImage(index: number): void {
    this.bulkPreviews.splice(index, 1);
    if (this.bulkInput?.nativeElement) {
      this.bulkInput.nativeElement.value = '';
    }
    this.updateAnalyzeState();
  }

  private isValidImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return file && acceptedImageTypes.includes(file.type);
  }

  private updateAnalyzeState(): void {
    if (this.mode === 'manual') {
      this.canAnalyze = !!this.referencePreview && this.comparisonPreviews.length > 0;
    } else {
      this.canAnalyze = this.bulkPreviews.length > 1;
    }
  }
  downloadReport(): void {
    // Create a link element
    const link = document.createElement('a');
    link.href = '/deduplication-report.pdf'; // Assuming PDF is stored in public folder
    link.target = '_blank';
    link.download = 'deduplication-report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}