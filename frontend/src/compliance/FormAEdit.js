import React, {useState, useEffect} from 'react'
import {Radio, Form} from 'antd'
import { useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
const FormAEdit = () => {
  const { pk } = useParams()
  const MODE = {
    'edit': 'edit',
    'new': 'new',
  }
  const mode = pk === undefined? MODE.new : MODE.edit; // 'edit', 'new';
  console.log("view mode", mode);

  return (
    <div>
      Form A Edit
    </div>
  )
}


export default FormAEdit;
