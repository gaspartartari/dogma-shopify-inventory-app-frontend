import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faSearch, faFileExport } from "@fortawesome/free-solid-svg-icons"
import type { OrderWithDetails } from '../../models/order'
import { toast } from 'react-toastify'

const myTheme = themeQuartz.withParams({
  accentColor: '#a1a1aa',
  backgroundColor: '#0a0a0a',
  borderColor: '#27272a',
  browserColorScheme: 'dark',
  foregroundColor: '#e4e4e7',
  headerBackgroundColor: '#1a1a1a',
});

type DetailRow = { isDetail: true; parentId: number; order: OrderWithDetails };
type GridRow = OrderWithDetails | DetailRow;

type OrdersGridProps = {
  orders: OrderWithDetails[]
  isLoading: boolean
  isError: boolean
  onRefresh: () => void
  onFilteredDataChange?: (filteredData: OrderWithDetails[], searchText: string) => void
}

export default function OrdersGrid({ orders, isLoading, isError, onRefresh, onFilteredDataChange }: OrdersGridProps) {
  const [searchText, setSearchText] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [gridData, setGridData] = useState<GridRow[]>([]);
  const gridRef = useRef<AgGridReact<GridRow>>(null);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return orders;
    
    const searchLower = searchText.toLowerCase();
    return orders.filter(order => 
      order.orderId.toString().includes(searchLower) ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower) ||
      order.subscriptionId?.toLowerCase().includes(searchLower)
    );
  }, [orders, searchText]);

  // Notify parent of filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData, searchText);
    }
  }, [filteredData, searchText, onFilteredDataChange]);

  useEffect(() => {
    // Create grid data with detail rows intercalated
    const newData: GridRow[] = [];
    filteredData.forEach(order => {
      newData.push(order);
      if (expandedRows.has(order.orderId)) {
        newData.push({ isDetail: true, parentId: order.orderId, order });
      }
    });
    setGridData(newData);
  }, [filteredData, expandedRows]);

  const toggleRowExpansion = useCallback((orderId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const columnDefs = useMemo<ColDef<GridRow>[]>(
    () => [
      { 
        headerName: 'ID Pedido', 
        field: 'orderId',
        width: 120,
        cellRenderer: (props: { data: GridRow }) => {
          if ('isDetail' in props.data) return null;
          const order = props.data as OrderWithDetails;
          const isExpanded = expandedRows.has(order.orderId);
          return (
            <button
              onClick={() => toggleRowExpansion(order.orderId)}
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              {isExpanded ? '▼' : '▶'} {order.orderId}
            </button>
          );
        }
      },
      { 
        headerName: 'Número Pedido', 
        field: 'orderNumber',
        width: 150
      },
      { 
        headerName: 'Recorrência', 
        field: 'numberRecurrence',
        width: 120
      },
      { 
        headerName: 'Cliente', 
        field: 'customerName',
        width: 200
      },
      { 
        headerName: 'Email', 
        field: 'customerEmail',
        width: 220
      },
      { 
        headerName: 'Assinatura', 
        field: 'subscriptionId',
        width: 180
      },
      { 
        headerName: 'Status Assinatura', 
        field: 'subscriptionStatus',
        width: 180,
        cellStyle: (params) => {
          if (params.value === 'ATIVO') {
            return { color: '#22c55e', fontWeight: 'bold' };
          }
          return null;
        }
      },
      { 
        headerName: 'Última Atualização', 
        field: 'updatedDate',
        width: 180
      },
      {
        headerName: 'Próxima Cobrança',
        field: 'subscriptionNextBillingDate',
        width: 180
      },
      {
        headerName: 'Data Prevista Pagamento',
        field: 'paymentDate',
        width: 200,
        cellRenderer: (props: { data: GridRow }) => {
          if ('isDetail' in props.data) return null;
          const order = props.data as OrderWithDetails;
          if (order.paymentDate) {
            return <span className="text-status-success">{order.paymentDate}</span>;
          }
          // Show expected date from subscription if unpaid
          return (
            <span className="text-status-warning">
              {order.subscriptionNextBillingDate ? `Pendente (${order.subscriptionNextBillingDate})` : 'Pendente'}
            </span>
          );
        }
      },
    ],
    [expandedRows, toggleRowExpansion]
  );

  const defaultColDef = useMemo<ColDef<GridRow>>(
    () => ({ 
      flex: 1, 
      minWidth: 100, 
      resizable: true,
      sortable: true,
      filter: true
    }),
    []
  );

  const isFullWidthRow = useCallback((params: { rowNode: { data: unknown } }) => {
    return !!(params.rowNode.data as { isDetail?: boolean })?.isDetail;
  }, []);

  const fullWidthCellRenderer = useCallback((props: { data: { order: OrderWithDetails; parentId: number } }) => {
    const order = props.data.order;
    
    return (
      <div className="bg-bg-tertiary p-6 border-t border-b border-border-default w-full">
        <div className="max-w-full">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Produtos do Pedido #{order.orderId}
          </h3>
          
          {order.products && order.products.length > 0 ? (
            <div className="bg-bg-primary rounded-md overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border-default">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Nome do Produto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, idx) => (
                    <tr key={product.productId} className={idx % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-tertiary'}>
                      <td className="px-6 py-3 text-sm text-text-primary">{product.sku}</td>
                      <td className="px-6 py-3 text-sm text-text-primary">{product.skuName}</td>
                      <td className="px-6 py-3 text-sm text-text-primary font-semibold">{product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-sm italic">Nenhum produto neste pedido</p>
          )}
        </div>
      </div>
    );
  }, []);

  const getRowHeight = useCallback((params: { node: { data?: GridRow } }) => {
    if (!params.node.data) return 42;
    if ('isDetail' in params.node.data && params.node.data.isDetail) {
      const order = params.node.data.order;
      const baseHeight = 120;
      const rowHeight = 45;
      const productsHeight = order.products ? order.products.length * rowHeight : 0;
      return baseHeight + productsHeight;
    }
    return 42;
  }, []);

  const getRowId = useCallback((params: { data: GridRow }) => {
    if ('isDetail' in params.data && params.data.isDetail) {
      return `detail-${params.data.parentId}`;
    }
    const order = params.data as OrderWithDetails;
    return String(order.orderId);
  }, []);

  const postSortRows = useCallback((params: { nodes: Array<{ data?: GridRow }> }) => {
    // After sorting, re-intercalate detail rows with their parent rows
    const sortedNodes = params.nodes;
    const parentNodes: Array<{ data?: GridRow }> = [];
    const detailNodesMap = new Map<number, { data?: GridRow }>();

    // Separate parent nodes from detail nodes
    sortedNodes.forEach(node => {
      if (node.data) {
        if ('isDetail' in node.data && node.data.isDetail) {
          detailNodesMap.set(node.data.parentId, node);
        } else {
          parentNodes.push(node);
        }
      }
    });

    // Re-insert detail nodes after their parents
    const reorderedNodes: Array<{ data?: GridRow }> = [];
    parentNodes.forEach(parentNode => {
      reorderedNodes.push(parentNode);
      if (parentNode.data && !('isDetail' in parentNode.data)) {
        const order = parentNode.data as OrderWithDetails;
        const detailNode = detailNodesMap.get(order.orderId);
        if (detailNode) {
          reorderedNodes.push(detailNode);
        }
      }
    });

    // Update the nodes array in place
    sortedNodes.length = 0;
    reorderedNodes.forEach(node => sortedNodes.push(node));
  }, []);

  const handleExportCSV = useCallback(() => {
    if (gridRef.current) {
      const params = {
        fileName: `pedidos_${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['orderId', 'orderNumber', 'numberRecurrence', 'customerName', 'customerEmail', 'subscriptionId', 'subscriptionStatus', 'updatedDate'],
        processCellCallback: (params: { value: unknown }): string => {
          return String(params.value ?? '');
        },
        processHeaderCallback: (params: { column: { getColId: () => string; getColDef: () => { headerName?: string } } }): string => {
          const headerMap: Record<string, string> = {
            orderId: 'ID Pedido',
            orderNumber: 'Número Pedido',
            numberRecurrence: 'Recorrência',
            customerName: 'Cliente',
            customerEmail: 'Email',
            subscriptionId: 'Assinatura',
            subscriptionStatus: 'Status',
            updatedDate: 'Última Atualização'
          };
          return headerMap[params.column.getColId()] || params.column.getColDef().headerName || '';
        }
      };
      gridRef.current.api.exportDataAsCsv(params);
      toast.success('Pedidos exportados com sucesso!');
    }
  }, []);

  return (
    <div className="bg-bg-primary rounded-lg shadow-sm border border-border-default p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Pedidos com Estoque Reservado
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
              placeholder="Buscar por ID, número, cliente, email..."
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
          {filteredData.length} {filteredData.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 text-4xl" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-status-error text-lg mb-4">Erro ao carregar pedidos</p>
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
          <AgGridReact<GridRow>
            ref={gridRef}
            theme={myTheme}
            rowData={gridData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            isFullWidthRow={isFullWidthRow}
            fullWidthCellRenderer={fullWidthCellRenderer}
            getRowHeight={getRowHeight}
            getRowId={getRowId}
            postSortRows={postSortRows}
          />
        </div>
      )}
    </div>
  )
}

