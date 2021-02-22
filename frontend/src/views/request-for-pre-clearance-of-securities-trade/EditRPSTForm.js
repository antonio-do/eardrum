/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Button, Input, Spin, Table, DatePicker, Row, Col, message, Popconfirm} from 'antd'
import {HomeOutlined, EditOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import messages from '../../messages'

const {formD} = messages.compliance
const formText = formD.text

const dateFormat = 'DD/MM/YYYY'
const defaultData = Array.from({length: 3}).map((_, index) => {
  return {
    id: index + 1,
    date: moment(new Date()).format(dateFormat),
    securityName: '',
    account: '',
    SHRSOrder: '',
    approxPrice: '',
    symbolOrCusipOrder: '',
    purchaseSale: '',
  }
})

const EditRPSTForm = () => {
  const [tableData, setTableData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const {formId} = useParams()
  const history = useHistory()
  const {url} = useRouteMatch()
  const [submissionDate, setSubmissionDate] = useState()
  const isOnViewPage = formId && url.includes('/view')

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(`/api/compliance/${formId}/`)
        .then(({data: {json_data}}) => {
          const {submissionDate, formData} = json_data
          setSubmissionDate(submissionDate)

          if (Array.isArray(formData) && formData.length) {
            setTableData(formData)
          }

          setIsLoading(false)
        })
        .catch((err) => {
          console.log(err)
          message.error('Error getting form, please try again!')
        })
    }
  }, [formId])

  const onDateChange = (arrIndex) => (_, dateString) => {
    const newTableData = [...tableData]
    const newItem = {...newTableData[arrIndex], date: dateString}
    newTableData[arrIndex] = newItem
    setTableData(newTableData)
  }

  const addTableRow = () => {
    setTableData((tableData) => [
      ...tableData,
      {
        id: tableData.length + 1,
        date: moment(new Date()).format(dateFormat),
        securityName: '',
        account: '',
        SHRSOrder: '',
        approxPrice: '',
        symbolOrCusipOrder: '',
        purchaseSale: '',
      },
    ])
  }

  const deleteTableRow = (arrIndex) => () => {
    setTableData(tableData.filter((_, index) => index !== arrIndex))
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newTableData = [...tableData]
    const newItem = {...tableData[arrIndex], [key]: event.target.value}
    newTableData[arrIndex] = newItem
    setTableData(newTableData)
  }

  const onSubmit = async () => {
    try {
      const formData = tableData.filter((row) => {
        const rowClone = {...row}
        delete rowClone.date
        delete rowClone.id
        return !Object.values(rowClone).every((val) => !val)
      })

      const url = formId ? `/api/compliance/${formId}/` : '/api/compliance/'
      const newSubmissionDate = formId ? submissionDate : moment(new Date()).format(dateFormat)

      const {data} = await axios({
        method: formId ? 'PATCH' : 'POST',
        url,
        data: {
          typ: 'd',
          data: {submissionDate: newSubmissionDate, formData},
        },
      })

      if (data.id) {
        message.success('Request for Pre-Clearance of Securities Trade was submitted successfully!', 1)
        history.push('/compliance')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  const onDelete = async () => {
    try {
      const res = await axios.delete(`/api/compliance/${formId}/`)

      if (res.status === 204) {
        history.push('/compliance')
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }
  const columns = [
    {
      title: 'DATE',
      dataIndex: 'date',

      ...(!isOnViewPage && {
        width: '16%',
        render: (text, record, index) => {
          return (
            <DatePicker
              defaultValue={moment(new Date(), dateFormat)}
              format={dateFormat}
              onChange={onDateChange(index)}
            />
          )
        },
      }),
    },
    {
      title: 'NAME OF SECURITY',
      dataIndex: 'securityName',
      ...(!isOnViewPage && {
        width: '12%',
        render: (text, record, index) => {
          return <Input value={tableData[index].securityName} onChange={onInputValueChange(index, 'securityName')} />
        },
      }),
    },
    {
      title: 'ACCOUNT',
      dataIndex: 'account',
      ...(!isOnViewPage && {
        width: '14%',
        render: (text, record, index) => {
          return <Input value={tableData[index].account} onChange={onInputValueChange(index, 'account')} />
        },
      }),
    },
    {
      title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
      dataIndex: 'SHRSOrder',
      ...(!isOnViewPage && {
        width: '14%',
        render: (text, record, index) => {
          return <Input value={tableData[index].SHRSOrder} onChange={onInputValueChange(index, 'SHRSOrder')} />
        },
      }),
    },
    {
      title: 'APPROX PRICE',
      dataIndex: 'approxPrice',
      ...(!isOnViewPage && {
        width: '12%',
        render: (text, record, index) => {
          return <Input value={tableData[index].approxPrice} onChange={onInputValueChange(index, 'approxPrice')} />
        },
      }),
    },
    {
      title: 'SYMBOL OR CUSIP #',
      dataIndex: 'symbolOrCusipOrder',
      ...(!isOnViewPage && {
        width: '12%',
        render: (text, record, index) => {
          return (
            <Input
              value={tableData[index].symbolOrCusipOrder}
              onChange={onInputValueChange(index, 'symbolOrCusipOrder')}
            />
          )
        },
      }),
    },
    {
      title: 'PURCHASE(P) SALE(S)',
      dataIndex: 'purchaseSale',
      ...(!isOnViewPage && {
        width: '20%',
        render: (text, record, index) => {
          return <Input value={tableData[index].purchaseSale} onChange={onInputValueChange(index, 'purchaseSale')} />
        },
      }),
    },
  ]

  if (!isOnViewPage) {
    columns.push({
      title: 'Actions',
      dataIndex: 'action',
      render: (text, record, index) => {
        return index === 0 ? (
          <Button type='primary' onClick={addTableRow}>
            <PlusOutlined />
          </Button>
        ) : (
          <Button type='text' danger onClick={deleteTableRow(index)}>
            <MinusOutlined />
          </Button>
        )
      },
    })
  }

  return (
    <Spin spinning={isLoading}>
      <div
        style={{
          padding: '32px 16px',
          fontSize: '16px',
          border: '1px solid rgba(156, 163, 175, 50%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}>
        <Breadcrumb style={{fontSize: '14px', marginBottom: '10px'}}>
          <Breadcrumb.Item>
            <Link to='/'>
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to='/compliance'>Compliance</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {formId ? (
              isOnViewPage ? (
                ''
              ) : (
                <>
                  <EditOutlined /> Edit{' '}
                </>
              )
            ) : (
              <>
                <PlusOutlined /> New{' '}
              </>
            )}
            {formD.name} Form
          </Breadcrumb.Item>
        </Breadcrumb>

        {isOnViewPage && (
          <Row justify='end' style={{marginBottom: '10px'}}>
            <Col>
              <Link to={`${url.replace('/view', '')}/edit`}>
                <Button type='primary'>
                  <EditOutlined /> Edit
                </Button>
              </Link>
            </Col>
          </Row>
        )}

        <div>
          <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
        </div>

        <div style={{marginTop: '16px'}}>
          <div>{formText.list.title}</div>
          <ol type='a'>
            {formText.list.items.map((item) => {
              return <li key={item}>{item}</li>
            })}
          </ol>
          <div>
            <i>{formText.note}</i>
          </div>
        </div>

        {!isOnViewPage && (
          <div>
            <Row justify='end' gutter={10}>
              <Col>
                <Button type='primary' onClick={onSubmit}>
                  Submit
                </Button>
              </Col>
              {formId && (
                <Col>
                  <Popconfirm
                    title='Are you sure to delete this form?'
                    onConfirm={onDelete}
                    okText='Yes'
                    cancelText='No'>
                    <Button type='link' danger>
                      Delete
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </Row>
          </div>
        )}
      </div>
    </Spin>
  )
}

export default EditRPSTForm
