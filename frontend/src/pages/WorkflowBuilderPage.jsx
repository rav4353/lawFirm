import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { workflowService } from '@/services/workflows';
import { ThemeToggle } from '@/components/ThemeToggle';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Save,
  ArrowLeft,
  FileUp,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Plus,
  Loader2,
  GripVertical,
  Workflow,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import DocumentUploadNode from '@/components/workflow/DocumentUploadNode';
import ExtractTextNode from '@/components/workflow/ExtractTextNode';
import AnalyzeGDPRNode from '@/components/workflow/AnalyzeGDPRNode';
import AnalyzeCCPANode from '@/components/workflow/AnalyzeCCPANode';
import ScoreComplianceNode from '@/components/workflow/ScoreComplianceNode';

import { toast } from 'sonner';

/* ── Node type registry ── */
const nodeTypes = {
  document_upload: DocumentUploadNode,
  extract_text: ExtractTextNode,
  analyze_gdpr: AnalyzeGDPRNode,
  analyze_ccpa: AnalyzeCCPANode,
  score_compliance: ScoreComplianceNode,
};

/* ── Palette items ── */
const paletteItems = [
  {
    type: 'document_upload',
    label: 'Document Upload',
    desc: 'PDF input node',
    icon: FileUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    type: 'extract_text',
    label: 'Extract Text',
    desc: 'AI text extraction',
    icon: FileSearch,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
  },
  {
    type: 'analyze_gdpr',
    label: 'Analyze GDPR',
    desc: 'EU privacy check',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    type: 'analyze_ccpa',
    label: 'Analyze CCPA',
    desc: 'CA privacy check',
    icon: ShieldAlert,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    type: 'score_compliance',
    label: 'Score Compliance',
    desc: 'Final scoring',
    icon: BarChart3,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/30',
  },
];

/* ── Default edge style ── */
const defaultEdgeOptions = {
  animated: true,
  style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
};

let nodeIdCounter = 0;
function getNextNodeId() {
  nodeIdCounter += 1;
  return `node_${Date.now()}_${nodeIdCounter}`;
}

/* ── Inner canvas (needs ReactFlowProvider parent) ── */
function WorkflowCanvas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');

  const { hasPermission } = useAuth();
  const canEdit = hasPermission('workflows', 'create');

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!workflowId);
  const [errorMsg, setErrorMsg] = useState('');

  /* ── Load existing workflow ── */
  useEffect(() => {
    if (!workflowId) return;
    (async () => {
      try {
        const wf = await workflowService.get(workflowId);
        setWorkflowName(wf.name);
        setNodes(wf.nodes || []);
        setEdges(wf.edges || []);
      } catch {
        setErrorMsg('Failed to load workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [workflowId, setNodes, setEdges]);

  /* ── Edge connection ── */
  const onConnect = useCallback(
    (params) => {
      if (!canEdit) return;
      setEdges((eds) =>
        addEdge({ ...params, animated: true, id: `e_${Date.now()}` }, eds)
      );
    },
    [setEdges, canEdit]
  );

  /* ── Drag-and-drop from palette ── */
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (!canEdit || !reactFlowInstance) return;

      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const item = paletteItems.find((p) => p.type === type);
      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newNode = {
        id: getNextNodeId(),
        type,
        position,
        data: { label: item?.label || type, type },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, canEdit]
  );

  /* ── Save workflow ── */
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        name: workflowName,
        description: '',
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          animated: e.animated ?? true,
        })),
      };

      if (workflowId) {
        await workflowService.update(workflowId, payload);
      } else {
        const created = await workflowService.create(payload);
        // Update URL to include the new workflow ID without a page reload
        window.history.replaceState(null, '', `/workflows?id=${created.id}`);
      }
      toast.success('Workflow saved successfully!');
    } catch (err) {
      toast.error('Failed to save workflow');
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'object' && detail?.validation_errors) {
        setErrorMsg(detail.validation_errors.join(', '));
      } else {
        setErrorMsg(typeof detail === 'string' ? detail : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/workflows')}
              className="gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </Button>
            
            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                 <Scale className="h-4.5 w-4.5 text-primary" />
              </div>
              <Workflow className="h-4 w-4 text-muted-foreground hidden sm:block" />
            
              {canEdit ? (
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-transparent text-lg font-bold tracking-tight outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors w-64"
                  placeholder="Workflow name…"
                />
              ) : (
                <span className="text-lg font-bold tracking-tight">{workflowName}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 rounded-full px-5 shadow-sm"
              >
                {saving ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Save className="h-4.5 w-4.5" />
                )}
                Save
              </Button>
            )}
            {!canEdit && (
              <Badge variant="secondary" className="text-amber-400">
                View Only
              </Badge>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            {errorMsg}
          </div>
        )}
      </header>

      {/* ── Body: sidebar + canvas ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node palette sidebar */}
        {canEdit && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-56 shrink-0 border-r border-border/40 bg-card/40 p-3 overflow-y-auto flex flex-col"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Plus className="mr-1 inline h-3 w-3" />
              Drag to add
            </p>
            <div className="space-y-2 flex-1">
              {paletteItems.map((item) => (
                <Card
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', item.type);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className={`cursor-grab active:cursor-grabbing border ${item.bg} transition-all hover:scale-[1.03]`}
                >
                  <CardContent className="flex items-center gap-2.5 p-3">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Helpful tip for deletion */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center border border-border/50">
              <p className="text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> Select any node on the canvas and press <kbd className="font-mono text-[9px] bg-background border border-border rounded px-1">Backspace</kbd> or <kbd className="font-mono text-[9px] bg-background border border-border rounded px-1">Delete</kbd> to remove it.
              </p>
            </div>
          </motion.aside>
        )}

        {/* React Flow canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={canEdit ? onNodesChange : undefined}
            onEdgesChange={canEdit ? onEdgesChange : undefined}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode={canEdit ? ['Backspace', 'Delete'] : []}
            nodesDraggable={canEdit}
            nodesConnectable={canEdit}
            elementsSelectable={canEdit}
            proOptions={{ hideAttribution: true }}
            className="bg-background"
          >
            <Background
              gap={20}
              size={1}
              color="rgba(255,255,255,0.03)"
            />
            <Controls
              className="[&>button]:!bg-card [&>button]:!border-border/50 [&>button]:!text-foreground [&>button:hover]:!bg-accent"
            />
            <MiniMap
              nodeColor={(n) => {
                const colors = {
                  document_upload: '#3b82f6',
                  extract_text: '#06b6d4',
                  analyze_gdpr: '#10b981',
                  analyze_ccpa: '#f59e0b',
                  score_compliance: '#8b5cf6',
                };
                return colors[n.type] || '#6366f1';
              }}
              maskColor="rgba(0,0,0,0.7)"
              className="!bg-card/80 !border-border/50"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

/* ── Exported page wrapper ── */
export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}
