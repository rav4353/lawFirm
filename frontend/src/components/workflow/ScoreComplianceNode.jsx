import { Handle, Position } from 'reactflow';
import { BarChart3 } from 'lucide-react';

export default function ScoreComplianceNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-violet-500/30 bg-violet-950/60 px-4 py-3 shadow-lg shadow-violet-500/10 backdrop-blur">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-violet-900"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
          <BarChart3 className="h-4 w-4 text-violet-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Score
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">
        {data?.label || 'Score Compliance'}
      </p>
    </div>
  );
}
