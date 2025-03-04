import React from 'react'

export default function DemoPage() {
  return (
    <div className="flex items-center justify-center h-screen text-xl font-bold">
      {/* Mobile screen (max-width: 768px) */}
      <div className="block md:hidden">This is Mobile screen</div>

      {/* Computer screen (min-width: 769px) */}
      <div className="hidden md:block">This is Computer screen</div>
    </div>
  )
}
