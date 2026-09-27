import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'govtrack.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password?: string;
  role: 'citizen' | 'admin';
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

export interface IRequiredDocumentSpec {
  name: string;
  description: string;
  isRequired: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
}

export interface IDynamicFieldSpec {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface IDocumentType {
  id: string;
  name: string;
  description: string;
  department: string;
  processingTime: number; // in business days
  fee: number;
  requiredDocuments: IRequiredDocumentSpec[];
  dynamicFormFields: IDynamicFieldSpec[];
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

export interface IUploadedDoc {
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

export interface IFinalDocument {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  issuedAt: string;
  certificateNumber: string;
}

export interface IDocumentRequest {
  id: string;
  requestNumber: string;
  citizen: string; // User ID
  documentType: string; // DocumentType ID
  applicationData: Record<string, any>;
  uploadedDocuments: IUploadedDoc[];
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
  finalDocument?: IFinalDocument;
}

export interface IRequestStatusHistory {
  id: string;
  request: string; // Request ID
  oldStatus: RequestStatus;
  newStatus: RequestStatus;
  changedBy: string; // User ID
  changedByRole: 'citizen' | 'admin' | 'system';
  remarks?: string;
  timestamp: string;
}

export interface INotification {
  id: string;
  user: string; // User ID
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  request?: string; // Request ID
  isRead: boolean;
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  user: string; // User ID
  action: string;
  request?: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: IUser[];
  documentTypes: IDocumentType[];
  requests: IDocumentRequest[];
  statusHistories: IRequestStatusHistory[];
  notifications: INotification[];
  auditLogs: IAuditLog[];
}

let dbData: DatabaseSchema = {
  users: [],
  documentTypes: [],
  requests: [],
  statusHistories: [],
  notifications: [],
  auditLogs: [],
};

// Persistence helper
export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(raw);
    } else {
      seedInitialData();
    }
  } catch (err) {
    console.error('Error reading database file, re-seeding:', err);
    seedInitialData();
  }
}

// Generate unique ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Generate sequential Request Number: GOV-2026-000001
export function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const count = dbData.requests.length + 1;
  const padded = String(count).padStart(6, '0');
  return `GOV-${year}-${padded}`;
}

