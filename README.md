# GovTrack — Government Document Request & Status Tracking System

**GovTrack** is a production-quality MERN full-stack digital civic services portal built to solve a critical real-world problem:

> *Currently, citizens submit requests for government documents or certificates and frequently have to physically visit the concerned government office just to know whether their request is pending, under verification, approved, rejected, or ready for collection.*

GovTrack digitizes the complete application, scrutiny, multi-stage status workflow, notification pipeline, and digital certificate delivery with cryptographic audit accountability.

---

## 🏛️ System Features

### 1. Citizen Portal
- **Registration & Authentication**: Secure JWT-based citizen account with residential jurisdiction details.
- **Dynamic Application Submission**: Form fields dynamically adjust depending on the certificate requested (e.g. Income, Caste, Domicile, Birth, EWS).
- **Mandatory Document Uploads**: File uploads (PDF, JPG, PNG) verified with MIME-type and size enforcement.
- **Public & Authenticated Status Tracking**: Enter request number (e.g., `GOV-2026-000001`) to see real-time vertical status timeline, assigned scrutiny desk, and expected completion date.
- **Supplementary Document Uploads**: If an officer requests clarification (`ADDITIONAL_DOCUMENT_REQUIRED`), the citizen can upload requested proofs directly, automatically returning the request to `DOCUMENT_VERIFICATION`.
- **Authenticated Digital Document Download**: Download officially sanctioned certificates with certificate registration numbers and QR verification marks.
- **Early Stage Cancellation**: Citizens can cancel their request while in `SUBMITTED` stage before departmental scrutiny begins.
- **Live Notifications**: Automated alerts triggered on every state transition.

### 2. Department Officer / Admin Console
- **Analytics Dashboard**: Real-time calculated KPIs and Recharts analytics (Intake by status, Service category breakdown, Monthly throughput trends).
- **Scrutiny Queue**: Full administrative table with backend pagination, status filtering, document-type filtering, global search, and sorting.
- **Dedicated Request Processing Console**:
  - Applicant profile & contact inspection.
  - Declared form data particulars.
  - Document attachment scrutiny with individual `[Verify]` and `[Reject with Remarks]` actions.
  - Strict State Machine status transitions (disallowing invalid arbitrary jumps).
  - Clarification request action (transitions to `ADDITIONAL_DOCUMENT_REQUIRED`).
  - Final certificate issuance action (uploads signed PDF, generates serial number, marks `READY_FOR_DOWNLOAD`).
- **Document Type Configuration**: Add and manage statutory document types, SLAs, statutory fees, and required document checklists.
- **Identity & User Directory**: View registered citizens and officers, toggle activation status.
- **Security Audit Trail**: Immutable log of administrative logins, status transitions, document scrutiny decisions, and origin IP addresses.

---

## ⚙️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 SPA with Vite
- **Styling**: Tailwind CSS v4 with custom Plus Jakarta Sans & JetBrains Mono typography
- **Routing**: React Router DOM (with protected citizen & admin guards)
- **Visuals**: Lucide Icons, Recharts Analytics, responsive design

### Backend
- **Runtime**: Node.js & Express.js full-stack mount
- **Authentication**: JSON Web Tokens (JWT) with RBAC (`citizen` vs `admin`) and Bcrypt password hashing
- **File Management**: Multer disk storage with MIME and extension filtering
- **Data Persistence**: Dual-mode database layer:
  - Ready for external MongoDB / Mongoose via `MONGO_URI`.
  - Built-in persistent file-backed database (`data/govtrack.json`) guaranteeing out-of-the-box functionality in any sandboxed or containerized environment.
- **Security**: RBAC middleware, IDOR protection (ownership validation on files and applications), path sanitization, and audit logging.

---

## 🔒 Status Workflow State Machine

The system enforces non-arbitrary status transitions:

```text
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
DOCUMENT_VERIFICATION ⇄ ADDITIONAL_DOCUMENT_REQUIRED (Citizen uploads requested proof)
   ↓
PROCESSING
   ↓
APPROVED (or REJECTED at any scrutiny stage)
   ↓
READY_FOR_DOWNLOAD (Official digital certificate issued)
   ↓
COMPLETED (Citizen downloads certificate)
```

---

## 🔑 Demo Credentials

GovTrack is pre-seeded with realistic fictional demo records for immediate verification:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin Officer** | Vikram Singhania | `admin@govtrack.demo` | `Password@123` |
| **Citizen Applicant 1** | Rahul Patel | `rahul.patel@example.com` | `Password@123` |
| **Citizen Applicant 2** | Priya Sharma | `priya.sharma@example.com` | `Password@123` |

*Note: The UI also features a **1-Click Demo Login** button on the Login page and a **Quick Role Switcher** in the top navigation bar for seamless testing.*

---

## 🚀 Running the Project

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack dev server
npm run dev
# Server and Vite will be available at http://localhost:3000
```

### Production Build
```bash
# Build frontend bundles
npm run build

# Start production server
npm start
```

---

## 🌐 Real Government API Integration Guide

GovTrack includes a production abstraction layer at `server/services/government/GovernmentDocumentService.ts`.

When an officially authorized government agency connects GovTrack to their live state infrastructure:
1. Configure environment variables in `.env`:
   ```env
   GOVERNMENT_API_BASE_URL="https://api.staterevenue.gov.in/v1"
   GOVERNMENT_API_KEY="your-authorized-gateway-secret"
   ```
2. The `GovernmentDocumentService` will automatically detect the live non-sandbox endpoint and route:
   - `verifyCitizen(identityNumber, dob)` to the State Citizen Registry.
   - `submitApplication(payload)` to the State e-District Scrutiny Gateway.
   - `downloadCertificate(certId)` to DigiLocker or the official state repository.
3. If the external gateway is unreachable or unconfigured, it gracefully runs internal database workflows without failing transactions.

---

## 🛡️ Prototype Disclaimer
*This application is an educational prototype and portfolio demonstration. It does not impersonate any real government department or store real citizen PII.*
