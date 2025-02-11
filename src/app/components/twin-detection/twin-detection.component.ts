import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ManualResult {
  id: number;
  similarity: number;
  matched: boolean;
}

interface Results {
  totalMatches: number;
  confidenceScore: number;
}

@Component({
  selector: 'app-twin-detection',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './twin-detection.component.html',
  styleUrl: './twin-detection.component.css'
})
export class TwinDetectionComponent implements OnInit {
  features = [
    {
      icon: 'fas fa-dna',
      title: 'Advanced AI Analysis',
      description: 'Cutting-edge facial recognition technology for precise twin detection.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Detailed Metrics',
      description: 'Comprehensive analysis with twin probability, facial similarity, and confidence scores.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure Processing',
      description: 'Your data and images are processed with the highest level of privacy and security.'
    },
    {
      icon: 'fas fa-database',
      title: 'Extensive Database',
      description: 'Powered by a vast database of facial features and genetic markers.'
    },
    {
      icon: 'fas fa-brain',
      title: 'Machine Learning',
      description: 'Continuous improvement through advanced machine learning algorithms.'
    },
    {
      icon: 'fas fa-globe',
      title: 'Global Comparisons',
      description: 'Compare facial features across diverse genetic backgrounds.'
    }
  ];

  analysisSteps: string[] = [
    'Preprocessing',
    'Feature Extraction',
    'Model Inference', 
    'Post-processing',
    'Similarity Scoring',
    'Result Generation'
  ];

  @ViewChild('referenceInput') referenceInput!: ElementRef;
  @ViewChild('comparisonInput') comparisonInput!: ElementRef;
  
  mode: 'manual' | 'bulk' = 'manual';
  referencePreview: string = '';
  comparisonPreviews: string[] = [];
  showResults: boolean = false;
  isProcessing: boolean = false;
  currentAnalysisStep: string = '';
  manualResults: ManualResult[] = [];
  
  results = {
    totalMatches: 0,
    confidenceScore: 0
  };

  constructor() {}

  ngOnInit(): void {}

  getSimilarityColor(similarity: number): string {
    if (similarity >= 90) return 'bg-success';
    if (similarity >= 70) return 'bg-warning';
    return 'bg-danger';
  }

  setMode(mode: 'manual' | 'bulk'): void {
    this.mode = mode;
    this.resetAll();
  }

  triggerReferenceUpload(): void {
    this.referenceInput.nativeElement.click();
  }

  triggerComparisonUpload(): void {
    this.comparisonInput.nativeElement.click();
  }

  onReferenceSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.referencePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onComparisonSelected(event: any): void {
    const files = Array.from(event.target.files as FileList);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.comparisonPreviews.push(e.target?.result as string);
      };
      reader.readAsDataURL(file as Blob);
    });
  }

  clearReference(): void {
    this.referencePreview = '';
  }

  removeComparisonImage(index: number): void {
    this.comparisonPreviews.splice(index, 1);
  }

  canAnalyze(): boolean {
    if (this.mode === 'manual') {
      return !!this.referencePreview && this.comparisonPreviews.length > 0;
    }
    return true; // For bulk mode, we'll validate after S3 selection
  }

  resetAll(): void {
    this.referencePreview = '';
    this.comparisonPreviews = [];
    this.showResults = false;
  }

  async analyze(): Promise<void> {
    this.isProcessing = true;
    this.showResults = false;
  
    // Simulate analysis steps
    for (const step of this.analysisSteps) {
      this.currentAnalysisStep = step;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  
    if (this.mode === 'manual') {
      // Generate results for each comparison image
      this.manualResults = this.comparisonPreviews.map((_, index) => {
        const similarity = Math.floor(Math.random() * 31) + 70; // Random score between 70-100
        return {
          id: index + 1,
          similarity: similarity,
          matched: similarity >= 85
        };
      });
  
      // Update summary statistics
      this.results = {
        totalMatches: this.manualResults.filter(r => r.matched).length,
        confidenceScore: Math.floor(this.manualResults.reduce((acc, curr) => acc + curr.similarity, 0) / this.manualResults.length)
      };
    } else {
      // Bulk mode results simulation
      this.results = {
        totalMatches: Math.floor(Math.random() * 100),
        confidenceScore: Math.floor(Math.random() * 20) + 80
      };
    }
    
    this.isProcessing = false;
    this.showResults = true;
  }

  uploadFromS3(): void {
    // TO DO: Implement S3 upload logic
    console.log('Initiating S3 upload...');
    // Example implementation:
    // this.s3Service.selectBucket()
    //   .then(response => {
    //     // Handle successful bucket selection
    //     this.analyze();
    //   })
    //   .catch(error => {
    //     console.error('Error accessing S3:', error);
    //   });
  }
  
  downloadResults(): void {
    // Create a JSON blob of the results
    const resultsData = {
      timestamp: new Date().toISOString(),
      mode: this.mode,
      results: this.results,
      detailedResults: this.mode === 'manual' ? this.manualResults : undefined
    };

    const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `twin-detection-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}