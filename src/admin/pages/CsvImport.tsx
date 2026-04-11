import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, AlertCircle, CheckCircle, FileText, X, Download } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';

interface StudentRecord {
  studentId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  enrollmentDate: string;
}

interface ImportResult {
  record: StudentRecord;
  status: 'valid' | 'error';
  message: string;
}

export default function CsvImport() {
  const navigate = useNavigate();
  const [fileContent, setFileContent] = useState('');
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState({ status: 'all' as 'all' | 'valid' | 'error' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setImportResults([]);
    };
    reader.readAsText(file);
  };

  const parseAndValidate = () => {
    if (!fileContent) {
      toast.error('Please upload a CSV file first');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const lines = fileContent.split('\n').filter((line) => line.trim());
      const headers = lines[0].toLowerCase().split(',');

      const results: ImportResult[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        
        if (values.length < 6) continue;

        const record: StudentRecord = {
          studentId: values[0],
          name: values[1],
          email: values[2],
          campus: values[3] as 'Lagos Island' | 'Lagos Mainland',
          level: values[4] as 'Level 1' | 'Level 2',
          enrollmentDate: values[5],
        };

        // Validation
        const errors: string[] = [];

        if (!record.studentId || record.studentId.length === 0) {
          errors.push('Student ID is required');
        }
        if (!record.name || record.name.length < 2) {
          errors.push('Valid name is required');
        }
        if (!record.email || !record.email.includes('@')) {
          errors.push('Valid email is required');
        }
        if (!['Lagos Island', 'Lagos Mainland'].includes(record.campus)) {
          errors.push('Campus must be Lagos Island or Lagos Mainland');
        }
        if (!['Level 1', 'Level 2'].includes(record.level)) {
          errors.push('Level must be Level 1 or Level 2');
        }
        if (!record.enrollmentDate) {
          errors.push('Enrollment date is required');
        }

        results.push({
          record,
          status: errors.length === 0 ? 'valid' : 'error',
          message: errors.length === 0 ? 'Ready to import' : errors.join('; '),
        });
      }

      setImportResults(results);
      setIsProcessing(false);

      const validCount = results.filter((r) => r.status === 'valid').length;
      const errorCount = results.filter((r) => r.status === 'error').length;
      toast.success(`Processed ${results.length} records (${validCount} valid, ${errorCount} errors)`);
    }, 500);
  };

  const handleImport = () => {
    const validRecords = importResults.filter((r) => r.status === 'valid');
    if (validRecords.length === 0) {
      toast.error('No valid records to import');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      // In a real app, this would save to database
      toast.success(`✓ Imported ${validRecords.length} students successfully`);
      setFileContent('');
      setImportResults([]);
      setIsProcessing(false);
    }, 800);
  };

  const downloadTemplate = () => {
    const template = 'StudentID,Name,Email,Campus,Level,EnrollmentDate\nSTU001,John Doe,john@example.com,Lagos Island,Level 1,Jan 10 2026\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
  };

  const filteredResults = useMemo(() => {
    if (filters.status === 'all') return importResults;
    return importResults.filter((r) => r.status === filters.status);
  }, [importResults, filters]);

  const validCount = importResults.filter((r) => r.status === 'valid').length;
  const errorCount = importResults.filter((r) => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin.html#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Dashboard" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            CSV Import
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Import students from CSV and review skipped records.
            <br className="hidden sm:block" />
            Validate your data before adding students to the system.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload CSV File</h2>
            <p className="text-slate-600 mb-6">Drop your CSV file here or click to browse</p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-block px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Choose File
            </label>

            {fileContent && (
              <div className="mt-4 text-sm text-slate-600">
                <p className="font-semibold">✓ File loaded ({Math.round(fileContent.length / 1024)} KB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Template Download */}
        <div className="mb-10 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Need a template?</p>
              <p className="text-sm text-blue-700">Download our CSV template to get started</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
        </div>

        {/* Preview and Validation */}
        {fileContent && (
          <>
            {/* Stats */}
            {importResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{importResults.length}</div>
                  <p className="text-sm font-medium text-slate-600">Total Records</p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <div className="text-3xl font-bold text-green-900 mb-1">{validCount}</div>
                  <p className="text-sm font-medium text-green-600">Valid</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="text-3xl font-bold text-red-900 mb-1">{errorCount}</div>
                  <p className="text-sm font-medium text-red-600">Errors</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-10">
              <button
                onClick={parseAndValidate}
                disabled={isProcessing}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Validate Data'}
              </button>
              {validCount > 0 && (
                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Importing...' : `Import ${validCount} Records`}
                </button>
              )}
              <button
                onClick={() => {
                  setFileContent('');
                  setImportResults([]);
                }}
                className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Results Table */}
            {importResults.length > 0 && (
              <>
                {/* Filter */}
                <div className="mb-6 flex gap-2">
                  {['all', 'valid', 'error'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilters({ status: status as 'all' | 'valid' | 'error' })}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filters.status === status
                          ? 'bg-black text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'all'
                        ? `All (${importResults.length})`
                        : status === 'valid'
                        ? `Valid (${validCount})`
                        : `Errors (${errorCount})`}
                    </button>
                  ))}
                </div>

                {/* Results */}
                <div className="space-y-3 mb-12">
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <p>No {filters.status === 'all' ? 'records' : filters.status} records found</p>
                    </div>
                  ) : (
                    filteredResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 flex items-start gap-4 ${
                          result.status === 'valid'
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        {result.status === 'valid' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{result.record.name}</p>
                          <p className="text-sm text-slate-600">
                            {result.record.studentId} • {result.record.email} • {result.record.level}
                          </p>
                          {result.status === 'error' && (
                            <p className="text-sm text-red-700 mt-1">Error: {result.message}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${
                            result.status === 'valid'
                              ? 'bg-green-200 text-green-900'
                              : 'bg-red-200 text-red-900'
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
