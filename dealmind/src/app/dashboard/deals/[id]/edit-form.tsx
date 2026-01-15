'use client'

import { useState } from 'react'
import { updateDeal } from './actions'

interface EditableFieldProps {
  label: string
  value: string | number | null | undefined
  dealId: string
  field: string
  type?: 'text' | 'number' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  format?: (value: any) => string
  multiline?: boolean
}

export default function EditableField({
  label,
  value,
  dealId,
  field,
  type = 'text',
  options,
  format = (v) => v,
  multiline = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateDeal(dealId, field, editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && type !== 'textarea') {
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        {multiline || type === 'textarea' ? (
          <textarea
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            autoFocus
          />
        ) : type === 'select' && options ? (
          <select
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="group cursor-pointer space-y-1 rounded-lg p-2 hover:bg-gray-50 transition-colors"
    >
      <label className="text-sm font-medium text-gray-500 group-hover:text-gray-600">
        {label}
      </label>
      <p className="text-gray-900">
        {value !== null && value !== undefined ? format(value) : '-'}
      </p>
      <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Clique para editar
      </p>
    </div>
  )
}
