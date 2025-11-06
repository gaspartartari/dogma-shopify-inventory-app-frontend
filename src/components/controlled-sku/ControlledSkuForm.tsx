import { useState, useEffect, type FormEvent } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import type { ControlledSku } from '../../models/controlled-sku'

type ControlledSkuFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ControlledSku) => Promise<void>
  initialData?: ControlledSku | null
  mode: 'create' | 'edit'
}

export default function ControlledSkuForm({ isOpen, onClose, onSubmit, initialData, mode }: ControlledSkuFormProps) {
  const [formData, setFormData] = useState<ControlledSku>({ sku: '', name: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ sku?: string; name?: string }>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({ sku: '', name: '' })
    }
    setErrors({})
  }, [initialData, isOpen])

  const validate = (): boolean => {
    const newErrors: { sku?: string; name?: string } = {}
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório'
    } else if (formData.sku.length > 100) {
      newErrors.sku = 'SKU deve ter no máximo 100 caracteres'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length > 255) {
      newErrors.name = 'Nome deve ter no máximo 255 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-lg shadow-xl max-w-md w-full border border-border-default">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">
            {mode === 'create' ? 'Adicionar SKU Controlado' : 'Editar SKU Controlado'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* SKU Field */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-text-primary mb-2">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={mode === 'edit' || isSubmitting}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ex: 6600_41368920588421"
              maxLength={100}
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-status-error">{errors.sku}</p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus text-text-primary disabled:opacity-50"
              placeholder="Ex: BOURBON VANILLA EUDER"
              maxLength={255}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-status-error">{errors.name}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-bg-brand hover:bg-bg-brand-hover text-text-inverse rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Adicionar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

