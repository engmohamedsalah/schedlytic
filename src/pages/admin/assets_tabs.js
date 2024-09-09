import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'

import Assets_page from '@/components/admin/assetsPage';
import Catagory_page from '@/components/admin/catagoryPage';
import Frames_page from '@/components/admin/framesPage';

export default function Assets_Tab() {

    const [ToggleState, setToggleState] = useState(1);

    const toggleTab = (index) => {
        setToggleState(index);
    };
    const router = useRouter();

    const getActiveClass = (index, className) =>
        ToggleState === index ? className : "";

    return (
        <div className='rz_dashboardWrapper' >
            <div className='ps_conatiner'>
                <div className=' welcomeWrapper'>
                    <div className='ps_admin_assets_tabs'>
                        <div className="ps_min_conatiner">

                            <ul className="tab-list">
                                <li
                                    className={`tabs ${getActiveClass(1, "active-tabs")}`}
                                    onClick={() => toggleTab(1)}
                                >
                                    Assets
                                </li>
                                <li
                                    className={`tabs ${getActiveClass(2, "active-tabs")}`}
                                    onClick={() => toggleTab(2)}
                                >
                                    Category
                                </li>
                                <li
                                    className={`tabs ${getActiveClass(3, "active-tabs")}`}s
                                    onClick={() => toggleTab(3)}
                                >
                                    Frames
                                </li>
                                
                            </ul>
                        </div>

                        <div className="content-container">
                            <div className={`content ${getActiveClass(1, "active-content")}`}>
                                <Assets_page />
                            </div>
                            <div className={`content ${getActiveClass(2, "active-content")}`}>
                                <Catagory_page />
                            </div>
                            <div className={`content ${getActiveClass(3, "active-content")}`}>
                                <Frames_page />
                            </div>
                           
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

