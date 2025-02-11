import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

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
export class TwinDetectionComponent {
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
    'Initializing Face Detection',
    'Analyzing Facial Features',
    'Comparing Images',
    'Generating Results'
  ];

  @ViewChild('referenceInput') referenceInput!: ElementRef;
  @ViewChild('comparisonInput') comparisonInput!: ElementRef;
  
  mode: 'manual' | 'bulk' = 'manual';
  referencePreview: string | null = null;
  comparisonPreviews: string[] = [];
  showResults = false;
  isProcessing: boolean = false;
  currentAnalysisStep: string = '';
  manualResults: Array<{
    similarity: number;
    matched: boolean;
    imageUrl: string;
  }> = [];
  
  results = {
    totalMatches: 0,
    confidenceScore: 0
  };

  sameNameMatches = 0;
  differentNameMatches = 0;

  constructor() {}

  getSimilarityColor(similarity: number): string {
    if (similarity >= 80) return 'bg-success';
    if (similarity >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  setMode(mode: 'manual' | 'bulk'): void {
    this.mode = mode;
    this.resetState();
  }

  resetState(): void {
    this.referencePreview = null;
    this.comparisonPreviews = [];
    this.showResults = false;
    this.manualResults = [];
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
    this.referencePreview = null;
  }

  removeComparisonImage(index: number): void {
    this.comparisonPreviews.splice(index, 1);
  }

  canAnalyze(): boolean {
    if (this.mode === 'manual') {
      return !!this.referencePreview && this.comparisonPreviews.length > 0;
    }
    return true;
  }

  async analyze(): Promise<void> {
    this.isProcessing = true;
    this.showResults = false;

    // Simulate analysis steps
    for (const step of this.analysisSteps) {
      this.currentAnalysisStep = step;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Each step takes 1 second
      // Trigger animation
      const animationEvent = new CustomEvent('animationTriggered', { detail: step });
      window.dispatchEvent(animationEvent);
    }
  
    if (this.mode === 'manual') {
      // Generate results for each comparison image
      this.manualResults = this.comparisonPreviews.map(preview => ({
        similarity: Math.floor(Math.random() * 100),
        matched: Math.random() > 0.5,
        imageUrl: preview
      }));

      // Update summary statistics
      this.results.totalMatches = this.manualResults.filter(r => r.matched).length;
    } else if (this.mode === 'bulk') {
      // Generate random statistics for bulk mode
      this.sameNameMatches = Math.floor(Math.random() * 50) + 1; // 1 to 50
      this.differentNameMatches = Math.floor(Math.random() * 30) + 1; // 1 to 30
    }

    this.isProcessing = false;
    this.showResults = true;
  }

  uploadFromS3(){}

  processS3Images(){}

  downloadResults(): void {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Historical Data Analysis Results', pageWidth/2, 20, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth/2, 30, { align: 'center' });
    
    // Add match statistics
    doc.setFontSize(16);
    doc.text('Match Statistics', pageWidth/2, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Matches with Same Name: ${this.sameNameMatches}`, 20, 70);
    doc.text(`Matches with Different Name: ${this.differentNameMatches}`, 20, 85);
    
    // Save the PDF
    doc.save('historical-data-analysis-results.pdf');
  }
}