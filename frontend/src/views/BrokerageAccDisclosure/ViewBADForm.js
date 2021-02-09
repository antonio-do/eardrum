/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Spin, Button, Input, Checkbox, Row, Col, Breadcrumb, message} from 'antd'
import {Link, useParams, useRouteMatch} from 'react-router-dom'
import {EditOutlined, HomeOutlined} from '@ant-design/icons'
import axios from 'axios'

const ViewBADForm = () => {
  const [hasAccounts, setHasAccounts] = useState(false)
  const [formData, setFormData] = useState([[]])
  const [isLoading, setIsLoading] = useState(true)
  const {formId} = useParams()
  const {url} = useRouteMatch()

  useEffect(() => {
    axios
      .get(`/api/compliance/${formId}/`)
      .then(({data: {json_data}}) => {
        const {hasDisclosedAccounts, formData} = json_data

        setHasAccounts(hasDisclosedAccounts)

        if (Array.isArray(formData) && formData.length) {
          setFormData(formData)
        }

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
        message.error('Error getting form, please try again!')
      })
  }, [formId])

  // const [formData, setFormData] = useState(Array.from({length: formLength}).map(() => []))

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
              that is limited to exempted securities such as bank certificates of deposit, open-end mutual fund
              shares,and Treasury obligations,and does not have discretionary brokerage capability for individual
              securities (e.g., 529 and 401(k) accounts).
            </li>
          </ul>
        </div>
        <div>
          <p>Please check one of the following and sign below:</p>
          <Checkbox disabled checked={!hasAccounts} style={{fontSize: '16px'}}>
            I do not have any accounts that must be disclosed. Iagree to notifythe CCO prior to any such account being
            opened in the future.
          </Checkbox>
          <br />
          <Checkbox disabled checked={hasAccounts} style={{fontSize: '16px'}}>
            Set forth below is a complete list of all accounts that must be disclosed (use additional formsif
            necessary).
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
            {formData.map((item, index) => {
              return (
                <Input.Group key={index} compact>
                  <Input style={{width: '50%'}} value={item.account} addonBefore={index + 1} disabled />
                  <Input style={{width: '50%'}} value={item.organization} disabled />
                </Input.Group>
              )
            })}
          </div>
        </div>
      </div>
    </Spin>
  )
}

export default ViewBADForm
