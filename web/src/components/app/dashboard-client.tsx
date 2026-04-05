"use client";

import { createClient } from "@/lib/supabase/client";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

type Project = {
  id: string;
  project_name: string;
};

export function DashboardClient() {
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (cancelled || !u) return;
      setUser(u);

      const { data, error } = await supabase.from("projects").select("*");
      if (cancelled) return;
      if (error) {
        console.error("MYDEBUG →", error.message);
        return;
      }
      setProjects(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user) return;
    const { error } = await supabase.from("projects").insert({
      project_name: newName.trim(),
      user_id: user.id,
    });
    if (error) {
      showToast("Could not create project.");
      console.error("MYDEBUG →", error.message);
      return;
    }
    setNewName("");
    setShowNew(false);
    showToast("Project created.");
    const { data } = await supabase.from("projects").select("*");
    setProjects(data ?? []);
  };

  const handleUpload = async () => {
    if (!file || !selectedId || !user) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(`File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`);
      return;
    }
    const path = `${selectedId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("project-files")
      .upload(path, file);
    if (upErr) {
      showToast(upErr.message);
      console.error("MYDEBUG →", upErr.message);
      return;
    }
    const { error: insErr } = await supabase.from("files").insert({
      project_id: selectedId,
      file_name: file.name,
      file_path: path,
      uploaded_by: user.id,
    });
    if (insErr) {
      showToast("Upload saved to storage but metadata failed.");
      console.error("MYDEBUG →", insErr.message);
      return;
    }
    setFile(null);
    setShowUpload(false);
    showToast("Upload successful.");
  };

  return (
    <div className="mx-auto max-w-5xl">
      {user ? (
        <p className="mb-6 text-lg font-semibold">Welcome, {user.email}</p>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={() => setShowNew((v) => !v)}>
          + Create new project
        </Button>
        {showNew ? (
          <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-56"
            />
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNew(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </form>
        ) : null}
      </div>

      <h1 className="mb-4 text-2xl font-bold">My projects</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border bg-card p-4 shadow-sm transition hover:bg-muted/40"
            >
              <div className="text-lg font-semibold">{p.project_name}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/project/${p.id}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "secondary" }),
                  )}
                >
                  View files
                </Link>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSelectedId(p.id);
                    setShowUpload(true);
                  }}
                >
                  Upload file
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && selectedId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Upload to project</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Max {MAX_UPLOAD_BYTES / 1024 / 1024} MB per file.
            </p>
            <input
              type="file"
              className="mt-4 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleUpload()} disabled={!file}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ven-green px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
