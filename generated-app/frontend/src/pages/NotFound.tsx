import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <div className="text-8xl font-display font-bold text-forest-300 mb-4">404</div>
        <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 h-10 px-5 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 h-10 px-5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
          >
            <Home size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
