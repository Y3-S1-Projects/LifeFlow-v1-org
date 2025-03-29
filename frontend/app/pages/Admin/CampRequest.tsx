"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Organizer {
  id: string
  name: string
  location: string
  phone: string
  status: string
}

const OrganizerTable: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([])

  useEffect(() => {
    // Dummy data
    setOrganizers([
      { id: "1", name: "Ravishan Silva", location: "Colombo", phone: "123-456-7890", status: "Pending" },
      { id: "2", name: "Kavindu Lakmal", location: "Kurunagala", phone: "987-654-3210", status: "Approved" },
      { id: "3", name: "Amal Perera", location: "Kandy", phone: "555-123-4567", status: "Rejected" },
    ])
  }, [])

  const handleApprove = (id: string) => {
    setOrganizers((prev) => prev.map((org) => (org.id === id ? { ...org, status: "Approved" } : org)))
  }

  const handleReject = (id: string) => {
    setOrganizers((prev) => prev.map((org) => (org.id === id ? { ...org, status: "Rejected" } : org)))
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Camp Request Management</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Organizer Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Camp Location</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Phone Number</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                <td className="py-3 px-4 text-gray-800">{org.name}</td>
                <td className="py-3 px-4 text-gray-800">{org.location}</td>
                <td className="py-3 px-4 text-gray-800">{org.phone}</td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={
                      org.status === "Approved" ? "default" : org.status === "Rejected" ? "destructive" : "secondary"
                    }
                  >
                    {org.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => handleApprove(org.id)}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Approve</span>
                    </Button>
                    <Button
                      onClick={() => handleReject(org.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Reject</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrganizerTable

