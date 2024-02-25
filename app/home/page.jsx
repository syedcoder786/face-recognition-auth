import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-3xl gap-2">
      <p>This is Home page</p>
      <Link
        href="/"
        className="bg-slate-700 hover:bg-slate-800 hover:underline p-2"
      >
        Go Back
      </Link>
    </div>
  );
};

export default Home;
