import { useState, useEffect } from 'react'

type NavbarProps = {
    selected: string;
    onSelect: (value: string) => void;
}

export const Navbar = ({ selected, onSelect } : NavbarProps) => {
  const [shrinked, setShrinked] = useState(false);

  // Shrink by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShrinked(true);
      } else {
        setShrinked(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  const selectedStyle = "bg-[#181d1c] text-white px-4 py-2 rounded";
  const unselectedStyle =
    "bg-[#181d1c] border-white bg-opacity-30 border-2 text-white px-4 py-2 rounded";

  if (shrinked) {
    return (
      <div
        className="fixed h-fit md:h-[96%] min-w-[15px] max-w-[80px] m-0 md:m-5 rounded-md bg-[#2b3533] text-white flex flex-col items-center justify-start p-4 cursor-pointer select-none z-10"
        style={{ minHeight: '30px' }}
        onClick={() => setShrinked(false)}
        title="Expand navbar"
      >
        <span className="text-2xl font-bold">CP</span>
      </div>
    );
  }

  return (
    <div className="fixed md:fixed z-10 m-1 min-w-[96%] md:max-w-[20%] md:min-w-[20%] md:top-5 md:left-5 rounded-md bg-[#2b3533] text-white flex flex-col gap-2 p-4 min-h-[96%]">
      <button
        className="absolute top-2 right-2 text-white text-2xl px-2 py-1 rounded hover:bg-[#181d1c] transition"
        onClick={() => setShrinked(true)}
        aria-label="Shrink navbar"
        type="button"
      >
        &laquo;
      </button>
      <h1 className="text-2xl md:text-3xl font-bold text-left text-white mb-10">
        Cert Prep
      </h1>
      <button
        className={
          (selected === "ace" ? unselectedStyle : selectedStyle) +
          " text-white px-4 py-2 rounded"
        }
        onClick={() => handleSelect("ace")}
      >
        GCP Associate Cloud Engineer
      </button>
      <button
        className={ (selected === "devops" ? unselectedStyle : selectedStyle) +" bg-[#181d1c] text-white px-4 py-2 rounded"}
        onClick={() => handleSelect("devops")}
      >
        GCP Professional DevOps Engineer
      </button>
      <button
        className={ (selected === "dbdataeng" ? unselectedStyle : selectedStyle) +" bg-[#181d1c] text-white px-4 py-2 rounded"}
        onClick={() => handleSelect("dbdataeng")}
        >
          DataBricks Data Engineer
        </button>
        <button
        className={ (selected === "gcpdataeng" ? unselectedStyle : selectedStyle) +" bg-[#181d1c] text-white px-4 py-2 rounded"}
        onClick={() => handleSelect("gcpdataeng")}
        >
          GCP Professional Data Engineer
        </button>
        <button
        className={ (selected === "gcpmleng" ? unselectedStyle : selectedStyle) +" bg-[#181d1c] text-white px-4 py-2 rounded"}
        onClick={() => handleSelect("gcpmleng")}
        >
          GCP Professional Machine Learning Engineer
        </button>

    </div>
  );
};