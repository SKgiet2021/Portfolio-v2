"use client";

import { useState, useRef, useEffect } from "react";

type UploadStats = {
  pages?: number;
  chunks: number;
  totalTokens: number;
  avgChunkTokens: number;
  peopleCount?: number;
  objectCount?: number;
  tags?: string[];
};

type IndexedDocument = {
  name: string;
  chunks: number;
  createdAt: number;
  createdAtFormatted: string;
};

interface PersonaData {
  name: string;
  title: string;
  tagline: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    design: string[];
    dataScience: string[];
    databases: string[];
  };
  certifications: string[];
  [key: string]: any;
}

// Custom Modal Component
function Modal({
  isOpen,
  title,
  message,
  type = "confirm",
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "confirm" | "alert" | "success" | "error";
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  if (!isOpen) return null;

  const bgColor =
    type === "success"
      ? "border-green-500"
      : type === "error"
      ? "border-red-500"
      : "border-blue-500";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className={`bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 border-2 ${bgColor}`}
      >
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-zinc-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          {type === "confirm" && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${
              type === "error"
                ? "bg-red-600 hover:bg-red-500"
                : type === "success"
                ? "bg-green-600 hover:bg-green-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {type === "confirm" ? "Confirm" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "persona">(
    "knowledge"
  );

  // Knowledge base state
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState<IndexedDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadResults, setUploadResults] = useState<
    Array<{
      name: string;
      status: "success" | "error";
      message: string;
      stats?: UploadStats;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persona state
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [loadingPersona, setLoadingPersona] = useState(true);
  const [savingPersona, setSavingPersona] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [jsonMode, setJsonMode] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "confirm" | "alert" | "success" | "error";
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadIndexedDocuments();
    loadPersona();
  }, []);

  const showModal = (
    title: string,
    message: string,
    type: "confirm" | "alert" | "success" | "error" = "alert",
    onConfirm?: () => void
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm:
        onConfirm || (() => setModal((m) => ({ ...m, isOpen: false }))),
      onCancel:
        type === "confirm"
          ? () => setModal((m) => ({ ...m, isOpen: false }))
          : undefined,
    });
  };

  // ============ Knowledge Base Functions ============
  const loadIndexedDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/admin/documents");
      const data = await res.json();
      setIndexedDocs(data.documents || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
    setLoadingDocs(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const confirmDelete = (docName: string) => {
    showModal(
      "🗑️ Delete Document",
      `Delete "${docName}" from knowledge base?`,
      "confirm",
      () => executeDelete(docName)
    );
  };

  const executeDelete = async (docName: string) => {
    setModal((m) => ({ ...m, isOpen: false }));
    try {
      const res = await fetch(
        `/api/admin/documents?name=${encodeURIComponent(docName)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setIndexedDocs((prev) => prev.filter((d) => d.name !== docName));
        showModal("✅ Deleted", `"${docName}" removed.`, "success");
      } else {
        showModal("❌ Error", data.error || "Failed", "error");
      }
    } catch {
      showModal("❌ Error", "Failed to delete.", "error");
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadResults([]);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setUploadResults((prev) => [
          ...prev,
          {
            name: file.name,
            status: data.error ? "error" : "success",
            message:
              data.error ||
              (data.type === "image"
                ? `${data.stats.peopleCount || 0} people, ${
                    data.stats.objectCount || 0
                  } objects`
                : `${data.stats.chunks} chunks`),
            stats: data.stats,
          },
        ]);
      } catch (error: any) {
        setUploadResults((prev) => [
          ...prev,
          {
            name: file.name,
            status: "error",
            message: error.message || "Failed",
          },
        ]);
      }
    }

    setIsUploading(false);
    setFiles([]);
    loadIndexedDocuments();
    showModal("✅ Complete", `Processed ${files.length} file(s).`, "success");
  };

  const confirmClearAll = () => {
    showModal(
      "⚠️ Clear All",
      "Delete ALL documents? Cannot be undone!",
      "confirm",
      async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        try {
          const res = await fetch("/api/admin/upload", { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setIndexedDocs([]);
            showModal("✅ Cleared", "Knowledge base cleared.", "success");
          }
        } catch {
          showModal("❌ Error", "Failed to clear.", "error");
        }
      }
    );
  };

  // ============ Persona Functions ============
  const loadPersona = async () => {
    setLoadingPersona(true);
    try {
      const res = await fetch("/api/admin/persona");
      const data = await res.json();
      if (data.persona) {
        setPersona(data.persona);
        setRawJson(JSON.stringify(data.persona, null, 2));
      }
    } catch {
      showModal("❌ Error", "Failed to load persona", "error");
    }
    setLoadingPersona(false);
  };

  const savePersona = async () => {
    if (!persona) return;
    setSavingPersona(true);
    try {
      const res = await fetch("/api/admin/persona", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      const data = await res.json();
      if (data.success)
        showModal("✅ Saved", "Persona saved! Backup created.", "success");
      else showModal("❌ Error", data.error || "Failed", "error");
    } catch {
      showModal("❌ Error", "Failed to save", "error");
    }
    setSavingPersona(false);
  };

  const saveRawJson = async () => {
    setSavingPersona(true);
    try {
      const parsed = JSON.parse(rawJson);
      const res = await fetch("/api/admin/persona", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        setPersona(parsed);
        showModal("✅ Saved", "Persona saved from JSON!", "success");
        setJsonMode(false);
      } else showModal("❌ Error", data.error, "error");
    } catch (e: any) {
      showModal("❌ Invalid JSON", e.message, "error");
    }
    setSavingPersona(false);
  };

  const restoreBackup = () => {
    showModal(
      "🔄 Restore",
      "Restore persona from backup?",
      "confirm",
      async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        try {
          const res = await fetch("/api/admin/persona", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "restore" }),
          });
          const data = await res.json();
          if (data.success) {
            loadPersona();
            showModal(
              "✅ Restored",
              "Persona restored from backup!",
              "success"
            );
          } else showModal("❌ Error", data.error, "error");
        } catch {
          showModal("❌ Error", "Failed to restore", "error");
        }
      }
    );
  };

  const updateField = (path: string, value: any) => {
    if (!persona) return;
    const keys = path.split(".");
    const newPersona = { ...persona };
    let current: any = newPersona;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setPersona(newPersona);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "🖼️";
    if (ext === "pdf") return "📄";
    return "📝";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔧 Admin Panel</h1>
            <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Back to Portfolio
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "knowledge"
                  ? "bg-blue-600"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              📚 Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab("persona")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "persona"
                  ? "bg-blue-600"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              👤 Persona
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* ============ KNOWLEDGE BASE TAB ============ */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            {/* Indexed Documents */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  📚 Indexed Documents ({indexedDocs.length})
                </h3>
                <button
                  onClick={loadIndexedDocuments}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  🔄 Refresh
                </button>
              </div>
              {loadingDocs ? (
                <p className="text-zinc-500 text-center py-4">Loading...</p>
              ) : indexedDocs.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">
                  No documents indexed
                </p>
              ) : (
                <div className="space-y-2">
                  {indexedDocs.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(doc.name)}</span>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-zinc-400">
                            {doc.chunks} chunks • {doc.createdAtFormatted}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(doc.name)}
                        className="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload */}
            <div
              className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-blue-500 cursor-pointer transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-2">📁</div>
              <p className="text-zinc-300">Click to select files</p>
              <p className="text-zinc-500 text-sm">PDF, TXT, MD, or Images</p>
            </div>

            {files.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-3">
                  Selected ({files.length})
                </h3>
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2"
                    >
                      <span>
                        {getFileIcon(file.name)} {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={uploadAllFiles}
                  disabled={isUploading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 py-3 rounded-xl font-medium transition"
                >
                  {isUploading
                    ? "Processing..."
                    : `Upload ${files.length} File(s)`}
                </button>
              </div>
            )}

            {uploadResults.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-3">Results</h3>
                {uploadResults.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-4 py-2 mb-2 ${
                      r.status === "success"
                        ? "bg-green-900/30 border border-green-700"
                        : "bg-red-900/30 border border-red-700"
                    }`}
                  >
                    {r.status === "success" ? "✅" : "❌"} {r.name} -{" "}
                    {r.message}
                  </div>
                ))}
              </div>
            )}

            <div className="border border-red-900 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                ⚠️ Danger Zone
              </h3>
              <button
                onClick={confirmClearAll}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* ============ PERSONA TAB ============ */}
        {activeTab === "persona" && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setJsonMode(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  !jsonMode ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                📝 Form
              </button>
              <button
                onClick={() => {
                  setJsonMode(true);
                  setRawJson(JSON.stringify(persona, null, 2));
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  jsonMode ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                💻 JSON
              </button>
              <button
                onClick={restoreBackup}
                className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 ml-auto transition"
              >
                🔄 Restore
              </button>
            </div>

            {loadingPersona ? (
              <p className="text-center py-8">Loading persona...</p>
            ) : jsonMode ? (
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  className="w-full h-[500px] bg-zinc-950 text-green-400 font-mono text-sm p-4 rounded-lg border border-zinc-700 focus:border-blue-500 outline-none"
                  spellCheck={false}
                />
                <button
                  onClick={saveRawJson}
                  disabled={savingPersona}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium transition"
                >
                  {savingPersona ? "Saving..." : "💾 Save JSON"}
                </button>
              </div>
            ) : (
              persona && (
                <div className="space-y-6">
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={persona.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={persona.title}
                          onChange={(e) => updateField("title", e.target.value)}
                          className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm text-zinc-400 mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={persona.tagline}
                          onChange={(e) =>
                            updateField("tagline", e.target.value)
                          }
                          className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">Contact</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="email"
                        placeholder="Email"
                        value={persona.contact?.email || ""}
                        onChange={(e) =>
                          updateField("contact.email", e.target.value)
                        }
                        className="bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={persona.contact?.phone || ""}
                        onChange={(e) =>
                          updateField("contact.phone", e.target.value)
                        }
                        className="bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="GitHub"
                        value={persona.contact?.github || ""}
                        onChange={(e) =>
                          updateField("contact.github", e.target.value)
                        }
                        className="bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn"
                        value={persona.contact?.linkedin || ""}
                        onChange={(e) =>
                          updateField("contact.linkedin", e.target.value)
                        }
                        className="bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold mb-4">Skills</h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Languages (comma-separated)"
                        value={persona.skills?.languages?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(
                            "skills.languages",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Frameworks (comma-separated)"
                        value={persona.skills?.frameworks?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(
                            "skills.frameworks",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Databases (comma-separated)"
                        value={persona.skills?.databases?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(
                            "skills.databases",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={savePersona}
                    disabled={savingPersona}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 py-4 rounded-xl font-medium text-lg transition"
                  >
                    {savingPersona ? "Saving..." : "💾 Save All Changes"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
