import React from 'react'

function NoData(props) {
    
  return (
    <>
        <div className='rz_noFound'>
            <div className='rz_innerDetails'>
                <img src="../assets/images/Noresults.png" alt="No Data Found"/>
                <h4>No Data Found</h4>
                <p>We Can Find the Page You Are Looking for, <br/>Please Try Again After Some Time Go Back to the Dashboard.
                </p>
                <a className="spv-btn">Go Back</a>
            </div>
        </div>
    </>
  )
}
export default NoData;