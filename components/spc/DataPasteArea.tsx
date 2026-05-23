"use client";

import { useState, useCallback } from "react";
import { parseDataText } from "@/lib/spc/statistics";
import { ClipboardPaste, X } from "lucide-react";

interface DataPasteAreaProps {
  data: number[];
  onDataChange: (data: number[]) => void;
}

export default function DataPasteArea({ data, onDataChange }: DataPasteAreaProps) {
  const [rawText, setRawText] = useState("");
  const [parseError, setParseError] = useState("");

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData("text");
      setRawText(text);
      const parsed = parseDataText(text);
      if (parsed.length === 0) {
        setParseError("숫자 데이터를 찾을 수 없습니다.");
      } else {
        setParseError("");
        onDataChange(parsed);
      }
    },
    [onDataChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setRawText(text);
      if (text.trim() === "") {
        setParseError("");
        onDataChange([]);
        return;
      }
      const parsed = parseDataText(text);
      if (parsed.length === 0) {
        setParseError("숫자 데이터를 찾을 수 없습니다.");
      } else {
        setParseError("");
        onDataChange(parsed);
      }
    },
    [onDataChange]
  );

  const handleClear = () => {
    setRawText("");
    setParseError("");
    onDataChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground">
          측정 데이터 입력
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        {data.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            지우기
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={rawText}
          onChange={handleChange}
          onPaste={handlePaste}
          rows={6}
          placeholder={`엑셀에서 열 전체를 복사(Ctrl+C) 후 여기에 붙여넣기(Ctrl+V)\n\n예:\n29.98\n30.01\n30.02\n...`}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white font-mono resize-y"
        />
        {rawText === "" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <ClipboardPaste className="h-8 w-8 text-muted-foreground/30 mb-2" />
          </div>
        )}
      </div>

      {parseError && (
        <p className="text-xs text-red-500">{parseError}</p>
      )}

      {data.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <span className="font-semibold text-foreground">
            {data.length}개 데이터 인식됨
          </span>
          <span>
            미리보기:{" "}
            {data.slice(0, 5).map((v) => v.toFixed(4)).join(", ")}
            {data.length > 5 ? ` ... 외 ${data.length - 5}개` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
