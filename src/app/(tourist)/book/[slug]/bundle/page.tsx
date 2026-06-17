'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function BundleRedirectPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  useEffect(() => {
    router.replace(`/book/${slug}/experience`)
  }, [slug, router])
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )
}
