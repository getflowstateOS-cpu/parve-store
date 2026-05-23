import { redirect } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{ handle: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  await params
  redirect('/')
}
