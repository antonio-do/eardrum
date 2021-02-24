/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, Breadcrumb, message, Tabs} from 'antd'
import {DownOutlined, MenuOutlined} from '@ant-design/icons'
import {Link, useRouteMatch, useParams, useHistory} from 'react-router-dom'
import axios from 'axios'
import routes from '../routes'
import messages from '../messages'

const {TabPane} = Tabs

const typeToFormProps = messages.compliance
const complianceRoutes = routes.compliance

const FormAList = ({onRowDelete, isLoading, data}) => {
  const {url} = useRouteMatch()

  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]
        return <Link to={`${url}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return data.submissionDate
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
      sorter: (a, b) => {
        console.log(typeof a.submit_by)
        return a.submit_by.localeCompare(b.submit_by)
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={`${url}/${record.id}/edit`}>Edit</Link>
            <Popconfirm
              title='Are you sure to delete this form?'
              onConfirm={onRowDelete(record.id)}
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

  return <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={data} />
}

const FormBList = ({onRowDelete, isLoading, data}) => {
  const {url} = useRouteMatch()

  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]
        return <Link to={`${url}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return data.year
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
      sorter: (a, b) => {
        console.log(typeof a.submit_by)
        return a.submit_by.localeCompare(b.submit_by)
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={`${url}/${record.id}/edit`}>Edit</Link>
            <Popconfirm
              title='Are you sure to delete this form?'
              onConfirm={onRowDelete(record.id)}
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

  return <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={data} />
}

const FormCList = ({onRowDelete, isLoading, data}) => {
  const {url} = useRouteMatch()

  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]
        return <Link to={`${url}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return `${data.quarter}/${data.year}`
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
      sorter: (a, b) => {
        console.log(typeof a.submit_by)
        return a.submit_by.localeCompare(b.submit_by)
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={`${url}/${record.id}/edit`}>Edit</Link>
            <Popconfirm
              title='Are you sure to delete this form?'
              onConfirm={onRowDelete(record.id)}
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

  return <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={data} />
}

const FormDList = ({onRowDelete, isLoading, data}) => {
  const {url} = useRouteMatch()

  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = typeToFormProps[record.typ]
        return <Link to={`${url}/${record.id}/view`}>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return data.submissionDate
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
      sorter: (a, b) => {
        console.log(typeof a.submit_by)
        return a.submit_by.localeCompare(b.submit_by)
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Status',
      render: () => {
        return 'Incomplete'
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={`${url}/${record.id}/edit`}>Edit</Link>
            <Popconfirm
              title='Are you sure to delete this form?'
              onConfirm={onRowDelete(record.id)}
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

  return <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={data} />
}

const ComplianceApp = () => {
  const {url} = useRouteMatch()
  const [formList, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const {formType} = useParams()
  const [tabKey, setTabKey] = useState(() => (formType in typeToFormProps ? formType : Object.keys(typeToFormProps)[0]))
  const history = useHistory()
  const typeToFormComponent = {
    a: FormAList,
    b: FormBList,
    c: FormCList,
    d: FormDList,
  }

  useEffect(() => {
    setIsLoading(true)

    if (!formType || !(formType in typeToFormProps)) {
      history.replace(`/compliance/${Object.keys(typeToFormProps)[0]}`)
    }

    axios
      .get(complianceRoutes.list())
      .then(({data}) => {
        setFormList(data)
      })
      .catch((err) => {
        console.log(err)
        message.error('Unexpected error encountered')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  function onTabKeyChange(key) {
    setTabKey(key)
    history.replace(key)
  }

  const onDelete = (formId) => async () => {
    try {
      const res = await axios.delete(complianceRoutes.detailsURL(formId))

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
      {Object.entries(typeToFormProps).map(([type, form]) => {
        const newUrl = url.replace(`/compliance/${formType}`, `/compliance/${type}/new`)

        if (type === 'd') {
          return (
            <Button key='d' type='text' disabled>
              {form.name}
            </Button>
          )
        }

        return (
          <Menu.Item key={form.name}>
            <Link to={newUrl}>{form.name}</Link>
          </Menu.Item>
        )
      })}
    </Menu>
  )

  return (
    <div
      style={{
        padding: '32px 10px',
        border: '1px solid rgba(156, 163, 175, 50%)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}>
      <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='primary'>
            Create a form <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Tabs onChange={onTabKeyChange} type='card' activeKey={tabKey}>
        {Object.entries(typeToFormProps).map(([type, form]) => {
          const specificFormList = formList.filter((f) => f.typ === type)
          const FormList = typeToFormComponent[type]

          return (
            <TabPane tab={form.name} key={type}>
              <FormList formName={form.name} onRowDelete={onDelete} data={specificFormList} isLoading={isLoading} />
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}

export default ComplianceApp
