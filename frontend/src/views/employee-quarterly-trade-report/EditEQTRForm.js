/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {
  Row,
  Col,
  DatePicker,
  Input,
  Divider,
  Breadcrumb,
  Select,
  Button,
  Checkbox,
  message,
  InputNumber,
  Radio,
  Spin,
  Popconfirm,
  Table,
} from 'antd'
import {MenuOutlined, EditOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import messages from '../../messages'

const formC = messages.compliance.c
const formText = formC.text

const {Option} = Select

const dateFormat = 'DD/MM/YYYY'
const defaultData = Array.from({length: 2}).map((_, index) => {
  return {
    id: index + 1,
    date: moment(new Date()).format(dateFormat),
    stockTicker: '',
    listedOn: '',
    totalValue: 0,
    type: 'Long',
  }
})

const EditEQTRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [quarter, setQuarter] = useState('Q1')
  const [radioValue, setRadioValue] = useState()
  const [tableData, setTableData] = useState(defaultData)
  const [checkboxGroup, setCheckboxGroup] = useState([false, false, false, false])
  const history = useHistory()
  const {formId} = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const {url} = useRouteMatch()
  const isOnViewPage = formId && url.includes('/view')

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(`/api/compliance/${formId}/`)
        .then(({data: {json_data}}) => {
          const {quarter, year, radioValue, checkboxGroup, formData} = json_data

          setQuarter(quarter)
          setYear(year)
          setRadioValue(radioValue)
          setCheckboxGroup(checkboxGroup)

          if (Array.isArray(formData) && formData.length) {
            const newFormData = !isOnViewPage
              ? [
                  ...formData,
                  {
                    id: formData.length + 1,
                    date: moment(new Date()).format(dateFormat),
                    stockTicker: '',
                    listedOn: '',
                    totalValue: 0,
                    type: 'Long',
                  },
                ]
              : formData

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

  const onCheckboxGroupChange = (arrIndex) => (event) => {
    const newCheckboxGroup = [...checkboxGroup]
    newCheckboxGroup[arrIndex] = event.target.checked
    setCheckboxGroup(newCheckboxGroup)
  }

  const updateStateValue = (arrIndex, key, value) => {
    const newTableData = [...tableData]
    const newItem = {...tableData[arrIndex], [key]: value}
    newTableData[arrIndex] = newItem
    setTableData(newTableData)
  }

  const addTableRow = () => {
    setTableData((tableData) => [
      ...tableData,
      {
        id: tableData.length + 1,
        date: moment(new Date()).format(dateFormat),
        stockTicker: '',
        listedOn: '',
        totalValue: 0,
        type: 'Long',
      },
    ])
  }

  const deleteTableRow = (arrIndex) => () => {
    setTableData(tableData.filter((_, index) => index !== arrIndex))
  }

  const columns = [
    {
      title: '#',
      render: (text, record, index) => {
        return <div>{index + 1}</div>
      },
    },
    {
      title: 'Stock Ticker',
      dataIndex: 'stockTicker',
      ...(!isOnViewPage && {
        render: (text, record, index) => {
          return (
            <Input
              disabled={radioValue !== 3}
              value={tableData[index].stockTicker}
              onChange={(event) => updateStateValue(index, 'stockTicker', event.target.value)}
            />
          )
        },
      }),
    },
    {
      title: 'Exchange which the security is listed on',
      dataIndex: 'listedOn',
      ...(!isOnViewPage && {
        render: (text, record, index) => {
          return (
            <Input
              disabled={radioValue !== 3}
              value={tableData[index].listedOn}
              onChange={(event) => updateStateValue(index, 'listedOn', event.target.value)}
            />
          )
        },
      }),
    },
    {
      title: 'Total value on the date of accquisition/sale(SGD)',
      dataIndex: 'totalValue',
      ...(!isOnViewPage && {
        render: (text, record, index) => {
          return (
            <InputNumber
              value={tableData[index].totalValue}
              disabled={radioValue !== 3}
              style={{width: '100%'}}
              onChange={(value) => updateStateValue(index, 'totalValue', value)}
              min={0}
            />
          )
        },
      }),
    },
    {
      title: 'Long/Sell/Short',
      dataIndex: 'type',
      ...(!isOnViewPage && {
        render: (text, record, index) => {
          return (
            <Select
              disabled={radioValue !== 3}
              value={tableData[index].type}
              onChange={(value) => updateStateValue(index, 'type', value)}>
              <Option value='Long'>Long</Option>
              <Option value='Sell'>Sell</Option>
              <Option value='Short'>Short</Option>
            </Select>
          )
        },
      }),
    },
    {
      title: 'Date of sale/accquisition or other(DD/MM/YYYY)',
      dataIndex: 'date',
      ...(!isOnViewPage && {
        width: '16%',
        render: (text, record, index) => {
          return (
            <DatePicker
              disabled={radioValue !== 3}
              value={moment(tableData[index].date, dateFormat)}
              format={dateFormat}
              onChange={(_, dateString) => updateStateValue(index, 'date', dateString)}
            />
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
          <Button type='primary' disabled={radioValue !== 3} onClick={addTableRow}>
            <PlusOutlined />
          </Button>
        ) : (
          <Button type='text' danger disabled={radioValue !== 3} onClick={deleteTableRow(index)}>
            <MinusOutlined />
          </Button>
        )
      },
    })
  }

  const onSubmit = async () => {
    try {
      const validRows = tableData.filter((row) => {
        if (!row.stockTicker && !row.listedOn && !row.totalValue) {
          return false
        }

        return true
      })

      const url = formId ? `/api/compliance/${formId}/` : '/api/compliance/'

      const {data} = await axios({
        method: formId ? 'PATCH' : 'POST',
        url,
        data: {
          typ: 'c',
          data:
            radioValue !== 3
              ? {quarter, year, radioValue, checkboxGroup, formData: []}
              : {quarter, year, radioValue, checkboxGroup, formData: validRows},
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
            <Link to='/compliance/c'>
              <MenuOutlined /> {formC.name} Form List
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
            {formC.name} Form
          </Breadcrumb.Item>
        </Breadcrumb>

        {isOnViewPage && (
          <Row justify='end'>
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
          {formText.title}{' '}
          <span>
            {formText.quarterYearSelectTitle}{' '}
            <Select value={quarter} disabled={isOnViewPage} style={{width: 120}} onChange={setQuarter}>
              <Option value='Q1'>Q1</Option>
              <Option value='Q2'>Q2</Option>
              <Option value='Q3'>Q3</Option>
              <Option value='Q4'>Q4</Option>
            </Select>
            ,{' '}
            <Select value={year} disabled={isOnViewPage} style={{width: 120}} onChange={setYear}>
              {Array.from({length: 100}).map((_, index) => (
                <Option key={index} value={currentYear + index}>
                  {currentYear + index}
                </Option>
              ))}
            </Select>
          </span>
        </div>
        <div
          style={{
            marginTop: '10px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'inherit',
            borderTop: 'none',
          }}>
          <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
            {formText.box1.title}
          </Divider>
          <Radio.Group
            onChange={(event) => setRadioValue(event.target.value)}
            disabled={isOnViewPage}
            value={radioValue}>
            {formText.box1.radioGroupTitles.map((title, index) => {
              return (
                <Radio key={index} value={index + 1} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
                  {title}
                </Radio>
              )
            })}
          </Radio.Group>
          <div>
            <div>{formText.box1.lastRadioItemNote}</div>
            <div>
              <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: '10px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'inherit',
            borderTop: 'none',
          }}>
          <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
            {formText.box2.title}
          </Divider>
          {formText.box2.checkboxGroupTitles.map((value, index) => {
            return (
              <React.Fragment key={index}>
                <Checkbox
                  checked={checkboxGroup[index]}
                  disabled={isOnViewPage}
                  onChange={onCheckboxGroupChange(index)}>
                  {value}
                </Checkbox>
                <br />
              </React.Fragment>
            )
          })}
        </div>

        {!isOnViewPage && (
          <div style={{marginTop: '10px'}}>
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

export default EditEQTRForm
