/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {InputNumber, Breadcrumb, Button, Select, Input, Spin, Table, DatePicker, Row, Col, message} from 'antd'
import {MenuOutlined, EditOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import messages from '../../messages'
import DeleteFormButton from '../DeleteFormButton'
import routes from '../../routes'

const complianceRoutes = routes.compliance
const formD = messages.compliance.d
const formText = formD.text

const dateFormat = 'DD/MM/YYYY'
const defaultData = Array.from({length: 3}).map((_, index) => {
  return {
    id: index + 1,
    date: moment(new Date()).format(dateFormat),
    securityName: '',
    account: '',
    SHRSOrder: 0,
    approxPrice: 0,
    symbolOrCusipOrder: '',
    purchaseSale: 'PURCHASE',
  }
})

const {Option} = Select

const EditRPSTForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const {formId} = useParams()
  const history = useHistory()
  const {url} = useRouteMatch()
  const [submissionDate, setSubmissionDate] = useState()
  const isOnViewPage = formId && url.includes('/view')
  const [tableData, setTableData] = useState(!formId || !isOnViewPage ? defaultData : [])

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(`/api/compliance/${formId}/`)
        .then(({data: {json_data}}) => {
          const {submissionDate, formData} = json_data
          setSubmissionDate(submissionDate)

          if (Array.isArray(formData)) {
            const newFormData = [...formData]

            if (!isOnViewPage) {
              newFormData.push({
                id: formData.length + 1,
                date: moment(new Date()).format(dateFormat),
                securityName: '',
                account: '',
                SHRSOrder: 0,
                approxPrice: 0,
                symbolOrCusipOrder: '',
                purchaseSale: 'PURCHASE',
              })
            }

            setTableData(newFormData)
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
        SHRSOrder: 0,
        approxPrice: 0,
        symbolOrCusipOrder: '',
        purchaseSale: 'PURCHASE',
      },
    ])
  }

  const deleteTableRow = (arrIndex) => () => {
    setTableData(tableData.filter((_, index) => index !== arrIndex))
  }

  const updateStateValue = (arrIndex, key, value) => {
    const newTableData = [...tableData]
    const newItem = {...tableData[arrIndex], [key]: value}
    newTableData[arrIndex] = newItem
    setTableData(newTableData)
  }

  const onSubmit = async () => {
    try {
      const formData = tableData.filter((row) => {
        const rowClone = {...row}
        delete rowClone.date
        delete rowClone.purchaseSale
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
        history.push(complianceRoutes.formListView('d'))
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
        history.push(complianceRoutes.formListView('d'))
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
          return (
            <Input
              value={tableData[index].securityName}
              onChange={(event) => updateStateValue(index, 'securityName', event.target.value)}
            />
          )
        },
      }),
    },
    {
      title: 'ACCOUNT',
      dataIndex: 'account',
      ...(!isOnViewPage && {
        width: '14%',
        render: (text, record, index) => {
          return (
            <Input
              value={tableData[index].account}
              onChange={(event) => updateStateValue(index, 'account', event.target.value)}
            />
          )
        },
      }),
    },
    {
      title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
      dataIndex: 'SHRSOrder',
      ...(!isOnViewPage && {
        width: '14%',
        render: (text, record, index) => {
          return (
            <InputNumber
              min={0}
              value={tableData[index].SHRSOrder}
              onChange={(value) => updateStateValue(index, 'SHRSOrder', value)}
            />
          )
        },
      }),
    },
    {
      title: 'APPROX PRICE',
      dataIndex: 'approxPrice',
      ...(!isOnViewPage && {
        width: '12%',
        render: (text, record, index) => {
          return (
            <InputNumber
              min={0}
              value={tableData[index].approxPrice}
              onChange={(value) => updateStateValue(index, 'approxPrice', value)}
            />
          )
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
              onChange={(event) => updateStateValue(index, 'symbolOrCusipOrder', event.target.value)}
            />
          )
        },
      }),
    },
    {
      title: 'PURCHASE(P) SALE(S)',
      dataIndex: 'purchaseSale',
      ...(!isOnViewPage && {
        width: '10%',
        render: (text, record, index) => {
          return (
            <Select
              value={tableData[index].purchaseSale}
              onChange={(value) => updateStateValue(index, 'purchaseSale', value)}>
              <Option value='PURCHASE'>PURCHASE</Option>
              <Option value='SALE'>SALE</Option>
            </Select>
          )
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
          border: '1px solid rgba(156, 163, 175, 50%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}>
        <Breadcrumb style={{marginBottom: '10px'}}>
          <Breadcrumb.Item>
            <Link to={complianceRoutes.formListView('d')}>
              <MenuOutlined /> {formD.name} Form List
            </Link>
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
                  <DeleteFormButton onDelete={onDelete} />
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
