"use client";

import { useState } from "react";
import { Plus, Trash2, Download, ChevronRight } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportTree } from "@/lib/qc7/excelExporter";

interface TreeNode {
  id: string;
  text: string;
  children: TreeNode[];
}

let nodeSeq = 1;
const mkNode = (text = ""): TreeNode => ({ id: `n${nodeSeq++}`, text, children: [] });

function NodeEditor({
  node,
  depth,
  onUpdate,
  onAddChild,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  onUpdate: (id: string, text: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-navy"
          value={node.text}
          onChange={(e) => onUpdate(node.id, e.target.value)}
          placeholder={depth === 0 ? "목표" : depth === 1 ? "1차 수단" : "세부 수단"}
        />
        {depth < 3 && (
          <button
            onClick={() => onAddChild(node.id)}
            className="text-xs text-brand-orange hover:text-brand-orange-hover flex items-center gap-0.5 shrink-0"
          >
            <Plus className="h-3 w-3" /> 하위
          </button>
        )}
        {depth > 0 && (
          <button onClick={() => onDelete(node.id)} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {node.children.map((child) => (
        <NodeEditor
          key={child.id}
          node={child}
          depth={depth + 1}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function updateNode(node: TreeNode, id: string, text: string): TreeNode {
  if (node.id === id) return { ...node, text };
  return { ...node, children: node.children.map((c) => updateNode(c, id, text)) };
}

function addChild(node: TreeNode, parentId: string): TreeNode {
  if (node.id === parentId) return { ...node, children: [...node.children, mkNode()] };
  return { ...node, children: node.children.map((c) => addChild(c, parentId)) };
}

function deleteNode(node: TreeNode, id: string): TreeNode {
  return { ...node, children: node.children.filter((c) => c.id !== id).map((c) => deleteNode(c, id)) };
}

export default function TreeDiagram() {
  const [root, setRoot] = useState<TreeNode>({
    id: `n${nodeSeq++}`,
    text: "불량률 감소",
    children: [
      {
        id: `n${nodeSeq++}`,
        text: "원자재 품질 관리",
        children: [mkNode("공급업체 심사"), mkNode("수입검사 강화")],
      },
      {
        id: `n${nodeSeq++}`,
        text: "공정 개선",
        children: [mkNode("설비 정기 점검"), mkNode("작업 표준화")],
      },
    ],
  });
  const [downloading, setDownloading] = useState(false);

  const handleUpdate = (id: string, text: string) => setRoot((r) => updateNode(r, id, text));
  const handleAddChild = (parentId: string) => setRoot((r) => addChild(r, parentId));
  const handleDelete = (id: string) => setRoot((r) => deleteNode(r, id));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportTree(root);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="계통도 (Tree Diagram)"
      badge="신 QC 7가지 도구 ③"
      description="목표를 달성하기 위한 수단을 계층적으로 전개합니다. 목표→1차 수단→세부 수단 순으로 최대 4단계까지 입력합니다."
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="border border-border rounded-2xl p-5 space-y-1">
          <NodeEditor
            node={root}
            depth={0}
            onUpdate={handleUpdate}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
          />
        </div>
      }
    />
  );
}
