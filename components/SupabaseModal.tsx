'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Check, 
  Copy, 
  AlertCircle, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck 
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  setCustomSupabaseCredentials, 
  testSupabaseConnection 
} from '@/lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionStatusChange: (connected: boolean) => void;
}

const SQL_SCHEMA = `-- User Search & Route History Table
create table public.saved_routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  max_budget numeric not null,
  priority_mode text not null check (priority_mode in ('fastest', 'cheapest', 'balanced')),
  selected_mode text,
  route_payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_routes enable row level security;

create policy "Users can view their own saved routes" 
on public.saved_routes for select 
using (auth.uid() = user_id or auth.uid() is null);

create policy "Users can insert their own saved routes" 
on public.saved_routes for insert 
with check (auth.uid() = user_id or auth.uid() is null);
`;

export default function SupabaseModal({
  isOpen,
  onClose,
  onConnectionStatusChange,
}: SupabaseModalProps) {
  const [creds, setCreds] = useState(getSupabaseCredentials());
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!creds.url || !creds.anonKey) {
      setCustomSupabaseCredentials('', '');
      onConnectionStatusChange(false);
      setStatusMsg({ type: 'error', text: 'Credentials cleared. Switched to browser LocalStorage mode.' });
      return;
    }

    setTesting(true);
    setStatusMsg(null);

    const res = await testSupabaseConnection(creds.url, creds.anonKey);
    setTesting(false);

    if (res.success) {
      setCustomSupabaseCredentials(creds.url, creds.anonKey);
      onConnectionStatusChange(true);
      setStatusMsg({ type: 'success', text: 'Connected! Table public.saved_routes is active.' });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Supabase PostgreSQL Database Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your cloud Supabase database for persisting multi-modal journeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        <div className="my-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
              Zero Setup Interruption:
            </strong>
            RouteWise automatically defaults to high-speed local browser storage if Supabase credentials are empty, and seamlessly upgrades to Supabase when credentials are provided!
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project URL (<code className="font-mono text-emerald-600">NEXT_PUBLIC_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={creds.url}
              onChange={(e) => setCreds({ ...creds, url: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Anon Key (<code className="font-mono text-emerald-600">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={creds.anonKey}
              onChange={(e) => setCreds({ ...creds, anonKey: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestAndSave}
              disabled={testing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Test & Save Supabase Sync</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SQL Schema Preview */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Database Migration SQL (Execute in Supabase SQL Editor)
            </div>
            <button
              onClick={handleCopySQL}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
            {SQL_SCHEMA}
          </pre>
        </div>

      </div>
    </div>
  );
}
