"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileAudio, File as FileIcon, X, Upload, FileType } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "../types";

interface DocumentUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = {
  "application/pdf": { icon: FileText, label: "PDF" },
  "application/msword": { icon: FileType, label: "Word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileType, label: "Word" },
  "image/*": { icon: FileImage, label: "图片" },
  "audio/*": { icon: FileAudio, label: "音频" },
};

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return FileText;
  if (type.includes("word") || type.includes("document")) return FileType;
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("audio/")) return FileAudio;
  return FileIcon;
}

export function DocumentUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `文件大小超过 ${maxSizeMB}MB 限制`;
    }
    return null;
  };

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      alert(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    const filesToProcess = Array.from(newFiles).slice(0, remainingSlots);
    const newUploadedFiles: UploadedFile[] = [];

    for (const file of filesToProcess) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      // 读取文本文件内容
      let content = '';
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        try {
          content = await file.text();
        } catch {
          content = '';
        }
      }

      newUploadedFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        content: content.slice(0, 10000), // 限制内容长度
      });
    }

    onFilesChange([...files, ...newUploadedFiles]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
    e.target.value = ""; // Reset input
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const canAddMore = files.length < maxFiles;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>参考文档</CardTitle>
        </div>
        <CardDescription>
          上传相关文档帮助AI更好地理解你的目标（可选）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 拖放区域 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => canAddMore && inputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50",
            !canAddMore && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
            disabled={!canAddMore}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <span className="font-medium text-primary">点击上传</span>
              <span className="text-muted-foreground"> 或拖放文件到这里</span>
            </div>
            <p className="text-xs text-muted-foreground">
              支持 PDF、Word、图片、音频，最多 {maxFiles} 个文件，单个不超过 {maxSizeMB}MB
            </p>
          </div>
        </div>

        {/* 文件类型标签 */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(ALLOWED_TYPES).map(([type, { icon: Icon, label }]) => (
            <div
              key={type}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
            >
              <Icon className="h-3 w-3" />
              {label}
            </div>
          ))}
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">已上传文件 ({files.length}/{maxFiles})</p>
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeFile(file.id)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
