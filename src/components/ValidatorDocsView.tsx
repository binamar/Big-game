import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { CHARACTERS, CHARACTER_IDS } from '../data/characters';
import { BACKDROPS, BACKDROP_IDS } from '../data/backdrops';
import { validateChapter } from '../engine/validator';

export const ValidatorDocsView: React.FC = () => {
  const reports = useMemo(() => CHAPTERS.map((ch) => validateChapter(ch)), []);
  const allPassed = reports.every((r) => r.passed);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-100">
            Chapter Schema Validator &amp; Godot Project Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Live verification of all 10 chapters under res://data/chapters/ (validated in Godot via res://scripts/validate_chapters.gd).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium">
          {allPassed ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {reports.length} chapters verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Validation errors detected</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#141a22] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#19202a] text-xs text-slate-300 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Chapter</th>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Reachable Nodes</th>
                <th className="py-3 px-4 font-semibold">Issues</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((rep) => (
                <tr key={rep.chapterId} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-mono text-xs text-amber-200">{rep.chapterId}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{rep.title}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">
                    {rep.reachableCount} / {rep.nodeCount}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">{rep.issues.length}</td>
                  <td className="py-3.5 px-4">
                    {rep.passed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141a22] border border-white/10 rounded-xl p-5">
          <h3 className="font-display text-2xl font-semibold text-amber-200 mb-3">Cast &amp; Signature Accessories</h3>
          <div className="divide-y divide-white/5">
            {CHARACTER_IDS.map((id) => {
              const c = CHARACTERS[id];
              return (
                <div key={id} className="py-2.5 flex items-baseline justify-between gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-100">{c.name}</span>
                    <span aria-hidden="true" className="text-slate-500 mx-1.5">·</span>
                    <span className="text-xs text-slate-400">{c.title}</span>
                  </div>
                  <span className="text-xs text-slate-300 text-right">{c.accessoryLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#141a22] border border-white/10 rounded-xl p-5">
          <h3 className="font-display text-2xl font-semibold text-amber-200 mb-3">Procedural Locations (12 Scenes)</h3>
          <div className="divide-y divide-white/5">
            {BACKDROP_IDS.map((id) => {
              const b = BACKDROPS[id];
              return (
                <div key={id} className="py-2.5 flex items-baseline justify-between gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-100">{b.name}</span>
                    <span aria-hidden="true" className="text-slate-500 mx-1.5">·</span>
                    <span className="text-xs text-slate-400">{b.region}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{b.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
