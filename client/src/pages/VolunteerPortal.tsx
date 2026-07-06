/**
 * StadiumPulse AI - Volunteer Portal
 *
 * Task queue view with accept/complete actions and incident reporting.
 */
import { useEffect, useState, useCallback } from 'react';
import { Users, ClipboardList, Plus, MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import * as api from '@/services/api';
import type { Task, Incident } from '@/types';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
};

export default function VolunteerPortal() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ title: '', description: '', zoneId: 'gate-1' });
  const [reporting, setReporting] = useState(false);
  const [reportResult, setReportResult] = useState<Incident | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const res = await api.getTasks();
    if (res.success && res.data) setTasks(res.data);
    setLoading(false);
  };

  const handleStatusUpdate = useCallback(async (taskId: string, status: string) => {
    const res = await api.updateTaskStatus(taskId, status);
    if (res.success && res.data) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: status as Task['status'] } : t)));
    }
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);
    try {
      const res = await api.createIncident(reportData);
      if (res.success && res.data) {
        setReportResult(res.data);
        setReportData({ title: '', description: '', zoneId: 'gate-1' });
      }
    } catch {
      // Error handled
    } finally {
      setReporting(false);
    }
  };

  const activeCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <div className="page-shell max-w-screen-xl mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10">
            <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm leading-none">Volunteer Portal</h1>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl leading-relaxed flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {activeCount} active tasks
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowReport(true); setReportResult(null); }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300"
          aria-label="Report an incident"
        >
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Task Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden min-h-[28rem] lg:min-h-[32rem] h-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5 relative z-10">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <ClipboardList className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              Task Queue
            </h2>

            {loading ? (
              <div className="flex-1 flex items-center justify-center relative z-10">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:bg-slate-800/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300',
                      task.status === 'COMPLETED' && 'opacity-40 grayscale pointer-events-none border-dashed'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-[0.95rem] font-bold text-slate-100">{task.title}</h3>
                          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border', PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">{task.description}</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5">
                            <MapPin className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                            {task.zone?.name || task.zoneId}
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5 text-primary">
                            Status: {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 sm:flex-col shrink-0">
                        {task.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors w-full"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors w-full flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-colors w-full"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-xl border border-white/5 border-dashed relative z-10 m-4">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-3 opacity-50" />
                <p className="text-sm font-bold text-slate-300">All tasks completed! 🎉</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Great job today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Incident Report Form */}
        <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden h-fit">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5 relative z-10">
            <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
              <AlertCircle className="w-4 h-4 text-orange-400" aria-hidden="true" />
            </div>
            {showReport ? 'Report Incident' : 'Quick Report'}
          </h2>

          <form onSubmit={handleReport} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="incident-title" className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
              <input
                id="incident-title"
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                className="w-full bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                placeholder="Brief title"
                required
                minLength={3}
              />
            </div>
            <div>
              <label htmlFor="incident-desc" className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea
                id="incident-desc"
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                className="w-full bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner h-24 resize-none custom-scrollbar"
                placeholder="What happened? Include location details."
                required
                minLength={10}
              />
            </div>
            <div>
              <label htmlFor="incident-zone" className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Zone</label>
              <select
                id="incident-zone"
                value={reportData.zoneId}
                onChange={(e) => setReportData({ ...reportData, zoneId: e.target.value })}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg px-3 py-2.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner appearance-none cursor-pointer"
              >
                {['gate-1','gate-2','gate-3','gate-4','gate-5','gate-6','gate-7','gate-8',
                  'seating-a','seating-b','seating-c','seating-d','seating-e','seating-f','seating-g','seating-h',
                  'concourse-n','concourse-e','concourse-s','concourse-w',
                ].map((z) => (
                  <option key={z} value={z} className="bg-slate-800 text-white py-2">{z}</option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={reporting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white py-2.5 rounded-lg text-[0.95rem] font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-300 mt-2"
            >
              {reporting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit & Auto-Categorize
            </button>
          </form>

          {reportResult && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 animate-fade-in relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-[0.95rem] font-bold text-emerald-400">Incident Reported</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-300 border border-white/5">
                  Category: <span className="text-white ml-1">{reportResult.category}</span>
                </span>
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border', 
                  reportResult.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  reportResult.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                )}>
                  Severity: {reportResult.severity}
                </span>
              </div>
              
              {reportResult.aiSummary && (
                <div className="bg-slate-900/40 rounded-lg p-2.5 border border-white/5 shadow-inner mt-2">
                  <p className="text-[10px] font-semibold text-slate-300 leading-relaxed">
                    <span className="font-bold text-emerald-400 mr-1 uppercase tracking-wider">AI Summary:</span>
                    {reportResult.aiSummary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
