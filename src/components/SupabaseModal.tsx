import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, Zap } from 'lucide-react';

interface SupabaseModalProps {
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key-here`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">100% Free Tier Cloud Sync (Supabase)</h3>
            <p className="text-xs text-slate-400">PostGIS Geospatial Engine + Realtime WebSockets</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-300">
          <p>
            The app currently runs in <strong>Smart Local-First Mode</strong> (pre-seeded with real Kigali bottlenecks and saving your reports in local storage).
          </p>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2">
            <span className="font-semibold text-slate-200 block text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 3 Steps to activate free live cloud sync:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                (Zero credit card needed).
              </li>
              <li>
                Open the <strong>SQL Editor</strong> in Supabase and paste the contents of{' '}
                <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">
                  supabase_schema.sql
                </code>{' '}
                (already created in this project).
              </li>
              <li>
                Add your project URL and Anon key in a <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">.env</code> file:
              </li>
            </ol>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              {envSample}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Got it, continue in local mode
          </button>
        </div>
      </div>
    </div>
  );
};
