/* eslint-disable no-shadow */
/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Checkbox, Spin, Button, Table, Row, Col, Breadcrumb, message, Divider, Select, Radio} from 'antd'
import {Link, useParams, useRouteMatch} from 'react-router-dom'
import {EditOutlined, HomeOutlined} from '@ant-design/icons'
import axios from 'axios'

const {Option} = Select

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
  },
  {
    title: 'Exchange which the security is listed on',
    dataIndex: 'listedOn',
  },
  {
    title: 'Total value on the date of accquisition/sale(SGD)',
    dataIndex: 'totalValue',
  },
  {
    title: 'Long/Sell/Short',
    dataIndex: 'type',
  },
  {
    title: 'Date of sale/accquisition or other(DD/MM/YYYY)',
    dataIndex: 'date',
  },
]

const checkBoxOptions = [
  'My personal dealing activities and those of any Related Persons are in accordance with the Rules set out in this Manual',
  'To the best of my knowledge, my personal dealing activities will not raise any conflict of interest with the Company or any of its clients',
  'I am not aware of any pending client order, current or upcoming client soliciation, in relation to my personal deadling activities',
  'My personal deadling activities do not breach any relevant holding or blackout period by the Manual',
]

const ViewEQTRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [quarter, setQuarter] = useState('Q1')
  const [radioValue, setRadioValue] = useState()
  const [tableData, setTableData] = useState([])
  const [checkboxGroup, setCheckboxGroup] = useState([false, false, false, false])
  const [isLoading, setIsLoading] = useState(true)
  const {formId} = useParams()
  const {url} = useRouteMatch()

  useEffect(() => {
    axios
      .get(`/api/compliance/${formId}/`)
      .then(({data: {json_data}}) => {
        const {quarter, year, radioValue, checkboxGroup, formData} = json_data

        setQuarter(quarter)
        setYear(year)
        setRadioValue(radioValue)
        setCheckboxGroup(checkboxGroup)

        if (Array.isArray(formData) && formData.length) {
          setTableData(formData)
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
          <Breadcrumb.Item>Employee Quarterly Trade Report Form</Breadcrumb.Item>
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

        <div>
          I declare that:{' '}
          <span>
            As of the end of{' '}
            <Select value={quarter} disabled style={{width: 120}}>
              <Option value='Q1'>Q1</Option>
              <Option value='Q2'>Q2</Option>
              <Option value='Q3'>Q3</Option>
              <Option value='Q4'>Q4</Option>
            </Select>
            , <Select value={year} disabled style={{width: 120}} />
          </span>
        </div>

        <div
          style={{
            marginTop: '10px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'inherit',
            borderTop: 'none',
          }}>
          <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
            I hereby declare that (tickbox):
          </Divider>
          <Radio.Group disabled value={radioValue}>
            <Radio value={1} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
              I have not engaged in personal account deadling
            </Radio>
            <Radio value={2} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
              I have engaged in personal account deadling, not exceeding the limit of S$10,000 (ten thousand)
            </Radio>
            <Radio value={3} style={{whiteSpace: 'break-spaces', fontSize: '16px'}}>
              I have engaged in personal account deadling, and obtained prior approval to trade on a single stock on the
              same day (i.e 24 hours) for an amount exceeding S$10,000 (ten thousand)
            </Radio>
          </Radio.Group>
          <div>
            <div>
              Comple the details below in case of personal account deadling on a single stock on the same day and
              exceeding the amount of S$10,000 (ten thousand):
            </div>
            <div>
              <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: '10px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'inherit',
            borderTop: 'none',
          }}>
          <Divider style={{position: 'relative', marginBottom: '0px', top: '-12px'}} orientation='left'>
            I hereby confirm that:
          </Divider>

          {checkBoxOptions.map((value, index) => {
            return (
              <React.Fragment key={index}>
                <Checkbox disabled checked={checkboxGroup[index]}>
                  {value}
                </Checkbox>
                <br />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </Spin>
  )
}

export default ViewEQTRForm
