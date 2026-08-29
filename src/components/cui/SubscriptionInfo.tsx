"use client"
import { myFetch } from '@/utils/myFetch';
import React, { useEffect } from 'react'
import { toast } from 'sonner';

import dayjs from 'dayjs';

const SubscriptionInfo = () => {
  const [myPackage, setMyPackage] = React.useState<any>(null);
  // const [subscription, setSubscription] = React.useState<any>(null);



  const fetchSubscribe = async () => {
    const res = await myFetch("/subscription/my-subscription")
    // console.log("My Subscribe Response : ", res)
    if (res.success) {
      console.log("My Subscribe Data : ", res?.data)
      setMyPackage(res?.data);
      // setSubscription(res?.data?.subscription);
    } else {
      toast.error(res.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    fetchSubscribe();
  }, [])

  const cancelSubscribe = async () => {
    const res = await myFetch("/subscription/cancel", {
      method: "POST",
      body: {
        immediate: false
      }
    })
    //console.log("Cancel My Subscribe Response : ", res)

    if (res.success) {
      toast.success(res.message || "Subscription cancelled!");
      fetchSubscribe();
    } else {
      toast.error(res.message || "Something went wrong!");
    }
  }




  const isUnlimitedJobPost =
    Number(myPackage?.userId?.availableJobQuota) === -1 ||
    Number(myPackage?.packageId?.limits?.jobPostLimit) === -1;

  const isUnlimitedBoost =
    Number(myPackage?.userId?.availableBoostQuota) === -1 ||
    Number(myPackage?.packageId?.limits?.boostLimit) === -1;

  const isUnlimitedBooking =
    Number(myPackage?.userId?.availableBookingQuota) === -1 ||
    Number(myPackage?.packageId?.limits?.bookingLimit) === -1;

  return (
    <div>
      {myPackage?.packageType ? <div className='h-full w-full max-w-160 shadow rounded-md overflow-hidden flex flex-col md:flex-row gap-4 p-6'>
        <div>
          <div className='rounded-b-xl px-2 py-2 space-y-2'>
            <h3 className='text-lg font-bold text-center text-gray-700 capitalize'>{myPackage?.packageType}</h3>
            <div className='flex items-end justify-center gap-1'>
              <p className='text-2xl font-bold text-gray-600'>£{myPackage?.packageId?.regularPrice ?? myPackage?.price}</p>
              <p className='text-center text-gray-500 text-[11px] pb-1'>(per {myPackage?.packageId?.interval || 'month'})</p>
            </div>
          </div>
          <ul className='flex-1 mt-6 space-y-3 list-disc pl-12 pr-2'>
            {myPackage?.packageId?.features?.map((feature: string, index: number) => (
              <li key={index} className='text-gray-600'>{feature}</li>
            ))}
          </ul>
          <div className='flex flex-col items-center justify-center px-4 py-10 gap-2'>
            <button onClick={cancelSubscribe} type='button' disabled={myPackage?.cancelAtPeriodEnd} className={`w-full mt-auto bg-red-500 text-white font-semibold px-6 py-2 rounded-lg ${myPackage?.cancelAtPeriodEnd ? 'opacity-80 cursor-not-allowed' : 'hover:bg-red-600 cursor-pointer'} transition-colors duration-300`}>
              {myPackage?.cancelAtPeriodEnd ? "Subscription Cancelled" : "Cancel Subscription"}
            </button>
            {myPackage?.cancelAtPeriodEnd && (
              <p className='text-xs text-red-500 mt-2 text-center font-medium'>
                You have already cancelled this package. This package will be expired at {myPackage?.currentPeriodEnd ? dayjs(myPackage.currentPeriodEnd * 1000).format("DD, MMMM YYYY") : ''}.
              </p>
            )}
          </div>
        </div>
        <div className='hidden md:block h-full w-px bg-gray-200 ' />
        <div className='space-y-3'>
          <p className='text-xl font-semibold'>Your Rights</p>
          <p className='border-2 border-blue-500 rounded-sm text-blue-600 font-semibold px-3 py-2'>
            Available : {isUnlimitedJobPost ? "Unlimited" : (myPackage?.userId?.availableJobQuota ?? 0)} Post
          </p>
          <p className='border-2 border-blue-500 rounded-sm text-blue-600 font-semibold px-3 py-2'>
            Available : {isUnlimitedBoost ? "Unlimited" : (myPackage?.userId?.availableBoostQuota ?? 0)} Boosts
          </p>
          <p className='border-2 border-blue-500 rounded-sm text-blue-600 font-semibold px-3 py-2'>
            Available : {isUnlimitedBooking ? "Unlimited" : (myPackage?.userId?.availableBookingQuota ?? 0)} Bookings
          </p>
          {/* <p className='text-lg font-semibold text-gray-700'>You Are Already Spending 1 Boost.</p> */}
        </div>
      </div> : <p className='text-center text-gray-600'>You don&apos;t have any active subscription yet.</p>}
    </div>
  )
}

export default SubscriptionInfo