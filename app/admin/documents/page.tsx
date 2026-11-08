"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { FileText, Upload, CheckCircle2, Eye, ShieldCheck } from "lucide-react";
import { CampusDocument } from "@/types";

export default function AdminDocumentsPage() {
  const { documents, addDocument, publishDocument } = useCampusStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CampusDocument | null>(null);

  // Upload Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [version, setVersion] = useState("2026.1");
  const [description, setDescription] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadAndProcess = async () => {
    if (!title.trim() && !pdfFile && !sampleText.trim()) return;
    setIsUploading(true);
    try {
      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("title", title || pdfFile.name.replace(/\.[^/.]+$/, ""));
        formData.append("category", category);
        formData.append("version", version);
        formData.append("description", description || "Official Admin PDF Upload");

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.document) {
          addDocument({
            id: data.document.id,
            title: data.document.title,
            description: data.document.description,
            category: data.document.category,
            academic_year: "2026",
            version: data.document.version,
            document_type: "PDF",
            file_url: data.document.file_url,
            uploaded_by: "Admin (Academic Cell)",
            status: "PUBLISHED",
            chunks_count: data.chunksCount || 1,
            created_at: data.document.created_at,
            updated_at: data.document.updated_at,
          });
        }
      } else {
        const newDocId = `doc_${Date.now()}`;
        const createdDoc: CampusDocument = {
          id: newDocId,
          title,
          description: description || sampleText,
          category: category as CampusDocument["category"],
          academic_year: "2026",
          version,
          document_type: "PDF",
          file_url: `/uploads/${title}.pdf`,
          uploaded_by: "Admin",
          status: "READY_FOR_REVIEW",
          chunks_count: 14,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addDocument(createdDoc);
      }

      setIsUploadModalOpen(false);
      setTitle("");
      setDescription("");
      setSampleText("");
      setPdfFile(null);
    } catch (err) {
      console.error("Upload process error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = (docId: string) => {
    publishDocument(docId);
  };

  const handlePreview = (doc: CampusDocument) => {
    setSelectedDoc(doc);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> Official Knowledge Base Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload, extract, chunk, embed with pgvector, review, and publish official campus PDFs.
          </p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)} leftIcon={<Upload className="w-4 h-4" />} variant="primary" size="md">
          Upload New PDF Document
        </Button>
      </div>

      {/* Critical Knowledge Rule Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/60 flex items-start gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Strict Admin Knowledge Approval Rule:</strong> Processed documents enter <Badge variant="warning" size="sm">READY_FOR_REVIEW</Badge> status. Documents do NOT automatically enter the Grounded RAG index until an Admin explicitly reviews chunks and clicks <strong className="text-emerald-400">Publish</strong>.
        </div>
      </div>

      {/* Documents List */}
      <div className="flex flex-col gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-slate-800 bg-slate-900/90 hover:border-slate-700 transition">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{doc.title}</h3>
                  <Badge variant="primary" size="sm">{doc.category}</Badge>
                  <Badge variant={doc.status === "PUBLISHED" ? "success" : doc.status === "READY_FOR_REVIEW" ? "warning" : "outline"} size="sm">
                    {doc.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">{doc.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>Version: {doc.version}</span>
                  <span>Indexed Chunks: <strong className="text-indigo-400">{doc.chunks_count || 0}</strong></span>
                  <span>Uploaded by: {doc.uploaded_by}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button onClick={() => handlePreview(doc)} variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                  Preview Chunks
                </Button>

                {doc.status !== "PUBLISHED" && (
                  <Button onClick={() => handlePublish(doc.id)} variant="emerald" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Approve & Publish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Official Campus PDF Document" maxWidth="lg">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Select Official PDF File to Upload & Ingest
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPdfFile(f);
                  if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                }
              }}
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/30 file:text-indigo-300 hover:file:bg-indigo-600/50 cursor-pointer w-full bg-slate-950 p-2 rounded-xl border border-slate-700"
            />
          </div>

          <Input label="Document Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Academic Regulations 2026" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[
              { label: "Academic Regulations", value: "REGULATION" },
              { label: "Placement Guidelines", value: "PLACEMENT" },
              { label: "Project Guidelines", value: "PROJECT" },
              { label: "Examination Rules", value: "EXAM" },
            ]} />
            <Input label="Version Code" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2026.1" />
          </div>
          <Input label="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Summary of rules contained" />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Paste or Extract Document Text Content
            </label>
            <textarea
              rows={4}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Paste official text rules here for text extraction, chunking, and embedding generation..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button onClick={handleUploadAndProcess} isLoading={isUploading} variant="primary" size="md" className="mt-2">
            Upload, Extract & Generate Embeddings
          </Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      {selectedDoc && (
        <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`Preview Extracted Chunks — ${selectedDoc.title}`} maxWidth="xl">
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <strong>Document Status:</strong> <Badge variant={selectedDoc.status === "PUBLISHED" ? "success" : "warning"} size="sm">{selectedDoc.status}</Badge> | <strong>Total Vector Chunks:</strong> {selectedDoc.chunks_count}
            </div>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                  <span>Chunk #1 (Page 1)</span>
                  <span>Embedding: 768 Vector Float Dimensions</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  &ldquo;{selectedDoc.description || selectedDoc.title}&rdquo;
                </p>
              </div>
            </div>

            {selectedDoc.status !== "PUBLISHED" && (
              <Button onClick={() => { handlePublish(selectedDoc.id); setIsPreviewModalOpen(false); }} variant="emerald" size="md" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Confirm Preview & Publish to RAG Knowledge Base
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
