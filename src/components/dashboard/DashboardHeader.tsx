import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons"
import { Link, useLocation } from 'react-router-dom'

type DashboardHeaderProps = {
  username?: string
  onLogout: () => void
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  const location = useLocation();
  
  return (
    <header className="bg-bg-primary shadow-sm border-b border-border-default">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold text-text-primary">
            Inventory Sync
          </h1>
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-bg-brand text-text-inverse' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/controlled-skus"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/controlled-skus' 
                  ? 'bg-bg-brand text-text-inverse' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              }`}
            >
              SKUs Controlados
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-text-secondary">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            <span className="text-sm">
              {username || 'Usuário'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}


