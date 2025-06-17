import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { AcePrep } from './Ace';
import { Devops } from './Devops';


export const Home = () => {
  const [selected, setSelected] = useState('ace');
  return (
    <div className="flex flex-row h-screen w-screen overflow-x-hidden">
      <div className='md:relative md:min-w-fit fixed min-w-[100%] p-1 bg-[#181d1c] z-10'>
        <Navbar selected={selected} onSelect={setSelected} />
      </div>
      
      <div className="w-full mt-12">
        {selected === "ace" && <AcePrep />}
        {selected === "devops" && <Devops />}
      </div>
    </div>
  );
}