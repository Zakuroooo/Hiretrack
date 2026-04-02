'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Plus } from 'lucide-react';
import ApplicationCard from '@/components/board/ApplicationCard';
import ApplicationDrawer from '@/components/board/ApplicationDrawer';
import ApplicationDetailDialog from '@/components/board/ApplicationDetailDialog';
import PageTransition from '@/components/ui/PageTransition';

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

// ── Main Page ──
export default function BoardPage() {
  const queryClient = useQueryClient();

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editApplication, setEditApplication] = useState<Application | null>(null);
  const [detailApplication, setDetailApplication] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [drawerDefaultStatus, setDrawerDefaultStatus] = useState('Applied');

  // Fetch
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () =>
      axios.get('/applications?limit=100').then((r) => r.data.data.applications),
    staleTime: 30000,
  });

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    try {
      await axios.delete(`/applications/${id}`);
      toast.success('Application deleted');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch {
      toast.error('Failed to delete');
    }
  };

  const activeCard = applications.find((a) => a._id === activeId);

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
                        onClick={() => {
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

        {/* DRAWER */}
        <ApplicationDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setEditApplication(null);
          }}
          application={editApplication}
          defaultStatus={drawerDefaultStatus}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }}
        />

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
      </div>
    </PageTransition>
  );
}
