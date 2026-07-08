import { Link } from 'react-router-dom';
import { EmptyState } from '../components/shared/EmptyState';

export default function NotFound() {
  return (
    <div>
      <EmptyState title="Page not found" description="That route doesn't exist." />
      <div className="text-center">
        <Link to="/" className="text-sm text-(--color-accent) underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
