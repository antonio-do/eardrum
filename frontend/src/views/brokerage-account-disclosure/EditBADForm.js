/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Button, Input, Checkbox, Row, Col, message, Spin, Popconfirm, Radio, Form} from 'antd'
import {MenuOutlined, PlusOutlined, EditOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import messages from '../../messages'
import routes from '../../routes'
import '../../styles/formA.css'

const formA = messages.compliance.a
const complianceRoutes = routes.compliance
const formText = formA.text

const dateFormat = 'DD/MM/YYYY'

const defaultFormData = Array.from({length: 4}).map(() => ({}))

const EditBADForm = () => {
  const [shouldAgree, setShouldAgree] = useState(false)
  const [formData, setFormData] = useState([[]])
  const [isLoading, setIsLoading] = useState(false)
  const [submissionDate, setSubmissionDate] = useState()
  const [radioOptionValue, setRadioOptionValue] = useState()
  const history = useHistory()
  const {formId} = useParams()
  const {url} = useRouteMatch()
  const isOnViewPage = formId && url.includes('/view')
  const [form] = Form.useForm()

  const addFormRow = () => {
    setFormData([...formData, {}])
  }

  const deleteFormRow = (arrIndex) => () => {
    setFormData(formData.filter((_, index) => index !== arrIndex))
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newFormData = [...formData]
    const newItem = {...formData[arrIndex], [key]: event.target.value}
    newFormData[arrIndex] = newItem
    setFormData(newFormData)
  }

  const onRadioValueChange = (event) => {
    setRadioOptionValue(event.target.value)
  }

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(complianceRoutes.detailsURL(formId))
        .then(({data: {json_data}}) => {
          const {hasDisclosedAccounts, submissionDate, formData} = json_data
          setSubmissionDate(submissionDate)

          if (hasDisclosedAccounts) {
            form.setFieldsValue({radioGroup: 2})
            setRadioOptionValue(2)
          } else {
            setRadioOptionValue(1)
            form.setFieldsValue({radioGroup: 1})
          }

          if (Array.isArray(formData) && formData.length) {
            const newFormData = [...formData]

            newFormData.forEach((row, index) => {
              Object.entries(row).forEach(([key, value]) => {
                form.setFieldsValue({[`${key}-${index}`]: value})
              })
            })

            if (!isOnViewPage) {
              newFormData.push({})
            }

            setFormData(newFormData)
          }

          setIsLoading(false)
        })
        .catch((err) => {
          console.log(err)
          message.error('Error getting form, please try again!')
        })
    } else {
      setFormData(defaultFormData)
    }
  }, [formId])

  const createForm = async () => {
    try {
      await form.validateFields()
      const newSubmissionDate = moment(new Date()).format(dateFormat)
      const {data} = await axios({
        method: 'POST',
        url: complianceRoutes.list(),
        data: {
          typ: 'a',
          data:
            radioOptionValue === 1
              ? {hasDisclosedAccounts: false, submissionDate: newSubmissionDate, formData: []}
              : {
                  hasDisclosedAccounts: true,
                  submissionDate: newSubmissionDate,
                  formData: formData.filter((row) => row.firmName && row.accountName && row.accountNumber),
                },
        },
      })

      if (data.id) {
        message.success('Brokerage Account Disclosure Form was created successfully!', 1)
        history.push('/compliance')
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
          typ: 'a',
          data:
            radioOptionValue === 1
              ? {hasDisclosedAccounts: false, submissionDate, formData: []}
              : {
                  hasDisclosedAccounts: true,
                  submissionDate,
                  formData: formData.filter((row) => row.firmName && row.accountName && row.accountNumber),
                },
        },
      })

      if (data.id) {
        message.success('Brokerage Account Disclosure Form was updated successfully!', 1)
        history.push('/compliance')
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
            <Link to='/compliance/a'>
              <MenuOutlined /> {formA.name} Form List
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
            {formA.name} Form
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

        <p>{formText.overview}</p>
        <div>
          {formText.list.tile}
          <ul>
            {formText.list.items.map((item) => {
              return <li key={item}>{item}</li>
            })}
          </ul>
        </div>
        <Form layout='vertical' form={form}>
          <div>
            <Form.Item
              style={{fontSize: '16px', margin: 0}}
              name='radioGroup'
              label={formText.radioGroup.title}
              rules={[{required: true, message: 'Please check 1 option!'}]}>
              <Radio.Group disabled={isOnViewPage} onChange={onRadioValueChange} value={radioOptionValue}>
                <Radio value={1} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
                  {formText.radioGroup.option1}
                </Radio>
                <Radio value={2} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
                  {formText.radioGroup.option2.content}
                </Radio>
              </Radio.Group>
            </Form.Item>
            <div>{formText.radioGroup.option2.note}</div>
          </div>
          <div style={{marginTop: '16px'}}>
            <Row style={{marginBottom: '10px'}}>
              {formText.formTitles.map((title) => {
                return (
                  <Col span={8} key={title}>
                    {title}
                  </Col>
                )
              })}
            </Row>
            <Row gutter={10}>
              {formData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <Col span={isOnViewPage ? 24 : 22}>
                      <Row className='hide-message'>
                        <Col span={8}>
                          <Form.Item
                            name={`firmName-${index}`}
                            style={{margin: 0}}
                            rules={[{required: radioOptionValue === 2, message: ''}]}>
                            <Input
                              disabled={radioOptionValue !== 2 || isOnViewPage}
                              addonBefore={index + 1}
                              value={item.firmName}
                              onChange={onInputValueChange(index, 'firmName')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={`accountName-${index}`}
                            style={{margin: 0}}
                            rules={[{required: radioOptionValue === 2, message: ''}]}>
                            <Input
                              value={item.accountName}
                              disabled={radioOptionValue !== 2 || isOnViewPage}
                              onChange={onInputValueChange(index, 'accountName')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={`accountNumber-${index}`}
                            style={{margin: 0}}
                            rules={[{required: radioOptionValue === 2, message: ''}]}>
                            <Input
                              value={item.accountNumber}
                              disabled={radioOptionValue !== 2 || isOnViewPage}
                              onChange={onInputValueChange(index, 'accountNumber')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    {!isOnViewPage &&
                      (index === 0 ? (
                        <Col>
                          <Button
                            type='primary'
                            icon={<PlusOutlined />}
                            disabled={radioOptionValue !== 2}
                            onClick={addFormRow}
                          />
                        </Col>
                      ) : (
                        <Col>
                          <Button
                            type='text'
                            danger
                            disabled={radioOptionValue !== 2}
                            icon={<MinusOutlined />}
                            onClick={deleteFormRow(index)}
                          />
                        </Col>
                      ))}
                  </React.Fragment>
                )
              })}
            </Row>
          </div>
          {!isOnViewPage && (
            <div style={{marginTop: '16px'}}>
              <Form.Item
                name='policyCheckbox'
                rules={[
                  {message: 'Please check the checkbox to continute!'},
                  {
                    validator() {
                      if (shouldAgree) {
                        return Promise.resolve()
                      }

                      return Promise.reject('Please check the checkbox to continue!')
                    },
                  },
                ]}>
                <Checkbox
                  style={{fontSize: '16px'}}
                  checked={shouldAgree}
                  onChange={(event) => setShouldAgree(event.target.checked)}>
                  {formText.agreeToPolicy}
                </Checkbox>
              </Form.Item>

              <Row justify='end' gutter={10}>
                {formId ? (
                  <>
                    <Col>
                      <Form.Item>
                        <Button type='primary' onClick={updateForm}>
                          Update
                        </Button>
                      </Form.Item>
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
                    <Form.Item>
                      <Button type='primary' onClick={createForm}>
                        Submit
                      </Button>
                    </Form.Item>
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

export default EditBADForm
