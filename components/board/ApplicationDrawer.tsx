'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as const;

const applicationSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(STAGES),
  jobUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  salary: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  appliedDate: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationInput {
  _id?: string;
  company?: string;
  role?: string;
  status?: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  notes?: string;
  jobDescription?: string;
  appliedDate?: string;
  [key: string]: unknown;
}

interface ApplicationDrawerProps {
  open: boolean;
  onClose: () => void;
  application?: ApplicationInput | null;
  defaultStatus?: string;
  onSuccess: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#e2f0ff',
  fontSize: 14,
  width: '100%',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

export default function ApplicationDrawer({
  open,
  onClose,
  application,
  defaultStatus = 'Applied',
  onSuccess,
}: ApplicationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: '',
      role: '',
      status: defaultStatus as ApplicationFormData['status'],
      jobUrl: '',
      salary: '',
      location: '',
      notes: '',
      jobDescription: '',
      appliedDate: '',
    },
  });

  useEffect(() => {
    if (application) {
      reset({
        company: (application.company as string) || '',
        role: (application.role as string) || '',
        status: (application.status as ApplicationFormData['status']) || 'Applied',
        jobUrl: (application.jobUrl as string) || '',
        salary: (application.salary as string) || '',
        location: (application.location as string) || '',
        notes: (application.notes as string) || '',
        jobDescription: (application.jobDescription as string) || '',
        appliedDate: application.appliedDate
          ? new Date(application.appliedDate as string).toISOString().split('T')[0]
          : '',
      });
    } else {
      reset({
        company: '',
        role: '',
        status: defaultStatus as ApplicationFormData['status'],
        jobUrl: '',
        salary: '',
        location: '',
        notes: '',
        jobDescription: '',
        appliedDate: '',
      });
    }
  }, [application, defaultStatus, reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      if (application) {
        await axios.patch(`/applications/${application._id}`, data);
        toast.success('Application updated!');
      } else {
        await axios.post('/applications', data);
        toast.success('Application added!');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(application ? 'Failed to update' : 'Failed to add application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={true}
        style={{
          background: '#0d1421',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          width: 'min(540px, 100vw)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 9999,
        }}
      >
        <div style={{ padding: '24px 24px 0' }}>
          <SheetTitle style={{ color: '#e2f0ff', fontSize: 18, fontWeight: 600 }}>
            {application ? 'Edit Application' : 'Add Application'}
          </SheetTitle>
          <SheetDescription style={{ color: '#7096b8', fontSize: 13, marginTop: 4 }}>
            Track your job application
          </SheetDescription>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Row 1: Company + Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Company Name *
              </label>
              <input
                {...register('company')}
                placeholder="e.g. Google"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.company && (
                <span style={{ color: '#f87171', fontSize: 12 }}>
                  {errors.company.message}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Job Role *
              </label>
              <input
                {...register('role')}
                placeholder="e.g. Software Engineer"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.role && (
                <span style={{ color: '#f87171', fontSize: 12 }}>
                  {errors.role.message}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Status + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Status
              </label>
              <select
                {...register('status')}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} style={{ background: '#0d1421' }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Applied Date
              </label>
              <input
                type="date"
                {...register('appliedDate')}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Row 3: Job URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
              Job URL
            </label>
            <input
              {...register('jobUrl')}
              placeholder="https://..."
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.jobUrl && (
              <span style={{ color: '#f87171', fontSize: 12 }}>
                {errors.jobUrl.message}
              </span>
            )}
          </div>

          {/* Row 4: Salary + Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Salary
              </label>
              <input
                {...register('salary')}
                placeholder="e.g. $120,000"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                Location
              </label>
              <input
                {...register('location')}
                placeholder="e.g. San Francisco, CA"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Row 5: Job Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
              Job Description
            </label>
            <textarea
              {...register('jobDescription')}
              rows={4}
              placeholder="Paste job description for AI matching later"
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Row 6: Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Any additional notes..."
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#7096b8',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = '#e2f0ff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#7096b8';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : application ? (
                'Save Changes'
              ) : (
                'Add Application'
              )}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
