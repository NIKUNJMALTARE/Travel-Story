// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import ProfileInfo from './Cards/ProfileInfo';
// import SearchBar from './Input/SearchBar';




// const Navbar = ({ userInfo, searchQuery, setSearchQuery, onSearchNote, handleClearSearch }) => {
//     const isToken = localStorage.getItem("token");
//     const navigate = useNavigate();
//     const onLogout = () => {
//         localStorage.clear();
//         navigate("/login");
//     };

//     const handleSearch = () => {
//       if (searchQuery) {
//         onSearchNote(searchQuery);
//       }
//     };


//     const onClearSearch = () => {
//       handleClearSearch();
//       setSearchQuery("");
//     };
    
//   return (
//     <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
//       <img src="../src/assets/images/logo.png" alt="travel story" className="h-9" />
//       {isToken && (
//         <>
//           <SearchBar
//             value={searchQuery}
//             onChnage={({ target }) => {
//               setSearchQuery(target.value);
//             }} 
//             handleSearch={handleSearch}
//             onClearSearch={onClearSearch}
//           />
        
//         <ProfileInfo userInfo={userInfo} onLogout={onLogout} /> 
//         </>
//       )}
//     </div>
//   )
// }

// export default Navbar

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from './Cards/ProfileInfo';
import SearchBar from './Input/SearchBar';

const Navbar = ({ userInfo, searchQuery, setSearchQuery, onSearchNote, handleClearSearch }) => {
  const isToken = localStorage.getItem('token');
  const navigate = useNavigate();

  // Logout handler
  const onLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Handle Search Button Click
  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  // Clear Search Input and Results
  const onClearSearch = () => {
    setSearchQuery(''); // Reset input field
    handleClearSearch(); // Clear the search results
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      {/* Logo */}
      <img
        src="../src/assets/images/logo.png"
        alt="travel story"
        className="h-9"
      />

      {/* SearchBar and ProfileInfo */}
      {isToken && (
        <>
          {/* SearchBar Component */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Fixes the typo
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />

          {/* Profile Information */}
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </>
      )}
    </div>
  );
};

export default Navbar;
