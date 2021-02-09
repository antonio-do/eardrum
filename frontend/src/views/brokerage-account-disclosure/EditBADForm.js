/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Button, Input, Checkbox, Row, Col, message, Spin, Popconfirm} from 'antd'
import {HomeOutlined, PlusOutlined, EditOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams} from 'react-router-dom'
import axios from 'axios'

const EditBADForm = () => {
  const [noAccountOpt, setNoAccountOpt] = useState(false)
  const [hasAccountsOpt, setHasAccountsOpt] = useState(false)
  const [shouldAgree, setShouldAgree] = useState(false)
  const [formData, setFormData] = useState(Array.from({length: 4}).map(() => ({})))
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const {formId} = useParams()

  const addFormRow = () => {
    setFormData([...formData, {}])
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
            setFormData(formData)
            // addFormRow()
          }

          setIsLoading(false)
        })
        .catch((err) => {
          console.log(err)
          message.error('Error getting form, please try again!')
        })
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
            <EditOutlined /> {formId ? 'Edit' : 'New'} Brokerage Account Disclosure Form
          </Breadcrumb.Item>
        </Breadcrumb>
        <p>
          Every employee must disclose to the CCO any and all brokerage accounts in the name of the employee, over which
          the employee exercises discretion (expressor in fact) orin which the employee has an interest.
        </p>
        <div>
          Disclosure is not required for any account:
          <ul>
            <li>
              over which the employee has no control or discretionary trading authority (including Managed Accounts), or
            </li>
            <li>
              used exclusively for trading in commodities and futures contracts and do not have discretionary brokerage
              capability for individual securities ;or
            </li>
            <li>
              that is limited to exempted securities such as bank certificates of deposit, open-end mutual fund shares,
              and Treasury obligations,and does not have discretionary brokerage capability for individual securities
              (e.g., 529 and 401(k) accounts).
            </li>
          </ul>
        </div>
        <div>
          <p>Please check one of the following and sign below:</p>
          <Checkbox
            onChange={(event) => {
              setNoAccountOpt(event.target.checked)
            }}
            checked={noAccountOpt}
            style={{fontSize: '16px'}}>
            I do not have any accounts that must be disclosed. I agree to notify the CCO prior to any such account being
            opened in the future.
          </Checkbox>
          <br />
          <Checkbox
            onChange={(event) => {
              setHasAccountsOpt(event.target.checked)
            }}
            checked={hasAccountsOpt}
            style={{fontSize: '16px'}}>
            Set forth below is a complete list of all accounts that must be disclosed (use additional forms if
            necessary).
          </Checkbox>
          <br />
          The CCO will be sending a letter requesting duplicate confirms and statements foreach of the accounts
          disclosed below.
        </div>
        <div style={{marginTop: '16px'}}>
          <Row>
            <Col span={12}>
              <div>Name and Number of Account</div>
            </Col>
            <Col span={12}>
              <div>Name and Phone Number of Organization Where Account is Located</div>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={22}>
              {formData.map((item, index) => {
                return (
                  <Input.Group key={index} compact>
                    <Input
                      style={{width: '50%'}}
                      disabled={!hasAccountsOpt}
                      addonBefore={index + 1}
                      value={item.account}
                      onChange={onInputValueChange(index, 'account')}
                    />
                    <Input
                      style={{width: '50%'}}
                      value={item.organization}
                      disabled={!hasAccountsOpt}
                      onChange={onInputValueChange(index, 'organization')}
                    />
                  </Input.Group>
                )
              })}
            </Col>
            <Col>
              <Button type='primary' icon={<PlusOutlined />} disabled={!hasAccountsOpt} onClick={addFormRow} />
            </Col>
          </Row>
        </div>
        <div style={{marginTop: '16px'}}>
          <Checkbox
            style={{fontSize: '16px'}}
            checked={shouldAgree}
            onChange={(event) => setShouldAgree(event.target.checked)}>
            I have read and understand the Personal Securities Trading Policies referenced in the Code of Ethicsand
            Compliance Manual, and I agree to abide by such policiesduring the term of my employment..
          </Checkbox>
          <Row justify='end' gutter={10}>
            <Col>
              <Button type='primary' onClick={onSubmit}>
                Submit
              </Button>
            </Col>
            {formId && (
              <Col>
                <Popconfirm title='Are you sure to delete this form?' onConfirm={onDelete} okText='Yes' cancelText='No'>
                  <Button type='link' danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </Spin>
  )
}

export default EditBADForm