// Initial Seeding
export function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  const adminUser: IUser = {
    id: 'user_admin_01',
    firstName: 'Vikram',
    lastName: 'Singhania',
    email: 'admin@govtrack.demo',
    mobileNumber: '+91 98765 43210',
    password: passwordHash,
    role: 'admin',
    profilePhoto: '/src/assets/images/avatar_officer_demo_1790490008709.jpg',
    address: 'Room 204, Directorate of Citizen Services, Civil Lines',
    city: 'Central District',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    isActive: true,
    isVerified: true,
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T09:00:00.000Z',
  };

  const citizenUser1: IUser = {
    id: 'user_citizen_01',
    firstName: 'Rahul',
    lastName: 'Patel',
    email: 'rahul.patel@example.com',
    mobileNumber: '+91 98112 23344',
    password: passwordHash,
    role: 'citizen',
    profilePhoto: '/src/assets/images/avatar_citizen_demo_1790490097049.jpg',
    address: 'B-42, Shanti Nagar, Ring Road',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    isActive: true,
    isVerified: true,
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z',
  };

  const citizenUser2: IUser = {
    id: 'user_citizen_02',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    mobileNumber: '+91 97234 56789',
    password: passwordHash,
    role: 'citizen',
    profilePhoto: '',
    address: 'Flat 301, Greenfield Residency, Sector 14',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302004',
    isActive: true,
    isVerified: true,
    createdAt: '2026-09-12T11:30:00.000Z',
    updatedAt: '2026-09-12T11:30:00.000Z',
  };

  const docTypes: IDocumentType[] = [
    {
      id: 'dt_income_cert',
      name: 'Income Certificate',
      description: 'Official revenue document certifying the annual household income of an applicant from all declared sources.',
      department: 'Revenue & District Administration',
      processingTime: 7,
      fee: 50,
      requiredDocuments: [
        { name: 'Aadhaar Card / Identity Proof', description: 'Clear front and back copy of government identity document.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Residential Address Proof', description: 'Electricity bill, water bill, or ration card matching current address.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Income Proof / Salary Slip / Affidavit', description: 'Latest Form 16, employer salary statement, or notary income affidavit.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Passport Size Photograph', description: 'Recent front-facing color photo with white background.', isRequired: true, allowedFileTypes: ['jpg', 'jpeg', 'png'], maxFileSize: 2 },
      ],
      dynamicFormFields: [
        { id: 'applicantOccupation', label: 'Occupation / Source of Livelihood', type: 'text', required: true, placeholder: 'e.g. Agriculture, Salaried, Small Business' },
        { id: 'annualIncome', label: 'Total Declared Annual Income (INR)', type: 'number', required: true, placeholder: 'e.g. 240000' },
        { id: 'familyMembersCount', label: 'Number of Dependent Family Members', type: 'number', required: true, placeholder: 'e.g. 4' },
        { id: 'purposeOfCertificate', label: 'Purpose of Certificate', type: 'select', required: true, options: ['Higher Education Scholarship', 'Government Welfare Scheme', 'Fee Concession', 'Bank Loan Application', 'Other'] },
      ],
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'dt_caste_cert',
      name: 'Caste / Community Certificate',
      description: 'Statutory certificate verifying category affiliation (SC, ST, OBC, SEBC) issued under state executive authority.',
      department: 'Social Justice & Empowerment',
      processingTime: 14,
      fee: 60,
      requiredDocuments: [
        { name: 'Identity Proof of Applicant', description: 'Aadhaar or Voter ID Card.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Proof of Caste Affiliation', description: 'Parent caste certificate, school leaving certificate, or land pedigree record.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Residence Certificate / Domicile', description: 'Valid proof of residence in the state for specified statutory period.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Affidavit of Caste Declaration', description: 'Notarized sworn declaration affirming caste lineage.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 5 },
      ],
      dynamicFormFields: [
        { id: 'casteCategory', label: 'Caste Category', type: 'select', required: true, options: ['Scheduled Caste (SC)', 'Scheduled Tribe (ST)', 'Other Backward Class (OBC)', 'Special Backward Category'] },
        { id: 'subCaste', label: 'Sub-Caste / Clan', type: 'text', required: true, placeholder: 'Specify sub-caste name' },
        { id: 'fatherCaste', label: "Father's Recorded Caste", type: 'text', required: true, placeholder: "Father's caste as per official record" },
        { id: 'nativeVillage', label: 'Ancestral / Native Village', type: 'text', required: true, placeholder: 'Village and Tehsil' },
      ],
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'dt_residence_cert',
      name: 'Residence / Domicile Certificate',
      description: 'Document proving that the citizen is a permanent resident of the state or union territory.',
      department: 'Revenue & Land Records',
      processingTime: 10,
      fee: 40,
      requiredDocuments: [
        { name: 'Identity Proof', description: 'Aadhaar Card, Passport, or PAN Card.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: 'Continuous Residence Proof (10+ Years)', description: 'School certificates, utility bills, or property registry deeds spanning domicile duration.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 10 },
        { name: 'Passport Size Photo', description: 'Recent photograph.', isRequired: true, allowedFileTypes: ['jpg', 'jpeg', 'png'], maxFileSize: 2 },
      ],
      dynamicFormFields: [
        { id: 'yearsInState', label: 'Years of Continuous Residence in State', type: 'number', required: true, placeholder: 'e.g. 15' },
        { id: 'placeOfBirth', label: 'Place of Birth (Town / District)', type: 'text', required: true, placeholder: 'e.g. Ahmedabad' },
        { id: 'purposeOfDomicile', label: 'Application Purpose', type: 'select', required: true, options: ['State Government Recruitment', 'University Admission Quota', 'Land Purchase Clearance', 'Other'] },
      ],
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'dt_birth_cert',
      name: 'Birth Certificate (Extract / Copy)',
      description: 'Certified extract from the Registrar of Births and Deaths confirming date and place of birth.',
      department: 'Municipal Administration & Health',
      processingTime: 5,
      fee: 30,
      requiredDocuments: [
        { name: 'Hospital Discharge Summary / Birth Slip', description: 'Official discharge card issued by hospital or healthcare facility.', isRequired: true, allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'], maxFileSize: 5 },
        { name: "Parents' Aadhaar / Identity Proof", description: 'Combined identity proof of mother and father.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 5 },
      ],
      dynamicFormFields: [
        { id: 'childName', label: 'Full Name of Child', type: 'text', required: true, placeholder: 'As to appear on certificate' },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
        { id: 'hospitalName', label: 'Hospital / Place of Birth', type: 'text', required: true, placeholder: 'Hospital name or home address' },
        { id: 'fatherName', label: "Father's Full Name", type: 'text', required: true },
        { id: 'motherName', label: "Mother's Full Name", type: 'text', required: true },
      ],
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'dt_ews_cert',
      name: 'Economically Weaker Section (EWS) Certificate',
      description: 'Statutory income & asset certificate for reservation benefits under General Category economic reservation quotas.',
      department: 'Welfare & Social Justice',
      processingTime: 12,
      fee: 50,
      requiredDocuments: [
        { name: 'Income Statement of Family', description: 'Comprehensive income certificate validating gross annual family income below Rs 8 Lakhs.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 5 },
        { name: 'Land & Property Holding Declaration', description: 'Patwari certificate confirming residential flat/agricultural land holding limits.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 5 },
        { name: 'Aadhaar & PAN Card', description: 'Combined identification document.', isRequired: true, allowedFileTypes: ['pdf'], maxFileSize: 5 },
      ],
      dynamicFormFields: [
        { id: 'grossFamilyIncome', label: 'Gross Annual Family Income (INR)', type: 'number', required: true, placeholder: 'Must be below statutory ceiling' },
        { id: 'agriculturalLandAcres', label: 'Total Agricultural Land Owned (Acres)', type: 'number', required: true, placeholder: '0 if none' },
        { id: 'residentialFlatSqFt', label: 'Residential Flat Area (Sq. Ft.)', type: 'number', required: true, placeholder: '0 if none' },
      ],
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
  ];

  // Demo requests
  const sampleRequest1: IDocumentRequest = {
    id: 'req_000001',
    requestNumber: 'GOV-2026-000001',
    citizen: citizenUser1.id,
    documentType: 'dt_income_cert',
    applicationData: {
      applicantOccupation: 'Salaried IT Professional',
      annualIncome: '480000',
      familyMembersCount: '3',
      purposeOfCertificate: 'Higher Education Scholarship',
    },
    uploadedDocuments: [
      {
        id: 'doc_101',
        documentType: 'Aadhaar Card / Identity Proof',
        originalName: 'Aadhaar_Rahul_Patel.pdf',
        storedName: 'mock_aadhaar_001.pdf',
        mimeType: 'application/pdf',
        size: 842100,
        path: '/uploads/mock_aadhaar_001.pdf',
        uploadedBy: citizenUser1.id,
        uploadedAt: '2026-09-20T10:30:00.000Z',
        verificationStatus: 'VERIFIED',
        verificationRemarks: 'Identity verified against UIDAI database.',
      },
      {
        id: 'doc_102',
        documentType: 'Residential Address Proof',
        originalName: 'Electricity_Bill_Aug2026.pdf',
        storedName: 'mock_bill_001.pdf',
        mimeType: 'application/pdf',
        size: 512400,
        path: '/uploads/mock_bill_001.pdf',
        uploadedBy: citizenUser1.id,
        uploadedAt: '2026-09-20T10:32:00.000Z',
        verificationStatus: 'VERIFIED',
        verificationRemarks: 'Address matches municipal jurisdiction.',
      },
      {
        id: 'doc_103',
        documentType: 'Income Proof / Salary Slip / Affidavit',
        originalName: 'Form16_Salary_Proof.pdf',
        storedName: 'mock_income_001.pdf',
        mimeType: 'application/pdf',
        size: 1048576,
        path: '/uploads/mock_income_001.pdf',
        uploadedBy: citizenUser1.id,
        uploadedAt: '2026-09-20T10:35:00.000Z',
        verificationStatus: 'VERIFIED',
        verificationRemarks: 'Form-16 computation audited.',
      },
      {
        id: 'doc_104',
        documentType: 'Passport Size Photograph',
        originalName: 'Applicant_Photo.jpg',
        storedName: 'mock_photo_001.jpg',
        mimeType: 'image/jpeg',
        size: 154200,
        path: '/uploads/mock_photo_001.jpg',
        uploadedBy: citizenUser1.id,
        uploadedAt: '2026-09-20T10:36:00.000Z',
        verificationStatus: 'VERIFIED',
        verificationRemarks: 'Clear portrait photograph.',
      },
    ],
    status: 'READY_FOR_DOWNLOAD',
    currentDepartment: 'Revenue & District Administration',
    assignedOfficer: 'Vikram Singhania (Deputy Tehsildar)',
    remarks: 'Application vetted and digital certificate issued with cryptographic QR stamp.',
    submittedAt: '2026-09-20T10:40:00.000Z',
    lastUpdatedAt: '2026-09-24T14:30:00.000Z',
    expectedCompletionDate: '2026-09-27T10:40:00.000Z',
    finalDocument: {
      originalName: 'Income_Certificate_GOV-2026-000001.pdf',
      storedName: 'Income_Cert_GOV-2026-000001.pdf',
      mimeType: 'application/pdf',
      size: 420500,
      path: '/uploads/cert_gov_2026_000001.pdf',
      issuedAt: '2026-09-24T14:30:00.000Z',
      certificateNumber: 'INC/DL/2026/98214',
    },
  };

  const sampleRequest2: IDocumentRequest = {
    id: 'req_000002',
    requestNumber: 'GOV-2026-000002',
    citizen: citizenUser2.id,
    documentType: 'dt_caste_cert',
    applicationData: {
      casteCategory: 'Other Backward Class (OBC)',
      subCaste: 'Gujjar',
      fatherCaste: 'Gujjar',
      nativeVillage: 'Ramgarh, Tehsil Amber',
    },
    uploadedDocuments: [
      {
        id: 'doc_201',
        documentType: 'Identity Proof of Applicant',
        originalName: 'Aadhaar_Priya_Sharma.pdf',
        storedName: 'mock_doc_201.pdf',
        mimeType: 'application/pdf',
        size: 750000,
        path: '/uploads/mock_doc_201.pdf',
        uploadedBy: citizenUser2.id,
        uploadedAt: '2026-09-22T11:00:00.000Z',
        verificationStatus: 'VERIFIED',
        verificationRemarks: 'Applicant identity validated.',
      },
      {
        id: 'doc_202',
        documentType: 'Proof of Caste Affiliation',
        originalName: 'Father_School_Certificate.pdf',
        storedName: 'mock_doc_202.pdf',
        mimeType: 'application/pdf',
        size: 920000,
        path: '/uploads/mock_doc_202.pdf',
        uploadedBy: citizenUser2.id,
        uploadedAt: '2026-09-22T11:05:00.000Z',
        verificationStatus: 'PENDING',
      },
    ],
    status: 'DOCUMENT_VERIFICATION',
    currentDepartment: 'Social Justice & Empowerment',
    assignedOfficer: 'Vikram Singhania (Verification Officer)',
    remarks: 'Under verification by scrutiny officer.',
    submittedAt: '2026-09-22T11:15:00.000Z',
    lastUpdatedAt: '2026-09-23T09:20:00.000Z',
    expectedCompletionDate: '2026-10-06T11:15:00.000Z',
  };

  const sampleRequest3: IDocumentRequest = {
    id: 'req_000003',
    requestNumber: 'GOV-2026-000003',
    citizen: citizenUser1.id,
    documentType: 'dt_residence_cert',
    applicationData: {
      yearsInState: '22',
      placeOfBirth: 'Ahmedabad',
      purposeOfDomicile: 'State Government Recruitment',
    },
    uploadedDocuments: [
      {
        id: 'doc_301',
        documentType: 'Identity Proof',
        originalName: 'Passport_Rahul_P.pdf',
        storedName: 'mock_doc_301.pdf',
        mimeType: 'application/pdf',
        size: 1100000,
        path: '/uploads/mock_doc_301.pdf',
        uploadedBy: citizenUser1.id,
        uploadedAt: '2026-09-25T14:00:00.000Z',
        verificationStatus: 'PENDING',
      },
    ],
    status: 'SUBMITTED',
    currentDepartment: 'Revenue & Land Records',
    remarks: 'New application received in department queue.',
    submittedAt: '2026-09-25T14:10:00.000Z',
    lastUpdatedAt: '2026-09-25T14:10:00.000Z',
    expectedCompletionDate: '2026-10-05T14:10:00.000Z',
  };

  // Status histories for request 1
  const histories: IRequestStatusHistory[] = [
    {
      id: 'sh_001',
      request: sampleRequest1.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'SUBMITTED',
      changedBy: citizenUser1.id,
      changedByRole: 'citizen',
      remarks: 'Application submitted successfully online by citizen.',
      timestamp: '2026-09-20T10:40:00.000Z',
    },
    {
      id: 'sh_002',
      request: sampleRequest1.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'UNDER_REVIEW',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Application acknowledged by District Tehsildar desk.',
      timestamp: '2026-09-21T09:15:00.000Z',
    },
    {
      id: 'sh_003',
      request: sampleRequest1.id,
      oldStatus: 'UNDER_REVIEW',
      newStatus: 'DOCUMENT_VERIFICATION',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Scrutinizing Aadhaar, residential proof, and annual income proofs.',
      timestamp: '2026-09-22T11:30:00.000Z',
    },
    {
      id: 'sh_004',
      request: sampleRequest1.id,
      oldStatus: 'DOCUMENT_VERIFICATION',
      newStatus: 'PROCESSING',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'All 4 mandatory documents verified successfully. Transferred to sanctioning authority.',
      timestamp: '2026-09-23T15:20:00.000Z',
    },
    {
      id: 'sh_005',
      request: sampleRequest1.id,
      oldStatus: 'PROCESSING',
      newStatus: 'APPROVED',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Income assessment ratified. Certificate sanctioned under Section 14.',
      timestamp: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'sh_006',
      request: sampleRequest1.id,
      oldStatus: 'APPROVED',
      newStatus: 'READY_FOR_DOWNLOAD',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Digitally signed certificate generated and made available on citizen portal.',
      timestamp: '2026-09-24T14:30:00.000Z',
    },
    // Request 2 history
    {
      id: 'sh_007',
      request: sampleRequest2.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'SUBMITTED',
      changedBy: citizenUser2.id,
      changedByRole: 'citizen',
      remarks: 'Caste certificate request submitted with initial records.',
      timestamp: '2026-09-22T11:15:00.000Z',
    },
    {
      id: 'sh_008',
      request: sampleRequest2.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'UNDER_REVIEW',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Assigned to Social Welfare inspection officer.',
      timestamp: '2026-09-22T16:00:00.000Z',
    },
    {
      id: 'sh_009',
      request: sampleRequest2.id,
      oldStatus: 'UNDER_REVIEW',
      newStatus: 'DOCUMENT_VERIFICATION',
      changedBy: adminUser.id,
      changedByRole: 'admin',
      remarks: 'Cross-verifying genealogy document with District Record Room.',
      timestamp: '2026-09-23T09:20:00.000Z',
    },
    // Request 3 history
    {
      id: 'sh_010',
      request: sampleRequest3.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'SUBMITTED',
      changedBy: citizenUser1.id,
      changedByRole: 'citizen',
      remarks: 'Domicile request submitted.',
      timestamp: '2026-09-25T14:10:00.000Z',
    },
  ];

  const notifications: INotification[] = [
    {
      id: 'notif_001',
      user: citizenUser1.id,
      title: 'Certificate Ready for Download',
      message: 'Your Income Certificate application GOV-2026-000001 has been approved and is ready to download.',
      type: 'success',
      request: sampleRequest1.id,
      isRead: false,
      createdAt: '2026-09-24T14:30:00.000Z',
    },
    {
      id: 'notif_002',
      user: citizenUser1.id,
      title: 'Application Approved',
      message: 'Application GOV-2026-000001 was sanctioned by District Tehsildar desk.',
      type: 'info',
      request: sampleRequest1.id,
      isRead: true,
      createdAt: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'notif_003',
      user: citizenUser2.id,
      title: 'Verification In Progress',
      message: 'Your Caste Certificate application GOV-2026-000002 has entered document verification stage.',
      type: 'info',
      request: sampleRequest2.id,
      isRead: false,
      createdAt: '2026-09-23T09:20:00.000Z',
    },
    {
      id: 'notif_004',
      user: citizenUser1.id,
      title: 'Application Received',
      message: 'Your Domicile application GOV-2026-000003 was logged successfully.',
      type: 'info',
      request: sampleRequest3.id,
      isRead: false,
      createdAt: '2026-09-25T14:10:00.000Z',
    },
  ];

  const auditLogs: IAuditLog[] = [
    {
      id: 'audit_001',
      user: adminUser.id,
      action: 'ADMIN_LOGIN',
      description: 'Administrative officer logged into verification portal.',
      ipAddress: '127.0.0.1',
      timestamp: '2026-09-24T08:50:00.000Z',
    },
    {
      id: 'audit_002',
      user: adminUser.id,
      action: 'DOCUMENT_VERIFIED',
      request: sampleRequest1.id,
      description: 'Document Aadhaar_Rahul_Patel.pdf verified by officer.',
      ipAddress: '127.0.0.1',
      timestamp: '2026-09-23T15:10:00.000Z',
    },
    {
      id: 'audit_003',
      user: adminUser.id,
      action: 'STATUS_UPDATED',
      request: sampleRequest1.id,
      description: 'Status transitioned from PROCESSING to APPROVED.',
      ipAddress: '127.0.0.1',
      timestamp: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'audit_004',
      user: adminUser.id,
      action: 'FINAL_DOCUMENT_UPLOADED',
      request: sampleRequest1.id,
      description: 'Issued digital certificate INC/DL/2026/98214.',
      ipAddress: '127.0.0.1',
      timestamp: '2026-09-24T14:30:00.000Z',
    },
  ];

  dbData = {
    users: [adminUser, citizenUser1, citizenUser2],
    documentTypes: docTypes,
    requests: [sampleRequest1, sampleRequest2, sampleRequest3],
    statusHistories: histories,
    notifications: notifications,
    auditLogs: auditLogs,
  };

  saveDatabase();
  console.log('✅ GovTrack database initialized with demo records.');
}

// Database helper queries and model access
export const db = {
  users: {
    find: (predicate?: (u: IUser) => boolean) => predicate ? dbData.users.filter(predicate) : [...dbData.users],
    findById: (id: string) => dbData.users.find((u) => u.id === id),
    findOne: (predicate: (u: IUser) => boolean) => dbData.users.find(predicate),
    create: (user: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): IUser => {
      const now = new Date().toISOString();
      const newUser: IUser = {
        id: generateId('usr'),
        createdAt: now,
        updatedAt: now,
        ...user,
      };
      dbData.users.push(newUser);
      saveDatabase();
      return newUser;
    },
    updateById: (id: string, updates: Partial<IUser>): IUser | null => {
      const index = dbData.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      dbData.users[index] = {
        ...dbData.users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase();
      return dbData.users[index];
    },
  },

  documentTypes: {
    find: (predicate?: (dt: IDocumentType) => boolean) => predicate ? dbData.documentTypes.filter(predicate) : [...dbData.documentTypes],
    findById: (id: string) => dbData.documentTypes.find((dt) => dt.id === id),
    findOne: (predicate: (dt: IDocumentType) => boolean) => dbData.documentTypes.find(predicate),
    create: (data: Omit<IDocumentType, 'id' | 'createdAt' | 'updatedAt'>): IDocumentType => {
      const now = new Date().toISOString();
      const newDt: IDocumentType = {
        id: generateId('dt'),
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      dbData.documentTypes.push(newDt);
      saveDatabase();
      return newDt;
    },
    updateById: (id: string, updates: Partial<IDocumentType>): IDocumentType | null => {
      const index = dbData.documentTypes.findIndex((dt) => dt.id === id);
      if (index === -1) return null;
      dbData.documentTypes[index] = {
        ...dbData.documentTypes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase();
      return dbData.documentTypes[index];
    },
  },

  requests: {
    find: (predicate?: (r: IDocumentRequest) => boolean) => predicate ? dbData.requests.filter(predicate) : [...dbData.requests],
    findById: (id: string) => dbData.requests.find((r) => r.id === id),
    findByRequestNumber: (reqNo: string) =>
      dbData.requests.find((r) => r.requestNumber.toUpperCase().trim() === reqNo.toUpperCase().trim()),
    create: (data: Omit<IDocumentRequest, 'id' | 'requestNumber' | 'submittedAt' | 'lastUpdatedAt'>): IDocumentRequest => {
      const now = new Date().toISOString();
      const newReq: IDocumentRequest = {
        id: generateId('req'),
        requestNumber: generateRequestNumber(),
        submittedAt: now,
        lastUpdatedAt: now,
        ...data,
      };
      dbData.requests.push(newReq);
      saveDatabase();
      return newReq;
    },
    updateById: (id: string, updates: Partial<IDocumentRequest>): IDocumentRequest | null => {
      const index = dbData.requests.findIndex((r) => r.id === id);
      if (index === -1) return null;
      dbData.requests[index] = {
        ...dbData.requests[index],
        ...updates,
        lastUpdatedAt: new Date().toISOString(),
      };
      saveDatabase();
      return dbData.requests[index];
    },
  },

  statusHistories: {
    find: (predicate?: (sh: IRequestStatusHistory) => boolean) => predicate ? dbData.statusHistories.filter(predicate) : [...dbData.statusHistories],
    findByRequest: (requestId: string) =>
      dbData.statusHistories
        .filter((sh) => sh.request === requestId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    create: (data: Omit<IRequestStatusHistory, 'id' | 'timestamp'>): IRequestStatusHistory => {
      const newHistory: IRequestStatusHistory = {
        id: generateId('sh'),
        timestamp: new Date().toISOString(),
        ...data,
      };
      dbData.statusHistories.push(newHistory);
      saveDatabase();
      return newHistory;
    },
  },

  notifications: {
    find: (predicate?: (n: INotification) => boolean) => predicate ? dbData.notifications.filter(predicate) : [...dbData.notifications],
    findByUser: (userId: string) =>
      dbData.notifications
        .filter((n) => n.user === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    create: (data: Omit<INotification, 'id' | 'createdAt'>): INotification => {
      const newNotif: INotification = {
        id: generateId('notif'),
        createdAt: new Date().toISOString(),
        ...data,
      };
      dbData.notifications.push(newNotif);
      saveDatabase();
      return newNotif;
    },
    markAsRead: (id: string): boolean => {
      const notif = dbData.notifications.find((n) => n.id === id);
      if (notif) {
        notif.isRead = true;
        saveDatabase();
        return true;
      }
      return false;
    },
    markAllAsRead: (userId: string): number => {
      let count = 0;
      dbData.notifications.forEach((n) => {
        if (n.user === userId && !n.isRead) {
          n.isRead = true;
          count++;
        }
      });
      if (count > 0) saveDatabase();
      return count;
    },
  },

  auditLogs: {
    find: (predicate?: (a: IAuditLog) => boolean) => predicate ? dbData.auditLogs.filter(predicate) : [...dbData.auditLogs],
    create: (data: Omit<IAuditLog, 'id' | 'timestamp'>): IAuditLog => {
      const newLog: IAuditLog = {
        id: generateId('audit'),
        timestamp: new Date().toISOString(),
        ...data,
      };
      dbData.auditLogs.push(newLog);
      saveDatabase();
      return newLog;
    },
  },
};

// Auto-load on initialization
loadDatabase();
