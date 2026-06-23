"use client"
import { getUserRoleEmployer } from '@/utils/getUserRoleClient';
import { myFetch } from '@/utils/myFetch';
import React from 'react'
import { toast } from 'sonner';

const SubscriptionCard = ({ data, hideButton }: { data: any, hideButton?: boolean }) => {
  const afterDiscount = data.regularPrice - (data.regularPrice * (data.discountPercent / 100));

  // console.log("Subscription Card Data : ", data)

  const handleSubscribe = async () => {
    const isEmployer = await getUserRoleEmployer();
    if (!isEmployer) {
      toast.error("Please login as Employer!");
      return
    }
    const res = await myFetch(`/subscription/checkout/${data?._id}`, {
      method: "POST",
    })
    console.log("Subscribe Response : ", res)
    if (res.success) {
      if (res?.data?.checkoutUrl) {
        window.location.href = res?.data?.checkoutUrl;
      } else if (res?.statusCode === 200) {
        toast.success(res?.data?.message || res.message)
      }
    } else {
      toast.error(res.message || "Something went wrong!");
    }
  };

  return (
    <div className='relative h-full w-full max-w-75 mx-auto  shadow rounded-md overflow-hidden flex flex-col'>
      {data.discountPercent > 0 && <span className='absolute top-1 right-1 bg-blue-500 text-gray-100 px-2 py-1 text-[10px] rounded-sm'>{data.discountPercent}% off</span>}
      <div className='bg-[#E6EEFC] rounded-b-xl px-2 py-8 space-y-2'>
        <h3 className='text-lg font-bold text-center text-gray-700 capitalize'>{data?.type}</h3>
        <div className='flex items-end justify-center gap-1'>
          {data.discountPercent ? <p className='flex items-end justify-center'>
            <span className='line-through text-red-500 mr-2 text-xl font-bold'>£{data.regularPrice}</span>
            <span className='text-2xl font-bold text-gray-600'>/£{afterDiscount.toFixed(2)}</span>
          </p> : <p className='text-2xl font-bold text-gray-600'>£{data.regularPrice}</p>}
          <p className='text-center text-gray-500 text-[11px] pb-1'>{`(per ${data.interval})`}</p>
        </div>
      </div>
      <ul className='flex-1 mt-6 space-y-3 list-disc pl-12 pr-2'>
        {data.features.map((feature: string, index: number) => (
          <li key={index} className='text-gray-600'>{feature}</li>
        ))}
      </ul>
      <div className='flex justify-center py-10'>
        {!hideButton && <button onClick={handleSubscribe} className='mt-auto bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-600 transition'>Subscribe Now</button>}
      </div>
      <div className='w-18 h-18 bg-[#B0CBF4] rotate-45 absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2' />
      <div className='w-18 h-18 bg-[#B0CBF4] rotate-45 absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2' />
    </div>
  )
}

export default SubscriptionCard