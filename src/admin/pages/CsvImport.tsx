import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, X, Download } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PageShell from '../../components/PageShell';
import SectionHeading from '../../components/SectionHeading';
import BackButton from '../../components/BackButton';

interface ParsedRow {
  rowIndex: number;
  studentId: string;
  name: string;
  level: string;
  campus: string;
  email: string;
  error?: string;
}

type Step = 'upload' | 'preview' | 'done';

const ADMIN_NAV = [
  { label: 'Student Records', href: '/admin.html#/students' },
  { label: 'ID Collection', href: '/admin.html#/id-cards' },
  { label: 'Volunteer Accounts', href: '/admin.html#/volunteers' },
  { label: 'Reports', href: '/admin.html#/reports' },
  { label: 'Approvals Queue', href: '/admin.html#/approvals' },
];

const SAMPLE_CSV = `studentId,name,level,campus,email
STU017,Akin Martins,Level 1,Lagos Island,akin@bibleschool.edu
STU018,Bola Okafor,Level 2,Lagos Mainland,bola@bibleschool.edu
STU019,Chibike Nwosu,Level 1,Lagos Island,chibike@bibleschool.edu
,Missing Name Student,Level 1,Lagos Island,missing@bibleschool.edu
STU021,Dami Adeyinka,,Lagos Mainland,dami@bibleschool.edu`;

function parseCSV(text: string): { valid: ParsedRow[]; skipped: ParsedRow[] } {
  const lines = text.trim().split('\n');
  const valid: ParsedRow[] = [];
  const skipped: ParsedRow[] = [];

  lines.slice(1).forEach((line, i) => {
    const [studentId, name, level, campus, email] = line.split(',').map(s => s.trim());
    const row: ParsedRow = { rowIndex: i + 2, studentId, name, level, campus, email: email ?? '' };

    const errors: string[] = [];
    if (!studentId) errors.push('Missing Student ID');
    if (!name) errors.push('Missing Name');
    if (!level) errors.push('Missing Level');
    if (!campus) errors.push('Missing Campus');

    if (errors.length) {
      row.error = errors.join('; ');
      skipped.push(row);
    } else {
      valid.push(row);
    }
  });

  return { valid, skipped };
}

export default function CsvImport() {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [valid, setValid] = useState<ParsedRow[]>([]);
  const [skipped, setSkipped] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setValid(result.valid);
      setSkipped(result.skipped);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    toast.success(`${valid.length} student${valid.length !== 1 ? 's' : ''} imported successfully.`);
    setStep('done');
  };

  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setValid([]);
    setSkipped([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell ctaHref="/admin.html#/dashboard" navbarItems={ADMIN_NAV}>
      <Toaster position="top-right" richColors />
      <div className="pt-10 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <SectionHeading
            title="CSV Import"
            subtitle="Upload a CSV file to bulk-import student records. Rows with missing required fields are skipped and shown for review."
          />
          <BackButton to="/dashboard" label="Dashboard" className="shrink-0 mt-1" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {(['upload', 'preview', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-black text-white' : step === 'done' || (s === 'upload' && step !== 'upload') ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {(step === 'preview' && s === 'upload') || step === 'done' ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-semibold capitalize hidden sm:inline ${step === s ? 'text-black' : 'text-slate-400'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
                isDragging ? 'border-orange-400 bg-orange-50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-orange-500' : 'text-slate-400'}`} />
              <p className="text-base font-bold text-slate-700 mb-1">Drag & drop your CSV here</p>
              <p className="text-sm text-slate-400">or click to browse files</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm font-bold text-slate-700 mb-2">Required CSV columns</p>
              <div className="flex flex-wrap gap-2">
                {['studentId', 'name', 'level', 'campus', 'email'].map(col => (
                  <code key={col} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono">{col}</code>
                ))}
              </div>
              <button onClick={downloadSample} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download sample CSV
              </button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">{fileName}</span>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-black transition-colors">
                <X className="w-4 h-4" /> Change file
              </button>
            </div>

            {/* Valid rows */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h3 className="font-bold text-black">Ready to import — {valid.length} row{valid.length !== 1 ? 's' : ''}</h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Row', 'Student ID', 'Name', 'Level', 'Campus', 'Email'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {valid.map(row => (
                      <tr key={row.rowIndex} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400">{row.rowIndex}</td>
                        <td className="px-4 py-3 font-mono text-slate-700">{row.studentId}</td>
                        <td className="px-4 py-3 font-semibold text-black">{row.name}</td>
                        <td className="px-4 py-3 text-slate-600">{row.level}</td>
                        <td className="px-4 py-3 text-slate-600">{row.campus}</td>
                        <td className="px-4 py-3 text-slate-500">{row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skipped rows */}
            {skipped.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-black">Skipped — {skipped.length} row{skipped.length !== 1 ? 's' : ''} with errors</h3>
                </div>
                <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 border-b border-amber-200">
                        {['Row', 'Name', 'Student ID', 'Issue'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {skipped.map(row => (
                        <tr key={row.rowIndex} className="bg-amber-50/50">
                          <td className="px-4 py-3 text-amber-600">{row.rowIndex}</td>
                          <td className="px-4 py-3 text-slate-700">{row.name || '—'}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{row.studentId || '—'}</td>
                          <td className="px-4 py-3 text-amber-700 font-medium">{row.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleImport}
                disabled={valid.length === 0}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import {valid.length} Student{valid.length !== 1 ? 's' : ''}
              </button>
              <button onClick={handleReset} className="px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-black mb-3">Import complete</h2>
            <p className="text-slate-500 mb-8">
              {valid.length} student{valid.length !== 1 ? 's were' : ' was'} added to the registry.
              {skipped.length > 0 && ` ${skipped.length} row${skipped.length !== 1 ? 's were' : ' was'} skipped.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-3.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-slate-800 transition-all"
              >
                Import another file
              </button>
              <a
                href="/admin.html#/students"
                className="px-8 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                View student records
              </a>
            </div>
          </div>
        )}
      </div>

      <footer className="py-10 border-t border-slate-100 text-center">
        <p className="italic text-slate-400 text-xs font-serif">"Whatever you do, work at it with all your heart"</p>
      </footer>
    </PageShell>
  );
}
