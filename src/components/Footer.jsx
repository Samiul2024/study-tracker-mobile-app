import React from 'react';

const Footer = () => {
    return (
        <>
            <footer className='m-[-20px] text-center bg-black'>

                {/* Credit Section starts */}

                <p className='text-white  m-0 py-4 '> © {new Date().getFullYear()} - All rights reserved | Designed & Developed By
                    <a href="https://github.com/Samiul2024/">
                        <span className='text-yellow-500 px-2 hover:text-white'>
                            Samiul
                        </span>
                    </a></p>
                {/* Credit Section Ends */}
            </footer>
        </>
    );
};

export default Footer;