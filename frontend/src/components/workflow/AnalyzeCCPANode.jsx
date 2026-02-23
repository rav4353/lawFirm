import { Handle, Position } from 'reactflow';
import { ShieldAlert } from 'lucide-react';

export default function AnalyzeCCPANode({ data }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-amber-500/30 bg-amber-950/60 px-4 py-3 shadow-lg shadow-amber-500/10 backdrop-blur">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-amber-900"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
          CCPA
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">
        {data?.label || 'Analyze CCPA'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-amber-900"
      />
    </div>
  );
}
