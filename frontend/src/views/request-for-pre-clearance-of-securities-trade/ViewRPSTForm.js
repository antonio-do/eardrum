/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Spin, Button, Table, Row, Col, Breadcrumb, message} from 'antd'
import {Link, useParams, useRouteMatch} from 'react-router-dom'
import {EditOutlined, HomeOutlined} from '@ant-design/icons'
import axios from 'axios'

const ViewRPSTForm = () => {
  const [formData, setFormData] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const {formId} = useParams()
  const {url} = useRouteMatch()

  const columns = [
    {
      title: 'DATE',
      dataIndex: 'date',
      width: '16%',
    },
    {
      title: 'NAME OF SECURITY',
      dataIndex: 'securityName',
      width: '12%',
    },
    {
      title: 'ACCOUNT',
      dataIndex: 'account',
      width: '14%',
    },
    {
      title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
      dataIndex: 'SHRSOrder',
      width: '14%',
    },
    {
      title: 'APPROX PRICE',
      dataIndex: 'approxPrice',
      width: '12%',
    },
    {
      title: 'SYMBOL OR CUSIP #',
      dataIndex: 'symbolOrCusipOrder',
      width: '12%',
    },
    {
      title: 'PURCHASE(P) SALE(S)',
      dataIndex: 'purchaseSale',
      width: '20%',
    },
  ]

  useEffect(() => {
    axios
      .get(`/api/compliance/${formId}/`)
      .then(({data: {json_data}}) => {
        const {formData} = json_data

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
          <Breadcrumb.Item>Request for Pre-Clearance of Securities Trade Form</Breadcrumb.Item>
        </Breadcrumb>

        <Row justify='end'>
          <Col>
            <Link to={`${url.replace('/view', '')}/edit`}>
              <Button type='primary'>
                <EditOutlined /> Edit
              </Button>
            </Link>
          </Col>
        </Row>

        <div style={{marginTop: '10px'}}>
          <Table columns={columns} dataSource={formData} pagination={false} rowKey={(record) => record.id} />
        </div>

        <div style={{marginTop: '16px'}}>
          <div>The Employee submitting this request understands and specifically represents as follows:*</div>
          <ol type='a'>
            <li>I have no inside information relating to the above-referenced issuer(s);</li>
            <li>I have not had any contact or communication with the issuer(s) in the last six months;</li>
            <li>
              I am not aware of any conflict of interest this transaction may cause with respect to any Client account
              and I am not aware of any Client account trading activity that may have occurred in the issuers of the
              above referenced securities during the past four trading days or that may now or in the near future be
              contemplated;
            </li>
            <li>
              If approval is granted, it is only good for one day and specifically the day it was approved (e.g.,
              expiring at midnight on the day of approval); and
            </li>
            <li>The securities are not being purchased in an initial public offering or private placement.</li>
          </ol>
          <div>
            <i>
              *If for any reason an employee cannot make the above required representations or has any questions in this
              area, the employee MUST contact the CCO before submitting any request for approval.
            </i>
          </div>
        </div>
      </div>
    </Spin>
  )
}

export default ViewRPSTForm
