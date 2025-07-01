// TODO: Implement search and filtering
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (status: string) => void
}

export function SearchFilter({ onSearch, onFilter }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          onSearch(e.target.value)
        }}
        className="max-w-sm"
      />
      <Select onValueChange={onFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
