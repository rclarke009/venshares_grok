"use client";

import { createClient } from "@/lib/supabase/client";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at?: string;
  signedUrl?: string;
};

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [files, setFiles] = useState<Row[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId);

      if (cancelled) return;

      if (error) {
        console.error("MYDEBUG →", error.message);
        setFiles([]);
        setLoading(false);
        return;
      }

      const withUrls = await Promise.all(
        (data ?? []).map(async (row: Row) => {
          const { data: urlData } = await supabase.storage
            .from("project-files")
            .createSignedUrl(row.file_path, 3600);
          return { ...row, signedUrl: urlData?.signedUrl ?? "" };
        }),
      );
      if (cancelled) return;
      setFiles(withUrls);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, projectId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("project_name")
        .eq("id", projectId)
        .single();
      if (cancelled) return;
      if (!error && data) setProjectName(data.project_name);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, projectId]);

  const handleUpload = async () => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setToast(`Max file size ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`);
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setUploading(true);
    const path = `${projectId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("project-files")
      .upload(path, file);
    if (upErr) {
      setToast(upErr.message);
      setUploading(false);
      setTimeout(() => setToast(null), 4000);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setToast("Not signed in.");
      setUploading(false);
      return;
    }
    const { error: insErr } = await supabase.from("files").insert({
      project_id: projectId,
      file_name: file.name,
      file_path: path,
      uploaded_by: user.id,
    });
    if (insErr) {
      setToast("Could not save file metadata.");
      console.error("MYDEBUG →", insErr.message);
    } else {
      setToast("Upload successful.");
      setShowUpload(false);
      setFile(null);
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId);
      const withUrls = await Promise.all(
        (data ?? []).map(async (row: Row) => {
          const { data: urlData } = await supabase.storage
            .from("project-files")
            .createSignedUrl(row.file_path, 3600);
          return { ...row, signedUrl: urlData?.signedUrl ?? "" };
        }),
      );
      setFiles(withUrls);
    }
    setUploading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{projectName || "Project"}</h1>
      <p className="text-sm text-muted-foreground">ID: {projectId}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setShowUpload((v) => !v)}>
          + Upload file
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          ← Back to dashboard
        </Link>
      </div>

      {showUpload ? (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Max {MAX_UPLOAD_BYTES / 1024 / 1024} MB.
          </p>
          <input
            type="file"
            className="mt-2 block w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowUpload(false);
                setFile(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <h2 className="mt-10 text-xl font-semibold">Files</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : files.length === 0 ? (
        <p className="text-muted-foreground">No files yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3"
            >
              <span className="font-medium">{f.file_name}</span>
              <span className="flex gap-2">
                <a
                  href={f.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "secondary" }),
                  )}
                >
                  Open
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ven-green px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
