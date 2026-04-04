'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trash2,
  Upload,
  X,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

// ── Types ──
interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  keywords: { matched: string[]; missing: string[] };
  recommendation: string;
  interviewReadiness: 'Low' | 'Medium' | 'High';
}

interface SimpleApplication {
  _id: string;
  company: string;
  role: string;
  jobDescription?: string;
  resumeUrl?: string;
  aiMatchData?: AnalysisResult;
}

interface HistoryEntry {
  date: string;
  score: number;
  jdPreview: string;
  jd: string;
  resume: string;
}

// ── Constants ──
const HISTORY_KEY = 'hiretrack-ai-history';

const cardStyle: React.CSSProperties = {
  background: '#0d1421',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: 24,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 180,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: 14,
  color: '#e2f0ff',
  fontSize: 14,
  lineHeight: 1.6,
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease',
  outline: 'none',
};

// ── Page ──
export default function AIMatchPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const resumePdfRef = useRef<HTMLInputElement>(null);

  // Fetch applications for dropdown
  const { data: applications } = useQuery<SimpleApplication[]>({
    queryKey: ['applications-simple'],
    queryFn: () =>
      axios
        .get('/applications?limit=50')
        .then((r) => r.data.data.applications),
    staleTime: 60000,
  });

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryEntry[];
        setHistory(parsed.slice(0, 3));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const extractTextFromPdf = async (file: File) => {
    setIsExtractingPdf(true);
    setUploadedFileName(file.name);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }

      const cleaned = fullText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      if (cleaned.length < 50) {
        toast.error('Could not extract text from PDF. Please paste manually.');
        setUploadedFileName('');
        return;
      }

      setResumeText(cleaned);
      toast.success('Resume text extracted successfully!');
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast.error('Failed to extract PDF text. Please paste your resume manually.');
      setUploadedFileName('');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleSelectApplication = (appId: string) => {
    setSelectedApplicationId(appId);
    if (!appId) return;

    const app = applications?.find(a => a._id === appId);
    if (app) {
      if (app.jobDescription && !jobDescription) {
        setJobDescription(app.jobDescription);
        toast.success("Job description loaded from application");
      }
      if (app.aiMatchData) {
        setResult(app.aiMatchData);
      }
    }
  };

  const selectedApp = applications?.find(a => a._id === selectedApplicationId);

  const isValid = jobDescription.length >= 50 && resumeText.length >= 100;

  const handleAnalyze = async () => {
    if (!isValid) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/ai/match', {
        jobDescription,
        resumeText,
        applicationId: selectedApplicationId || undefined,
      });
      const data = response.data.data as AnalysisResult;
      setResult(data);

      // Save to history
      const newEntry: HistoryEntry = {
        date: new Date().toISOString(),
        score: data.score,
        jdPreview: jobDescription.slice(0, 60),
        jd: jobDescription,
        resume: resumeText,
      };
      const existing: HistoryEntry[] = (() => {
        try {
          return JSON.parse(
            localStorage.getItem(HISTORY_KEY) || '[]'
          );
        } catch {
          return [];
        }
      })();
      const updated = [newEntry, ...existing].slice(0, 3);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);

      toast.success('Analysis complete!');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Analysis failed';
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return '#ef4444';
    if (score < 75) return '#f59e0b';
    return '#22c55e';
  };

  const getScoreBg = (score: number) => {
    if (score < 50) return 'rgba(239,68,68,0.1)';
    if (score < 75) return 'rgba(245,158,11,0.1)';
    return 'rgba(34,197,94,0.1)';
  };

  const getReadinessStyle = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          background: 'rgba(239,68,68,0.1)',
          color: '#f87171',
          border: '1px solid rgba(239,68,68,0.2)',
        };
      case 'Medium':
        return {
          background: 'rgba(245,158,11,0.1)',
          color: '#fbbf24',
          border: '1px solid rgba(245,158,11,0.2)',
        };
      case 'High':
        return {
          background: 'rgba(34,197,94,0.1)',
          color: '#4ade80',
          border: '1px solid rgba(34,197,94,0.2)',
        };
      default:
        return {
          background: 'rgba(255,255,255,0.05)',
          color: '#7096b8',
          border: '1px solid rgba(255,255,255,0.08)',
        };
    }
  };

  const circumference = 2 * Math.PI * 70;

  return (
    <PageTransition>
      <div>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Sparkles
              size={24}
              style={{
                color: '#0ea5e9',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                background:
                  'linear-gradient(135deg, #0ea5e9, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Resume Match
            </h1>
          </div>
          <p
            style={{
              fontSize: 14,
              color: '#7096b8',
              marginTop: 4,
              margin: 0,
              marginLeft: 34,
            }}
          >
            Paste a job description and your resume to get an instant
            AI compatibility score
          </p>
        </div>

        {/* TWO PANEL LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* ─────────── LEFT PANEL — Inputs ─────────── */}
          <div style={cardStyle}>
            {/* Job Description */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Briefcase size={14} style={{ color: '#0ea5e9' }} />
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#7096b8',
                    }}
                  >
                    Job Description
                  </label>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color:
                      jobDescription.length >= 50
                        ? '#22c55e'
                        : '#f59e0b',
                    fontWeight: 500,
                  }}
                >
                  {jobDescription.length}/50 min
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                style={textareaStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = '#0ea5e9')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    'rgba(255,255,255,0.08)')
                }
              />
            </div>

            {/* Resume Section */}
            <div style={{ marginBottom: 16 }}>

              {/* Label row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} color="#0ea5e9" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                    Your Resume
                  </span>
                </div>
                <span style={{
                  fontSize: 12,
                  color: resumeText.length >= 100 ? '#22c55e' : '#f59e0b',
                }}>
                  {resumeText.length}/100 min
                </span>
              </div>

              {/* PDF Upload Button */}
              <div style={{ marginBottom: 10 }}>
                <input
                  type="file"
                  accept=".pdf"
                  ref={resumePdfRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('File too large. Max 5MB');
                        return;
                      }
                      extractTextFromPdf(file);
                    }
                    e.target.value = '';
                  }}
                />

                {/* Upload area */}
                <div
                  onClick={() => !isExtractingPdf && resumePdfRef.current?.click()}
                  style={{
                    border: uploadedFileName
                      ? '1px solid rgba(34,197,94,0.3)'
                      : '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: isExtractingPdf ? 'not-allowed' : 'pointer',
                    background: uploadedFileName
                      ? 'rgba(34,197,94,0.05)'
                      : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                    marginBottom: 10,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExtractingPdf && !uploadedFileName) {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        'rgba(14,165,233,0.4)';
                      (e.currentTarget as HTMLDivElement).style.background =
                        'rgba(14,165,233,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!uploadedFileName) {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLDivElement).style.background =
                        'rgba(255,255,255,0.02)';
                    }
                  }}
                >
                  {isExtractingPdf ? (
                    <>
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: '2px solid rgba(14,165,233,0.2)',
                        borderTop: '2px solid #0ea5e9',
                        animation: 'spin 0.8s linear infinite',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 13, color: '#7096b8' }}>
                        Extracting text from PDF...
                      </span>
                    </>
                  ) : uploadedFileName ? (
                    <>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: 'rgba(34,197,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <FileText size={16} color="#22c55e" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#4ade80' }}>
                          ✓ Resume extracted
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: '#7096b8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {uploadedFileName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFileName('');
                          setResumeText('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: '#4a6080',
                          flexShrink: 0,
                        }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: 'rgba(14,165,233,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Upload size={16} color="#0ea5e9" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#e2f0ff' }}>
                          Upload Resume PDF
                        </div>
                        <div style={{ fontSize: 11, color: '#7096b8', marginTop: 2 }}>
                          PDF only · max 5MB · text extracted automatically
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: '#3d5a7a' }}>or paste manually</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Manual textarea */}
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (e.target.value && uploadedFileName) {
                    setUploadedFileName('');
                  }
                }}
                placeholder="Or copy and paste your resume text here..."
                style={{
                  width: '100%',
                  minHeight: 140,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: 14,
                  color: '#e2f0ff',
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {selectedApp && selectedApp.resumeUrl && (
                <div style={{ marginTop: 10, padding: 10, background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Paperclip size={13} color="#0ea5e9" />
                  <span style={{ fontSize: 12, color: '#7096b8' }}>
                    Resume on file for {selectedApp.company} —
                  </span>
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'none' }}
                  >
                    View
                  </a>
                </div>
              )}
            </div>

            {/* Link to Application */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#7096b8',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Save results to application (optional)
              </label>
              <select
                value={selectedApplicationId}
                onChange={(e) => handleSelectApplication(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#e2f0ff',
                  fontSize: 14,
                  width: '100%',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="" style={{ background: '#0d1421' }}>
                  Don&apos;t save results
                </option>
                {applications?.map((app) => (
                  <option
                    key={app._id}
                    value={app._id}
                    style={{ background: '#0d1421' }}
                  >
                    {app.company} — {app.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!isValid || isAnalyzing}
              style={{
                width: '100%',
                height: 52,
                marginTop: 8,
                background: isValid
                  ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: 12,
                color: isValid ? 'white' : '#3d5a7a',
                fontSize: 15,
                fontWeight: 600,
                cursor: isValid && !isAnalyzing ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (isValid && !isAnalyzing) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(14,165,233,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" /> Analyzing your match...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Analyze Match
                </>
              )}
            </button>

            {/* Recent Analyses */}
            {history.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: '#4a6080',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                    }}
                  >
                    Recent Analyses
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem(HISTORY_KEY);
                      setHistory([]);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#3d5a7a',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
                {history.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom:
                        i < history.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: getScoreBg(entry.score),
                        color: getScoreColor(entry.score),
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {entry.score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#e2f0ff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.jdPreview.slice(0, 45)}
                        {entry.jdPreview.length > 45 ? '...' : ''}
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#4a6080' }}
                      >
                        {new Date(entry.date).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setJobDescription(entry.jd);
                        setResumeText(entry.resume);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: 12,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}
                    >
                      Restore →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─────────── RIGHT PANEL — Results ─────────── */}
          <div>
            {!result ? (
              /* Empty State */
              <div
                style={{
                  ...cardStyle,
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <Sparkles
                  size={64}
                  style={{ color: '#1e3a5f', margin: '0 auto 16px' }}
                />
                <div
                  style={{
                    fontSize: 16,
                    color: '#4a6080',
                    marginBottom: 8,
                  }}
                >
                  Your analysis will appear here
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#3d5a7a',
                    marginTop: 12,
                  }}
                >
                  Paste your details and click Analyze
                </div>
              </div>
            ) : (
              /* Results */
              <AnimatePresence mode="wait">
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {/* RESULT 1 — Score Circle */}
                  <div
                    style={{
                      ...cardStyle,
                      textAlign: 'center',
                    }}
                  >
                    <svg
                      width="160"
                      height="160"
                      viewBox="0 0 160 160"
                      style={{ margin: '0 auto', display: 'block' }}
                    >
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="10"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={getScoreColor(result.score)}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={
                          circumference *
                          (1 - result.score / 100)
                        }
                        transform="rotate(-90 80 80)"
                        style={{
                          transition:
                            'stroke-dashoffset 1.2s ease',
                        }}
                      />
                      {/* Center text */}
                      <text
                        x="80"
                        y="72"
                        textAnchor="middle"
                        fill="#e2f0ff"
                        fontSize="36"
                        fontWeight="700"
                        fontFamily="inherit"
                      >
                        {result.score}
                      </text>
                      <text
                        x="80"
                        y="92"
                        textAnchor="middle"
                        fill="#7096b8"
                        fontSize="13"
                        fontFamily="inherit"
                      >
                        / 100
                      </text>
                    </svg>

                    <div
                      style={{
                        color: '#7096b8',
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      Match Score
                    </div>

                    {/* Interview Readiness */}
                    <div
                      style={{
                        marginTop: 12,
                        display: 'inline-flex',
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        ...getReadinessStyle(
                          result.interviewReadiness
                        ),
                      }}
                    >
                      {result.interviewReadiness} Readiness
                    </div>
                  </div>

                  {/* RESULT 2 — Summary */}
                  <div
                    style={{
                      ...cardStyle,
                      padding: 20,
                      background:
                        'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(37,99,235,0.02))',
                      border: '1px solid rgba(14,165,233,0.1)',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 16,
                        fontSize: 48,
                        color: 'rgba(14,165,233,0.15)',
                        lineHeight: 1,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      &ldquo;
                    </span>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#c8deff',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        margin: 0,
                        paddingTop: 20,
                        paddingLeft: 8,
                      }}
                    >
                      {result.summary}
                    </p>
                  </div>

                  {/* RESULT 3 — Strengths & Gaps */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                    }}
                  >
                    {/* Strengths */}
                    <div
                      style={{
                        border: '1px solid rgba(34,197,94,0.15)',
                        background: 'rgba(34,197,94,0.03)',
                        borderRadius: 14,
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 12,
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          style={{ color: '#4ade80' }}
                        />
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#4ade80',
                          }}
                        >
                          Strengths
                        </span>
                      </div>
                      {result.strengths.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.05,
                            duration: 0.3,
                          }}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#4ade80',
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: '#94a3b8',
                              lineHeight: 1.5,
                            }}
                          >
                            {s}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Gaps */}
                    <div
                      style={{
                        border: '1px solid rgba(239,68,68,0.15)',
                        background: 'rgba(239,68,68,0.03)',
                        borderRadius: 14,
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 12,
                        }}
                      >
                        <XCircle
                          size={16}
                          style={{ color: '#f87171' }}
                        />
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#f87171',
                          }}
                        >
                          Areas to Improve
                        </span>
                      </div>
                      {result.gaps.map((g, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.05,
                            duration: 0.3,
                          }}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#f87171',
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: '#94a3b8',
                              lineHeight: 1.5,
                            }}
                          >
                            {g}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* RESULT 4 — Keywords */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    {/* Matched Keywords */}
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          color: '#4a6080',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                        }}
                      >
                        Matched Keywords
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        {result.keywords.matched.map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(34,197,94,0.1)',
                              color: '#4ade80',
                              border:
                                '1px solid rgba(34,197,94,0.2)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div style={{ marginTop: 16 }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: '#4a6080',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                        }}
                      >
                        Missing Keywords
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        {result.keywords.missing.map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(239,68,68,0.08)',
                              color: '#f87171',
                              border:
                                '1px solid rgba(239,68,68,0.2)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RESULT 5 — Recommendation */}
                  <div
                    style={{
                      borderLeft: '4px solid #0ea5e9',
                      padding: 20,
                      borderRadius: 14,
                      background: 'rgba(14,165,233,0.04)',
                      border: '1px solid rgba(14,165,233,0.15)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Lightbulb
                        size={16}
                        style={{ color: '#fbbf24' }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#0ea5e9',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Pro Tip
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#c8deff',
                        lineHeight: 1.6,
                        marginTop: 8,
                        margin: '8px 0 0 0',
                      }}
                    >
                      {result.recommendation}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Pulse animation for sparkle icon */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </PageTransition>
  );
}
