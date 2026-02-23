import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/useAuth';
import { workflowService } from '@/services/workflows';
import { ThemeToggle } from '@/components/ThemeToggle';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  ArrowLeft,
  Plus,
  Workflow,
  Loader2,
  Calendar,
  Trash2,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('workflows', 'create');
  const canDelete = hasPermission('workflows', 'delete');

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await workflowService.list();
        setWorkflows(data.workflows || []);
      } catch {
        setError('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await workflowService.remove(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch {
      setError('Failed to delete workflow');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">Workflows</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {canCreate && (
            <Button
              size="sm"
              onClick={() => navigate('/workflows/builder')}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : workflows.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Workflow className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-1">No workflows yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {canCreate
                ? 'Create your first compliance workflow to get started.'
                : 'No workflows are available for your role.'}
            </p>
            {canCreate && (
              <Button onClick={() => navigate('/workflows/builder')} className="gap-1.5">
                <Plus className="h-4 w-4" /> Create Workflow
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((wf, i) => (
              <motion.div
                key={wf.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
              >
                <Card
                  className="group cursor-pointer border-border/50 bg-card/60 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() =>
                    navigate(`/workflows/builder?id=${wf.id}`)
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Workflow className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm">{wf.name}</CardTitle>
                      </div>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(e, wf.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {wf.description && (
                      <CardDescription className="mb-2 line-clamp-2">
                        {wf.description}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[10px] text-muted-foreground"
                      >
                        <Calendar className="h-3 w-3" />
                        {new Date(wf.created_at).toLocaleDateString()}
                      </Badge>
                      {wf.is_active && (
                        <Badge variant="secondary" className="text-[10px] text-emerald-400">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
