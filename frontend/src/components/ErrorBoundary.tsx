import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#fff8fa',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              background: '#fff',
              padding: '2.5rem',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(181, 70, 94, 0.1)',
            }}
          >
            <h1 style={{ color: '#801d38', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              ✨ Accesorios Lilis
            </h1>
            <p style={{ color: '#68595f', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Hubo un detalle temporal al inicializar la tienda. Haz clic abajo para reanudar.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #b5465e 0%, #801d38 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1.8rem',
                borderRadius: '999px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              🔄 Recargar Tienda
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
