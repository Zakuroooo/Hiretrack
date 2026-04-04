'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  Sparkles,
  Paperclip,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ApplicationData {
  _id: string;
  company: string;
  role: string;
  status: string;
  salary?: string;
  location?: string;
  appliedDate?: string;
  createdAt: string;
  aiMatchScore?: number;
  resumeUrl?: string;
  jobUrl?: string;
}

interface ApplicationCardProps {
  application: ApplicationData;
  onEdit: (application: ApplicationData) => void;
  onDelete: (id: string) => void;
  onView: (application: ApplicationData) => void;
  isDragging?: boolean;
}

export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onView,
  isDragging,
}: ApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
    zIndex: isSortableDragging ? 1000 : 'auto',
  };

  const scoreColor =
    application.aiMatchScore !== undefined
      ? application.aiMatchScore > 75
        ? { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' }
        : application.aiMatchScore >= 50
        ? { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' }
        : { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' }
      : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? '#111c2e' : '#0d1421',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 8,
        position: 'relative',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
      }}
      {...attributes}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(14,165,233,0.2)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        (e.currentTarget as HTMLDivElement).style.transform =
          `${CSS.Transform.toString(transform) || ''} translateY(-1px)`.trim();
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform =
          CSS.Transform.toString(transform) || '';
      }}
    >
      {/* ROW 1 — Company + Menu */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div
          {...listeners}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#e2f0ff',
            lineHeight: 1.3,
            cursor: 'grab',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {application.company}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 4,
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#4a6080',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              }}
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{
              background: '#0d1421',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 4,
              minWidth: 160,
            }}
          >
            <DropdownMenuItem
              onClick={() => onView(application)}
              style={{ cursor: 'pointer', gap: 8, padding: '6px 10px' }}
            >
              <Eye size={14} style={{ color: '#7096b8' }} />
              <span style={{ color: '#e2f0ff', fontSize: 13 }}>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(application)}
              style={{ cursor: 'pointer', gap: 8, padding: '6px 10px' }}
            >
              <Pencil size={14} style={{ color: '#7096b8' }} />
              <span style={{ color: '#e2f0ff', fontSize: 13 }}>Edit</span>
            </DropdownMenuItem>
            {application.jobUrl && (
              <DropdownMenuItem
                onClick={() => window.open(application.jobUrl, '_blank')}
                style={{ cursor: 'pointer', gap: 8, padding: '6px 10px' }}
              >
                <ExternalLink size={14} style={{ color: '#7096b8' }} />
                <span style={{ color: '#e2f0ff', fontSize: 13 }}>Open Job</span>
              </DropdownMenuItem>
            )}
            {application.resumeUrl && (
              <DropdownMenuItem
                onClick={() => window.open(application.resumeUrl, '_blank')}
                style={{ cursor: 'pointer', gap: 8, padding: '6px 10px' }}
              >
                <Paperclip size={14} style={{ color: '#7096b8' }} />
                <span style={{ color: '#e2f0ff', fontSize: 13 }}>Open Resume</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.06)' }} />
            <DropdownMenuItem
              onClick={() => onDelete(application._id)}
              style={{ cursor: 'pointer', gap: 8, padding: '6px 10px' }}
            >
              <Trash2 size={14} style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: 13 }}>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ROW 2 — Role */}
      <div style={{ fontSize: 13, color: '#7096b8', marginTop: 4 }}>
        {application.role}
      </div>

      {/* ROW 3 — Details */}
      {(application.location || application.salary || application.appliedDate || application.createdAt) && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {application.location && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: '#4a6080',
              }}
            >
              <MapPin size={11} /> {application.location}
            </span>
          )}
          {application.salary && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: '#4a6080',
              }}
            >
              <DollarSign size={11} /> {application.salary}
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: '#4a6080',
            }}
          >
            <Calendar size={11} />{' '}
            {format(
              new Date(application.appliedDate || application.createdAt),
              'MMM dd'
            )}
          </span>
        </div>
      )}

      {/* ROW 4 — Badges */}
      {(application.resumeUrl || application.aiMatchScore !== undefined) && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                color: '#38bdf8',
                background: 'rgba(14,165,233,0.1)',
                padding: '2px 8px',
                borderRadius: 20,
                border: '1px solid rgba(14,165,233,0.2)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <Paperclip size={11} /> Resume
            </a>
          )}
          {application.aiMatchScore !== undefined && scoreColor && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                color: scoreColor.text,
                background: scoreColor.bg,
                padding: '2px 8px',
                borderRadius: 20,
                border: `1px solid ${scoreColor.border}`,
              }}
            >
              <Sparkles size={11} /> {application.aiMatchScore}/100
            </span>
          )}
        </div>
      )}
    </div>
  );
}
