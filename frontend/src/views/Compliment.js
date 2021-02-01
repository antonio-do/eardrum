import React from 'react'
import {Table, Space, Menu, Dropdown, Button, Breadcrumb} from 'antd'
import {DownOutlined, HomeOutlined} from '@ant-design/icons'
import {Link, useRouteMatch} from 'react-router-dom'

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

const data = [
  {
    key: '1',
    id: 1,
    submit_by: 'User 1',
    type: 'a',
  },
  {
    key: '2',
    id: 2,
    submit_by: 'User 2',
    type: 'a',
  },
  {
    key: '3',
    id: 3,
    submit_by: 'User 3',
    type: 'a',
  },
  {
    key: '4',
    id: 4,
    submit_by: 'User 2',
    type: 'b',
  },
  {
    key: '5',
    id: 5,
    submit_by: 'User 4',
    type: 'c',
  },
  {
    key: '6',
    id: 6,
    submit_by: 'User 5',
    type: 'd',
  },
]

const ComplimentApp = () => {
  let {path} = useRouteMatch()

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
        const form = typeToFormName[record.type]
        return <Link to={`${path}/${form.path}/${record.id}`}>{form.name}</Link>
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size='middle'>
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ]

  return (
    <div style={{paddingTop: '32px'}}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to='/'>
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Compliment</Breadcrumb.Item>
      </Breadcrumb>
      <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='primary'>
            Create a form <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}

export default ComplimentApp
