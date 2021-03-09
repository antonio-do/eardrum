/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, message, Tabs} from 'antd'
import {Link, useParams, useHistory } from 'react-router-dom'
import axios from 'axios';
import Container from './components/Container';
import {useCurrentUser, useDeleteOne} from './hooks';


import routes from './routes';
import messages from './messages';


const {TabPane} = Tabs


const FormAList = ({onRowDelete, isLoading, data}) => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = messages[record.typ]
        return <Link to={ routes.formA.view.url(record.id) }>{form.name}</Link>
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
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={ routes.formA.edit.url(record.id) }>Edit</Link>
              <Popconfirm onConfirm={ onRowDelete(record.id) } title="Are you sure?">
                <Button type='link' danger>Delete</Button>
              </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return <Table loading={ isLoading } rowKey={(record) => record.id} columns={columns} dataSource={data} />
}


const FormBList = ({onRowDelete, isLoading, data}) => {
  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = messages[record.typ]
        return <Link to={routes.formB.view.url(record.id)}>{form.name}</Link>
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
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={routes.formB.edit.url(record.id)}>Edit</Link>
            <Popconfirm onConfirm={onRowDelete(record.id)} title='Are you sure?'>
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
  const columns = [
    {
      title: 'Form',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = messages[record.typ]
        return <Link to={routes.formC.view.url(record.id)}>{form.name}</Link>
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
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={routes.formC.edit.url(record.id)}>Edit</Link>
            <Popconfirm onConfirm={onRowDelete(record.id)} title='Are you sure?'>
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
  const [loading, res, error] = useCurrentUser();
  if (error) {
    message.error('Errors occured while fetching user!.');
    return null;
  }

  const approveForm = () => {};

  const rejectForm = () => {};

  const columns = [
    {
      title: 'Title',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = messages[record.typ]
        return <Link to={ routes.formD.view.url(record.id) }>{form.name}</Link>
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
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size='middle'>
            {!loading && res.data.is_admin && (
              <>
              <Popconfirm onConfirm={approveForm} title='Are you sure?'>
                <Button type='link'>
                  Approve
                </Button>
              </Popconfirm>
              <Popconfirm onConfirm={rejectForm} title='Are you sure?'>
                <Button type='link' danger>
                  Reject
                </Button>
              </Popconfirm>
              </>
            )}
            <Link to={routes.formD.edit.url(record.id)}>Edit</Link>
            <Popconfirm onConfirm={onRowDelete(record.id)} title='Are you sure?'>
              <Button type='link' danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return <Table loading={ isLoading } rowKey={(record) => record.id} columns={columns} dataSource={data} />
}


const ComplianceApp = () => {
  const [forms, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { typ } = useParams()
  const [onDelete, _, deleteRes, deleteError] = useDeleteOne()
  console.log('FormType: ' + typ);

  const history = useHistory()
  const typeToFormComponent = {
    a: FormAList,
    b: FormBList,
    c: FormCList,
    d: FormDList,
  }

  useEffect(() => {
    setIsLoading(true)

    axios
      .get(routes.api.list())
      .then(({data}) => {
        setFormList(data)
      })
      .catch((err) => {
        console.log(err)
        message.error('Could not fetch forms. Errors occured while fetching.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])


  useEffect(() => {
    if (deleteRes && deleteRes.status === 204) {
      const formId = deleteRes.data.pk;
      setFormList((forms) => forms.filter((form) => form.id !== formId));
      message.success('Form has been deleted successfully!');
      return;
    }

    if (deleteError) {
      console.log(deleteError);
      message.error('Errors occured while deleting form.');
    }
  }, [deleteRes, deleteError]);

  function onTabKeyChange(key) {
    history.push('/compliance/' + key)
  }

  return (
    <Container>
      <Tabs onChange={ onTabKeyChange } type='card' activeKey={ typ }>
        {Object.entries(messages).map(([typ, form]) => {
          const specificFormList = forms.filter((form) => form.typ === typ);
          const FormList = typeToFormComponent[typ];
          const formRoute = Object.entries(routes).find(([key, route]) => route.type === typ);

          return (
            <TabPane tab={form.name} key={ typ }>
              <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
                <Link to={formRoute[1].new.url()}>
                  <Button type='primary'>
                    New
                  </Button>
                </Link>
              </Space>
              <FormList formName={form.name} onRowDelete={onDelete} data={specificFormList} isLoading={isLoading} />
            </TabPane>
          )
        })}
      </Tabs>
    </Container>
  )
}

export default ComplianceApp;


// {/* <PrivateRoute path="/compliance/a/new" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/a/:pk/view" component={ FormAView } />
// {/* <PrivateRoute path="/compliance/a/:pk/edit" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/:typ" component={ ComplianceApp } />
