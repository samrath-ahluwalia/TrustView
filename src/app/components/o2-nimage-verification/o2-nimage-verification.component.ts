import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

interface AnalysisResults {
  similarityScore: number;
  confidenceScore: number;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface S3Config {
  bucket: string;
  prefix?: string;
}

interface S3Image {
  key: string;
  url: string;
}

@Component({
  selector: 'app-o2-nimage-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './o2-nimage-verification.component.html',
  styleUrls: ['./o2-nimage-verification.component.css']
})
export class O2NImageVerificationComponent {
  features: Feature[] = [
    {
      icon: 'fas fa-camera',
      title: 'Blur Detection',
      description: 'Advanced algorithms detect and measure image blur to ensure photo quality.'
    },
    {
      icon: 'fas fa-user-check',
      title: 'Human Verification',
      description: 'Accurate detection of human faces in images with high confidence scoring.'
    },
    {
      icon: 'fas fa-head-side-mask',
      title: 'Mask Detection',
      description: 'Identifies the presence of face masks for compliance and security purposes.'
    }
  ];

  // Manual mode properties
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  showAnalysis = false;
  uploadError: string | null = null;
  
  // Bulk mode properties
  isBulkMode = false;
  isLoadingS3 = false;
  s3ImagesLoaded = false;
  s3Images: S3Image[] = [];
  s3Config: S3Config = {
    bucket: '',
    prefix: ''
  };
  showBulkAnalysis = false;
  
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  bulkAnalysisResults: Array<{
    filename: string;
    blur: string;
    human: string;
    mask: string;
  }> = [];

  analysisResults = {
    blur: '',
    human: '',
    mask: ''
  };

  // Add new properties for the face outline loader
  showFaceOutline: boolean = false;
  currentAnalysisStep: string = '';
  analysisSteps: string[] = [
    'Initializing Analysis...',
    'Detecting Face Features...',
    'Analyzing Image Quality...',
    'Verifying Identity...',
    'Completing Analysis...'
  ];

  setMode(bulk: boolean) {
    this.isBulkMode = bulk;
    this.resetState();
  }

  resetState() {
    // Reset manual mode
    this.selectedFile = null;
    this.previewUrl = null;
    this.showAnalysis = false;
    this.uploadError = null;
    
    // Reset bulk mode
    this.s3ImagesLoaded = false;
    this.s3Images = [];
    this.showBulkAnalysis = false;
    this.bulkAnalysisResults = [];
    this.isLoadingS3 = false;
    this.s3Config = {
      bucket: '',
      prefix: ''
    };
    
    this.analysisResults = {
      blur: '',
      human: '',
      mask: ''
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('upload-container');
    dropZone?.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('upload-container');
    dropZone?.classList.remove('drag-over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('upload-container');
    dropZone?.classList.remove('drag-over');
    
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.handleFile(file);
      }
    }
  }

  handleFile(file: File) {
    this.uploadError = null;
    
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please upload an image file (PNG, JPG, or JPEG)';
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.uploadError = 'File size exceeds 5MB limit';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.onerror = () => {
      this.uploadError = 'Error reading file';
      this.selectedFile = null;
      this.previewUrl = null;
    };
    reader.readAsDataURL(file);
  }

  async importFromS3() {
    if (!this.s3Config.bucket) {
      return;
    }

    this.isLoadingS3 = true;
    this.s3ImagesLoaded = false;
    this.s3Images = [];

    try {
      // Simulate S3 API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock S3 response
      this.s3Images = [
        { key: 'images/person1.jpg', url: 'https://example.com/person1.jpg' },
        { key: 'images/person2.jpg', url: 'https://example.com/person2.jpg' },
        { key: 'images/person3.jpg', url: 'https://example.com/person3.jpg' }
      ];
      
      this.s3ImagesLoaded = true;
    } catch (error) {
      this.uploadError = 'Error loading images from S3';
    } finally {
      this.isLoadingS3 = false;
    }
  }

  analyzeImage() {
    if (!this.selectedFile) return;

    this.showFaceOutline = true;
    this.showAnalysis = false;
    
    // Simulate analysis steps
    let currentStepIndex = 0;
    const stepInterval = setInterval(() => {
      this.currentAnalysisStep = this.analysisSteps[currentStepIndex];
      currentStepIndex++;
      
      if (currentStepIndex >= this.analysisSteps.length) {
        clearInterval(stepInterval);
        
        // Generate analysis results
        this.analysisResults = {
          blur: 'Not Blurry',
          human: 'Human Detected',
          mask: 'No Mask'
        };
        
        // Hide loader and show results after a short delay
        setTimeout(() => {
          this.showFaceOutline = false;
          this.showAnalysis = true;
        }, 1000);
      }
    }, 2000);
  }

  analyzeBulkImages() {
    // Show the loader immediately
    this.showFaceOutline = true;
    this.showBulkAnalysis = false;
    
    // Simulate analysis steps
    let currentStepIndex = 0;
    const stepInterval = setInterval(() => {
      this.currentAnalysisStep = this.analysisSteps[currentStepIndex];
      currentStepIndex++;
      
      if (currentStepIndex >= this.analysisSteps.length) {
        clearInterval(stepInterval);
        
        // Generate analysis results
        this.bulkAnalysisResults = this.s3Images.map(image => ({
          filename: image.key,
          blur: 'Not Blurry',
          human: 'Human Detected',
          mask: 'No Mask'
        }));
        
        // Hide loader and show results after a short delay
        setTimeout(() => {
          this.showFaceOutline = false;
          this.showBulkAnalysis = true;
        }, 1000);
      }
    }, 2000);
  }

  downloadPdfReport() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text('S3 Image Analysis Report', pageWidth/2, 20, { align: 'center' });
    
    // Add S3 bucket info
    doc.setFontSize(12);
    doc.text(`Bucket: ${this.s3Config.bucket}`, pageWidth/2, 30, { align: 'center' });
    if (this.s3Config.prefix) {
      doc.text(`Prefix: ${this.s3Config.prefix}`, pageWidth/2, 40, { align: 'center' });
    }
    
    // Add timestamp
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth/2, 50, { align: 'center' });
    
    // Add results table
    let yPos = 70;
    const lineHeight = 10;
    
    this.bulkAnalysisResults.forEach((result, index) => {
      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Image ${index + 1}: ${result.filename}`, 20, yPos);
      yPos += lineHeight;
      
      doc.setFontSize(12);
      doc.text(`Blur Detection: ${result.blur}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Human Verification: ${result.human}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Mask Detection: ${result.mask}`, 30, yPos);
      yPos += lineHeight * 1.5;
    });
    
    // Save the PDF
    doc.save('s3-image-analysis-report.pdf');
  }
}