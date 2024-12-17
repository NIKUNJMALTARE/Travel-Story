// // import React, { useState } from 'react';
// // import { FaMagnifyingGlass } from 'react-icons/fa6';
// // import { MdClose } from 'react-icons/md';


// // const SearchBar = ({ value, onChange, handleSearch, onClearSearch}) => {
// //   return (
// //     <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md">
// //         <input 
// //             type="text" 
// //             placeholder="Search Notes" 
// //             className="w-full text-xs bg-transparent py-[11px] outline-none"
// //             value={value}
// //             onChange={handleSearch} 
// //         />

// //         {
// //             value && <MdClose className="text-xl text-slate-500 curdor-pointer hover:text-black mr-3" onClick={onClearSearch} />
// //         }

// //         <FaMagnifyingGlass className="text-slate-400 cursor-pointer hover:text-black" onClick={handleSearch} />
// //     </div>
// //   )
// // }

// // export default SearchBar

// import React from 'react';
// import { FaMagnifyingGlass } from 'react-icons/fa6';
// import { MdClose } from 'react-icons/md';

// const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
//   return (
//     <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md">
//       <input
//         type="text"
//         placeholder="Search Notes"
//         className="w-full text-xs bg-transparent py-[11px] outline-none"
//         value={value}
//         onChange={onChange} // Changed to onChange
//       />

//       {value && (
//         <MdClose
//           className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"
//           onClick={onClearSearch}
//         />
//       )}

//       <FaMagnifyingGlass
//         className="text-slate-400 cursor-pointer hover:text-black"
//         onClick={handleSearch}
//       />
//     </div>
//   );
// };

// export default SearchBar;

import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md">
      {/* Input Field */}
      <input
        type="text"
        placeholder="Search Notes"
        className="w-full text-xs bg-transparent py-[11px] outline-none"
        value={value}
        onChange={(e) => onChange(e)} // Pass the input value to the parent
      />

      {/* Clear Search Button */}
      {value && (
        <MdClose
          className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"
          onClick={onClearSearch} // Clear the input field
        />
      )}

      {/* Search Button */}
      <FaMagnifyingGlass
        className="text-slate-400 cursor-pointer hover:text-black"
        onClick={handleSearch} // Trigger the search function
      />
    </div>
  );
};

// Default Props for Safety
SearchBar.defaultProps = {
  value: '',
  onChange: () => {},
  handleSearch: () => {},
  onClearSearch: () => {},
};

export default SearchBar;
