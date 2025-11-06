import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import RevenueLineGraph from '../RevenueLineGraph'
import type { RevenueDataPoint } from '../../models/order'
import { Tooltip } from "react-tooltip"

type RevenueGraphSectionProps = {
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  data: RevenueDataPoint[]
  isLoading: boolean
  isError: boolean
}

export default function RevenueGraphSection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  data,
  isLoading,
  isError
}: RevenueGraphSectionProps) {
  return (
    <div className="bg-bg-primary rounded-lg shadow-sm border border-border-default p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 id="headerText" className="text-lg font-semibold text-text-primary">
          Receita ao Longo do Tempo
        </h2>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="text-text-tertiary" />
            <DatePicker
              selected={startDate}
              onChange={(date) => date && onStartDateChange(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent text-text-primary bg-bg-secondary text-sm"
              placeholderText="Data inicial"
            />
          </div>
          <span className="text-text-tertiary">até</span>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={endDate}
              onChange={(date) => date && onEndDateChange(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className="px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent text-text-primary bg-bg-secondary text-sm"
              placeholderText="Data final"
            />
          </div>
        </div>
      </div>
      <Tooltip anchorSelect="#headerText">
          Receita gerada pelos SKUs controlados ao longo do tempo.
      </Tooltip>
      
      <RevenueLineGraph 
        data={data}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  )
}


