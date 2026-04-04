'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { Plus, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import ApplicationCard from '@/components/board/ApplicationCard';
import ApplicationDetailDialog from '@/components/board/ApplicationDetailDialog';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ── Constants ──
const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as const;

const STAGE_COLORS: Record<string, string> = {
  Applied: '#38bdf8',
  Screening: '#f59e0b',
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444',
};

const STAGE_BG: Record<string, string> = {
  Applied: 'rgba(56,189,248,0.08)',
  Screening: 'rgba(245,158,11,0.08)',
  Interview: 'rgba(167,139,250,0.08)',
  Offer: 'rgba(34,197,94,0.08)',
  Rejected: 'rgba(239,68,68,0.08)',
};

// ── Types ──
interface Application {
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
  jobDescription?: string;
  notes?: string;
  [key: string]: unknown;
}

// ── Droppable Column Wrapper ──
function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 100,
        borderRadius: 10,
        padding: 4,
        transition: 'background 0.2s ease',
        background: isOver ? 'rgba(14,165,233,0.06)' : 'transparent',
      }}
    >
      {children}
    </div>
  );
}

// ── Inline Application Modal Form Schema ──
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
  resumeUrl: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

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


// ── Main Page ──
function BoardPageInner() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const appQuery = searchParams.get('app') || '';

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [detailApplication, setDetailApplication] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [drawerDefaultStatus, setDrawerDefaultStatus] = useState('Applied');

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    applicationId: string | null;
    companyName: string;
  }>({ open: false, applicationId: null, companyName: '' });

  // Fetch
  const { data: rawApplications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () =>
      axios.get('/applications?limit=100').then((r) => r.data.data.applications),
    staleTime: 30000,
  });

  const applications = useMemo(() => {
    return rawApplications.filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.company.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q)) return false;
      }
      if (appQuery && a._id !== appQuery) return false;
      return true;
    });
  }, [rawApplications, searchQuery, appQuery]);

  // Group by status
  const grouped = STAGES.reduce<Record<string, Application[]>>((acc, stage) => {
    acc[stage] = applications.filter((a) => a.status === stage);
    return acc;
  }, {} as Record<string, Application[]>);

  const totalApps = applications.length;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Find which column an item is in
  const findColumn = useCallback(
    (id: UniqueIdentifier): string | null => {
      // Check if id is a column name
      if (STAGES.includes(id as typeof STAGES[number])) return id as string;
      // Otherwise find which app has this id
      const app = applications.find((a) => a._id === id);
      return app?.status || null;
    },
    [applications]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by DroppableColumn isOver
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = applications.find((a) => a._id === active.id);
    if (!activeApp) return;

    // Determine target status
    let targetStatus: string | null = null;

    // If dropped over a column droppable
    if (STAGES.includes(over.id as typeof STAGES[number])) {
      targetStatus = over.id as string;
    } else {
      // Dropped over another card — find its column
      targetStatus = findColumn(over.id);
    }

    if (!targetStatus || targetStatus === activeApp.status) return;

    // Optimistic update
    queryClient.setQueryData<Application[]>(['applications'], (old) =>
      (old || []).map((a) =>
        a._id === activeApp._id ? { ...a, status: targetStatus! } : a
      )
    );

    try {
      await axios.patch('/applications/reorder', {
        applicationId: activeApp._id,
        newStatus: targetStatus,
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`Moved to ${targetStatus}`);
    } catch {
      // Revert
      queryClient.setQueryData<Application[]>(['applications'], (old) =>
        (old || []).map((a) =>
          a._id === activeApp._id ? { ...a, status: activeApp.status } : a
        )
      );
      toast.error('Failed to move application');
    }
  };

  const handleDelete = (id: string) => {
    const app = applications.find(a => a._id === id);
    setDeleteConfirm({
      open: true,
      applicationId: id,
      companyName: app?.company || 'this application'
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.applicationId) return;
    try {
      await axios.delete(`/applications/${deleteConfirm.applicationId}`);
      toast.success('Application deleted');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirm({ open: false, applicationId: null, companyName: '' });
    }
  };

  const activeCard = applications.find((a) => a._id === activeId);

  // ── Modal Form Setup ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: '',
      role: '',
      status: drawerDefaultStatus as ApplicationFormData['status'],
      jobUrl: '',
      salary: '',
      location: '',
      notes: '',
      jobDescription: '',
      appliedDate: '',
    },
  });

  useEffect(() => {
    if (drawerOpen) {
      if (editApplication) {
        reset({
          company: (editApplication.company as string) || '',
          role: (editApplication.role as string) || '',
          status: (editApplication.status as ApplicationFormData['status']) || drawerDefaultStatus,
          jobUrl: (editApplication.jobUrl as string) || '',
          salary: (editApplication.salary as string) || '',
          location: (editApplication.location as string) || '',
          notes: (editApplication.notes as string) || '',
          jobDescription: (editApplication.jobDescription as string) || '',
          appliedDate: editApplication.appliedDate
            ? new Date(editApplication.appliedDate as string).toISOString().split('T')[0]
            : '',
        });
      } else {
        reset({
          company: '',
          role: '',
          status: drawerDefaultStatus as ApplicationFormData['status'],
          jobUrl: '',
          salary: '',
          location: '',
          notes: '',
          jobDescription: '',
          appliedDate: '',
          resumeUrl: '',
        });
      }
    }
  }, [drawerOpen, editApplication, drawerDefaultStatus, reset]);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue('resumeUrl', res.data.data.url);
      toast.success('Resume uploaded successfully');
    } catch {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const onModalSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      if (editApplication) {
        await axios.patch(`/applications/${editApplication._id}`, data);
        toast.success('Application updated!');
      } else {
        await axios.post('/applications', data);
        toast.success('Application added!');
      }
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDrawerOpen(false);
      setEditApplication(null);
    } catch {
      toast.error(editApplication ? 'Failed to update' : 'Failed to add application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div>
        {/* PAGE HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#e2f0ff',
                margin: 0,
              }}
            >
              Job Board
            </h1>
            <p style={{ fontSize: 14, color: '#7096b8', marginTop: 4 }}>
              {totalApps} application{totalApps !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setEditApplication(null);
              setDrawerDefaultStatus('Applied');
              setDrawerOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={18} /> Add Application
          </button>
        </div>

        {/* FILTER PILLS */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {/* All pill */}
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              background:
                filterStatus === 'all'
                  ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
                  : 'rgba(255,255,255,0.04)',
              color: filterStatus === 'all' ? 'white' : '#7096b8',
              border:
                filterStatus === 'all'
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            All
            <span
              style={{
                background:
                  filterStatus === 'all'
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.06)',
                padding: '1px 7px',
                borderRadius: 10,
                fontSize: 11,
              }}
            >
              {totalApps}
            </span>
          </button>
          {STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setFilterStatus(stage)}
              style={{
                background:
                  filterStatus === stage
                    ? STAGE_COLORS[stage]
                    : STAGE_BG[stage],
                color:
                  filterStatus === stage ? 'white' : STAGE_COLORS[stage],
                border:
                  filterStatus === stage
                    ? 'none'
                    : `1px solid ${STAGE_COLORS[stage]}33`,
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              {stage}
              <span
                style={{
                  background:
                    filterStatus === stage
                      ? 'rgba(255,255,255,0.2)'
                      : `${STAGE_COLORS[stage]}22`,
                  padding: '1px 7px',
                  borderRadius: 10,
                  fontSize: 11,
                }}
              >
                {grouped[stage]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* KANBAN BOARD */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 16,
            }}
          >
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="shimmer-loading"
                style={{
                  flexShrink: 0,
                  width: 280,
                  height: 400,
                  borderRadius: 16,
                }}
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                paddingBottom: 16,
                minHeight: 'calc(100vh - 280px)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {STAGES.map((stage) => {
                // If a specific filter is set, only show that column
                if (filterStatus !== 'all' && filterStatus !== stage) return null;

                const stageApps = grouped[stage] || [];

                return (
                  <div
                    key={stage}
                    style={{
                      flexShrink: 0,
                      width: filterStatus !== 'all' ? '100%' : 280,
                      maxWidth: filterStatus !== 'all' ? 400 : 280,
                    }}
                  >
                    {/* Column header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 4px 12px',
                        borderBottom: `2px solid ${STAGE_COLORS[stage]}`,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: STAGE_COLORS[stage],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#e2f0ff',
                        }}
                      >
                        {stage}
                      </span>
                      <span
                        style={{
                          background: STAGE_BG[stage],
                          color: STAGE_COLORS[stage],
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 20,
                          border: `1px solid ${STAGE_COLORS[stage]}33`,
                        }}
                      >
                        {stageApps.length}
                      </span>
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditApplication(null);
                          setDrawerDefaultStatus(stage);
                          setDrawerOpen(true);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 6,
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#4a6080',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            'rgba(14,165,233,0.3)';
                          (e.currentTarget as HTMLButtonElement).style.color =
                            '#38bdf8';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            'rgba(255,255,255,0.06)';
                          (e.currentTarget as HTMLButtonElement).style.color =
                            '#4a6080';
                        }}
                        title={`Add to ${stage}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Column body */}
                    <DroppableColumn id={stage}>
                      <SortableContext
                        items={stageApps.map((a) => a._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {stageApps.map((app) => (
                          <ApplicationCard
                            key={app._id}
                            application={app}
                            onEdit={(a) => {
                              setEditApplication(a as Application);
                              setDrawerOpen(true);
                            }}
                            onDelete={handleDelete}
                            onView={(a) => {
                              setDetailApplication(a as Application);
                              setDetailOpen(true);
                            }}
                          />
                        ))}

                        {stageApps.length === 0 && (
                          <div
                            style={{
                              minHeight: 100,
                              border: '1px dashed rgba(255,255,255,0.06)',
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#3d5a7a',
                              fontSize: 13,
                            }}
                          >
                            Drop here
                          </div>
                        )}
                      </SortableContext>
                    </DroppableColumn>
                  </div>
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeCard ? (
                <div
                  style={{
                    transform: 'rotate(2deg)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                    opacity: 0.95,
                    width: 280,
                  }}
                >
                  <ApplicationCard
                    application={activeCard}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onView={() => {}}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* INLINE MODAL */}
        {drawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => {
              setDrawerOpen(false);
              setEditApplication(null);
            }}
          >
            <div
              style={{
                background: '#0d1421',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 32,
                width: 'min(540px, 90vw)',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setEditApplication(null);
                }}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'transparent',
                  border: 'none',
                  color: '#7096b8',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
              
              <h2 style={{ color: '#e2f0ff', fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 4 }}>
                {editApplication ? 'Edit Application' : 'Add Application'}
              </h2>
              <p style={{ color: '#7096b8', fontSize: 13, margin: 0, marginBottom: 24 }}>
                Track your job application
              </p>

              <form
                onSubmit={handleSubmit(onModalSubmit)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
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

                {/* Row 6: Resume Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#7096b8' }}>
                    Resume (PDF)
                  </label>
                  
                  {watch('resumeUrl') ? (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: 'rgba(34,197,94,0.1)', 
                      border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontSize: 13, fontWeight: 500 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        Resume Attached
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={watch('resumeUrl')} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 12, textDecoration: 'none' }}>View</a>
                        <button type="button" onClick={() => setValue('resumeUrl', '')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: 0 }}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      style={{
                        ...inputStyle, padding: '24px', textAlign: 'center',
                        border: isDraggingFile ? '2px dashed #0ea5e9' : '1px dashed rgba(255,255,255,0.2)',
                        background: isDraggingFile ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                      }}
                    >
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        disabled={uploadingResume}
                      />
                      {uploadingResume ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <LoadingSpinner size="sm" />
                          <span style={{ fontSize: 13, color: '#7096b8' }}>Uploading...</span>
                        </div>
                      ) : (
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#e2f0ff', fontSize: 14 }}>Drag & drop your resume PDF</p>
                          <p style={{ margin: 0, color: '#4a6080', fontSize: 12 }}>or click to browse</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 7: Notes */}
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
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setEditApplication(null);
                    }}
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
                    ) : editApplication ? (
                      'Save Changes'
                    ) : (
                      'Add Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DETAIL DIALOG */}
        <ApplicationDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          application={detailApplication}
          onEdit={() => {
            setDetailOpen(false);
            setEditApplication(detailApplication);
            setDrawerOpen(true);
          }}
        />
        {deleteConfirm.open && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: deleteConfirm.open ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: deleteConfirm.open ? 'all' : 'none',
          }}>
            <div style={{
              background: '#0d1421',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 16,
              padding: 32,
              width: 'min(420px, 90vw)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.1)',
              position: 'relative',
              zIndex: 1000000,
            }}>
              
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={22} color="#ef4444" />
              </div>

              <h3 style={{
                fontSize: 18, fontWeight: 700, color: '#e2f0ff',
                textAlign: 'center', margin: '0 0 8px 0'
              }}>Delete Application</h3>

              <p style={{
                fontSize: 14, color: '#7096b8',
                textAlign: 'center', lineHeight: 1.6,
                margin: '0 0 24px 0'
              }}>
                Are you sure you want to delete the application for <strong style={{color:'#e2f0ff'}}>{deleteConfirm.companyName}</strong>? This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setDeleteConfirm({open:false, applicationId:null, companyName:''})}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: 11,
                    color: '#7096b8', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', borderRadius: 10, padding: 11,
                    color: 'white', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></div>}>
      <BoardPageInner />
    </Suspense>
  );
}
