import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, X, ChevronRight, Flame, AlertOctagon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIORITY_COLORS } from '../lib/utils';
import type { Issue } from '@canopy/shared';

interface PriorityAlertBannerProps {
  issues: Issue[] | undefined;
  onIssueClick?: (id: string) => void;
}

export default function PriorityAlertBanner({ issues, onIssueClick }: PriorityAlertBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('canopy_dismissed_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const criticalIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter(
      i => (i.priority === 'Highest' || i.priority === 'High') &&
        i.status !== 'done' &&
        !dismissed.includes(i.id)
    ).sort((a, b) => {
      // Highest first, then High
      if (a.priority === 'Highest' && b.priority !== 'Highest') return -1;
      if (b.priority === 'Highest' && a.priority !== 'Highest') return 1;
      return 0;
    });
  }, [issues, dismissed]);

  const highestCount = criticalIssues.filter(i => i.priority === 'Highest').length;
  const highCount = criticalIssues.filter(i => i.priority === 'High').length;

  useEffect(() => {
    localStorage.setItem('canopy_dismissed_alerts', JSON.stringify(dismissed));
  }, [dismissed]);

  function dismissIssue(e: React.MouseEvent, issueId: string) {
    e.stopPropagation();
    setDismissed(prev => [...prev, issueId]);
  }

  function dismissAll() {
    setDismissed(prev => [...prev, ...criticalIssues.map(i => i.id)]);
  }

  if (criticalIssues.length === 0) return null;

  return (
    <div
      data-testid="priority-alert-banner"
      className="mb-4 rounded-lg border overflow-hidden animate-slide-in-up"
      style={{
        borderColor: highestCount > 0 ? 'rgba(188, 108, 37, 0.4)' : 'rgba(233, 196, 106, 0.4)',
        backgroundColor: highestCount > 0 ? 'rgba(188, 108, 37, 0.06)' : 'rgba(233, 196, 106, 0.06)',
      }}
    >
      {/* Banner header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-1.5 rounded-md ${highestCount > 0 ? 'bg-[#BC6C25]/15' : 'bg-[#E9C46A]/15'}`}>
          {highestCount > 0 ? (
            <Flame size={16} className="text-[#BC6C25] animate-pulse" />
          ) : (
            <AlertTriangle size={16} className="text-[#E9C46A]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {criticalIssues.length} Critical {criticalIssues.length === 1 ? 'Issue' : 'Issues'}
            </span>
            {highestCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#BC6C25]/15 text-[#BC6C25] font-bold uppercase tracking-wider">
                {highestCount} Urgent
              </span>
            )}
            {highCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E9C46A]/15 text-[#B8860B] font-bold uppercase tracking-wider">
                {highCount} High
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">
            {highestCount > 0
              ? 'Urgent issues require immediate attention'
              : 'High priority issues need to be addressed soon'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); dismissAll(); }}
            className="text-[10px] px-2 py-1 text-text-tertiary hover:text-text-primary hover:bg-hover-bg rounded transition-colors"
            title="Dismiss all alerts"
          >
            Dismiss all
          </button>
          <ChevronRight
            size={16}
            className={`text-text-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>

      {/* Expanded issue list */}
      {isExpanded && (
        <div className="border-t border-border/50 divide-y divide-border/30">
          {criticalIssues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors group"
              onClick={() => onIssueClick?.(issue.id)}
            >
              {issue.priority === 'Highest' ? (
                <AlertOctagon size={14} className="text-[#BC6C25] shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-[#E9C46A] shrink-0" />
              )}
              <span className="text-[11px] font-mono text-text-tertiary shrink-0">{issue.key}</span>
              <span className="text-sm text-text-primary truncate flex-1">{issue.summary}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                style={{
                  color: PRIORITY_COLORS[issue.priority],
                  backgroundColor: `${PRIORITY_COLORS[issue.priority]}18`,
                }}
              >
                {issue.priority}
              </span>
              <button
                onClick={(e) => dismissIssue(e, issue.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-hover-bg transition-all text-text-tertiary hover:text-text-primary"
                title="Dismiss this alert"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {criticalIssues.length > 5 && (
            <div className="px-4 py-2 text-xs text-text-tertiary text-center">
              +{criticalIssues.length - 5} more critical issues
            </div>
          )}
        </div>
      )}
    </div>
  );
}
