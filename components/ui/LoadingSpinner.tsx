interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: '16px',
    md: '28px',
    lg: '44px',
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        width: currentSize,
        height: currentSize,
        border: '2px solid rgba(14,165,233,0.15)',
        borderTop: '2px solid #0ea5e9',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
