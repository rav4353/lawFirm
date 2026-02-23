import { Handle, Position } from 'reactflow';
import { FileSearch } from 'lucide-react';

export default function ExtractTextNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-cyan-500/30 bg-cyan-950/60 px-4 py-3 shadow-lg shadow-cyan-500/10 backdrop-blur">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyan-900"
      />
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20">
          <FileSearch className="h-4 w-4 text-cyan-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Extract
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">
        {data?.label || 'Extract Text'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyan-900"
      />
    </div>
  );
}
