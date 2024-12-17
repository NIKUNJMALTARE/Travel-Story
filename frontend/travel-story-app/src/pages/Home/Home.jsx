import React, { useState }  from 'react';
import { useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { MdAdd } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import { useNavigate } from "react-router-dom";
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import Modal from 'react-modal';
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import { DayPicker } from 'react-day-picker';
import moment from 'moment';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import { getEmptyCardImage } from '../../utils/helper';
import { getEmptyCardMessage } from '../../utils/helper';

// import EmptyImg from '../../assets/images';



const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({form: null, to: null});


  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user){
        setUserInfo(response.data.user);
      }
    
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get all travel stories
  const getAllTravelStories = async () => {
    try{
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories){
        setAllStories(response.data.stories);
      }
    } catch (error){
      console.log("An unexpected error occured. Please Try again");

    }
  }

  // Handle Edit Story Click
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data});
  }

  // Handle Travel Story Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  }

  // Handle Update Favourite
  const updateIsFavourite = async (storyData) => {
    const storyDataString = JSON.stringify(storyData);
    const storyDataParsed = JSON.parse(storyDataString);
    const storyId = storyDataParsed._id;
    try {
      const response = await axiosInstance.put("/update-is-favourite/" + storyId + {
        isFavourite: !storyData.isFavourite,
      });
      if (response.data && response.data.story) {
        toast.success("Story Updated Successfully");

        if (filterType === "search" && searchQuery){
          onSearchStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.error("An unexpected error occured. Please Try again", error);
    }
  };

  // Delete Travel Story
  const deleteTravelStory = async(data) =>{
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);
      toast.error("Story Deleted Successfully"); {
      setOpenViewModal((prevState) => ({ ...prevState, isShown: false}));
      getAllTravelStories();
    }
  } catch (error) {
    console.log("An unexpected error occurred. Please Try again");
    }
  };

  // Search Story
  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        },
      });

      if (response.data && response.data.stories){
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please Try again");
    }
  }

  const handleClearSearch = () => {
    setFilterType("");
    getAllTravelStories();
  };

  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;

      if(startDate && endDate){
        const response = await axiosInstance.get("travel-stories/filter", {
          params: { startDate, endDate },
    });

    if (response.data && response.data.stories){
      setFilterType("date");
      setAllStories(response.data.stories);
    }
  }
} catch (error) {
  console.log("An unexpected error occurred. Please Try again");
}
  };

  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  }

  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  }

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory} handleClearSearch={handleClearSearch}/>

      <div className="container mx-auto py-10">

        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
        />


        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      visitedLocation={item.visitedLocation}
                      date={item.visitedDate}
                      isFavourite={item.isFavourite}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard  
              imgSrc={getEmptyCardImage(filterType)}
              message={getEmptyCardMessage(filterType)}
              />
            )}
          </div>

            <div className="w-[350px]">
              <div className="bg-white border border-slate-200 shadow-lg shadow-lg shadow-slate-200/60 rounded-lg">
                <div className="p-3">
                  <DayPicker
                    captionLayout="dropdown-buttons"
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDayClick}
                    pagedNavigation
                  />
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Add and Edit Travel Story Model*/}

      <Modal 
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory 
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null});
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/* View Travel Story Model*/}
      <Modal 
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null } 
          onClose={()=>{
            setOpenViewModal((prevState) => ({...prevState, isShown: false}));
          }} 
          onEditClick={()=>{
            setOpenViewModal((prevState) => ({...prevState, isShown: false}));
            handleEdit(openViewModal.data || null )
          }} 
          onDeleteClick={()=>{
            deleteTravelStory(openViewModal.data || null );
          }}
        />
      </Modal>


      <button 
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null});
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />

    </>
  )
}

export default Home