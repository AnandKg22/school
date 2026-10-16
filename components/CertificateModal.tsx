"use client";

import React from "react";
import { X, Printer, Award, ShieldCheck, Download, Sparkles } from "lucide-react";
import { Certificate } from "../lib/types";

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified Credential</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Design */}
        <div
          id="printable-certificate"
          className="p-8 md:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 text-slate-100 relative overflow-hidden"
        >
          {/* Ornate Outer Border */}
          <div className="absolute inset-4 border-2 border-amber-500/30 rounded-2xl pointer-events-none" />
          <div className="absolute inset-5 border border-amber-500/15 rounded-xl pointer-events-none" />

          {/* Corner Flourishes */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

          {/* Certificate Content */}
          <div className="relative text-center space-y-6 py-4">
            {/* Academy Seal */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-2 border-amber-400/50 text-amber-400 shadow-lg shadow-amber-500/10">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400/90 block mb-1">
                AKSchool Academy of AI Engineering
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 tracking-wide">
                Certificate of Completion
              </h1>
            </div>

            <p className="text-xs text-slate-400 italic">
              This is officially awarded and presented to
            </p>

            {/* Recipient */}
            <div className="py-2 border-b-2 border-amber-500/30 max-w-md mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">
                {certificate.recipient_name}
              </h2>
            </div>

            <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              for successfully completing all rigorous curriculum modules, laboratory code assignments, and passing the comprehensive examination for
            </p>

            {/* Course Title */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl max-w-xl mx-auto">
              <h3 className="text-base md:text-lg font-bold text-indigo-300">
                {certificate.course_title}
              </h3>
              <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                Final Grade: {certificate.grade_percentage}% (High Honors)
              </span>
            </div>

            {/* Signatures & Verification Row */}
            <div className="pt-6 grid grid-cols-3 gap-4 items-end text-left border-t border-slate-800/80 text-[11px] text-slate-400">
              <div>
                <span className="block text-slate-500 uppercase tracking-wider text-[10px]">
                  Issued Date
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(certificate.issued_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="text-center">
                <span className="font-serif italic text-base text-amber-300 block">
                  Akaash Sharma
                </span>
                <span className="block text-[10px] text-slate-500 border-t border-slate-700/60 pt-1">
                  Lead System Architect
                </span>
              </div>

              <div className="text-right">
                <span className="block text-slate-500 uppercase tracking-wider text-[10px]">
                  Certificate No.
                </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {certificate.certificate_number}
                </span>
              </div>
            </div>

            {/* Digital Hash Footer */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SHA256: {certificate.verification_hash}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
