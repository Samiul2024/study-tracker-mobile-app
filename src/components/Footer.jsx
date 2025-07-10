import React from 'react';

const Footer = () => {
    return (
        <>
            <footer className='m-[-20px]'>

                {/* Credit Section starts */}

                <p className='text-white text-center m-0 py-4 bg-black'> © {new Date().getFullYear()} - All rights reserved | Designed & Developed By <a href="https://github.com/Samiul2024/Bills-Payment">Samiul</a></p>
                {/* Credit Section Ends */}
            </footer>
        </>
    );
};

export default Footer;