/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Button, Input, Checkbox, Row, Col, message, Spin, Popconfirm} from 'antd'
import {HomeOutlined, PlusOutlined, EditOutlined, MinusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import messages from '../../messages'

const {formA} = messages.compliance
const formText = formA.text

const defaultFormData = Array.from({length: 4}).map(() => ({}))

const EditBADForm = () => {
  const [noAccountOpt, setNoAccountOpt] = useState(false)
  const [hasAccountsOpt, setHasAccountsOpt] = useState(false)
  const [shouldAgree, setShouldAgree] = useState(false)
  const [formData, setFormData] = useState([[]])
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const {formId} = useParams()
  const {url} = useRouteMatch()
  const isOnViewPage = formId && url.includes('/view')

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

  useEffect(() => {
    if (formId) {
      setIsLoading(true)
      axios
        .get(`/api/compliance/${formId}/`)
        .then(({data: {json_data}}) => {
          const {hasDisclosedAccounts, formData} = json_data

          if (hasDisclosedAccounts) {
            setHasAccountsOpt(true)
          } else {
            setNoAccountOpt(true)
          }

          if (Array.isArray(formData) && formData.length) {
            const newFormData = !isOnViewPage ? [...formData, {}] : formData

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

  const onSubmit = async () => {
    if (noAccountOpt && hasAccountsOpt) {
      message.error('You can only check 1 option!')
      return
    }

    if (!noAccountOpt && !hasAccountsOpt) {
      message.error('Please check one of the following option!')
      return
    }

    if (!shouldAgree) {
      message.error('Please check "I have read and understand..." to continue!')
      return
    }

    try {
      const invalidRow = formData.find(
        (row) => (row.account && !row.organization) || (!row.account && row.organization)
      )

      if (invalidRow) {
        message.error('Either none or all the fields of the row must be filled!')
        return
      }

      const url = formId ? `/api/compliance/${formId}/` : '/api/compliance/'

      const {data} = await axios({
        method: formId ? 'PATCH' : 'POST',
        url,
        data: {
          typ: 'a',
          data: noAccountOpt
            ? {hasDisclosedAccounts: false, formData: []}
            : {hasDisclosedAccounts: true, formData: formData.filter((row) => row.account && row.organization)},
        },
      })

      if (data.id) {
        message.success('Brokerage Account Disclosure Form was submitted successfully!', 1)
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
        <div>
          <p>{formText.radioGroup.title}</p>
          <Checkbox
            disabled={isOnViewPage}
            onChange={(event) => {
              setNoAccountOpt(event.target.checked)
            }}
            checked={noAccountOpt}
            style={{fontSize: '16px'}}>
            {formText.radioGroup.option1}
          </Checkbox>
          <br />
          <Checkbox
            disabled={isOnViewPage}
            onChange={(event) => {
              setHasAccountsOpt(event.target.checked)
            }}
            checked={hasAccountsOpt}
            style={{fontSize: '16px'}}>
            {formText.radioGroup.option2.content}
          </Checkbox>
          <br />
          {formText.radioGroup.option2.note}
        </div>
        <div style={{marginTop: '16px'}}>
          <Row>
            {formText.formTitles.map((title) => {
              return (
                <Col span={12} key={title}>
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
                    <Input.Group compact>
                      <Input
                        style={{width: '50%'}}
                        disabled={!hasAccountsOpt || isOnViewPage}
                        addonBefore={index + 1}
                        value={item.account}
                        onChange={onInputValueChange(index, 'account')}
                      />
                      <Input
                        style={{width: '50%'}}
                        value={item.organization}
                        disabled={!hasAccountsOpt || isOnViewPage}
                        onChange={onInputValueChange(index, 'organization')}
                      />
                    </Input.Group>
                  </Col>
                  {!isOnViewPage &&
                    (index === 0 ? (
                      <Col>
                        <Button
                          type='primary'
                          icon={<PlusOutlined />}
                          disabled={!hasAccountsOpt}
                          onClick={addFormRow}
                        />
                      </Col>
                    ) : (
                      <Col>
                        <Button
                          type='text'
                          danger
                          disabled={!hasAccountsOpt}
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
            <Checkbox
              style={{fontSize: '16px'}}
              checked={shouldAgree}
              onChange={(event) => setShouldAgree(event.target.checked)}>
              {formText.agreeToPolicy}
            </Checkbox>
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

export default EditBADForm
