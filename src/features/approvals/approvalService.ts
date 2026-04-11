import * as persistence from '../../utils/persistence';
import { enqueueOfflineMutation } from '../shared/offlineQueue';
import { supabase } from '../shared/backend';
import { publishRealtimeEvent, subscribeToRealtimeTopic } from '../shared/realtime';
import { studentService, type StudentRecord } from '../students/studentService';

export type ApprovalRequest = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  parentGuardian: string;
  parentPhone: string;
  notes: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

function normalizeApproval(row: Record<string, unknown>): ApprovalRequest {
  return {
    id: Number(row.id),
    studentId: String(row.student_id ?? row.studentId ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    campus: (row.campus as ApprovalRequest['campus']) ?? 'Lagos Island',
    level: (row.level as ApprovalRequest['level']) ?? 'Level 1',
    parentGuardian: String(row.parent_guardian ?? row.parentGuardian ?? ''),
    parentPhone: String(row.parent_phone ?? row.parentPhone ?? ''),
    notes: String(row.notes ?? ''),
    submittedBy: String(row.submitted_by ?? row.submittedBy ?? ''),
    submittedAt: String(row.submitted_at ?? row.submittedAt ?? ''),
    status: (row.status as ApprovalRequest['status']) ?? 'pending',
  };
}

async function cacheApprovals(items: ApprovalRequest[]) {
  await Promise.all(items.map((approval) => persistence.saveApprovalRequest(approval)));
}

function toStudentRecord(approval: ApprovalRequest): StudentRecord {
  return {
    id: approval.id,
    studentId: approval.studentId,
    name: approval.name,
    email: approval.email,
    campus: approval.campus,
    level: approval.level,
    enrollmentDate: approval.submittedAt,
  };
}

export const approvalService = {
  async listApprovals(): Promise<ApprovalRequest[]> {
    if (!supabase) {
      return persistence.getAllApprovals();
    }

    const { data, error } = await supabase.from('approval_requests').select('*').order('submitted_at', { ascending: false });
    if (error || !data) {
      return persistence.getAllApprovals();
    }

    const normalized = data.map((row) => normalizeApproval(row));
    await cacheApprovals(normalized);
    return normalized;
  },

  async createApprovalRequest(approval: ApprovalRequest) {
    if (supabase && navigator.onLine) {
      const { error } = await supabase.from('approval_requests').insert({
        id: approval.id,
        student_id: approval.studentId,
        name: approval.name,
        email: approval.email,
        campus: approval.campus,
        level: approval.level,
        parent_guardian: approval.parentGuardian,
        parent_phone: approval.parentPhone,
        notes: approval.notes,
        submitted_by: approval.submittedBy,
        submitted_at: approval.submittedAt,
        status: approval.status,
      });

      if (!error) {
        await persistence.saveApprovalRequest(approval);
        publishRealtimeEvent('approvals.changed');
        return { synced: true };
      }
    }

    await persistence.saveApprovalRequest(approval);
    enqueueOfflineMutation({
      entity: 'approvals',
      operation: 'create',
      payload: approval as unknown as Record<string, unknown>,
    });
    publishRealtimeEvent('approvals.changed');
    return { synced: false };
  },

  async updateApprovalStatus(id: number, status: ApprovalRequest['status']) {
    const currentApprovals = await this.listApprovals();
    const target = currentApprovals.find((approval) => approval.id === id);
    if (!target) {
      throw new Error('Approval request not found');
    }

    const updated = { ...target, status };

    if (supabase && navigator.onLine) {
      const { error } = await supabase.from('approval_requests').update({ status }).eq('id', id);
      if (!error) {
        await persistence.saveApprovalRequest(updated);
        if (status === 'approved') {
          await studentService.saveStudent(toStudentRecord(updated));
        }
        publishRealtimeEvent('approvals.changed');
        return { synced: true };
      }
    }

    await persistence.saveApprovalRequest(updated);
    if (status === 'approved') {
      await studentService.saveStudent(toStudentRecord(updated));
    }
    enqueueOfflineMutation({
      entity: 'approvals',
      operation: 'update',
      payload: { id, status },
    });
    publishRealtimeEvent('approvals.changed');
    return { synced: false };
  },

  subscribe(callback: () => void) {
    if (!supabase) {
      return subscribeToRealtimeTopic('approvals.changed', callback);
    }

    const channel = supabase
      .channel('approvals-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_requests' }, callback)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};