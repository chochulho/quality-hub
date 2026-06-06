'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Loader2, Building2 } from 'lucide-react'
import { uploadLogo, removeLogo } from '@/app/(workspace)/settings/actions'

interface Props {
  currentLogoUrl: string | null
  orgName: string | null
}

export default function LogoUploader({ currentLogoUrl, orgName }: Props) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('파일 크기는 2MB 이하여야 합니다.')
      return
    }
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('logo', file)

    startTransition(async () => {
      const result = await uploadLogo(formData)
      if (result.error) {
        setError(result.error)
        setPreview(currentLogoUrl)
      } else if (result.logoUrl) {
        setPreview(result.logoUrl)
      }
    })
  }

  function handleRemove() {
    setError('')
    startTransition(async () => {
      const result = await removeLogo()
      if (result.error) setError(result.error)
      else {
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* 미리보기 */}
      <div className="flex items-center gap-5">
        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40 overflow-hidden shrink-0">
          {preview ? (
            <Image
              src={preview}
              alt={orgName ?? '로고'}
              width={96}
              height={96}
              className="w-full h-full object-contain p-2"
              unoptimized
            />
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground/40" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {orgName ?? '조직'} 로고
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, SVG · 최대 2MB · 권장 크기 200×60px
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-orange text-white rounded-full px-4 py-2 hover:bg-brand-orange-hover transition-all disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {preview ? '변경' : '업로드'}
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium border border-border rounded-full px-4 py-2 text-muted-foreground hover:text-destructive hover:border-red-300 transition-colors disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
