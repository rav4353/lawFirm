import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { rbacService } from "@/services/rbac";
import { useAuth } from "@/context/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Scale,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Shield,
  Users,
  Settings,
  Briefcase,
  Crown,
  FileText,
  Brain,
  Workflow,
  Lock,
  Save,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const roleConfig = {
  it_admin: {
    label: "IT Admin",
    icon: Settings,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  partner: {
    label: "Partner",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  associate: {
    label: "Associate",
    icon: Briefcase,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  paralegal: {
    label: "Paralegal",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
};

const moduleIcons = {
  documents: FileText,
  ai_analysis: Brain,
  workflows: Workflow,
  users: Users,
  system: Settings,
};

const moduleDisplayNames = {
  documents: "Documents",
  ai_analysis: "AI Analysis",
  workflows: "Workflows",
  users: "Users",
  system: "System",
};

export default function RBACPoliciesPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "it_admin";

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingChanges, setPendingChanges] = useState({});

  // Load roles
  useEffect(() => {
    (async () => {
      try {
        const data = await rbacService.listRoles();
        setRoles(data.roles);
        if (data.roles.length > 0) {
          setSelectedRoleId(data.roles[0].id);
        }
      } catch {
        setError("Failed to load roles.");
      }
    })();
  }, []);

  // Load permissions when role changes
  const loadPermissions = useCallback(async () => {
    if (!selectedRoleId) return;
    setLoading(true);
    setPendingChanges({});
    try {
      const data = await rbacService.getRolePermissions(selectedRoleId);
      setPermissions(data.permissions);
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const mod = perm.module;
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const handleToggle = (permId, currentVal) => {
    if (!isAdmin) return;
    const newVal = !currentVal;
    // Update local state instantly
    setPermissions((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, allowed: newVal } : p))
    );
    setPendingChanges((prev) => ({
      ...prev,
      [permId]: newVal,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    setSaving(true);
    try {
      const updates = Object.entries(pendingChanges).map(([permId, allowed]) => ({
        permission_id: permId,
        allowed,
      }));
      await rbacService.updateRolePermissions(selectedRoleId, updates);
      setPendingChanges({});
      toast.success("Permissions saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save permissions.");
      // Reload original data on failure
      loadPermissions();
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const rc = selectedRole ? roleConfig[selectedRole.name] || roleConfig.paralegal : roleConfig.paralegal;
  const pendingCount = Object.keys(pendingChanges).length;

  const totalPerms = permissions.length;
  const enabledPerms = permissions.filter((p) => p.allowed).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <span className="text-lg font-bold tracking-tight">
                RBAC Policies
              </span>
              <p className="text-[11px] text-muted-foreground -mt-0.5">
                System Config
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && isAdmin && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save {pendingCount} Change{pendingCount > 1 ? "s" : ""}
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button className="ml-auto" onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* View-only notice for non-admins */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>View Only</strong> — Only IT Admins can modify role
              permissions. Contact your administrator for changes.
            </span>
          </motion.div>
        )}

        {/* ── System Config Tabs ── */}
        <div className="mb-8 border-b border-border/40">
          <div className="flex gap-8">
            <Link
              to="/system/users"
              className="relative pb-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              User Management
            </Link>
            <Link
              to="/system/rbac"
              className="relative pb-4 text-sm font-bold text-primary"
            >
              Roles & Permissions
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            </Link>
          </div>
        </div>

        {/* ── Role Tabs ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {roles.map((role) => {
              const c = roleConfig[role.name] || roleConfig.paralegal;
              const RIcon = c.icon;
              const active = role.id === selectedRoleId;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`group flex items-center gap-2.5 rounded-xl border px-5 py-3 transition-all duration-200 ${
                    active
                      ? `${c.border} ${c.bg} shadow-lg shadow-${c.color.split("-")[1]}-500/10`
                      : "border-border/50 bg-card/40 hover:bg-card/60 hover:border-border"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? c.bg : "bg-muted/50"
                    } transition-colors`}
                  >
                    <RIcon
                      className={`h-4 w-4 ${
                        active ? c.color : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-bold ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {role.display_name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Stats Bar ── */}
        {selectedRole && (
          <motion.div
            key={selectedRoleId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {selectedRole.display_name}
              </h2>
              <Badge
                variant="outline"
                className={`${rc.border} ${rc.bg} ${rc.color}`}
              >
                {enabledPerms}/{totalPerms} enabled
              </Badge>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-primary/10 text-primary border border-primary/20">
                {pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
          </motion.div>
        )}

        {/* ── Permissions Matrix ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            key={selectedRoleId}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="space-y-6"
          >
            {Object.entries(groupedPermissions).map(
              ([moduleName, perms], moduleIdx) => {
                const ModIcon = moduleIcons[moduleName] || Shield;
                const modDisplay =
                  moduleDisplayNames[moduleName] || moduleName;
                const enabledInModule = perms.filter((p) => p.allowed).length;

                return (
                  <motion.div
                    key={moduleName}
                    variants={fadeUp}
                    custom={moduleIdx}
                  >
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                      {/* Module Header */}
                      <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                              <ModIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold">
                                {modDisplay}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {enabledInModule} of {perms.length} permissions
                                enabled
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              enabledInModule === perms.length
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : enabledInModule === 0
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {enabledInModule === perms.length
                              ? "Full Access"
                              : enabledInModule === 0
                              ? "No Access"
                              : "Partial"}
                          </Badge>
                        </div>
                      </CardHeader>

                      {/* Permission Rows */}
                      <CardContent className="pt-4">
                        <div className="divide-y divide-border/30 rounded-lg border border-border/30 overflow-hidden">
                          {perms.map((perm) => {
                            const isChanged =
                              pendingChanges[perm.id] !== undefined;
                            return (
                              <div
                                key={perm.id}
                                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                                  isChanged
                                    ? "bg-primary/5"
                                    : "hover:bg-muted/20"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`flex h-2 w-2 rounded-full ${
                                      perm.allowed
                                        ? "bg-emerald-500"
                                        : "bg-muted-foreground/30"
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {perm.display_name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-mono">
                                      {perm.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isChanged && (
                                    <span className="text-[10px] font-bold text-primary uppercase">
                                      Modified
                                    </span>
                                  )}
                                  <Switch
                                    checked={perm.allowed}
                                    onCheckedChange={() =>
                                      handleToggle(perm.id, perm.allowed)
                                    }
                                    disabled={!isAdmin}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              }
            )}
          </motion.div>
        )}
      </main>

      {/* ── Floating Save Bar ── */}
      <AnimatePresence>
        {pendingCount > 0 && isAdmin && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>
                  {pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPermissions}
                disabled={saving}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
