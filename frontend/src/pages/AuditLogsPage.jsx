import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/useAuth';
import { auditLogsService } from '@/services/auditLogs';
import { ThemeToggle } from '@/components/ThemeToggle';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

import {
  Scale,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canViewAll = hasPermission('audit_logs', 'view_all');
  const canViewOwn = hasPermission('audit_logs', 'view_own');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [resourceId, setResourceId] = useState('');

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const allowed = canViewAll || canViewOwn;

  const query = useMemo(
    () => ({
      limit,
      offset,
      resource: resource.trim() || undefined,
      action: action.trim() || undefined,
      resource_id: resourceId.trim() || undefined,
    }),
    [limit, offset, resource, action, resourceId]
  );

  const fetchLogs = async () => {
    if (!allowed) return;
    setLoading(true);
    setError('');
    try {
      const data = await auditLogsService.list(query);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your role does not have permission to view audit logs.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </Button>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">Audit Logs</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Button
              variant="secondary"
              onClick={fetchLogs}
              className="gap-2 rounded-full px-5 shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4.5 w-4.5" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by resource (e.g. documents)"
              value={resource}
              onChange={(e) => {
                setOffset(0);
                setResource(e.target.value);
              }}
              className="pl-9 bg-card/40 border-border/50 rounded-full h-9"
            />
          </div>
          <Input
            placeholder="Filter by action (e.g. upload)"
            value={action}
            onChange={(e) => {
              setOffset(0);
              setAction(e.target.value);
            }}
            className="bg-card/40 border-border/50 rounded-full h-9"
          />
          <Input
            placeholder="Filter by resource_id"
            value={resourceId}
            onChange={(e) => {
              setOffset(0);
              setResourceId(e.target.value);
            }}
            className="bg-card/40 border-border/50 rounded-full h-9"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight">Event Stream</h2>
            <Badge variant="secondary" className="text-xs">
              {total} event{total === 1 ? '' : 's'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {logs.length} • Offset {offset}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <Card className="border-border/50 bg-card/40">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No audit events found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
              >
                <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {log.role}
                          </Badge>
                          <span className="text-sm font-bold text-foreground truncate">
                            {log.resource}/{log.action}
                          </span>
                          {log.resource_id && (
                            <Badge variant="outline" className="text-[10px] truncate max-w-[220px]">
                              {log.resource_id}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {formatDate(log.timestamp)} • user: <span className="font-mono">{log.user_id}</span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase tracking-wider ${log.opa_decision?.allow ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {log.opa_decision?.allow ? 'allowed' : 'denied'}
                      </Badge>
                    </div>

                    {(log.metadata || log.opa_input) && (
                      <>
                        <Separator className="opacity-50" />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="text-[11px]">
                            <div className="font-semibold text-muted-foreground mb-1">OPA input</div>
                            <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/20 p-2 overflow-auto max-h-28">
                              {JSON.stringify(log.opa_input || {}, null, 2)}
                            </pre>
                          </div>
                          <div className="text-[11px]">
                            <div className="font-semibold text-muted-foreground mb-1">Metadata</div>
                            <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/20 p-2 overflow-auto max-h-28">
                              {JSON.stringify(log.metadata || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={offset <= 0 || loading}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
          >
            Previous
          </Button>
          <div className="text-xs text-muted-foreground">
            Tip: generate events by uploading a document or running a workflow.
          </div>
          <Button
            variant="secondary"
            disabled={loading || logs.length < limit}
            onClick={() => setOffset((o) => o + limit)}
          >
            Next
          </Button>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          <span className="font-semibold">Note:</span> This view is permission-gated via OPA.
          If you can only view your own logs, the backend automatically filters by your user.
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Quick link: <Link className="text-primary underline underline-offset-4" to="/workflows">Workflows</Link>
        </div>
      </main>
    </div>
  );
}
