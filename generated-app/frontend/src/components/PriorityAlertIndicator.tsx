import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, AlertOctagon, AlertTriangle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIssues } from '../hooks/useApi';
import { PRIORITY_COLORS, PRIORITY_ICONS } from '../lib/utils';
import type { Issue } from '@canopy/shared';

export default function PriorityAlertIndicator() {
  const { state, dispatch } = useApp();
  const { data: issues } = useIssues(state.currentProjectId || undefined);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const criticalIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter(
      i => (i.priority === 'Highest' || i.priority === 'High') && i.status !== 'done'
    ).sort((a, b) => {
      if (a.priority === 'Highest' && b.priority !== 'Highest') return -1;
      if (b.priority === 'Highest' && a.priority !== 'Highest') return 1;
      return 0;
    });
  }, [issues]);

  const highestCount = criticalIssues.filter(i => i.priority === 'Highest').length;
  const totalCritical = criticalIssues.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-testid="priority-alert-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title={totalCritical > 0 ? `${totalCritical} critical issues` : 'No critical issues'}
      >
        <Bell size={17} className={totalCritical > 0 ? 'text-white' : 'text-white/60'} />
        {totalCritical > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full px-1 ${
              highestCount > 0 ? 'bg-[#BC6C25] animate-pulse' : 'bg-[#E9C46A]'
            }`}
          >
            {totalCritical > 9 ? '9+' : totalCritical}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-card-bg rounded-lg shadow-lg border border-border z-50 animate-slide-down overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#BC6C25]" />
              Priority Alerts
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {totalCritical > 0
                ? `${totalCritical} issues need attention`
                : 'No critical issues right now'}
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {criticalIssues.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-text-tertiary/50 mb-2" />
                <p className="text-sm text-text-tertiary">All clear!</p>
                <p className="text-xs text-text-tertiary/70 mt-0.5">No critical or high priority issues</p>
              </div>
            ) : (
              <div className="py-1">
                {criticalIssues.slice(0, 8).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => {
                      dispatch({ type: 'SELECT_ISSUE', id: issue.id });
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-hover-bg transition-colors text-left group"
                  >
                    {issue.priority === 'Highest' ? (
                      <AlertOctagon size={14} className="text-[#BC6C25] shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="text-[#E9C46A] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-text-tertiary">{issue.key}</span>
                        <span
                          className="text-[9px] px-1 py-0.5 rounded font-bold"
                          style={{
                            color: PRIORITY_COLORS[issue.priority],
                            backgroundColor: `${PRIORITY_COLORS[issue.priority]}18`,
                          }}
                        >
                          {issue.priority === 'Highest' ? 'URGENT' : 'HIGH'}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary truncate mt-0.5">{issue.summary}</p>
                    </div>
                    <ChevronRight size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
                {criticalIssues.length > 8 && (
                  <div className="px-4 py-2 text-[11px] text-text-tertiary text-center border-t border-border/50">
                    +{criticalIssues.length - 8} more issues
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
