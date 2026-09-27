import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  FileCheck2,
  Clock,
  ShieldCheck,
  Bell,
  Download,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Building2,
  Users,
  Award,
} from 'lucide-react';
import heroBanner from '../assets/images/hero_portal_banner_1790489985547.jpg';

export const LandingPage: React.FC = () => {
  const [trackNumber, setTrackNumber] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackNumber.trim()) {
      navigate(`/track-request?req=${encodeURIComponent(trackNumber.trim().toUpperCase())}`);
    }
  };

  const sampleTrackNumbers = ['GOV-2026-000001', 'GOV-2026-000002', 'GOV-2026-000003'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src={heroBanner}
            alt="Civic Public Service Center"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Domain Kicker */}
            <div className="text-xs uppercase tracking-widest font-mono text-blue-400 mb-3 font-semibold">
              Public Services Guarantee Act · Digital Governance
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Government Services. <br />
              <span className="text-blue-400">Now Trackable Online.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
              Submit your document request and track every stage of the verification process without visiting the government office just to check your application status.
            </p>

            {/* Direct Tracker Card */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/20 shadow-xl mb-6">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    placeholder="Enter Application No. (e.g. GOV-2026-000001)"
                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400">Try sample applications:</span>
                {sampleTrackNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTrackNumber(num);
                      navigate(`/track-request?req=${num}`);
                    }}
                    className="font-mono bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded text-blue-200 transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <Link
                to="/citizen/apply"
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4 text-blue-700" />
                Apply for Document
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Browse Services Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights / Proof Grid */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Zero In-Person Queues
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apply from your smartphone or desktop. Real-time timestamps inform you exactly which scrutiny officer or desk is processing your file.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  100% Audit Accountability
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every status transition creates an immutable historical ledger. Department remarks and verification decisions are transparently recorded.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Official Digital Certificates
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Once sanctioned, download your digitally signed PDF certificate immediately with official verification seal and registration number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6-Stage Transparent Lifecycle */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              End-To-End Scrutiny Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-3">
              How Your Request Travels Through The Department
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear accountability at every milestone. No ambiguity regarding who holds your file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Online Submission',
                desc: 'Citizen submits dynamic form with identity & address proofs.',
              },
              {
                step: '02',
                title: 'Initial Scrutiny',
                desc: 'Department desk acknowledges file and assigns verification officer.',
              },
              {
                step: '03',
                title: 'Doc Verification',
                desc: 'Officer cross-checks submitted proofs against state databases.',
              },
              {
                step: '04',
                title: 'Assessment',
                desc: 'Revenue or welfare calculation audited under statutory rules.',
              },
              {
                step: '05',
                title: 'Officer Sanction',
                desc: 'Competent authority signs and ratifies approval decree.',
              },
              {
                step: '06',
                title: 'Digital Delivery',
                desc: 'Official certificate ready for download in citizen portal.',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-3 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Citizen Certificates Grid */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Civic Services
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Frequently Requested Certificates
              </h2>
            </div>
            <Link
              to="/services"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
            >
              <span>View All 5 Document Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Revenue Department</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                  Income Certificate
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Certified assessment of gross annual household income required for educational concessions, state scholarships, and loan applications.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mb-6">
                  <span>Fee: ₹50</span>
                  <span>·</span>
                  <span>Processing: 7 Days</span>
                </div>
              </div>
              <Link
                to="/citizen/apply?type=dt_income_cert"
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg text-center transition-colors"
              >
                Apply Online
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Social Justice & Welfare</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                  Caste / Community Certificate
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Statutory verification certifying community affiliation (SC, ST, OBC) issued under state executive authority with genealogy validation.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mb-6">
                  <span>Fee: ₹60</span>
                  <span>·</span>
                  <span>Processing: 14 Days</span>
                </div>
              </div>
              <Link
                to="/citizen/apply?type=dt_caste_cert"
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg text-center transition-colors"
              >
                Apply Online
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Revenue & Land Records</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                  Residence / Domicile Certificate
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Official confirmation of permanent domicile within the state boundaries for state university admissions and recruitment quotas.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mb-6">
                  <span>Fee: ₹40</span>
                  <span>·</span>
                  <span>Processing: 10 Days</span>
                </div>
              </div>
              <Link
                to="/citizen/apply?type=dt_residence_cert"
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg text-center transition-colors"
              >
                Apply Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Answers regarding digital status tracking, verification periods, and document security.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                How do I know my current application stage?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your unique Application Number (e.g. <span className="font-mono text-blue-700">GOV-2026-000001</span>) into the Track Application search bar at any time. You will see an updated vertical timeline detailing which officer is scrutinizing the file, along with exact timestamps and departmental remarks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                What happens if my document is rejected or unclear?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If the verification officer needs clearer identity proof, the status transitions to "Action Required: Additional Document Needed". You will receive an instant in-portal notification explaining the exact requirement, and can upload the file directly without starting over.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Is the digitally downloaded certificate legally valid?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. Digitally issued certificates carry an authenticated Certificate Number, cryptographic QR verification seal, and issuing officer credentials, recognized across institutions under the Public Services Guarantee Act.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
