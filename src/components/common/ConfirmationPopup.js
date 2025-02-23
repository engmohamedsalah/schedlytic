import svg from '../svg';
import React, { useState, useEffect }  from 'react';

function ConfirmationPopup({ 
    shownPopup, 
    closePopup, 
    title,
    subTitle,
    type,
    removeAction ,
    socialMedia=false
}) { 
    return shownPopup ? (
        <>
            <div className="modal-backdrop rz_confirmPopup"
            onClick={() => closePopup}
            >
                <div
                    className="modal-content"
                    onClick={e => {
                        e.stopPropagation();
                    }}
                >
                    <a className="rz_closeIcon" onClick={closePopup}>{svg.app.closeIcon}</a>
                    <div className='modal-body'>
                        <div className='rz_confirmModal'>
                        {!socialMedia &&
                            <div className='rz_confirmImg'>
                                <img src='../assets/images/Confirmation.png' alt='Alert Img'/>
                            </div>
}
                            <div className='rz_textCOntent'>
                            {!socialMedia ?
                            <>
                                <h4>{title ? title :   `Are you sure you want to delete this ${type ? type.toLowerCase() : 'item'} `}</h4>
                                <p>{subTitle ? subTitle : `This ${type ? type.toLowerCase() : 'item '} will be deleted immediately and permanently.`}</p>
                                <span> {`you can't undo this action`}.</span> 
                                </>
                                :
                                 <h4>{`Before creating post please make sure you have added your social account`}</h4>
                            }
                                {!socialMedia &&
                                <div className='modalBtn_holder'>
                                    <a className='rz_btn rz_addAccBtn_blk' onClick={closePopup}>No</a>
                                    <a className='rz_btn' onClick={removeAction}>Yes, Delete</a>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </> 
    
    ): null;
}

export default ConfirmationPopup;