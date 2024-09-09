import React, { useState, useEffect } from 'react'
import Icon from '../icon/Icon'
import { common } from '@/components/Common';
import FramesBG from './framesBG';

let Icon_shape_setting = () => {
  const [state, setstate] = useState({
    categoryList: [],
    loading: false
  });

  useEffect(() => {
    getallcategory();
  }, [])

  let getallcategory = () => {
    setstate({
      ...state,
      loading: true
    })
    common.getAPI({
      method: 'GET',
      url: 'category',
      data: {

      },
    }, (resp) => {
      setstate({
        ...state,
        categoryList: [...resp.data],
        loading: true
      })
    });
  }

  return (
    <>

      <FramesBG />
      <div className="p-25 mt-3 ps_editor_shapes_icon">
        <div className="ps_img_editor_side_layers">
          <h6>Icon / Shape</h6>
        </div>
        {state.loading == true ? (
          state.categoryList &&
          state.categoryList.map((data, i) => {
            return <Icon key={i + 1} data={data} index={i} />;
          })
        ) : (
          <div
            className="spinner-border"
            style={{ color: "#e74c3c" }}
            role="status"
          >
            <span className="sr-only"></span>
          </div>
        )}
      </div>
    </>
  );
}
export default Icon_shape_setting