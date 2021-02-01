import React from 'react'
import {Button, Input, Checkbox, Row, Col, Breadcrumb} from 'antd'
import {Link, useRouteMatch} from 'react-router-dom'
import {EditOutlined, HomeOutlined} from '@ant-design/icons'

const ViewBADForm = () => {
  const {url} = useRouteMatch()
  const data = [
    ['abc', 'def'],
    ['123', 'las'],
    ['4tg', 'lasf'],
    ['1345', '454'],
  ]

  // const [formData, setFormData] = useState(Array.from({length: formLength}).map(() => []))

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
        <Breadcrumb.Item>Brokerage Account Disclosure Form</Breadcrumb.Item>
      </Breadcrumb>
      <Row justify='end'>
        <Col>
          <Link to={`${url}/edit`}>
            <Button type='primary'>
              <EditOutlined /> Edit
            </Button>
          </Link>
        </Col>
      </Row>
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
        <Checkbox disabled checked={true} style={{fontSize: '16px'}}>
          I do not have any accounts that must be disclosed. Iagree to notifythe CCO prior to any such account being
          opened in the future.
        </Checkbox>
        <br />
        <Checkbox disabled checked={false} style={{fontSize: '16px'}}>
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
        <div>
          {data.map((item, index) => {
            return (
              <Input.Group key={index} compact>
                <Input style={{width: '50%'}} value={item[0]} addonBefore={index + 1} disabled />
                <Input style={{width: '50%'}} value={item[1]} disabled />
              </Input.Group>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ViewBADForm
