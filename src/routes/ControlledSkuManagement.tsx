import { useState, useMemo, useRef, useContext } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faSearch, faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as authService from '../services/auth-service'
import { ContextToken } from '../utils/context-token'
import type { ControlledSku } from '../models/controlled-sku'
import { getAllControlledSkus, createControlledSku, updateControlledSku, deleteControlledSku } from '../services/controlled-sku-service'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import ControlledSkuForm from '../components/controlled-sku/ControlledSkuForm'

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
  accentColor: '#a1a1aa',
  backgroundColor: '#0a0a0a',
  borderColor: '#27272a',
  browserColorScheme: 'dark',
  foregroundColor: '#e4e4e7',
  headerBackgroundColor: '#1a1a1a',
});

export default function ControlledSkuManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { contextTokenPayload, setContextTokenPayload } = useContext(ContextToken);
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSku, setSelectedSku] = useState<ControlledSku | null>(null);
  const [deleteConfirmSku, setDeleteConfirmSku] = useState<ControlledSku | null>(null);
  const gridRef = useRef<AgGridReact<ControlledSku>>(null);

  // Fetch all controlled SKUs
  const { data: skus = [], isLoading, isError, refetch } = useQuery<ControlledSku[], Error>({
    queryKey: ['controlledSkus'],
    queryFn: getAllControlledSkus,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createControlledSku,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlledSkus'] });
      toast.success('SKU adicionado com sucesso!');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao adicionar SKU';
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: ControlledSku }) => 
      updateControlledSku(sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlledSkus'] });
      toast.success('SKU atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar SKU';
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteControlledSku,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlledSkus'] });
      toast.success('SKU removido com sucesso!');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover SKU';
      toast.error(message);
    },
  });

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return skus;
    
    const searchLower = searchText.toLowerCase();
    return skus.filter(sku => 
      sku.sku.toLowerCase().includes(searchLower) ||
      sku.name?.toLowerCase().includes(searchLower)
    );
  }, [skus, searchText]);

  // Handlers
  const handleLogout = () => {
    authService.logout();
    setContextTokenPayload(undefined);
    navigate('/login');
  }

  const handleAdd = () => {
    setSelectedSku(null);
    setFormMode('create');
    setIsFormOpen(true);
  }

  const handleEdit = (sku: ControlledSku) => {
    setSelectedSku(sku);
    setFormMode('edit');
    setIsFormOpen(true);
  }

  const handleDelete = (sku: ControlledSku) => {
    setDeleteConfirmSku(sku);
  }

  const confirmDelete = async () => {
    if (deleteConfirmSku) {
      await deleteMutation.mutateAsync(deleteConfirmSku.sku);
      setDeleteConfirmSku(null);
    }
  }

  const handleFormSubmit = async (data: ControlledSku) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (selectedSku) {
      await updateMutation.mutateAsync({ sku: selectedSku.sku, data });
    }
  }

  // Column definitions with action buttons
  const columnDefs = useMemo<ColDef<ControlledSku>[]>(
    () => [
      { 
        headerName: 'SKU', 
        field: 'sku',
        width: 250,
        filter: 'agTextColumnFilter',
        cellStyle: { fontWeight: '500' }
      },
      { 
        headerName: 'Nome do Produto', 
        field: 'name',
        flex: 1,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Ações',
        width: 150,
        cellRenderer: (props: { data: ControlledSku }) => {
          const sku = props.data;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                onClick={() => handleEdit(sku)}
                className="px-3 py-1 text-sm bg-bg-brand hover:bg-bg-brand-hover text-text-inverse rounded transition-colors"
                title="Editar"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                onClick={() => handleDelete(sku)}
                className="px-3 py-1 text-sm bg-status-error hover:bg-red-600 text-text-inverse rounded transition-colors"
                title="Remover"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          );
        }
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<ControlledSku>>(
    () => ({ 
      resizable: true,
      sortable: true,
      filter: true
    }),
    []
  );

  return (
    <div className="min-h-screen bg-bg-secondary">
      <DashboardHeader
        username={contextTokenPayload?.username}
        onLogout={handleLogout}
      />

      <main className="p-6">
        <div className="bg-bg-primary rounded-lg shadow-sm border border-border-default p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                SKUs Controlados
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie os SKUs que serão monitorados no sistema
              </p>
            </div>
            
            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:flex-initial md:min-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-text-tertiary" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por SKU ou nome..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent text-text-primary bg-bg-secondary"
                />
              </div>
              
              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-status-success hover:bg-green-600 text-text-inverse rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Adicionar SKU
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-4 py-2 bg-bg-brand hover:bg-bg-brand-hover text-text-inverse rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Atualizar'
                )}
              </button>
            </div>
          </div>
          
          {/* Results counter */}
          {searchText && (
            <div className="mb-3 text-sm text-text-secondary">
              {filteredData.length} {filteredData.length === 1 ? 'SKU encontrado' : 'SKUs encontrados'}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 text-4xl" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-status-error text-lg mb-4">Erro ao carregar SKUs</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-bg-brand hover:bg-bg-brand-hover text-text-inverse rounded-md transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: 600 }}>
              <AgGridReact<ControlledSku>
                ref={gridRef}
                theme={myTheme}
                rowData={filteredData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
              />
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      <ControlledSkuForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSku}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmSku && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-primary rounded-lg shadow-xl max-w-md w-full border border-border-default p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Confirmar Remoção
            </h3>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja remover o SKU <strong className="text-text-primary">{deleteConfirmSku.sku}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmSku(null)}
                className="px-4 py-2 border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-status-error hover:bg-red-600 text-text-inverse rounded-md transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

