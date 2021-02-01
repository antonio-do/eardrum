import React, {useState} from 'react'
import {Breadcrumb, Button, Input, Checkbox, Row, Col} from 'antd'
import {HomeOutlined, PlusOutlined, EditOutlined} from '@ant-design/icons'
import {Link} from 'react-router-dom'

const EditBADForm = () => {
  const [noAccountOpt, setNoAccountOpt] = useState(true)
  const [hasAccountsOpt, setHasAccountsOpt] = useState(false)
  const [formLength, setFormLength] = useState(4)
  const [formData, setFormData] = useState([
    ['abc', 'def'],
    ['123', 'las'],
    ['4tg', 'lasf'],
    ['1345', '454'],
  ])

  const onNoAccountChange = (event) => {
    setNoAccountOpt(event.target.checked)
  }

  const onHasAccountsChange = (event) => {
    setHasAccountsOpt(event.target.checked)
  }

  const addFormRow = () => {
    setFormLength((formLength) => formLength + 1)
    const newFormData = [...formData]
    newFormData.push([])
    setFormData(newFormData)
  }

  const onNumberOfAccountChange = (index) => (event) => {
    const newFormData = [...formData]
    newFormData[index][0] = event.target.value
    setFormData(newFormData)
  }

  const onPhoneNumberOfOrgChange = (index) => (event) => {
    const newFormData = [...formData]
    newFormData[index][1] = event.target.value
    setFormData(newFormData)
  }

  return (
    <div style={{padding: '32px 16px', fontSize: '16px'}}>
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
          <EditOutlined /> Edit Brokerage Account Disclosure Form
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
            that is limited to exempted securities such as bank certificates of deposit, open-end mutual fund shares,and
            Treasury obligations,and does not have discretionary brokerage capability for individual securities (e.g.,
            529 and 401(k) accounts).
          </li>
        </ul>
      </div>
      <div>
        <p>Please check one of the following and sign below:</p>
        <Checkbox onChange={onNoAccountChange} checked={noAccountOpt} style={{fontSize: '16px'}}>
          I do not have any accounts that must be disclosed. Iagree to notifythe CCO prior to any such account being
          opened in the future.
        </Checkbox>
        <br />
        <Checkbox onChange={onHasAccountsChange} checked={hasAccountsOpt} style={{fontSize: '16px'}}>
          Set forth below is a complete list of all accounts that must be disclosed (use additional formsif necessary).
        </Checkbox>
        <br />
        The CCO willbe sending a letterrequesting duplicate confirmsand statements foreach of the accountsdisclosed
        below.
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
                    value={item[0]}
                    addonBefore={index + 1}
                    onChange={onNumberOfAccountChange(index)}
                  />
                  <Input style={{width: '50%'}} value={item[1]} onChange={onPhoneNumberOfOrgChange(index)} />
                </Input.Group>
              )
            })}
          </Col>
          <Col>
            <Button type='primary' icon={<PlusOutlined />} onClick={addFormRow} />
          </Col>
        </Row>
      </div>
      <div style={{marginTop: '16px'}}>
        <Checkbox style={{fontSize: '16px'}} checked={true}>
          I have read and understand the Personal Securities Trading Policies referenced in the Code of Ethicsand
          Compliance Manual, and I agree to abide by such policiesduring the term of my employment..
        </Checkbox>
        <Row justify='end' gutter={10}>
          <Col>
            <Button type='primary' onClick={() => console.log(formData)}>
              Submit
            </Button>
          </Col>
          <Col>
            <Button type='text' danger>
              Delete
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default EditBADForm
