/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, Breadcrumb, message, Tabs} from 'antd'
import {DownOutlined, HomeOutlined} from '@ant-design/icons'
import {Link, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import messages from '../messages'

const {TabPane} = Tabs

const typeToFormProps = {
  a: messages.compliance.formA,
  b: messages.compliance.formB,
  c: messages.compliance.formC,
  d: messages.compliance.formD,
}

const ComplianceApp = () => {
  const {path} = useRouteMatch()
  const [formList, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [tabKey, setTabKey] = useState('Brokerage Account Disclosure')

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

  function onTabKeyChange(key) {
    setTabKey(key)
  }

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
      {Object.entries(typeToFormProps).map(([_, form]) => {
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
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]
        return <Link to={`${path}/${form.path}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data

        switch (record.typ) {
          case 'a':
          case 'd':
            return data.submissionDate
          case 'b':
            return data.year
          case 'c':
            return `${data.quarter}/${data.year}`
          default:
            return ''
        }
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
    },
    {
      title: 'Status',
      render: (text, record) => {
        switch (record.typ) {
          case 'a':
          case 'c':
          case 'b':
            return 'Complete'
          case 'd':
            return 'Incomplete'
          default:
            return ''
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]

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
        <Breadcrumb.Item>{tabKey} Form List</Breadcrumb.Item>
      </Breadcrumb>
      <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='primary'>
            Create a form <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Tabs onChange={onTabKeyChange} type='card'>
        {Object.entries(typeToFormProps).map(([type, form]) => {
          const specificFormList = formList.filter((f) => f.typ === type)

          return (
            <TabPane tab={form.name} key={form.name}>
              <Table
                loading={isLoading}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={specificFormList}
              />
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}

export default ComplianceApp
