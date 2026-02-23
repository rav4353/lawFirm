import { Handle, Position } from 'reactflow';
import { FileUp } from 'lucide-react';

export default function DocumentUploadNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-blue-500/30 bg-blue-950/60 px-4 py-3 shadow-lg shadow-blue-500/10 backdrop-blur">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
          <FileUp className="h-4 w-4 text-blue-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
          Upload
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">
        {data?.label || 'Document Upload'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-blue-900"
      />
    </div>
  );
}
