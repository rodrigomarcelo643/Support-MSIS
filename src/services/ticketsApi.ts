import { BACKEND_URL } from '../lib/config';
import type { SupportTicket, UserRole } from '../types';
import type { UploadedFile } from '../components/ui/file-upload';

/**
 * Determine API Base URL dynamically.
 * If running on localhost and VITE_BACKEND_URL points to remote or localhost,
 * dynamically handles relative path or absolute API endpoints.
 */
function getApiBaseUrl(): string {
  const configured = (BACKEND_URL || '').trim().replace(/\/+$/, '');
  return configured;
}

export interface CreateTicketApiInput {
  subject: string;
  description: string;
  department?: string;
  category?: 'Student' | 'Faculty' | 'Secretary' | 'Admin' | 'Super Admin';
  files?: UploadedFile[];
  reporterId?: string;
  reporterEmail?: string;
  reporterName?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

/**
 * Helper to convert a File object to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Submit / report a ticket directly to the backend database (MySQL via PHP API)
 */
export async function createTicketOnBackend(input: CreateTicketApiInput): Promise<SupportTicket> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/tickets/create.php`;

  const formData = new FormData();
  formData.append('subject', input.subject);
  formData.append('description', input.description);
  if (input.department) formData.append('department', input.department);
  if (input.category) formData.append('category', input.category);
  if (input.reporterId) formData.append('reporter_id', input.reporterId);
  if (input.reporterEmail) formData.append('reporter_email', input.reporterEmail);
  if (input.reporterName) formData.append('reporter_name', input.reporterName);
  if (input.priority) formData.append('priority', input.priority);

  // Append physical files for multipart upload
  if (input.files && input.files.length > 0) {
    for (const uf of input.files) {
      if (uf.file instanceof File) {
        formData.append('files[]', uf.file, uf.name);
      }
    }
  }

  // Attempt standard multipart submission first
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || `Failed to report ticket: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success' && data.ticket) {
      return data.ticket as SupportTicket;
    }
    throw new Error(data.message || 'Server did not return created ticket');
  } catch (err) {
    // If FormData fails (e.g. strict CORS preflight or proxy limitation), try JSON base64 fallback
    if (input.files && input.files.length > 0) {
      try {
        const base64Files = await Promise.all(
          input.files.map(async (uf) => ({
            name: uf.name,
            type: uf.type,
            data: await fileToBase64(uf.file),
          }))
        );

        const jsonResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            subject: input.subject,
            description: input.description,
            department: input.department,
            category: input.category,
            reporter_id: input.reporterId,
            reporter_email: input.reporterEmail,
            reporter_name: input.reporterName,
            priority: input.priority,
            base64_files: base64Files,
          }),
        });

        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          if (jsonData.status === 'success' && jsonData.ticket) {
            return jsonData.ticket as SupportTicket;
          }
        }
      } catch {
        // Continue to rethrow original error
      }
    }
    throw err;
  }
}

/**
 * Fetch all tickets from the backend with optional filters
 */
export async function fetchTicketsFromBackend(params?: {
  role?: UserRole | 'All';
  email?: string;
  status?: string;
  search?: string;
}): Promise<SupportTicket[]> {
  const baseUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams();

  if (params?.role && params.role !== 'All' && params.role !== 'Super Admin') {
    searchParams.append('role', params.role);
  }
  if (params?.email) {
    searchParams.append('email', params.email);
  }
  if (params?.status && params.status !== 'All') {
    searchParams.append('status', params.status);
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const queryString = searchParams.toString();
  const endpoint = `${baseUrl}/api/v1/tickets/list.php${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load tickets: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.status === 'success' && Array.isArray(data.tickets)) {
    return data.tickets as SupportTicket[];
  }
  return [];
}

/**
 * Update ticket status and optional support message (Super Admin)
 */
export async function updateTicketStatusOnBackend(
  id: string,
  status: SupportTicket['status'],
  supportMessage?: string,
  adminInfo?: { id?: string; name?: string; email?: string }
): Promise<SupportTicket> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/tickets/update_status.php`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id,
      status,
      support_message: supportMessage ?? null,
      admin_id: adminInfo?.id,
      admin_name: adminInfo?.name,
      admin_email: adminInfo?.email,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update status: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.status === 'success' && data.ticket) {
    return data.ticket as SupportTicket;
  }
  throw new Error(data.message || 'Server did not return updated ticket');
}

/**
 * Delete a ticket permanently from the backend database & filesystem
 */
export async function deleteTicketOnBackend(id: string): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/tickets/delete.php`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to delete ticket: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.status === 'success';
}
