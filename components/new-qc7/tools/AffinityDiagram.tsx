"use client";

import { useState } from "react";
import { Plus, Trash2, Download, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { exportAffinity } from "@/lib/qc7/excelExporter";
import ToolShell from "../ToolShell";

const GROUP_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-orange-50 border-orange-200",
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-yellow-50 border-yellow-200",
];
const GROUP_HEADER_COLORS = ["bg-blue-200", "bg-orange-200", "bg-green-200", "bg-purple-200", "bg-yellow-200"];

interface Card {
  id: string;
  text: string;
}
interface Group {
  id: string;
  name: string;
  cards: Card[];
}

let cardSeq = 1;
let groupSeq = 1;

function mkCard(text = ""): Card {
  return { id: `card-${cardSeq++}`, text };
}
function mkGroup(name = ""): Group {
  return { id: `group-${groupSeq++}`, name, cards: [] };
}

function DraggableCard({ card, groupId }: { card: Card; groupId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { groupId },
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-2 text-sm shadow-sm cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="flex-1">{card.text || <span className="text-muted-foreground italic">빈 카드</span>}</span>
    </div>
  );
}

function DroppableGroup({
  group,
  colorIdx,
  onRename,
  onDelete,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: {
  group: Group;
  colorIdx: number;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddCard: (groupId: string) => void;
  onEditCard: (groupId: string, cardId: string, text: string) => void;
  onDeleteCard: (groupId: string, cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });
  return (
    <div
      ref={setNodeRef}
      className={`border rounded-xl p-3 min-h-32 transition-all ${GROUP_COLORS[colorIdx % GROUP_COLORS.length]} ${isOver ? "ring-2 ring-brand-orange" : ""}`}
    >
      <div className={`flex items-center gap-2 rounded-lg px-2 py-1 mb-2 ${GROUP_HEADER_COLORS[colorIdx % GROUP_HEADER_COLORS.length]}`}>
        <input
          className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
          value={group.name}
          onChange={(e) => onRename(group.id, e.target.value)}
          placeholder="그룹명"
        />
        <button onClick={() => onDelete(group.id)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {group.cards.map((card) => (
          <div key={card.id} className="flex items-start gap-1">
            <DraggableCard card={card} groupId={group.id} />
            <button
              onClick={() => onDeleteCard(group.id, card.id)}
              className="text-muted-foreground hover:text-destructive mt-2"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {group.cards.map((card) => null)}
      </div>
      <button
        onClick={() => onAddCard(group.id)}
        className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Plus className="h-3 w-3" /> 카드 추가
      </button>
    </div>
  );
}

export default function AffinityDiagram() {
  const [groups, setGroups] = useState<Group[]>([
    { id: `group-${groupSeq++}`, name: "작업 환경", cards: [mkCard("조명 불충분"), mkCard("소음 심각")] },
    { id: `group-${groupSeq++}`, name: "의사소통", cards: [mkCard("인수인계 미흡"), mkCard("업무 지시 불명확")] },
    { id: `group-${groupSeq++}`, name: "미분류", cards: [mkCard("기타 의견")] },
  ]);
  const [downloading, setDownloading] = useState(false);

  const addGroup = () =>
    setGroups((prev) => [...prev, mkGroup(`그룹 ${prev.length + 1}`)]);

  const renameGroup = (id: string, name: string) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));

  const deleteGroup = (id: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== id));

  const addCard = (groupId: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, cards: [...g.cards, mkCard()] } : g))
    );

  const editCard = (groupId: string, cardId: string, text: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, cards: g.cards.map((c) => (c.id === cardId ? { ...c, text } : c)) }
          : g
      )
    );

  const deleteCard = (groupId: string, cardId: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, cards: g.cards.filter((c) => c.id !== cardId) } : g
      )
    );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const fromGroupId = (active.data.current as { groupId: string }).groupId;
    const toGroupId = over.id as string;
    if (fromGroupId === toGroupId) return;

    setGroups((prev) => {
      const fromGroup = prev.find((g) => g.id === fromGroupId);
      const card = fromGroup?.cards.find((c) => c.id === active.id);
      if (!card) return prev;
      return prev.map((g) => {
        if (g.id === fromGroupId) return { ...g, cards: g.cards.filter((c) => c.id !== card.id) };
        if (g.id === toGroupId) return { ...g, cards: [...g.cards, card] };
        return g;
      });
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportAffinity(groups.map((g) => ({ name: g.name, cards: g.cards.map((c) => c.text) })));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="친화도 (Affinity Diagram)"
      badge="신 QC 7가지 도구 ①"
      description="아이디어·의견·사실을 카드에 적고 유사한 것끼리 그룹화합니다. 카드를 드래그해서 그룹 간에 이동할 수 있습니다."
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
        <div className="space-y-4">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((group, gi) => (
                <DroppableGroup
                  key={group.id}
                  group={group}
                  colorIdx={gi}
                  onRename={renameGroup}
                  onDelete={deleteGroup}
                  onAddCard={addCard}
                  onEditCard={editCard}
                  onDeleteCard={deleteCard}
                />
              ))}
            </div>
          </DndContext>
          <button
            onClick={addGroup}
            className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all"
          >
            <Plus className="h-4 w-4" /> 그룹 추가
          </button>
          <p className="text-xs text-muted-foreground">카드를 드래그해서 다른 그룹으로 이동할 수 있습니다.</p>
        </div>
      }
    />
  );
}
