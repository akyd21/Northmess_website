import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ value = 0, onChange, readonly = false, size = 24 }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
          >
            {isFilled ? (
              <FaStar size={size} className="text-amber-400 drop-shadow-sm" />
            ) : (
              <FiStar size={size} className="text-dark-300 dark:text-dark-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
