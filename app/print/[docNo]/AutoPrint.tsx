"use client"

import { useEffect } from "react"

// 페이지 로드 후 500ms 뒤 자동으로 인쇄 다이얼로그 열기
export function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])
  return null
}
