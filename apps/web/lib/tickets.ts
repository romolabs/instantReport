import { backendFetch } from "./backend";

export interface TicketListItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    fullName: string;
    email: string;
    department: string | null;
    role: string;
  };
  assignedTo: {
    id: string;
    fullName: string;
    email: string;
    department: string | null;
    role: string;
  } | null;
  category: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    attachments: number;
    statusHistory: number;
  };
}

export async function getTickets() {
  const response = await backendFetch("/tickets");

  if (!response.ok) {
    throw new Error("Unable to load tickets");
  }

  return (await response.json()) as TicketListItem[];
}

export interface TicketCommentItem {
  id: string;
  body: string;
  type: "PUBLIC" | "INTERNAL_NOTE" | "RESOLUTION_NOTE";
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    department?: string | null;
    role: string;
  };
}

export interface TicketStatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    fullName: string;
    email: string;
    department?: string | null;
    role: string;
  };
}

export interface TicketAttachmentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
    department?: string | null;
    role: string;
  };
}

export interface TicketDetail extends TicketListItem {
  rootCause: string | null;
  resolutionSummary: string | null;
  reopenReason: string | null;
  location: string | null;
  assetTag: string | null;
  department?: string | null;
  comments: TicketCommentItem[];
  statusHistory: TicketStatusHistoryItem[];
  attachments: TicketAttachmentItem[];
}

export async function getTicket(ticketIdentifier: string) {
  const response = await backendFetch(
    `/tickets/${encodeURIComponent(ticketIdentifier)}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load ticket");
  }

  return (await response.json()) as TicketDetail;
}
