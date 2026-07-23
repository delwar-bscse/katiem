
import { CustomFilter } from '@/components/cui/CustomFilter'
import { CustomSearchBar } from '@/components/cui/CustomSearchBar'
// import { CustomModal } from '@/components/modal/CustomModal'
// import { jobDatas } from '@/data/jobDatas'
import { FaBars } from "react-icons/fa6";
import CustomPagination from '@/components/cui/CustomPagination'
import { myFetch } from '@/utils/myFetch'
import JobPostCard from '@/components/card/JobPostCard'
import LocationPicker from '@/components/map/LocationPicker';
import { CustomModalAutoComplete } from '@/components/modal/CustomModalAutoComplete';


const Jobs = async ({ searchParams }: { searchParams: { [key: string]: string } }) => {
  const newSearchParams = await searchParams;

  const searchTerm = newSearchParams.searchTerm;
  const category = newSearchParams.category;
  const subCategory = newSearchParams.subCategory;
  const price = newSearchParams.price;
  const radius = newSearchParams.radius;
  const salaryType = newSearchParams.salaryType;
  // const location = newSearchParams.location;
  const longitude = newSearchParams.longitude;
  const latitude = newSearchParams.latitude;
  const page = newSearchParams?.page || 1;
  const limit = newSearchParams?.pageSize || 10;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(searchTerm ? { searchTerm } : {}),
    ...(category ? { category } : {}),
    ...(subCategory ? { subCategory } : {}),
    ...(salaryType ? { salaryType } : {}),
    ...(price ? { minSalary: "0", maxSalary: price } : {}),
    ...(radius ? { radius } : {}),
    // ...(location ? { address: location } : {}),
    ...(longitude && latitude ? { longitude, latitude } : {}),
  });

  const jobUrl = `/job?isExpired=false?${params.toString()}`;
  //console.log("Url : ", `/job?${params.toString()}`)
  const res = await myFetch(jobUrl, { method: "GET" });


  const jobDatas = res?.data || [];
  const meta: any = res?.pagination || {};
  // console.log("Job get res : ", jobDatas);
  // console.log("Job meta res : ", res);

  const resCoordinates = jobDatas?.map((item: any) => ({
    lng: item.location.coordinates[0],
    lat: item.location.coordinates[1]
  }));

  // console.log("resCoordinates : ", resCoordinates);


  return (
    <div className='maxWidth'>
      {/* --------------- Google Map --------------- */}
      <div>
        <LocationPicker locations={resCoordinates || []} />
      </div>

      {/* --------------- Search and Jobs Filter Options --------------- */}
      <div className='flex items-center gap-4 py-8'>
        <div className='flex-1'>
          <CustomSearchBar placeholder="Search here..." query="searchTerm" />
        </div>
        <CustomModalAutoComplete
          title="Jobs Filter Options"
          trigger={<button className='border border-gray-400 p-3 text-gray-500 rounded-full cursor-pointer'>
            <FaBars className='text-xl' />
          </button>}
        >
          <CustomFilter />
        </CustomModalAutoComplete>
      </div>

      {/* --------------- Jobs --------------- */}
      <div className=''>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
          {jobDatas && jobDatas?.map((item: any, index: number) => (
            <JobPostCard key={index} item={item} url={`/jobs/${item._id}`} />
          ))}
        </div>
      </div>

      {/* --------------- Jobs --------------- */}
      <div className='py-12'>
        <CustomPagination TOTAL_PAGES={meta?.totalPages} />
      </div>

    </div>
  )
}

export default Jobs