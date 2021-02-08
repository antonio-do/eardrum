/* eslint-disable no-shadow */
import React, {useState} from 'react'
import {DatePicker, Table, Breadcrumb, Button, Input, Row, Col, message} from 'antd'
import {HomeOutlined, PlusOutlined} from '@ant-design/icons'
import {Link, useHistory} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'

const dateFormat = 'DD/MM/YYYY'
const defaultData = Array.from({length: 3}).map((_, index) => {
  return {
    id: index + 1,
    date: moment(new Date()).format(dateFormat),
    securityName: '',
    account: '',
    SHRSOrder: '',
    approxPrice: '',
    symbolOrCusipOrder: '',
    purchaseSale: '',
  }
})

const NewRPSTForm = () => {
  const [tableData, setTableData] = useState(defaultData)
  const history = useHistory()

  const onDateChange = (arrIndex) => (_, dateString) => {
    const newTableData = [...tableData]
    newTableData[arrIndex].date = dateString
    setTableData(newTableData)
  }

  const addTableRow = () => {
    const newFormData = [...tableData]
    newFormData.push({
      id: newFormData.length + 1,
      date: moment(new Date()).format(dateFormat),
      securityName: '',
      account: '',
      SHRSOrder: '',
      approxPrice: '',
      symbolOrCusipOrder: '',
      purchaseSale: '',
    })
    setTableData(newFormData)
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newTableData = [...tableData]
    newTableData[arrIndex][key] = event.target.value
    setTableData(newTableData)
  }

  const onSubmit = async () => {
    try {
      const formData = tableData.filter((row) => {
        const rowClone = {...row}
        delete rowClone.date
        delete rowClone.id
        return !Object.values(rowClone).every((val) => !val)
      })

      const {data} = await axios.post('/api/compliance/', {
        typ: 'd',
        data: {formData},
      })

      if (data.id) {
        message.success('Request for Pre-Clearance of Securities Trade was created successfully!', 1)
        history.push('/compliment')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  const columns = [
    {
      title: 'DATE',
      dataIndex: 'date',
      width: '16%',
      render: (text, record, index) => {
        return (
          <DatePicker
            defaultValue={moment(new Date(), dateFormat)}
            format={dateFormat}
            onChange={onDateChange(index)}
          />
        )
      },
    },
    {
      title: 'NAME OF SECURITY',
      dataIndex: 'securityName',
      width: '12%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'securityName')} />
      },
    },
    {
      title: 'ACCOUNT',
      dataIndex: 'account',
      width: '14%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'account')} />
      },
    },
    {
      title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
      dataIndex: 'SHRSOrder',
      width: '14%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'SHRSOrder')} />
      },
    },
    {
      title: 'APPROX PRICE',
      dataIndex: 'approxPrice',
      width: '12%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'approxPrice')} />
      },
    },
    {
      title: 'SYMBOL OR CUSIP #',
      dataIndex: 'symbolOrCusipOrder',
      width: '12%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'symbolOrCusipOrder')} />
      },
    },
    {
      title: 'PURCHASE(P) SALE(S)',
      dataIndex: 'purchaseSale',
      width: '20%',
      render: (text, record, index) => {
        return <Input onChange={onInputValueChange(index, 'purchaseSale')} />
      },
    },
  ]

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
          <PlusOutlined /> New Request for Pre-Clearance of Securities Trade Form
        </Breadcrumb.Item>
      </Breadcrumb>

      <div>
        <Button
          onClick={addTableRow}
          type='primary'
          style={{
            margin: '10px 0px',
          }}>
          Add a row
        </Button>
        <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
      </div>

      <div style={{marginTop: '16px'}}>
        <div>The Employee submitting this request understands and specifically represents as follows:*</div>
        <ol type='a'>
          <li>I have no inside information relating to the above-referenced issuer(s);</li>
          <li>I have not had any contact or communication with the issuer(s) in the last six months;</li>
          <li>
            I am not aware of any conflict of interest this transaction may cause with respect to any Client account and
            I am not aware of any Client account trading activity that may have occurred in the issuers of the above
            referenced securities during the past four trading days or that may now or in the near future be
            contemplated;
          </li>
          <li>
            If approval is granted, it is only good for one day and specifically the day it was approved (e.g., expiring
            at midnight on the day of approval); and
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

      <Row justify='end'>
        <Col span={4}>
          <Button type='primary' onClick={onSubmit} style={{marginTop: '10px'}}>
            Submit
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default NewRPSTForm
