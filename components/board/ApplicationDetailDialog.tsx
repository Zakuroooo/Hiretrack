'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Sparkles,
  Paperclip,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const STAGE_COLORS: Record<string, string> = {
  Applied: '#38bdf8',
  Screening: '#f59e0b',
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444',
};

const STAGE_BG: Record<string, string> = {
  Applied: 'rgba(56,189,248,0.1)',
  Screening: 'rgba(245,158,11,0.1)',
  Interview: 'rgba(167,139,250,0.1)',
  Offer: 'rgba(34,197,94,0.1)',
  Rejected: 'rgba(239,68,68,0.1)',
};

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #0ea5e9, #2563eb)',
  'linear-gradient(135deg, #a78bfa, #7c3aed)',
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
];

interface AiMatchData {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  keywords: { matched: string[]; missing: string[] };
  recommendation: string;
  interviewReadiness: string;
}

interface ApplicationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  application: Record<string, unknown> | null;
  onEdit: () => void;
}

export default function ApplicationDetailDialog({
  open,
  onClose,
  application,
  onEdit,
}: ApplicationDetailDialogProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const router = useRouter();

  if (!application) return null;

  const company = application.company as string;
  const role = application.role as string;
  const status = (application.status as string) || 'Applied';
  const location = application.location as string | undefined;
  const salary = application.salary as string | undefined;
  const jobUrl = application.jobUrl as string | undefined;
  const jobDescription = application.jobDescription as string | undefined;
  const notes = application.notes as string | undefined;
  const aiMatchScore = application.aiMatchScore as number | undefined;
  const appliedDate = application.appliedDate as string | undefined;
  const createdAt = application.createdAt as string;
  const resumeUrl = application.resumeUrl as string | undefined;
  
  const aiMatchData = application.aiMatchData as AiMatchData | undefined;

  const gradientIdx = company.charCodeAt(0) % GRADIENT_COLORS.length;

  const scoreColor =
    aiMatchScore !== undefined
      ? aiMatchScore > 75
        ? { bg: 'rgba(34,197,94,0.1)', arc: '#4ade80', text: '#4ade80', label: 'Strong Match' }
        : aiMatchScore >= 50
        ? { bg: 'rgba(245,158,11,0.1)', arc: '#fbbf24', text: '#fbbf24', label: 'Moderate Match' }
        : { bg: 'rgba(239,68,68,0.1)', arc: '#f87171', text: '#f87171', label: 'Low Match' }
      : null;

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

  const circumference = 2 * Math.PI * 40;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[560px]"
        style={{
          background: '#0d1421',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 0,
          overflow: 'hidden',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 24,
            background: 'rgba(14,165,233,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: GRADIENT_COLORS[gradientIdx],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {company[0].toUpperCase()}
              </div>
              <div>
                <DialogTitle
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#e2f0ff',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {company}
                </DialogTitle>
                <DialogDescription
                  style={{
                    fontSize: 14,
                    color: '#7096b8',
                    marginTop: 4,
                  }}
                >
                  {role}
                </DialogDescription>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: 20,
                background: STAGE_BG[status] || STAGE_BG.Applied,
                color: STAGE_COLORS[status] || STAGE_COLORS.Applied,
                border: `1px solid ${(STAGE_COLORS[status] || STAGE_COLORS.Applied)}33`,
                flexShrink: 0,
              }}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 24,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {/* Applied Date */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#4a6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Applied Date
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#e2f0ff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Calendar size={14} style={{ color: '#7096b8' }} />
              {format(
                new Date(appliedDate || createdAt),
                'MMM dd, yyyy'
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#4a6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Location
            </div>
            <div
              style={{
                fontSize: 14,
                color: location ? '#e2f0ff' : '#3d5a7a',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MapPin size={14} style={{ color: '#7096b8' }} />
              {location || 'Not specified'}
            </div>
          </div>

          {/* Salary */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#4a6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Salary
            </div>
            <div
              style={{
                fontSize: 14,
                color: salary ? '#e2f0ff' : '#3d5a7a',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <DollarSign size={14} style={{ color: '#7096b8' }} />
              {salary || 'Not specified'}
            </div>
          </div>

          {/* Job URL */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#4a6080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Job URL
            </div>
            {jobUrl ? (
              <a
                href={jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 14,
                  color: '#38bdf8',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ExternalLink size={14} />
                View posting
              </a>
            ) : (
              <div
                style={{
                  fontSize: 14,
                  color: '#3d5a7a',
                }}
              >
                No link provided
              </div>
            )}
          </div>

          {/* Resume badge */}
          {resumeUrl && (
            <div style={{ gridColumn: '1 / -1' }}>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: '#38bdf8',
                  background: 'rgba(14,165,233,0.1)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid rgba(14,165,233,0.2)',
                  textDecoration: 'none',
                }}
              >
                <Paperclip size={12} /> View Resume
              </a>
            </div>
          )}

          {/* AI Score */}
          {aiMatchScore !== undefined && scoreColor && (
            <div
              style={{
                gridColumn: '1 / -1',
                background: scoreColor.bg,
                borderRadius: 16,
                padding: 20,
              }}
            >
              {aiMatchData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Top Header: Circular Score + Summary */}
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                      <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle
                          cx="45"
                          cy="45"
                          r="40"
                          fill="none"
                          stroke={scoreColor.arc}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference * (1 - aiMatchData.score / 100)}
                          transform="rotate(-90 45 45)"
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: '#e2f0ff', lineHeight: 1 }}>{aiMatchData.score}</span>
                        <span style={{ fontSize: 10, color: '#7096b8' }}>/100</span>
                      </div>
                    </div>

                    <div style={{ flex: '1 1 min-content' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Sparkles size={16} style={{ color: scoreColor.text }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: scoreColor.text }}>AI Analysis</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            ...getReadinessStyle(aiMatchData.interviewReadiness),
                          }}
                        >
                          {aiMatchData.interviewReadiness}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#c8deff', fontStyle: 'italic', lineHeight: 1.5 }}>
                        &ldquo;{aiMatchData.summary}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Body: Strengths & Gaps */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <CheckCircle2 size={14} color="#4ade80" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>Strengths</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8deff', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {aiMatchData.strengths.map((str: string, i: number) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <XCircle size={14} color="#f87171" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>Gaps</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8deff', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {aiMatchData.gaps.map((gap: string, i: number) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer: Recommendation */}
                  <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #0ea5e9', padding: 12, borderRadius: '0 8px 8px 0' }}>
                    <Lightbulb size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: '#e2f0ff', lineHeight: 1.5 }}>
                      {aiMatchData.recommendation}
                    </span>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} style={{ color: scoreColor.text }} />
                    <span style={{ fontSize: 16, fontWeight: 600, color: scoreColor.text }}>
                      AI Match Score: {aiMatchScore}/100
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: '#7096b8' }}>
                    Run full AI Match to see analysis
                  </span>
                  <button
                    onClick={() => {
                      onClose()
                      router.push(`/dashboard/ai-match?appId=${application._id}`)
                    }}
                    style={{
                      background: 'rgba(14,165,233,0.1)',
                      color: '#38bdf8',
                      border: '1px solid rgba(14,165,233,0.2)',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Go to AI Match
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Job Description */}
          {jobDescription && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#4a6080',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Job Description
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#7096b8',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {showFullDesc || jobDescription.length <= 200
                  ? jobDescription
                  : `${jobDescription.slice(0, 200)}...`}
                {jobDescription.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: 13,
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: 4,
                    }}
                  >
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#4a6080',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Notes
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#7096b8',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#7096b8',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Edit Application
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
