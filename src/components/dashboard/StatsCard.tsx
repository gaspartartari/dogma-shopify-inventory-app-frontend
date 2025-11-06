import { useId } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { Tooltip } from 'react-tooltip'

type StatsCardProps = {
  title: string
  value: string | number
  secondaryValue?: string
  icon: IconDefinition
  toolTip: string
}

export default function StatsCard({ title, value, secondaryValue, icon, toolTip }: StatsCardProps) {
  const tooltipId = useId()
  
  return (
    <>
      <div className="bg-bg-primary rounded-lg shadow-sm border border-border-default p-6">
        <div className="flex items-center justify-between">
          <div  >
            <p id={tooltipId} className="text-sm text-text-secondary mb-1">
              {title}
            </p>
            <p className="text-2xl font-semibold text-text-primary">
              {value}
              {secondaryValue && (
                <span className="text-sm text-text-tertiary ml-2">{secondaryValue}</span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={icon} className="text-text-primary text-2xl" />
          </div>
        </div>
        {toolTip && (
          <Tooltip anchorSelect={`#${tooltipId}`}>
            {toolTip}
          </Tooltip>
        )}
      </div>
 


    </>
  )
}


