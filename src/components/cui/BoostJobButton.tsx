"use client"
import React, { useState } from 'react'
import { myFetch } from '@/utils/myFetch';
import { toast } from 'sonner';

interface BoostJobButtonProps {
  jobId: string;
}

const BoostJobButton: React.FC<BoostJobButtonProps> = ({ jobId }) => {
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    toast.loading("Boosting job...", { id: "boost-loading" });

    try {
      const res = await myFetch(`/job/boost/${jobId}`, {
        method: "POST",
      });

      if (res.success) {
        toast.success(res.message || "Job boosted successfully!", { id: "boost-loading" });
      } else {
        toast.error(res.message || "Failed to boost job.", { id: "boost-loading" });
      }
    } catch {
      toast.error("An error occurred while boosting the job.", { id: "boost-loading" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBoost}
      disabled={loading}
      className={`w-full border py-2 px-6 cursor-pointer rounded-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? "Boosting..." : "Boost"}
    </button>
  )
}

export default BoostJobButton;
