import { cn } from '@/utils/cn'
import React from 'react'

export default function Container({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('bg-[#232529] border rounded-xl flex py-4 shadow-sm', className)}>
      {children}
    </div>
  )
}