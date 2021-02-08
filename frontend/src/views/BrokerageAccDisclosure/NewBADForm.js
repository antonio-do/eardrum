/* eslint-disable no-shadow */
import React, {useState} from 'react'
import {Breadcrumb, Button, Input, Checkbox, Row, Col, message} from 'antd'
import {HomeOutlined, PlusOutlined} from '@ant-design/icons'
import {Link, useHistory} from 'react-router-dom'
import axios from 'axios'

const BrokerageAccountDisclosureForm = () => {
  const [hasNoAccount, setHasNoAccount] = useState(false)
  const [hasAccountsOpt, setHasAccountsOpt] = useState(false)
  const [shouldAgree, setShouldAgree] = useState(false)
  const [formData, setFormData] = useState(Array.from({length: 4}).map(() => ({})))
  const history = useHistory()

  const addFormRow = () => {
    const newFormData = [...formData]
    newFormData.push({})
    setFormData(newFormData)
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newFormData = [...formData]
    newFormData[arrIndex][key] = event.target.value
    setFormData(newFormData)
  }

  const onSubmit = async () => {
    if (hasNoAccount && hasAccountsOpt) {
      message.error('You can only check 1 option!')
      return
    }

    if (!hasNoAccount && !hasAccountsOpt) {
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

      const {data} = await axios.post('/api/compliance/', {
        typ: 'a',
        data: hasNoAccount
          ? {hasDisclosedAccounts: false, formData: []}
          : {hasDisclosedAccounts: true, formData: formData.filter((row) => row.account && row.organization)},
      })

      if (data.id) {
        message.success('Brokerage Account Disclosure Form has been created successfully!', 1)
        history.push('/compliment')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  return (
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
          <Link to='/compliment'>Compliment</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <PlusOutlined /> New Brokerage Account Disclosure Form
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
            setHasNoAccount(event.target.checked)
          }}
          checked={hasNoAccount}
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
          Set forth below is a complete list of all accounts that must be disclosed (use additional forms if necessary).
        </Checkbox>
        <br />
        The CCO will be sending a letter requesting duplicate confirms and statements foreach of the accounts disclosed
        below.
      </div>
      <div style={{marginTop: '16px'}}>
        <Row>
          <Col span={11}>
            <div>Name and Number of Account</div>
          </Col>
          <Col span={12} style={{marginLeft: '16px'}}>
            <div>Name and Phone Number of Organization Where Account is Located</div>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={23}>
            {Array.from({length: 4}).map((_, index) => {
              return (
                <Input.Group key={index} compact>
                  <Input
                    style={{width: '50%'}}
                    disabled={!hasAccountsOpt}
                    addonBefore={index + 1}
                    onChange={onInputValueChange(index, 'account')}
                  />
                  <Input
                    style={{width: '50%'}}
                    disabled={!hasAccountsOpt}
                    onChange={onInputValueChange(index, 'organization')}
                  />
                </Input.Group>
              )
            })}
          </Col>
          <Col span={1}>
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
        <Row justify='end'>
          <Col span={4}>
            <Button type='primary' onClick={onSubmit}>
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default BrokerageAccountDisclosureForm
