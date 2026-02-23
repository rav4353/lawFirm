import { Handle, Position } from 'reactflow';
import { ShieldCheck } from 'lucide-react';

export default function AnalyzeGDPRNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-4 py-3 shadow-lg shadow-emerald-500/10 backdrop-blur">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-900"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          GDPR
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">
        {data?.label || 'Analyze GDPR'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-900"
      />
    </div>
  );
}
