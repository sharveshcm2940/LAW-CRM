import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Calendar, FileText, Gavel, CheckSquare, DollarSign, MessageSquare, ArrowRight, Clock } from 'lucide-react';

export default function ChronologicalTimeline({ caseId }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('ALL');

  useEffect(() => {
    if (caseId) {
      fetchTimeline();
    }
  }, [caseId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/cases/${caseId}/timeline`);
      setTimelineData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-xs text-neutral-400">Loading chronological matter timeline...</div>;
  }

  if (!timelineData || !timelineData.events.length) {
    return <div className="py-10 text-center text-xs text-neutral-400">No events logged on timeline yet.</div>;
  }

  const stages = [
    'Lead',
    'Consultation',
    'Engagement',
    'Filing',
    'Hearing 1',
    'Hearing 2',
    'Order',
    'Appeal',
    'Closure',
  ];

  const filteredEvents = filterStage === 'ALL'
    ? timelineData.events
    : timelineData.events.filter(e => e.type === filterStage);

  const getIcon = (type) => {
    switch (type) {
      case 'COURT_HEARING': return <Gavel className="w-4 h-4 text-amber-400" />;
      case 'DOCUMENT_UPLOADED': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'TASK_CREATED': return <CheckSquare className="w-4 h-4 text-purple-400" />;
      case 'INVOICE_ISSUED': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'COMMUNICATION': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default: return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Lifecycle Stepper Header */}
      <div className="bg-[#161616] p-4 rounded-xl border border-white/10 overflow-x-auto">
        <div className="flex items-center min-w-max gap-2 text-xs font-medium">
          {stages.map((stg, idx) => (
            <React.Fragment key={stg}>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${
                idx <= 4
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-neutral-800/40 border-white/5 text-neutral-500'
              }`}>
                <span>{stg}</span>
              </div>
              {idx < stages.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'ALL', label: 'All Timeline Events' },
          { id: 'COURT_HEARING', label: 'Hearings' },
          { id: 'DOCUMENT_UPLOADED', label: 'Filings & Documents' },
          { id: 'TASK_CREATED', label: 'Tasks' },
          { id: 'COMMUNICATION', label: 'Communications' },
          { id: 'INVOICE_ISSUED', label: 'Billing' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterStage(cat.id)}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filterStage === cat.id
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-[#1A1A1A] border-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vertical Chronological Timeline Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {filteredEvents.map(evt => (
          <div key={evt.id} className="relative flex items-start gap-4 group">
            {/* Timeline Marker Dot */}
            <div className="absolute -left-6 top-1 p-1.5 rounded-full bg-[#1C1C1C] border border-white/10 shadow-lg group-hover:scale-110 transition">
              {getIcon(evt.type)}
            </div>

            {/* Event Card */}
            <div className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl p-4 space-y-2 hover:border-white/20 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${evt.badgeColor || 'bg-white/10 text-white'}`}>
                    {evt.stage}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{evt.title}</h4>
                </div>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {new Date(evt.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-neutral-300">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
