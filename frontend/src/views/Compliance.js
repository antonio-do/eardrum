/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, Breadcrumb, message} from 'antd'
import {DownOutlined, HomeOutlined} from '@ant-design/icons'
import {Link, useRouteMatch} from 'react-router-dom'
import axios from 'axios'

const typeToFormName = {
  a: {
    name: 'Brokerage Account Disclosure',
    path: 'brokerage-account-disclosure',
  },
  b: {
    name: 'Employee Securities Holdings Report',
    path: 'employee-security-holdings-report',
  },
  c: {
    name: 'Employee Quarterly Trade Report',
    path: 'employee-quarterly-trade-report',
  },
  d: {
    name: 'Request for Pre-Clearance of Securities Trade',
    path: 'request-for-pre-clearance-of-securities-trade',
  },
}

const ComplianceApp = () => {
  const {path} = useRouteMatch()
  const [formList, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    axios
      .get('/api/compliance/')
      .then(({data}) => {
        setFormList(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
        message.error('Unexpected error encountered')
      })
  }, [])

  const onDelete = (formId) => async () => {
    try {
      const res = await axios.delete(`/api/compliance/${formId}/`)

      if (res.status === 204) {
        setFormList((formList) => formList.filter((form) => form.id !== formId))
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  const menu = (
    <Menu>
      {Object.entries(typeToFormName).map(([_, form]) => {
        return (
          <Menu.Item key={form.name}>
            <Link to={`${path}/${form.path}/new`}>{form.name}</Link>
          </Menu.Item>
        )
      })}
    </Menu>
  )

  const columns = [
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormName[record.typ]
        return <Link to={`${path}/${form.path}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
    },
    {
      title: 'Type',
      dataIndex: 'typ',
      key: 'typ',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        const form = typeToFormName[record.typ]

        return (
          <Space size='middle'>
            <Link to={`${path}/${form.path}/${record.id}/edit`}>Edit</Link>
            <Popconfirm
              title='Are you sure to delete this form?'
              onConfirm={onDelete(record.id)}
              okText='Yes'
              cancelText='No'>
              <Button type='link' danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div
      style={{
        padding: '32px 10px',
        border: '1px solid rgba(156, 163, 175, 50%)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to='/'>
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Compliance</Breadcrumb.Item>
      </Breadcrumb>
      <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='primary'>
            Create a form <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
      <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={formList} />
    </div>
  )
}

export default ComplianceApp
