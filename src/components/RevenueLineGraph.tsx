import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RevenueDataPoint } from '../models/order';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface RevenueLineGraphProps {
    data: RevenueDataPoint[];
    isLoading?: boolean;
    isError?: boolean;
}

function RevenueLineGraph({ data, isLoading, isError }: RevenueLineGraphProps) {
    
    // Format currency for display
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format month label (YYYY-MM -> MMM/YY)
    const formatMonthLabel = (yearMonth: string) => {
        const [year, month] = yearMonth.split('-');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthIndex = parseInt(month, 10) - 1;
        return `${monthNames[monthIndex]}/${year.substring(2)}`;
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as RevenueDataPoint;
            return (
                <div className="bg-bg-secondary border border-border-default rounded-lg shadow-lg p-3">
                    <p className="text-text-primary font-semibold mb-1">
                        {formatMonthLabel(dataPoint.yearMonth)}
                    </p>
                    <p className="text-status-success font-bold text-lg">
                        {formatCurrency(dataPoint.totalRevenue)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-80">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-500 text-4xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-80">
                <p className="text-status-error text-lg">Erro ao carregar dados de receita</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80">
                <p className="text-text-secondary text-lg">Nenhum dado disponível para o período selecionado</p>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#27272a" 
                        vertical={false}
                    />
                    <XAxis 
                        dataKey="yearMonth" 
                        tickFormatter={formatMonthLabel}
                        stroke="#a1a1aa"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#a1a1aa' }}
                    />
                    <YAxis 
                        tickFormatter={formatCurrency}
                        stroke="#a1a1aa"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#a1a1aa' }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        wrapperStyle={{ 
                            paddingTop: '20px',
                            color: '#e4e4e7'
                        }}
                        formatter={() => 'Receita Mensal'}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="totalRevenue" 
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6, fill: '#16a34a' }}
                        name="Receita"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default RevenueLineGraph;

