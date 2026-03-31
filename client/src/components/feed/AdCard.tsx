import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { Ad } from "../../types";
import { adAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";

interface Props {
  ad: Ad;
}

export default function AdCard({ ad }: Props) {
  const { user } = useAuth();
  const viewTracked = useRef(false);
  const [imgError, setImgError] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && user && !viewTracked.current) {
      viewTracked.current = true;
      adAPI.trackView(ad._id).catch(() => {});
    }
  }, [inView, user, ad._id]);

  const handleClick = () => {
    if (user) {
      adAPI.trackClick(ad._id).catch(() => {});
    }
  };

  return (
    <div ref={ref} className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          Sponsored
        </span>
      </div>
      <a
        href={ad.targetLink}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block group"
      >
        {ad.imageUrl && !imgError && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            onError={() => setImgError(true)}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <p className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors line-clamp-2">
          {ad.title}
        </p>
        <span className="text-xs text-amber-600 mt-1 inline-block">Learn more →</span>
      </a>
    </div>
  );
}
