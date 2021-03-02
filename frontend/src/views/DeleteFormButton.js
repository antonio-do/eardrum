import React from 'react'
import {Button, Popconfirm} from 'antd'

const DeleteForm = ({onDelete}) => {
  return (
    <Popconfirm title='Are you sure to delete this form?' onConfirm={onDelete} okText='Yes' cancelText='No'>
      <Button type='link' danger>
        Delete
      </Button>
    </Popconfirm>
  )
}

export default DeleteForm
