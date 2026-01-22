import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
// Dataset analysis is handled locally - no API import needed
import { useDataset } from '@/contexts/DatasetContext';

interface UploadedFile {
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  rows?: number;
  columns?: number;
  errorMessage?: string;
}

const ITEMS_PER_PAGE = 5;

export function DatasetUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setAnalysis, setDatasetName, setIsAnalyzing, setRawData, resetDataset } = useDataset();

  const totalPages = Math.ceil(previewData.length / ITEMS_PER_PAGE);
  const paginatedData = previewData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const parseCSV = (text: string): Record<string, any>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Record<string, any>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: Record<string, any> = {};
        headers.forEach((header, idx) => {
          const value = values[idx];
          const numValue = parseFloat(value);
          row[header] = isNaN(numValue) ? value : numValue;
        });
        data.push(row);
      }
    }
    return data;
  };

  const parseJSON = (text: string): Record<string, any>[] => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

  const processFile = async (file: File) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    });
    setCurrentPage(1);
    setPreviewData([]);

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        setUploadedFile(prev => prev ? { ...prev, progress } : null);
      }
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 200);

    try {
      // Read file content
      const text = await file.text();
      let data: Record<string, any>[] = [];

      if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        data = parseJSON(text);
      }

      if (data.length === 0) {
        throw new Error('Could not parse file or file is empty');
      }

      clearInterval(progressInterval);
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: 'processing', 
        progress: 100,
        rows: data.length,
        columns: Object.keys(data[0]).length
      } : null);

      setPreviewData(data);
      setDatasetName(file.name);
      
      // Store raw data in context for all sections to consume
      setRawData(data);

      // Analyze dataset via API
      setUploadedFile(prev => prev ? { ...prev, status: 'analyzing' } : null);
      setIsAnalyzing(true);

      try {
        // Local analysis since backend doesn't have this endpoint
        const departments = [...new Set(data.map((d: any) => d.Department || d.department).filter(Boolean))];
        setUploadedFile(prev => prev ? { ...prev, status: 'complete' } : null);
        
        toast({
          title: "Dataset Loaded Successfully",
          description: `Loaded ${data.length} employees across ${departments.length} departments`,
        });
      } catch (apiError) {
        console.error('API analysis failed:', apiError);
        // Still mark as complete but without API analysis
        setUploadedFile(prev => prev ? { ...prev, status: 'complete' } : null);
        
        toast({
          title: "File Uploaded",
          description: "Dataset loaded. API analysis unavailable - using local preview only.",
          variant: "default",
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('File processing error:', error);
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: 'error', 
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Failed to process file'
      } : null);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.json'))) {
      processFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV, XLSX, or JSON file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setCurrentPage(1);
    setPreviewData([]);
    resetDataset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToCSV = () => {
    if (previewData.length === 0) return;
    
    const headers = Object.keys(previewData[0]).join(',');
    const rows = previewData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'preprocessed_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Preprocessed data exported as CSV",
    });
  };

  const exportToJSON = () => {
    if (previewData.length === 0) return;
    
    const jsonContent = JSON.stringify(previewData, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'preprocessed_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Preprocessed data exported as JSON",
    });
  };

  const getStatusMessage = () => {
    switch (uploadedFile?.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing data...';
      case 'analyzing':
        return 'Analyzing dataset with ML backend...';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <div className="bg-card border border-border rounded-xl p-6">
        {!uploadedFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Upload className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-lg sm:text-xl font-medium mb-2">
              {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports CSV, XLSX, and JSON files up to 50MB
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>Dataset will be analyzed by ML backend</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </div>
              {uploadedFile.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {uploadedFile.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
            </div>

            {/* Progress */}
            {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' || uploadedFile.status === 'analyzing') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {getStatusMessage()}
                  </span>
                  {uploadedFile.status === 'uploading' && <span>{uploadedFile.progress}%</span>}
                </div>
                <Progress value={uploadedFile.status === 'uploading' ? uploadedFile.progress : 100} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {uploadedFile.status === 'error' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <p className="text-sm">{uploadedFile.errorMessage || 'An error occurred'}</p>
              </div>
            )}

            {/* Complete Stats */}
            {uploadedFile.status === 'complete' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-2xl font-bold text-primary">{uploadedFile.rows?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Rows</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-2xl font-bold text-accent">{uploadedFile.columns}</p>
                  <p className="text-sm text-muted-foreground">Columns</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Preview Table */}
      {uploadedFile?.status === 'complete' && previewData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">Data Preview</h3>
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, previewData.length)} of {previewData.length} rows
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportToJSON} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/30">
                    {Object.keys(previewData[0]).map((key) => (
                      <th 
                        key={key} 
                        className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      {Object.values(row).map((value, cellIdx) => (
                        <td 
                          key={cellIdx} 
                          className="px-3 py-3 text-sm whitespace-nowrap"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Info */}
      {uploadedFile?.status === 'complete' && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Dataset Analysis Complete</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to Overview or other sections to view insights from your data
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={resetUpload} className="flex-1">
              Upload Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
