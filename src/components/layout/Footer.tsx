import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, HelpCircle, FileCheck2, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs">
                GT
              </span>
              <span>GovTrack Portal</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Digitized Public Services Scrutiny & Real-Time Application Tracking Platform. Eliminating the need to physically visit offices to query application status.
            </p>
            <div className="pt-2 text-xs text-amber-400/90 font-mono">
              ⚠️ Prototype Demo — Fictional Public Services Simulation
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Income Certificate
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Caste & Community Certificate
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Domicile / Residence Certificate
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Birth Certificate Extract
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  EWS Economically Weaker Section
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Tools */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Direct Tracking
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/track-request" className="hover:text-white transition-colors">
                  Track Application by Number
                </Link>
              </li>
              <li>
                <Link to="/citizen/apply" className="hover:text-white transition-colors">
                  Submit Online Application
                </Link>
              </li>
              <li>
                <Link to="/citizen/dashboard" className="hover:text-white transition-colors">
                  Citizen Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Department Officer Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Regulatory Notice */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Statutory Transparency
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Designed according to the Public Services Delivery Standard. Every stage transition is cryptographically logged into an immutable audit trail with timestamped administrative accountability.
            </p>
            <div className="pt-2 flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>TLS Encrypted & RBAC Protected</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            © 2026 GovTrack — Citizen Services Department (Demo Architecture). All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>WCAG 2.1 AA Compliant</span>
            <span>Zero Unverified Fees</span>
            <span>Automated SMS/In-App Alerts</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
