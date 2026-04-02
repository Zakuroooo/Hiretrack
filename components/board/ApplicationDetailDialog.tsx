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
} from 'lucide-react';
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

  const gradientIdx = company.charCodeAt(0) % GRADIENT_COLORS.length;

  const scoreColor =
    aiMatchScore !== undefined
      ? aiMatchScore > 75
        ? { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', label: 'Strong Match' }
        : aiMatchScore >= 50
        ? { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', label: 'Moderate Match' }
        : { bg: 'rgba(239,68,68,0.1)', text: '#f87171', label: 'Low Match' }
      : null;

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
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Sparkles size={16} style={{ color: scoreColor.text }} />
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: scoreColor.text }}
                >
                  AI Match Score: {aiMatchScore}/100
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#7096b8' }}>
                {scoreColor.label}
              </span>
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
