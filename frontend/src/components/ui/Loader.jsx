export default function Loader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-2 border-primary-200 dark:border-primary-900`}></div>
        <div className={`${sizes[size]} rounded-full border-2 border-transparent border-t-primary-500 animate-spin absolute top-0 left-0`}></div>
      </div>
    </div>
  );
}
