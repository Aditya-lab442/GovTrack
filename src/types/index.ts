export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  profilePhoto?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequiredDocumentSpec {
  name: string;
  description: string;
  isRequired: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
}

export interface DynamicFieldSpec {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  department: string;
  processingTime: number;
  fee: number;
  requiredDocuments: RequiredDocumentSpec[];
  dynamicFormFields: DynamicFieldSpec[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENT_VERIFICATION'
  | 'ADDITIONAL_DOCUMENT_REQUIRED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'READY_FOR_DOWNLOAD'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UploadedDoc {
  id: string;
  documentType: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationRemarks?: string;
}

export interface FinalDocument {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  issuedAt: string;
  certificateNumber: string;
}

export interface DocumentRequest {
  id: string;
  requestNumber: string;
  citizen: string;
  documentType: string;
  applicationData: Record<string, any>;
  uploadedDocuments: UploadedDoc[];
  status: RequestStatus;
  currentDepartment: string;
  assignedOfficer?: string;
  remarks?: string;
  rejectionReason?: string;
  additionalDocPrompt?: string;
  submittedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  expectedCompletionDate: string;
  finalDocument?: FinalDocument;
  citizenDetails?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    mobileNumber: string;
    address?: string;
    city: string;
    district: string;
    state?: string;
    pincode?: string;
    createdAt?: string;
  };
  documentTypeDetails?: {
    name: string;
    department: string;
    description?: string;
    processingTime?: number;
    fee?: number;
  };
  statusHistory?: StatusHistory[];
  auditLogs?: AuditLog[];
}

export interface StatusHistory {
  id: string;
  request: string;
  oldStatus: RequestStatus;
  newStatus: RequestStatus;
  changedBy: string;
  changedByRole: 'citizen' | 'admin' | 'system';
  remarks?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  request?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  request?: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  userEmail?: string;
  userRole?: string;
}

export interface DashboardStats {
  summary: {
    total: number;
    pending: number;
    submitted: number;
    underReview: number;
    docVerification: number;
    additionalDocs: number;
    processing: number;
    approved: number;
    readyForDownload: number;
    completed: number;
    rejected: number;
    cancelled: number;
    totalCitizens: number;
    approvalRate: number;
  };
  byDocumentType: {
    id: string;
    name: string;
    department: string;
    count: number;
  }[];
  monthlyTrends: {
    month: string;
    applications: number;
    completed: number;
  }[];
  recentRequests: {
    id: string;
    requestNumber: string;
    citizenName: string;
    documentName: string;
    status: RequestStatus;
    submittedAt: string;
    expectedCompletionDate: string;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: { field?: string; message: string }[];
}
