/* eslint-disable prefer-promise-reject-errors */
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
  message,
  InputNumber,
  Radio,
  Spin,
  Form,
  Table,
} from 'antd'
import {MenuOutlined, EditOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import messages from '../../messages'
import routes from '../../routes'
import '../../styles/formC.css'
import DeleteFormButton from '../DeleteFormButton'
import CheckSquareOutlined from '../CheckSquareOutlined'

const complianceRoutes = routes.compliance
const formC = messages.compliance.c
const formText = formC.text

const {Option} = Select

const dateFormat = 'DD/MM/YYYY'
const defaultRow = {
  date: moment(new Date()).format(dateFormat),
  stockTicker: '',
  listedOn: '',
  totalValue: 0,
  type: 'Long',
}
const defaultData = Array.from({length: 2}).map((_, index) => {
  return {id: new Date().getTime() + index, ...defaultRow}
})

const EditEQTRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [quarter, setQuarter] = useState('Q1')
  const [radioValue, setRadioValue] = useState()
  const history = useHistory()
  const {formId} = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const {url} = useRouteMatch()
  const isOnViewPage = formId && url.includes('/view')
  const [tableData, setTableData] = useState(!formId || !isOnViewPage ? defaultData : [])
  const [form] = Form.useForm()

  const isInputDisabled = radioValue !== 3
  const inputRule = {required: radioValue === 3, message: ''}

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(complianceRoutes.detailsURL(formId))
        .then(({data: {json_data}}) => {
          const {quarter, year, radioValue, formData} = json_data

          setQuarter(quarter)
          setYear(year)
          setRadioValue(radioValue)
          form.setFieldsValue({radioGroup: radioValue})

          if (Array.isArray(formData)) {
            const newFormData = [...formData]

            newFormData.forEach((row, index) => {
              Object.entries(row).forEach(([key, value]) => {
                form.setFieldsValue({[`${key}-${index}`]: value})
              })
            })

            if (!isOnViewPage) {
              newFormData.push({id: new Date().getTime(), ...defaultRow})
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

  const updateStateValue = (arrIndex, key, value) => {
    const newTableData = [...tableData]
    const newItem = {...tableData[arrIndex], [key]: value}
    newTableData[arrIndex] = newItem
    setTableData(newTableData)
  }

  const addTableRow = () => {
    setTableData((tableData) => [...tableData, {id: new Date().getTime(), ...defaultRow}])
  }

  const deleteTableRow = (arrIndex) => () => {
    setTableData(tableData.filter((_, index) => index !== arrIndex))
  }

  const getFormData = () => {
    return {
      typ: 'c',
      data:
        radioValue !== 3 ? {quarter, year, radioValue, formData: []} : {quarter, year, radioValue, formData: tableData},
    }
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
            <Form.Item name={`stockTicker-${index}`} style={{margin: 0}} rules={[inputRule]}>
              <Input
                disabled={isInputDisabled}
                value={tableData[index].stockTicker}
                onChange={(event) => updateStateValue(index, 'stockTicker', event.target.value)}
              />
            </Form.Item>
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
            <Form.Item name={`listedOn-${index}`} style={{margin: 0}} rules={[inputRule]}>
              <Input
                disabled={isInputDisabled}
                value={tableData[index].listedOn}
                onChange={(event) => updateStateValue(index, 'listedOn', event.target.value)}
              />
            </Form.Item>
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
            <Form.Item name={`totalValue-${index}`} style={{margin: 0}} rules={[inputRule]}>
              <InputNumber
                value={tableData[index].totalValue}
                disabled={isInputDisabled}
                style={{width: '100%'}}
                onChange={(value) => updateStateValue(index, 'totalValue', value)}
                min={0}
              />
            </Form.Item>
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
              disabled={isInputDisabled}
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
              disabled={isInputDisabled}
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
          <Button type='primary' disabled={isInputDisabled} onClick={addTableRow}>
            <PlusOutlined />
          </Button>
        ) : (
          <Button type='text' danger disabled={isInputDisabled} onClick={deleteTableRow(index)}>
            <MinusOutlined />
          </Button>
        )
      },
    })
  }

  const createForm = async () => {
    try {
      await form.validateFields()
      const {data} = await axios({
        method: 'POST',
        url: complianceRoutes.list(),
        data: getFormData(),
      })

      if (data.id) {
        history.push(complianceRoutes.formListView('c'))
        message.success('Employee Quarterly Trade Report was submitted successfully!', 1)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!')
      }
    }
  }

  const updateForm = async () => {
    try {
      await form.validateFields()
      const {data} = await axios({
        method: 'PATCH',
        url: complianceRoutes.detailsURL(formId),
        data: getFormData(),
      })

      if (data.id) {
        history.push(complianceRoutes.formListView('c'))
        message.success('Employee Quarterly Trade Report was updated successfully!', 1)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!')
      }
    }
  }

  const onDelete = async () => {
    try {
      const res = await axios.delete(complianceRoutes.detailsURL(formId))

      if (res.status === 204) {
        history.push(complianceRoutes.formListView('c'))
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
          border: '1px solid rgba(156, 163, 175, 50%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}>
        <Breadcrumb style={{marginBottom: '10px'}}>
          <Breadcrumb.Item>
            <Link to={complianceRoutes.formListView('c')}>
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

        <Form layout='vertical' form={form}>
          <div>
            {formText.title}{' '}
            <span>
              {formText.quarterYearSelectTitle}{' '}
              <Select value={quarter} disabled={isOnViewPage} style={{width: 120}} onChange={setQuarter}>
                {formText.quarters.map((q) => {
                  return <Option value={q}>{q}</Option>
                })}
              </Select>
              ,{' '}
              <Select value={year} disabled={isOnViewPage} style={{width: 120}} onChange={setYear}>
                {Array.from({length: 3}).map((_, index) => (
                  <Option key={index} value={year + index - 1}>
                    {year + index - 1}
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
              borderColor: 'lightgray',
              borderTop: 'none',
            }}>
            <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
              {formText.box1.title}
            </Divider>
            <Form.Item
              name='radioGroup'
              style={{margin: 0}}
              rules={[
                {
                  required: true,
                  message: 'Please choose 1 option!',
                },
              ]}>
              <Radio.Group
                onChange={(event) => setRadioValue(event.target.value)}
                disabled={isOnViewPage}
                value={radioValue}>
                {formText.box1.radioGroupTitles.map((title, index) => {
                  return (
                    <Radio key={index} value={index + 1} style={{whiteSpace: 'break-spaces'}}>
                      {title}
                    </Radio>
                  )
                })}
              </Radio.Group>
            </Form.Item>

            <div>
              <div>{formText.box1.lastRadioItemNote}</div>
              <div className='hide-message'>
                <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: '24px',
              padding: '6px',
              paddingTop: 0,
              border: '1px solid transparent',
              borderColor: 'lightgray',
              borderTop: 'none',
            }}>
            <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
              {formText.box2.title}
            </Divider>

            <CheckSquareOutlined titles={formText.box2.checkboxGroupTitles} />
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '6px',
              paddingTop: 0,
              border: '1px solid transparent',
              borderColor: 'lightgray',
              borderTop: 'none',
            }}>
            <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
              {formText.box3.title}
            </Divider>

            <CheckSquareOutlined titles={formText.box3.checkboxGroupTitles} />
          </div>
          <div style={{marginTop: '10px'}}>
            <strong>{formText.confirm}</strong>
          </div>
          {!isOnViewPage && (
            <div style={{marginTop: '10px'}}>
              <Row justify='end' gutter={10}>
                {formId ? (
                  <>
                    <Col>
                      <Button type='primary' onClick={updateForm}>
                        Update
                      </Button>
                    </Col>
                    <Col>
                      <DeleteFormButton onDelete={onDelete} />
                    </Col>
                  </>
                ) : (
                  <Col>
                    <Button type='primary' onClick={createForm}>
                      Submit
                    </Button>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Form>
      </div>
    </Spin>
  )
}

export default EditEQTRForm
