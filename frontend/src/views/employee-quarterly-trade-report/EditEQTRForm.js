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
  Checkbox,
  message,
  InputNumber,
  Radio,
  Spin,
  Popconfirm,
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

const checkboxGroup1Options = formText.box2.checkboxGroupTitles.map((name, index) => ({label: name, value: index}))
const checkboxGroup2Options = formText.box3.checkboxGroupTitles.map((name, index) => ({label: name, value: index}))
const defaultCheckboxGroup1Values = Array.from({length: formText.box2.checkboxGroupTitles.length}).map(
  (_, index) => index
)
const defaultCheckboxGroup2Values = Array.from({length: formText.box3.checkboxGroupTitles.length}).map(
  (_, index) => index
)

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
  const [confirmationStatements1, setConfirmationStatements1] = useState(defaultCheckboxGroup1Values)
  const [confirmationStatements2, setConfirmationStatements2] = useState(defaultCheckboxGroup2Values)
  const [tableData, setTableData] = useState(!formId || !isOnViewPage ? defaultData : [])
  const [form] = Form.useForm()

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(`/api/compliance/${formId}/`)
        .then(({data: {json_data}}) => {
          const {quarter, year, radioValue, confirmationStatements1, confirmationStatements2, formData} = json_data

          setQuarter(quarter)
          setYear(year)

          setConfirmationStatements1(confirmationStatements1)
          form.setFieldsValue({
            checkboxGroup1: confirmationStatements1,
          })

          setConfirmationStatements2(confirmationStatements2)
          form.setFieldsValue({
            checkboxGroup2: confirmationStatements2,
          })

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
    } else {
      form.setFieldsValue({
        checkboxGroup1: defaultCheckboxGroup1Values,
      })
      form.setFieldsValue({
        checkboxGroup2: defaultCheckboxGroup2Values,
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
            <Form.Item
              name={`stockTicker-${index}`}
              style={{margin: 0}}
              rules={[{required: radioValue === 3, message: ''}]}>
              <Input
                disabled={radioValue !== 3}
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
            <Form.Item
              name={`listedOn-${index}`}
              style={{margin: 0}}
              rules={[{required: radioValue === 3, message: ''}]}>
              <Input
                disabled={radioValue !== 3}
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
            <Form.Item
              name={`totalValue-${index}`}
              style={{margin: 0}}
              rules={[{required: radioValue === 3, message: ''}]}>
              <InputNumber
                value={tableData[index].totalValue}
                disabled={radioValue !== 3}
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

  const createForm = async () => {
    try {
      await form.validateFields()
      const {data} = await axios({
        method: 'POST',
        url: complianceRoutes.list(),
        data: {
          typ: 'c',
          data:
            radioValue !== 3
              ? {quarter, year, radioValue, confirmationStatements1, confirmationStatements2, formData: []}
              : {quarter, year, radioValue, confirmationStatements1, confirmationStatements2, formData: tableData},
        },
      })

      if (data.id) {
        history.push('/compliance/c')
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
        data: {
          typ: 'c',
          data:
            radioValue !== 3
              ? {quarter, year, radioValue, confirmationStatements1, confirmationStatements2, formData: []}
              : {quarter, year, radioValue, confirmationStatements1, confirmationStatements2, formData: tableData},
        },
      })

      if (data.id) {
        history.push('/compliance/c')
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
        history.push('/compliance/c')
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

        <Form layout='vertical' form={form}>
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
                    <Radio key={index} value={index + 1} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
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

            <Form.Item
              name='checkboxGroup1'
              rules={[
                {
                  validator() {
                    if (confirmationStatements1.length === formText.box2.checkboxGroupTitles.length) {
                      return Promise.resolve()
                    }

                    return Promise.reject('Please check all the checkboxes to continue!')
                  },
                },
              ]}>
              <Checkbox.Group
                disabled={isOnViewPage}
                options={checkboxGroup1Options}
                value={confirmationStatements1}
                onChange={(checkedList) => setConfirmationStatements1(checkedList)}
              />
            </Form.Item>
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

            <Form.Item
              name='checkboxGroup2'
              rules={[
                {
                  validator() {
                    if (confirmationStatements2.length === formText.box3.checkboxGroupTitles.length) {
                      return Promise.resolve()
                    }

                    return Promise.reject('Please check all the checkboxes to continue!')
                  },
                },
              ]}>
              <Checkbox.Group
                disabled={isOnViewPage}
                options={checkboxGroup2Options}
                value={confirmationStatements2}
                onChange={(checkedList) => setConfirmationStatements2(checkedList)}
              />
            </Form.Item>
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
