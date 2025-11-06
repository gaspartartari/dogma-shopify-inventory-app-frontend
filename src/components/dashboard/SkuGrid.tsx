import { useMemo, useState, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faSearch, faFileExport } from "@fortawesome/free-solid-svg-icons"
import type { SkuSummary } from '../../models/sku'
import { toast } from 'react-toastify'

const myTheme = themeQuartz.withParams({
  accentColor: '#a1a1aa',
  backgroundColor: '#0a0a0a',
  borderColor: '#27272a',
  browserColorScheme: 'dark',
  foregroundColor: '#e4e4e7',
  headerBackgroundColor: '#1a1a1a',
});

type SkuGridProps = {
  skus: SkuSummary[]
  isLoading: boolean
  isError: boolean
  onRefresh: () => void
}

export default function SkuGrid({ skus, isLoading, isError, onRefresh }: SkuGridProps) {
  const [searchText, setSearchText] = useState('');
  const gridRef = useRef<AgGridReact<SkuSummary>>(null);

  // Filter SKU data based on search text
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return skus;
    
    const searchLower = searchText.toLowerCase();
    return skus.filter(sku => 
      sku.sku.toLowerCase().includes(searchLower) ||
      sku.skuName?.toLowerCase().includes(searchLower)
    );
  }, [skus, searchText]);

  const columnDefs = useMemo<ColDef<SkuSummary>[]>(
    () => [
      { 
        headerName: 'SKU', 
        field: 'sku',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      { 
        headerName: 'Nome do Produto', 
        field: 'skuName',
        width: 350,
        filter: 'agTextColumnFilter',
      },
      { 
        headerName: 'Quantidade Total', 
        field: 'totalQuantity',
        width: 180,
        filter: 'agNumberColumnFilter',
        cellStyle: () => ({ fontWeight: 'bold', color: '#22c55e' })
      },
      { 
        headerName: 'Total de Pedidos', 
        field: 'orderCount',
        width: 180,
        filter: 'agNumberColumnFilter',
        cellStyle: () => ({ fontWeight: 'bold' })
      },
      {
        headerName: 'Receita',
        field: 'skuOrderRevenue',
        width: 180,
        filter: 'agNumberColumnFilter',
        cellStyle: () => ({ fontWeight: 'bold' }),
        cellRenderer: (data: { data: SkuSummary }) => {
          return "R$" + Number(data.data.skuOrderRevenue).toFixed(2);
        } 
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<SkuSummary>>(
    () => ({ 
      flex: 1, 
      minWidth: 100, 
      resizable: true,
      sortable: true,
      filter: true
    }),
    []
  );

  const handleExportCSV = useCallback(() => {
    if (gridRef.current) {
      const params = {
        fileName: `skus_${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['sku', 'skuName', 'totalQuantity', 'orderCount'],
        processCellCallback: (params: { value: unknown }): string => {
          return String(params.value ?? '');
        },
        processHeaderCallback: (params: { column: { getColId: () => string; getColDef: () => { headerName?: string } } }): string => {
          const headerMap: Record<string, string> = {
            sku: 'SKU',
            skuName: 'Nome do Produto',
            totalQuantity: 'Quantidade Total',
            orderCount: 'Total de Pedidos'
          };
          return headerMap[params.column.getColId()] || params.column.getColDef().headerName || '';
        }
      };
      gridRef.current.api.exportDataAsCsv(params);
      toast.success('SKUs exportados com sucesso!');
    }
  }, []);

  return (
    <div className="bg-bg-primary rounded-lg shadow-sm border border-border-default p-6 mt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          SKUs Reservados
        </h2>
        
        {/* Search and Action Buttons */}
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
              className="w-full pl-10 pr-4 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent text-text-primary"
            />
          </div>
          
          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={isLoading || filteredData.length === 0}
            className="px-4 py-2 bg-status-success hover:bg-status-success-hover text-text-inverse rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faFileExport} />
            Exportar CSV
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
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
              onClick={onRefresh}
              className="px-4 py-2 bg-bg-brand hover:bg-bg-brand-hover text-text-inverse rounded-md transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 600 }}>
          <AgGridReact<SkuSummary>
            ref={gridRef}
            theme={myTheme}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
          />
        </div>
      )}
    </div>
  )
}


